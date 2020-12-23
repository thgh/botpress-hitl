module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/Users/thomas/projects/puratos/botpress-hitl";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _botpressVersionManager = __webpack_require__(2);
	
	var _botpressVersionManager2 = _interopRequireDefault(_botpressVersionManager);
	
	var _db = __webpack_require__(3);
	
	var _db2 = _interopRequireDefault(_db);
	
	var _lodash = __webpack_require__(6);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _path = __webpack_require__(8);
	
	var _path2 = _interopRequireDefault(_path);
	
	var _fs = __webpack_require__(9);
	
	var _fs2 = _interopRequireDefault(_fs);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
	
	// TODO: Cleanup old sessions
	// TODO: If messages count > X, delete some
	
	var db = null;
	var config = null;
	
	var incomingMiddleware = function () {
	  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(event, next) {
	    var session, message, intents, isPaused;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            if (db) {
	              _context.next = 2;
	              break;
	            }
	
	            return _context.abrupt('return', next());
	
	          case 2:
	            if (!(event.type === 'human')) {
	              _context.next = 17;
	              break;
	            }
	
	            console.log('human event', event);
	
	            if (!event.text.toLowerCase().includes('survey')) {
	              _context.next = 11;
	              break;
	            }
	
	            console.log('human operator "survey" => unpause');
	            event.startSurvey = true;
	            _context.next = 9;
	            return event.bp.hitl.unpause(event.platform, event.user.id);
	
	          case 9:
	            event.bp.logger.debug('human operator "survey" => unpause');
	            return _context.abrupt('return', next());
	
	          case 11:
	            if (!event.text.toLowerCase().includes('goodbye')) {
	              _context.next = 15;
	              break;
	            }
	
	            event.bp.hitl.unpause(event.platform, event.user.id);
	            event.bp.logger.debug('human operator "goodbye" => unpause');
	            return _context.abrupt('return', console.log('human operator "goodbye" => unpause'));
	
	          case 15:
	            event.bp.hitl.pause(event.platform, event.user.id);
	            return _context.abrupt('return', console.log('human operator => pause'));
	
	          case 17:
	            if (!_lodash2.default.includes(['delivery', 'read', 'echo', 'bp_dialog_timeout'], event.type)) {
	              _context.next = 19;
	              break;
	            }
	
	            return _context.abrupt('return', next());
	
	          case 19:
	            _context.next = 21;
	            return db.getUserSession(event);
	
	          case 21:
	            session = _context.sent;
	
	            if (session) {
	              _context.next = 24;
	              break;
	            }
	
	            return _context.abrupt('return', next());
	
	          case 24:
	
	            if (session.is_new_session) {
	              event.bp.events.emit('hitl.session', session);
	            }
	
	            _context.next = 27;
	            return db.appendMessageToSession(event, session.id, 'in');
	
	          case 27:
	            message = _context.sent;
	
	            event.bp.events.emit('hitl.message', message);
	
	            // Custom logic start
	            intents = ['nlp.metadata.intentName', 'raw_message.postback.payload', 'raw.postback.payload', 'text'].map(function (s) {
	              return (_lodash2.default.get(event, s) || '').toLowerCase();
	            });
	            isPaused = !!session.paused || config.paused;
	
	            console.log('hitl.nowwhat', intents, isPaused);
	            event.chatbotDisable = !isPaused && intents.includes('bothrs:chatbot.disable') || /HITL_START/.test(event.text);
	            event.chatbotEnable = isPaused && intents.includes('bothrs:chatbot.enable') || /HITL_STOP/.test(event.text);
	
	            if (!event.chatbotDisable) {
	              _context.next = 38;
	              break;
	            }
	
	            console.log('chatbotDisable => pause', event.type);
	            event.bp.hitl.pause(event.platform, event.user.id);
	            return _context.abrupt('return', next());
	
	          case 38:
	            if (!event.chatbotEnable) {
	              _context.next = 42;
	              break;
	            }
	
	            console.log('chatbotEnable => unpause');
	            event.bp.hitl.unpause(event.platform, event.user.id);
	            return _context.abrupt('return', next());
	
	          case 42:
	            if (!(isPaused && _lodash2.default.includes(['text', 'message', 'quick_reply'], event.type))) {
	              _context.next = 45;
	              break;
	            }
	
	            event.bp.logger.debug('[hitl] Session paused, message swallowed:', event.text);
	            // the session or bot is paused, swallow the message
	            return _context.abrupt('return');
	
	          case 45:
	
	            next();
	
	          case 46:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, undefined);
	  }));
	
	  return function incomingMiddleware(_x, _x2) {
	    return _ref.apply(this, arguments);
	  };
	}();
	
	var outgoingMiddleware = function outgoingMiddleware(event, next) {
	  if (!db) {
	    return next();
	  }
	
	  if (event.type === 'bp_dialog_timeout') {
	    return next();
	  }
	
	  return db.getUserSession(event).then(function (session) {
	
	    if (session.is_new_session) {
	      event.bp.events.emit('hitl.session', session);
	    }
	
	    return db.appendMessageToSession(event, session.id, 'out').then(function (message) {
	      event.bp.events.emit('hitl.message', message);
	      next();
	    });
	  });
	};
	
	module.exports = {
	
	  config: {
	    sessionExpiry: { type: 'string', default: '3 days' },
	    paused: { type: 'bool', default: false, env: 'BOTPRESS_HITL_PAUSED' }
	  },
	
	  init: function () {
	    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(bp, configurator) {
	      return regeneratorRuntime.wrap(function _callee2$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	
	              (0, _botpressVersionManager2.default)(bp, __dirname);
	
	              bp.middlewares.register({
	                name: 'hitl.captureInMessages',
	                type: 'incoming',
	                order: 11,
	                handler: incomingMiddleware,
	                module: 'botpress-hitl',
	                description: 'Captures incoming messages and if the session if paused, swallow the event.'
	              });
	
	              bp.middlewares.register({
	                name: 'hitl.captureOutMessages',
	                type: 'outgoing',
	                order: 50,
	                handler: outgoingMiddleware,
	                module: 'botpress-hitl',
	                description: 'Captures outgoing messages to show inside HITL.'
	              });
	
	              _context2.next = 5;
	              return configurator.loadAll();
	
	            case 5:
	              config = _context2.sent;
	
	
	              bp.db.get().then(function (knex) {
	                return db = (0, _db2.default)(knex);
	              }).then(function () {
	                return db.initialize();
	              });
	
	            case 7:
	            case 'end':
	              return _context2.stop();
	          }
	        }
	      }, _callee2, undefined);
	    }));
	
	    return function init(_x3, _x4) {
	      return _ref2.apply(this, arguments);
	    };
	  }(),
	
	  ready: function ready(bp) {
	    var _this = this;
	
	    bp.hitl = {
	      pause: function pause(platform, userId, code) {
	        return db.setSessionPaused(true, platform, userId, code || 'code').then(function (sessionId) {
	          bp.events.emit('hitl.session', { id: sessionId });
	          bp.events.emit('hitl.session.changed', { id: sessionId, paused: 1 });
	        });
	      },
	      unpause: function unpause(platform, userId, code) {
	        return db.setSessionPaused(false, platform, userId, code || 'code').then(function (sessionId) {
	          bp.events.emit('hitl.session', { id: sessionId });
	          bp.events.emit('hitl.session.changed', { id: sessionId, paused: 0 });
	        });
	      },
	      isPaused: function isPaused(platform, userId) {
	        return db.isSessionPaused(platform, userId);
	      }
	    };
	
	    var router = bp.getRouter('botpress-hitl');
	
	    router.get('/sessions', function (req, res) {
	      db.getAllSessions(req.query.onlyPaused === "true").then(function (sessions) {
	        return res.send(sessions);
	      });
	    });
	
	    router.get('/sessions/:sessionId', function (req, res) {
	      db.getSessionData(req.params.sessionId).then(function (messages) {
	        return res.send(messages);
	      });
	    });
	
	    router.post('/sessions/:sessionId/message', function (req, res) {
	      var message = req.body.message;
	
	
	      db.getSession(req.params.sessionId).then(function () {
	        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(session) {
	          var event;
	          return regeneratorRuntime.wrap(function _callee3$(_context3) {
	            while (1) {
	              switch (_context3.prev = _context3.next) {
	                case 0:
	                  event = {
	                    type: 'text',
	                    platform: session.platform,
	                    raw: { to: session.userId, message: message },
	                    text: message
	                  };
	                  _context3.next = 3;
	                  return bp.middlewares.sendOutgoing(event);
	
	                case 3:
	
	                  res.sendStatus(200);
	
	                case 4:
	                case 'end':
	                  return _context3.stop();
	              }
	            }
	          }, _callee3, _this);
	        }));
	
	        return function (_x5) {
	          return _ref3.apply(this, arguments);
	        };
	      }());
	    });
	
	    // TODO post /sessions/:id/typing
	
	    router.post('/sessions/:sessionId/pause', function (req, res) {
	      db.setSessionPaused(true, null, null, 'operator', req.params.sessionId).then(function (sessionId) {
	        bp.events.emit('hitl.session', { id: sessionId });
	        bp.events.emit('hitl.session.changed', { id: sessionId, paused: 1 });
	      }).then(res.sendStatus(200));
	    });
	
	    router.post('/sessions/:sessionId/unpause', function (req, res) {
	      db.setSessionPaused(false, null, null, 'operator', req.params.sessionId).then(function (sessionId) {
	        bp.events.emit('hitl.session', { id: sessionId });
	        bp.events.emit('hitl.session.changed', { id: sessionId, paused: 0 });
	      }).then(res.sendStatus(200));
	    });
	  }
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("botpress-version-manager");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var getUserSession = function () {
	  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(event) {
	    var userId;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            userId = event.user && event.user.id || event.raw.to;
	
	            if (userId) {
	              _context.next = 3;
	              break;
	            }
	
	            return _context.abrupt('return', null);
	
	          case 3:
	            return _context.abrupt('return', knex('hitl_sessions').where({ platform: event.platform, userId: userId }).select('*').limit(1).then(function (users) {
	              if (!users || users.length === 0) {
	                console.log(event.raw);
	                return event.user ? createUserSession(event) : null;
	              } else {
	                users[0].raw = typeof users[0].raw === 'string' ? JSON.parse(users[0].raw) : null;
	
	                return users[0];
	              }
	            }));
	
	          case 4:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, this);
	  }));
	
	  return function getUserSession(_x) {
	    return _ref3.apply(this, arguments);
	  };
	}();
	
	var _bluebird = __webpack_require__(4);
	
	var _bluebird2 = _interopRequireDefault(_bluebird);
	
	var _moment = __webpack_require__(5);
	
	var _moment2 = _interopRequireDefault(_moment);
	
	var _lodash = __webpack_require__(6);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _botpress = __webpack_require__(7);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
	
	var knex = null;
	
	function initialize() {
	  if (!knex) {
	    throw new Error('you must initialize the database before');
	  }
	
	  return (0, _botpress.DatabaseHelpers)(knex).createTableIfNotExists('hitl_sessions', function (table) {
	    table.increments('id').primary();
	    table.string('platform');
	    table.string('userId');
	    table.string('full_name');
	    table.string('user_image_url');
	    table.timestamp('last_event_on');
	    table.timestamp('last_heard_on');
	    table.boolean('paused');
	    table.string('paused_trigger');
	  }).then(function () {
	    return (0, _botpress.DatabaseHelpers)(knex).createTableIfNotExists('hitl_messages', function (table) {
	      table.increments('id').primary();
	      table.integer('session_id').references('hitl_sessions.id').onDelete('CASCADE');
	      table.string('type');
	      table.string('text', 640);
	      table.jsonb('raw_message');
	      table.enu('direction', ['in', 'out']);
	      table.timestamp('ts');
	    });
	  });
	}
	
	function createUserSession(event) {
	  var profileUrl = null;
	  var full_name = '#' + Math.random().toString().substr(2);
	
	  if (event.user && event.user.first_name && event.user.last_name) {
	    profileUrl = event.user.profile_pic || event.user.picture_url;
	    full_name = event.user.first_name + ' ' + event.user.last_name;
	  }
	
	  var session = {
	    platform: event.platform,
	    userId: event.user.id,
	    user_image_url: profileUrl,
	    last_event_on: (0, _botpress.DatabaseHelpers)(knex).date.now(),
	    last_heard_on: (0, _botpress.DatabaseHelpers)(knex).date.now(),
	    paused: 0,
	    full_name: full_name,
	    paused_trigger: null
	  };
	  event.bp.logger.debug('[hitl] createUserSession');
	
	  return knex('hitl_sessions').insert(session).returning('id').then(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 1),
	        id = _ref2[0];
	
	    return knex('hitl_sessions').where({ id: id }).then().get(0);
	  }).then(function (dbSession) {
	    return _extends({ is_new_session: true }, dbSession);
	  });
	}
	
	function getSession(sessionId) {
	  return knex('hitl_sessions').where({ id: sessionId }).select('*').limit(1).then(function (users) {
	    if (!users || users.length === 0) {
	      return null;
	    } else {
	      return users[0];
	    }
	  });
	}
	
	function toPlainObject(object) {
	  // trims SQL queries from objects
	  return _lodash2.default.mapValues(object, function (v) {
	    return v.sql ? v.sql : v;
	  });
	}
	
	function appendMessageToSession(event, sessionId, direction) {
	
	  var message = {
	    session_id: sessionId,
	    type: event.type,
	    text: event.text,
	    raw_message: event.raw,
	    direction: direction,
	    ts: (0, _botpress.DatabaseHelpers)(knex).date.now()
	  };
	
	  var update = { last_event_on: (0, _botpress.DatabaseHelpers)(knex).date.now() };
	
	  if (direction === 'in') {
	    update.last_heard_on = (0, _botpress.DatabaseHelpers)(knex).date.now();
	  }
	
	  return knex('hitl_messages').insert(message).then(function () {
	    return knex('hitl_sessions').where({ id: sessionId }).update(update).then(function () {
	      return toPlainObject(message);
	    });
	  });
	}
	
	function setSessionPaused(paused, platform, userId, trigger) {
	  var sessionId = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
	
	  if (sessionId) {
	    return knex('hitl_sessions').where({ id: sessionId }).update({ paused: paused ? 1 : 0, paused_trigger: trigger }).then(function () {
	      return parseInt(sessionId);
	    });
	  } else {
	    return knex('hitl_sessions').where({ userId: userId, platform: platform }).update({ paused: paused ? 1 : 0, paused_trigger: trigger }).then(function () {
	      return knex('hitl_sessions').where({ userId: userId, platform: platform }).select('id');
	    }).then(function (sessions) {
	      return parseInt(sessions[0].id);
	    });
	  }
	}
	
	function isSessionPaused(platform, userId) {
	  var sessionId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	
	  var toBool = function toBool(s) {
	    return (0, _botpress.DatabaseHelpers)(knex).bool.parse(s);
	  };
	
	  if (sessionId) {
	    return knex('hitl_sessions').where({ id: sessionId }).select('paused').then().get(0).then(function (s) {
	      return s && toBool(s.paused);
	    });
	  } else {
	    return knex('hitl_sessions').where({ userId: userId, platform: platform }).select('paused').then().get(0).then(function (s) {
	      return s && toBool(s.paused);
	    });
	  }
	}
	
	function getAllSessions(onlyPaused) {
	  var condition = '';
	
	  if (onlyPaused === true) {
	    condition = 'hitl_sessions.paused = ' + (0, _botpress.DatabaseHelpers)(knex).bool.true();
	  }
	
	  return knex.select('*').from(function () {
	    this.select([knex.raw('max(id) as mId'), 'session_id', knex.raw('count(*) as count')]).from('hitl_messages').groupBy('session_id').as('q1');
	  }).join('hitl_messages', knex.raw('q1.mId'), 'hitl_messages.id').join('hitl_sessions', knex.raw('q1.session_id'), 'hitl_sessions.id').whereRaw(condition).orderBy('hitl_sessions.last_event_on', 'desc').limit(100).then(function (results) {
	    return {
	      total: 0,
	      sessions: results
	    };
	  });
	}
	
	function getSessionData(sessionId) {
	  return knex('hitl_sessions').where({ 'session_id': sessionId }).join('hitl_messages', 'hitl_messages.session_id', 'hitl_sessions.id').orderBy('hitl_messages.id', 'desc').limit(100).select('*').then(function (messages) {
	    return _lodash2.default.orderBy(messages, ['id'], ['asc']);
	  });
	}
	
	module.exports = function (k) {
	  knex = k;
	
	  return {
	    initialize: initialize,
	    getUserSession: getUserSession,
	    setSessionPaused: setSessionPaused,
	    appendMessageToSession: appendMessageToSession,
	    getAllSessions: getAllSessions,
	    getSessionData: getSessionData,
	    getSession: getSession,
	    isSessionPaused: isSessionPaused
	  };
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("moment");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("botpress");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ }
/******/ ]);
//# sourceMappingURL=node.bundle.js.map