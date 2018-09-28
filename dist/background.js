/* -------------------------------------------------- */
/*  Start of Webpack Chrome Hot Extension Middleware  */
/* ================================================== */
/*  This will be converted into a lodash templ., any  */
/*  external argument must be provided using it       */
/* -------------------------------------------------- */
(function (chrome, window) {
    var signals = JSON.parse('{"SIGN_CHANGE":"SIGN_CHANGE","SIGN_RELOAD":"SIGN_RELOAD","SIGN_RELOADED":"SIGN_RELOADED","SIGN_LOG":"SIGN_LOG","SIGN_CONNECT":"SIGN_CONNECT"}');
    var config = JSON.parse('{"RECONNECT_INTERVAL":2000,"SOCKET_ERR_CODE_REF":"https://tools.ietf.org/html/rfc6455#section-7.4.1"}');
    var reloadPage = "false" === "true";
    var wsHost = "ws://localhost:9090";
    var SIGN_CHANGE = signals.SIGN_CHANGE,
        SIGN_RELOAD = signals.SIGN_RELOAD,
        SIGN_RELOADED = signals.SIGN_RELOADED,
        SIGN_LOG = signals.SIGN_LOG,
        SIGN_CONNECT = signals.SIGN_CONNECT;
    var RECONNECT_INTERVAL = config.RECONNECT_INTERVAL,
        SOCKET_ERR_CODE_REF = config.SOCKET_ERR_CODE_REF;
    var runtime = chrome.runtime,
        tabs = chrome.tabs;

    var manifest = runtime.getManifest();
    var formatter = function formatter(msg) {
        return '[ WCER: ' + msg + ' ]';
    };
    var logger = function logger(msg) {
        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
        return console[level](formatter(msg));
    };
    var timeFormatter = function timeFormatter(date) {
        return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    };
    function contentScriptWorker() {
        runtime.sendMessage({ type: SIGN_CONNECT }, function (msg) {
            return console.info(msg);
        });
        runtime.onMessage.addListener(function (_ref) {
            var type = _ref.type,
                payload = _ref.payload;

            switch (type) {
                case SIGN_RELOAD:
                    logger("Detected Changes. Reloading ...");
                    reloadPage && window.location.reload();
                    break;
                case SIGN_LOG:
                    console.info(payload);
                    break;
            }
        });
    }
    function backgroundWorker(socket) {
        runtime.onMessage.addListener(function (action, sender, sendResponse) {
            if (action.type === SIGN_CONNECT) {
                sendResponse(formatter("Connected to Chrome Extension Hot Reloader"));
            }
        });
        socket.addEventListener("message", function (_ref2) {
            var data = _ref2.data;

            var _JSON$parse = JSON.parse(data),
                type = _JSON$parse.type,
                payload = _JSON$parse.payload;

            if (type === SIGN_CHANGE) {
                tabs.query({ status: "complete" }, function (loadedTabs) {
                    loadedTabs.forEach(function (tab) {
                        return tabs.sendMessage(tab.id, { type: SIGN_RELOAD });
                    });
                    socket.send(JSON.stringify({
                        type: SIGN_RELOADED,
                        payload: formatter(timeFormatter(new Date()) + ' - ' + manifest.name + ' successfully reloaded')
                    }));
                    runtime.reload();
                });
            } else {
                runtime.sendMessage({ type: type, payload: payload });
            }
        });
        socket.addEventListener("close", function (_ref3) {
            var code = _ref3.code;

            logger('Socket connection closed. Code ' + code + '. See more in ' + SOCKET_ERR_CODE_REF, "warn");
            var intId = setInterval(function () {
                logger("WEPR Attempting to reconnect ...");
                var ws = new WebSocket(wsHost);
                ws.addEventListener("open", function () {
                    clearInterval(intId);
                    logger("Reconnected. Reloading plugin");
                    runtime.reload();
                });
            }, RECONNECT_INTERVAL);
        });
    }
    runtime.reload ? backgroundWorker(new WebSocket(wsHost)) : contentScriptWorker();
})(chrome, window);
/* ----------------------------------------------- */
/* End of Webpack Chrome Hot Extension Middleware  */
/* ----------------------------------------------- *//******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"background": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/background.js","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background.js":
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! regenerator-runtime/runtime */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _controllers_background__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controllers/background */ "./src/controllers/background.js");
/* harmony import */ var extensionizer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! extensionizer */ "./node_modules/extensionizer/index.js");
/* harmony import */ var extensionizer__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(extensionizer__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var end_of_stream__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! end-of-stream */ "./node_modules/end-of-stream/index.js");
/* harmony import */ var end_of_stream__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(end_of_stream__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var extension_port_stream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! extension-port-stream */ "./node_modules/extension-port-stream/index.js");
/* harmony import */ var extension_port_stream__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(extension_port_stream__WEBPACK_IMPORTED_MODULE_4__);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }


console.log('AERGO Wallet Background Script');

__webpack_require__(/*! ./manifest.json */ "./src/manifest.json");





setupController();

function setupController() {
  return _setupController.apply(this, arguments);
}

