import React from 'react'
import {
  Grid,
  Row,
  Col
} from 'react-bootstrap'

import Sidebar from './sidebar'
import Conversation from './conversation'
import Typing from './typing'

import style from './style.scss'

import _ from 'lodash'

const api = route => '/api/botpress-hitl/' + route

export default class HitlModule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      currentSession: null,
      sessions: null,
      onlyPaused: false
    }

    this.updateSessionMessage = ::this.updateSessionMessage
    this.updateSession = ::this.updateSession
    this.refreshSessions = ::this.refreshSessions
  }

  componentDidMount() {
    this.props.bp.events.on('hitl.message', this.updateSessionMessage)
    this.props.bp.events.on('hitl.session', this.refreshSessions)
    this.props.bp.events.on('hitl.session.changed', this.updateSession)
    this.refreshSessions()
  }

  componentWillUnmount() {
    this.props.bp.events.off('hitl.message', this.updateSessionMessage)
    this.props.bp.events.off('hitl.session', this.refreshSessions)
    this.props.bp.events.off('hitl.session.changed', this.updateSession)
  }

  refreshSessions(session) {
    this.fetchAllSessions()
    .then(() => {
      if (!this.state.currentSession) {
        const userId = window.location.hash.slice(1)
        const firstSession = userId && this.state.sessions.sessions.find(s => s.userId === userId) || _.head(this.state.sessions.sessions)
        this.setSession(firstSession.id)
      }
    })
  }

  updateSession(changes) {
    if (!this.state.sessions) {
      return
    }

    const sessions = this.state.sessions.sessions.map(session => {
      return Object.assign({}, session, session.id === changes.id ? changes : {})
    })

    this.setState({ sessions: {
      total: this.state.sessions.total,
      sessions: sessions
    }})

    if (this.state.currentSession) {
      this.setSession(this.state.currentSession.id)
    }
  }

  updateSessionMessage(message) {
    if (!this.state.sessions) {
      return
    }

    const session = _.find(this.state.sessions.sessions, { id: message.session_id })

    if (!session) {
      return
    }

    const newSession = Object.assign({}, session, { 
      text: message.text,
      direction: message.direction,
      type: message.type,
      last_event_on: new Date(),
      last_heard_on: message.direction === 'in' ? new Date() : session.last_heard_on
    })

    const newSessions = {
      total: this.state.sessions.total,
      sessions: [newSession, ..._.without(this.state.sessions.sessions, session)]
    }

    this.setState({ sessions:  newSessions })
  }

  getAxios() {
    return this.props.bp.axios
  }

  fetchAllSessions() {
    return this.getAxios().get('/api/botpress-hitl/sessions?onlyPaused=' + this.state.onlyPaused)
    .then((res) => {
      this.setState({
        loading: false,
        sessions: res.data
      })
    })
  }

  toggleOnlyPaused() {
    this.setState({ onlyPaused: !this.state.onlyPaused, currentSession: null })
    setTimeout(() => {
      this.fetchAllSessions()
    }, 50)
  }

  setSession(sessionId) {
    const session = _.find(this.state.sessions.sessions, { id: sessionId })
    this.setState({ currentSession: session })
    if (window.location.hash.slice(1) !== session.userId) {
      window.history.replaceState({}, 'hitl', '#' + session.userId)
    }
  }

  sendMessage(message) {
    const sessionId = this.state.currentSession.id
    this.getAxios().post(`/api/botpress-hitl/sessions/${sessionId}/message`, { message })
  }

  renderLoading() {
    return <h1>Loading...</h1>
  }

  render() {

    if (this.state.loading) {
      return this.renderLoading()
    }

    const currentSessionId = this.state.currentSession && this.state.currentSession.id
    return (
      <div className={style.mainContainer}>
        <Grid>
          <Row>
            <Col sm={6} md={4} lg={3} className={style.column}>
              <Sidebar 
                sessions={this.state.sessions} 
                setSession={::this.setSession} 
                currentSession={currentSessionId} 
                filter={this.state.onlyPaused}
                toggleOnlyPaused={::this.toggleOnlyPaused} />
            </Col>
            <Col sm={6} md={8} lg={9} className={style.column}>
              <Row>
                <Col sm={12}>
                  <Conversation bp={this.props.bp} data={this.state.currentSession}/>
                </Col>
              </Row>
              <Row>
                <Col sm={12}>
                  <Typing sendMessage={::this.sendMessage}/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
