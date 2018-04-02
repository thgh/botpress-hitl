import checkVersion from 'botpress-version-manager'
import DB from './db'
import _ from 'lodash'
import path from 'path'
import fs from 'fs'

// TODO: Cleanup old sessions
// TODO: If messages count > X, delete some

let db = null
let config = null

const operatorMiddleware = (event, next) => {
  if (String(event.text).startsWith('[operator]')) {
    console.log('Operator is talking => pause', event.platform, event.user)
    event.bp.hitl.pause(event.platform, event.user.id)

    // TODO: append out message
    return
  }
}

const incomingMiddleware = (event, next) => {
  if (!db) { return next() }

  console.log('hitl.incoming.event.type', event.type, event.user)

  if (_.includes(['delivery', 'read'], event.type)) {
    return next()
  }

  return db.getUserSession(event)
  .then(session => {
    if (session.is_new_session) {
      event.bp.events.emit('hitl.session', session)
    }

    return db.appendMessageToSession(event, session.id, 'in')
    .then(message => {
      event.bp.events.emit('hitl.message', message)

      const intentName = _.get(event, 'nlp.metadata.intentName')
      const isPaused = !!session.paused || config.paused
      const chatbotDisable = intentName === 'bothrs:chatbot.disable' || /HITL_START/.test(event.text)
      const chatbotEnable = intentName === 'bothrs:chatbot.enable' || /HITL_STOP/.test(event.text)

      if (!isPaused && chatbotDisable) {
        console.log('chatbotDisable => pause', event.type)
        event.bp.hitl.pause(event.platform, event.user.id)
        next()
        return
      }

      if (isPaused && chatbotEnable) {
        console.log('chatbotEnable => unpause')
        event.bp.hitl.unpause(event.platform, event.user.id)
        next()
        return
      }

      if (isPaused && _.includes(['text', 'message'], event.type)) {
        event.bp.logger.debug('[hitl] Session paused, message swallowed:', event.text)
        // the session or bot is paused, swallow the message
        return
      } else {
        next()
      }
    })
  })
}

const outgoingMiddleware = (event, next) => {
  if (!db) { return next() }

  return db.getUserSession(event)
  .then(session => {

    if (session.is_new_session) {
      event.bp.events.emit('hitl.session', session)
    }

    return db.appendMessageToSession(event, session.id, 'out')
    .then(message => {
      event.bp.events.emit('hitl.message', message)
      next()
    })
  })
}

module.exports = {

  config: {
    sessionExpiry: { type: 'string', default: '3 days' },
    paused: { type: 'bool', default: false, env: 'BOTPRESS_HITL_PAUSED' }
  },

  init: async (bp, configurator) => {
    
    checkVersion(bp, __dirname)

    bp.middlewares.register({
      name: 'hitl.swallowOperatorMessages',
      type: 'incoming',
      order: -11,
      handler: operatorMiddleware,
      module: 'botpress-hitl'
    })

    bp.middlewares.register({
      name: 'hitl.captureInMessages',
      type: 'incoming',
      order: 11,
      handler: incomingMiddleware,
      module: 'botpress-hitl',
      description: 'Captures incoming messages and if the session if paused, swallow the event.'
    })

    bp.middlewares.register({
      name: 'hitl.captureOutMessages',
      type: 'outgoing',
      order: 50,
      handler: outgoingMiddleware,
      module: 'botpress-hitl',
      description: 'Captures outgoing messages to show inside HITL.'
    })

    config = await configurator.loadAll()

    bp.db.get()
    .then(knex => db = DB(knex))
    .then(() => db.initialize())
  },

  ready: function(bp) {

    bp.hitl = {
      pause: (platform, userId) => {
        return db.setSessionPaused(true, platform, userId, 'code')
        .then(sessionId => {
          bp.events.emit('hitl.session', { id: sessionId })
          bp.events.emit('hitl.session.changed', { id: sessionId, paused: 1 })
        })
      },
      unpause: (platform, userId) => {
        return db.setSessionPaused(false, platform, userId, 'code')
        .then(sessionId => {
          bp.events.emit('hitl.session', { id: sessionId })
          bp.events.emit('hitl.session.changed', { id: sessionId, paused: 0 })
        })
      },
      isPaused: (platform, userId) => {
        return db.isSessionPaused(platform, userId)
      }
    }

    const router = bp.getRouter('botpress-hitl')

    router.get('/sessions', (req, res) => {
      db.getAllSessions(req.query.onlyPaused === "true")
      .then(sessions => res.send(sessions))
    })

    router.get('/sessions/:sessionId', (req, res) => {
      db.getSessionData(req.params.sessionId)
      .then(messages => res.send(messages))
    })

    router.post('/sessions/:sessionId/message', (req, res) => {
      const { message } = req.body

      db.getSession(req.params.sessionId)
      .then(session => {
        const event = {
          type: 'text',
          platform: session.platform,
          raw: { to: session.userId, message: message },
          text: message
        }

        bp.middlewares.sendOutgoing(event)

        res.sendStatus(200)
      })
    })

    // TODO post /sessions/:id/typing
    
    router.post('/sessions/:sessionId/pause', (req, res) => {
      db.setSessionPaused(true, null, null, 'operator', req.params.sessionId)
      .then(sessionId => {
        bp.events.emit('hitl.session', { id: sessionId })
        bp.events.emit('hitl.session.changed', { id: sessionId, paused: 1 })
      })
      .then(res.sendStatus(200))
    })

    router.post('/sessions/:sessionId/unpause', (req, res) => {
      db.setSessionPaused(false, null, null, 'operator', req.params.sessionId)
      .then(sessionId => {
        bp.events.emit('hitl.session', { id: sessionId })
        bp.events.emit('hitl.session.changed', { id: sessionId, paused: 0 })
      })
      .then(res.sendStatus(200))
    })
  }
}