function _setupController() {
  _setupController = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var controller, connectRemote;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            connectRemote = function _ref(remotePort) {
              var processName = remotePort.name;
              console.log('Establishing connection with', processName);
              var portStream = new extension_port_stream__WEBPACK_IMPORTED_MODULE_4___default.a(remotePort);
              controller.setupCommunication(portStream);
              controller.uiState.popupOpen = true;
              end_of_stream__WEBPACK_IMPORTED_MODULE_3___default()(portStream, function () {
                controller.uiState.popupOpen = false;
                console.log('Closed connection with', processName);
              });
            };

            controller = new _controllers_background__WEBPACK_IMPORTED_MODULE_1__["default"]();
            extensionizer__WEBPACK_IMPORTED_MODULE_2___default.a.runtime.onConnect.addListener(connectRemote);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _setupController.apply(this, arguments);
}

/***/ }),

/***/ "./src/controllers/background.js":
/*!***************************************!*\
  !*** ./src/controllers/background.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var pump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! pump */ "./node_modules/pump/index.js");
/* harmony import */ var pump__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(pump__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var dnode_browser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! dnode/browser.js */ "./node_modules/dnode/browser.js");
/* harmony import */ var dnode_browser_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(dnode_browser_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var herajs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! herajs */ "./node_modules/herajs/src/platforms/web/index.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }






var BackgroundController =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(BackgroundController, _EventEmitter);

  function BackgroundController() {
    var _this;

    _classCallCheck(this, BackgroundController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BackgroundController).call(this));
    _this.uiState = {
      popupOpen: false
    };
    _this.aergo = new herajs__WEBPACK_IMPORTED_MODULE_3__["default"]();
    return _this;
  }

  _createClass(BackgroundController, [{
    key: "isUiOpen",
    value: function isUiOpen() {
      return this.uiState.popupOpen;
    }
  }, {
    key: "setupCommunication",
    value: function setupCommunication(outStream) {
      var _this2 = this;

      // Setup simple async rpc stream to popup
      var dnode = dnode_browser_js__WEBPACK_IMPORTED_MODULE_2___default()({
        getBlockchainStatus: function () {
          var _getBlockchainStatus = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(send) {
            var status;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return _this2.aergo.blockchain();

                  case 2:
                    status = _context.sent;
                    send({
                      blockHeight: status.getBestHeight()
                    });

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function getBlockchainStatus(_x) {
            return _getBlockchainStatus.apply(this, arguments);
          };
        }(),
        getAccounts: function () {
          var _getAccounts = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee3(send) {
            var addresses, accounts;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return _this2.aergo.accounts.get();

                  case 2:
                    addresses = _context3.sent;
                    _context3.next = 5;
                    return Promise.all(addresses.map(
                    /*#__PURE__*/
                    function () {
                      var _ref = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee2(address) {
                        var state;
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                _context2.next = 2;
                                return _this2.aergo.getState(address);

                              case 2:
                                state = _context2.sent;
                                return _context2.abrupt("return", {
                                  address: address,
                                  balance: state.getBalance()
                                });

                              case 4:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2, this);
                      }));

                      return function (_x3) {
                        return _ref.apply(this, arguments);
                      };
                    }()));

                  case 5:
                    accounts = _context3.sent;
                    console.log(accounts);
                    send(accounts);

                  case 8:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));

          return function getAccounts(_x2) {
            return _getAccounts.apply(this, arguments);
          };
        }(),
        createAccount: function () {
          var _createAccount = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee4(_ref2, send) {
            var name, password, createdAddress;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    name = _ref2.name, password = _ref2.password;
                    _context4.next = 3;
                    return _this2.aergo.accounts.create('testpass');

                  case 3:
                    createdAddress = _context4.sent;
                    send({
                      address: createdAddress
                    });

                  case 5:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          }));

          return function createAccount(_x4, _x5) {
            return _createAccount.apply(this, arguments);
          };
        }(),
        sendTransaction: function () {
          var _sendTransaction = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee5(tx, send) {
            var signedTx, txHash;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.next = 2;
                    return _this2.aergo.accounts.unlock(tx.from, 'testpass');

                  case 2:
                    _context5.next = 4;
                    return _this2.aergo.getNonce(tx.from);

                  case 4:
                    _context5.t0 = _context5.sent;
                    tx.nonce = 1 + _context5.t0;
                    _context5.next = 8;
                    return _this2.aergo.accounts.signTransaction(tx);

                  case 8:
                    signedTx = _context5.sent;
                    _context5.next = 11;
                    return _this2.aergo.sendSignedTransaction(signedTx);

                  case 11:
                    txHash = _context5.sent;
                    send(txHash);

                  case 13:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5, this);
          }));

          return function sendTransaction(_x6, _x7) {
            return _sendTransaction.apply(this, arguments);
          };
        }()
      });
      pump__WEBPACK_IMPORTED_MODULE_1___default()(outStream, dnode, outStream, function (err) {
        if (err) log.error(err);
      });
      dnode.on('remote', function (remote) {
        var sendUpdate = remote.sendUpdate.bind(remote);

        _this2.on('update', sendUpdate);
      });
      /*setInterval(() => {
          this.emit('update', 'something');
      }, 1000)*/
    }
  }]);

  return BackgroundController;
}(events__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]);

/* harmony default export */ __webpack_exports__["default"] = (BackgroundController);

/***/ }),

/***/ "./src/manifest.json":
/*!***************************!*\
  !*** ./src/manifest.json ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "manifest.json";

/***/ }),

/***/ 0:
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

/******/ });
//# sourceMappingURL=background.js.map