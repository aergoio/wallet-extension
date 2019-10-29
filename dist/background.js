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
  var manifest = runtime.getManifest(); // =============================== Helper functions ======================================= //

  var formatter = function formatter(msg) {
    return "[ WCER: ".concat(msg, " ]");
  };

  var logger = function logger(msg) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
    return console[level](formatter(msg));
  };

  var timeFormatter = function timeFormatter(date) {
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }; // ========================== Called only on content scripts ============================== //


  function contentScriptWorker() {
    runtime.sendMessage({
      type: SIGN_CONNECT
    }, function (msg) {
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
  } // ======================== Called only on background scripts ============================= //


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
        tabs.query({
          status: "complete"
        }, function (loadedTabs) {
          loadedTabs.forEach(function (tab) {
            return tab.id && tabs.sendMessage(tab.id, {
              type: SIGN_RELOAD
            });
          });
          socket.send(JSON.stringify({
            type: SIGN_RELOADED,
            payload: formatter("".concat(timeFormatter(new Date()), " - ").concat(manifest.name, " successfully reloaded"))
          }));
          runtime.reload();
        });
      } else {
        runtime.sendMessage({
          type: type,
          payload: payload
        });
      }
    });
    socket.addEventListener("close", function (_ref3) {
      var code = _ref3.code;
      logger("Socket connection closed. Code ".concat(code, ". See more in ").concat(SOCKET_ERR_CODE_REF), "warn");
      var intId = setInterval(function () {
        logger("Attempting to reconnect (tip: Check if Webpack is running)");
        var ws = new WebSocket(wsHost);
        ws.addEventListener("open", function () {
          clearInterval(intId);
          logger("Reconnected. Reloading plugin");
          runtime.reload();
        });
      }, RECONNECT_INTERVAL);
    });
  } // ======================= Bootstraps the middleware =========================== //


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
/* harmony import */ var extensionizer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! extensionizer */ "./node_modules/extensionizer/index.js");
/* harmony import */ var extensionizer__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(extensionizer__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var end_of_stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! end-of-stream */ "./node_modules/end-of-stream/index.js");
/* harmony import */ var end_of_stream__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(end_of_stream__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var extension_port_stream__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! extension-port-stream */ "./node_modules/extension-port-stream/index.js");
/* harmony import */ var extension_port_stream__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(extension_port_stream__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _controllers_background__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./controllers/background */ "./src/controllers/background.js");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }



__webpack_require__(/*! ./manifest.json */ "./src/manifest.json");





console.log('AERGO Wallet Background Script');
console.log('Extension ID', extensionizer__WEBPACK_IMPORTED_MODULE_1___default.a.runtime.id);
setupController();

function setupController() {
  return _setupController.apply(this, arguments);
}

function _setupController() {
  _setupController = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var controller, connectRemote;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            connectRemote = function _ref2(remotePort) {
              var processName = remotePort.name;
              console.log('Establishing connection with', processName);

              if (processName === 'external') {
                // Receive messages from external web pages
                remotePort.onMessage.addListener(
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee(msg, port) {
                    var actions, actionsToEventName, action;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!(msg.type !== 'AERGO_REQUEST')) {
                              _context.next = 2;
                              break;
                            }

                            return _context.abrupt("return");

                          case 2:
                            console.log('received message', msg, port.sender.url);
                            actions = ['ACTIVE_ACCOUNT', 'SIGN', 'SIGN_TX', 'SEND_TX'];
                            actionsToEventName = {
                              'ACTIVE_ACCOUNT': 'AERGO_ACTIVE_ACCOUNT',
                              'SIGN': 'AERGO_SIGN_RESULT',
                              'SIGN_TX': 'AERGO_SIGN_TX_RESULT',
                              'SEND_TX': 'AERGO_SEND_TX_RESULT'
                            };
                            action = msg.action || '';

                            if (actions.indexOf(action) === -1) {
                              console.log('message with invalid action type', action);
                            }

                            controller.permissionRequest(action, msg.data, port.sender.url, function (result) {
                              port.postMessage({
                                type: 'AERGO_RESPONSE',
                                eventName: actionsToEventName[action],
                                result: result
                              });
                            }, function () {
                              port.postMessage({
                                type: 'AERGO_CANCEL',
                                eventName: actionsToEventName[action]
                              });
                            });

                          case 8:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                  };
                }());
              } else {
                var portStream = new extension_port_stream__WEBPACK_IMPORTED_MODULE_3___default.a(remotePort);
                controller.state.set('active');
                controller.setupCommunication(portStream);
                controller.uiState.popupOpen = true;
                end_of_stream__WEBPACK_IMPORTED_MODULE_2___default()(portStream, function () {
                  controller.uiState.popupOpen = false;
                  console.log('Closed connection with', processName);
                  controller.state.set('inactive');
                });
              }
              /*
               const notifId = '';
              extension.notifications.create(
                  notifId,
                  {
                      type: 'basic',
                      title: 'Aergo Wallet',
                      iconUrl: extension.extension.getURL('0da81dee4755822e45e812c8ce30d733.png'),
                      message: `Hello from the Wallet! Established connection with ${processName}. Yes.`,
                  }
              );
              extension.notifications.onClicked.addListener((url) => {
                  if (!txId.startsWith('http')) return;
                  console.log('clicked on', e);
                  extension.tabs.create({ url });
              });
               */

            };

            controller = new _controllers_background__WEBPACK_IMPORTED_MODULE_4__["default"]();
            extensionizer__WEBPACK_IMPORTED_MODULE_1___default.a.runtime.onConnect.addListener(connectRemote);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _setupController.apply(this, arguments);
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: "Open full page",
  contexts: ["browser_action"],
  onclick: function onclick() {
    extensionizer__WEBPACK_IMPORTED_MODULE_1___default.a.tabs.create({
      url: "tab.html"
    });
  }
});

if (true) {
  extensionizer__WEBPACK_IMPORTED_MODULE_1___default.a.tabs.create({
    url: "tab.html"
  });
}

/***/ }),

/***/ "./src/controllers/background.js":
/*!***************************************!*\
  !*** ./src/controllers/background.js ***!
  \***************************************/
/*! exports provided: encodeTxHash, decodeTxHash, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeTxHash", function() { return encodeTxHash; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeTxHash", function() { return decodeTxHash; });
/* harmony import */ var extensionizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! extensionizer */ "./node_modules/extensionizer/index.js");
/* harmony import */ var extensionizer__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(extensionizer__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var pump__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! pump */ "./node_modules/pump/index.js");
/* harmony import */ var pump__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(pump__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var dnode_browser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! dnode/browser.js */ "./node_modules/dnode/browser.js");
/* harmony import */ var dnode_browser_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(dnode_browser_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _herajs_wallet__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @herajs/wallet */ "./node_modules/@herajs/wallet/dist/herajs-wallet.iife.js");
/* harmony import */ var _herajs_wallet__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_herajs_wallet__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./config */ "./src/controllers/config.js");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./store */ "./src/controllers/store.js");
/* harmony import */ var _tx_scanner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./tx-scanner */ "./src/controllers/tx-scanner.js");
/* harmony import */ var _herajs_crypto__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @herajs/crypto */ "../herajs/packages/crypto/dist/herajs-crypto.umd.js");
/* harmony import */ var _herajs_crypto__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_herajs_crypto__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./state */ "./src/controllers/state.js");
/* harmony import */ var whatwg_fetch__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! whatwg-fetch */ "./node_modules/whatwg-fetch/fetch.js");
/* harmony import */ var bs58__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! bs58 */ "./node_modules/bs58/index.js");
/* harmony import */ var bs58__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(bs58__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js");
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(buffer__WEBPACK_IMPORTED_MODULE_12__);
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














function encodeTxHash(bytes) {
  return bs58__WEBPACK_IMPORTED_MODULE_11___default.a.encode(buffer__WEBPACK_IMPORTED_MODULE_12__["Buffer"].from(bytes));
}
function decodeTxHash(bs58string) {
  return bs58__WEBPACK_IMPORTED_MODULE_11___default.a.decode(bs58string);
}
var AUTO_LOCK_TIMEOUT = 60 * 1000 * 2;

var BackgroundController =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(BackgroundController, _EventEmitter);

  function BackgroundController() {
    var _this;

    _classCallCheck(this, BackgroundController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BackgroundController).call(this));
    _this.id = extensionizer__WEBPACK_IMPORTED_MODULE_0___default.a.runtime.id;
    _this.requests = {};
    _this.lastRequestId = 0;
    _this.uiState = {
      popupOpen: false
    };
    _this.state = new _state__WEBPACK_IMPORTED_MODULE_9__["default"]();
    _this._lockTimeout = null;
    _this.wallet = new _herajs_wallet__WEBPACK_IMPORTED_MODULE_4__["Wallet"]({
      appName: 'aergo-browser-wallet',
      instanceId: _this.id
    });

    _this.wallet.use(_tx_scanner__WEBPACK_IMPORTED_MODULE_7__["AergoscanTransactionScanner"]);

    _this.wallet.useStorage(_store__WEBPACK_IMPORTED_MODULE_6__["default"]).then(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var customChains, _arr, _i, chainId;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this.firstLoad(); // Load custom defined chains


              _context.prev = 1;
              _context.next = 4;
              return _this.wallet.datastore.getIndex('settings').get('customChains');

            case 4:
              customChains = _context.sent;
              _arr = Object.keys(customChains.data);

              for (_i = 0; _i < _arr.length; _i++) {
                chainId = _arr[_i];

                _this.wallet.useChain({
                  chainId: chainId,
                  nodeUrl: customChains.data[chainId].nodeUrl
                });
              }

              _context.next = 11;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](1);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 9]]);
    })));

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _config__WEBPACK_IMPORTED_MODULE_5__["default"].chains[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var chain = _step.value;

        _this.wallet.useChain(chain);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    _this.wallet.keyManager.on('lock', function () {
      _this.emit('update', {
        unlocked: false
      });

      console.log('[lock] locked');
    });

    _this.wallet.keyManager.on('unlock', function () {
      _this.emit('update', {
        unlocked: true
      });

      console.log('[lock] unlocked');
    });

    _this.state.on('idle', function () {
      console.log('[state] idle, pausing trackers');

      _this.wallet.accountManager.pause();

      _this.wallet.transactionManager.pause();
    });

    _this.state.on('active', function () {
      console.log('[state] active, resuming trackers');

      _this.wallet.accountManager.resume();

      _this.wallet.transactionManager.resume();
    });

    _this.lock();

    return _this;
  }

  _createClass(BackgroundController, [{
    key: "firstLoad",
    value: function () {
      var _firstLoad = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var accounts, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, account;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.wallet.accountManager.getAccounts();

              case 2:
                accounts = _context2.sent;
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 6;

                for (_iterator2 = accounts[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  account = _step2.value;
                  this.trackAccount(account);
                }

                _context2.next = 14;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](6);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 14:
                _context2.prev = 14;
                _context2.prev = 15;

                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                  _iterator2.return();
                }

              case 17:
                _context2.prev = 17;

                if (!_didIteratorError2) {
                  _context2.next = 20;
                  break;
                }

                throw _iteratorError2;

              case 20:
                return _context2.finish(17);

              case 21:
                return _context2.finish(14);

              case 22:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[6, 10, 14, 22], [15,, 17, 21]]);
      }));

      return function firstLoad() {
        return _firstLoad.apply(this, arguments);
      };
    }()
  }, {
    key: "lock",
    value: function lock() {
      this.wallet.lock();
    }
  }, {
    key: "unlock",
    value: function () {
      var _unlock = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(passphrase) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.wallet.unlock(passphrase);

              case 2:
                this.keepUnlocked();

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function unlock(_x) {
        return _unlock.apply(this, arguments);
      };
    }()
  }, {
    key: "setupAndUnlock",
    value: function () {
      var _setupAndUnlock = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(passphrase) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.wallet.setupAndUnlock(passphrase);

              case 2:
                this.keepUnlocked();

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function setupAndUnlock(_x2) {
        return _setupAndUnlock.apply(this, arguments);
      };
    }()
  }, {
    key: "setActiveAccount",
    value: function () {
      var _setActiveAccount = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref2) {
        var chainId, address, account;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                chainId = _ref2.chainId, address = _ref2.address;
                _context5.next = 3;
                return this.wallet.accountManager.getOrAddAccount({
                  address: address,
                  chainId: chainId
                });

              case 3:
                account = _context5.sent;
                this.activeAccount = account;
                console.log('Active account is now', {
                  chainId: chainId,
                  address: address
                });

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function setActiveAccount(_x3) {
        return _setActiveAccount.apply(this, arguments);
      };
    }()
  }, {
    key: "getActiveAccount",
    value: function () {
      var _getActiveAccount = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", this.activeAccount);

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function getActiveAccount() {
        return _getActiveAccount.apply(this, arguments);
      };
    }()
  }, {
    key: "keepUnlocked",
    value: function keepUnlocked() {
      var _this2 = this;

      if (this._lockTimeout) {
        clearTimeout(this._lockTimeout);
      }

      this._lockTimeout = setTimeout(function () {
        console.log('[lock] auto-locking...');

        _this2.lock();
      }, AUTO_LOCK_TIMEOUT);
    }
  }, {
    key: "isUiOpen",
    value: function isUiOpen() {
      return this.uiState.popupOpen;
    }
  }, {
    key: "trackAccount",
    value: function trackAccount(account, onceCb) {
      var _this3 = this;

      var accountTracker = this.wallet.accountManager.trackAccount(account);
      this.wallet.transactionManager.trackAccount(account);
      accountTracker.then(function (t) {
        t.removeAllListeners('update');
        t.on('update', function (account) {
          console.log('got new state', account);

          _this3.emit('update', {
            accounts: [account]
          });

          if (onceCb) {
            onceCb(account);
            onceCb = false;
          }
        });
      });
    }
  }, {
    key: "permissionRequest",
    value: function permissionRequest(type, data, senderURL, callback, cancelCallback) {
      var requestId = this.lastRequestId++;
      this.requests[requestId] = {
        type: type,
        data: data,
        senderURL: senderURL,
        callback: callback,
        cancelCallback: cancelCallback
      };
      extensionizer__WEBPACK_IMPORTED_MODULE_0___default.a.windows.getCurrent(function (window) {
        var left = Math.max(0, window.left + window.width - 330);
        extensionizer__WEBPACK_IMPORTED_MODULE_0___default.a.windows.create({
          url: chrome.runtime.getURL("popup-request.html?request=".concat(requestId)),
          type: "popup",
          width: 330,
          height: 525,
          top: window.top,
          left: left
        });
      });
    }
  }, {
    key: "respondToPermissionRequest",
    value: function respondToPermissionRequest(requestId, result) {
      var respondCancel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var request = this.requests[requestId];
      if (!request) return;

      if (respondCancel) {
        request.cancelCallback();
        return;
      }

      request.callback(result);
    }
  }, {
    key: "signMessage",
    value: function () {
      var _signMessage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(_ref3) {
        var address, chainId, message, account;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                address = _ref3.address, chainId = _ref3.chainId, message = _ref3.message;
                this.keepUnlocked();
                _context7.next = 4;
                return this.wallet.accountManager.getOrAddAccount({
                  address: address,
                  chainId: chainId
                });

              case 4:
                account = _context7.sent;
                _context7.next = 7;
                return this.wallet.keyManager.signMessage(account, buffer__WEBPACK_IMPORTED_MODULE_12__["Buffer"].from(message));

              case 7:
                return _context7.abrupt("return", _context7.sent);

              case 8:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      return function signMessage(_x4) {
        return _signMessage.apply(this, arguments);
      };
    }()
  }, {
    key: "signTransaction",
    value: function () {
      var _signTransaction = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref4) {
        var address, chainId, txData, account, preparedTxData;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                address = _ref4.address, chainId = _ref4.chainId, txData = _ref4.txData;
                this.keepUnlocked();
                _context8.next = 4;
                return this.wallet.accountManager.getOrAddAccount({
                  address: address,
                  chainId: chainId
                });

              case 4:
                account = _context8.sent;
                _context8.next = 7;
                return this.wallet.accountManager.prepareTransaction(account, txData);

              case 7:
                preparedTxData = _context8.sent;
                _context8.next = 10;
                return this.wallet.keyManager.signTransaction(account, preparedTxData);

              case 10:
                return _context8.abrupt("return", _context8.sent);

              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      return function signTransaction(_x5) {
        return _signTransaction.apply(this, arguments);
      };
    }()
  }, {
    key: "sendTransaction",
    value: function () {
      var _sendTransaction = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(_ref5) {
        var txBody, chainId, txTracker;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                txBody = _ref5.txBody, chainId = _ref5.chainId;
                this.keepUnlocked();
                _context9.next = 4;
                return this.wallet.sendTransaction({
                  address: txBody.from,
                  chainId: chainId
                }, txBody);

              case 4:
                txTracker = _context9.sent;
                console.log(txTracker, txTracker.transaction.txBody);
                return _context9.abrupt("return", txTracker.transaction.txBody);

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      return function sendTransaction(_x6) {
        return _sendTransaction.apply(this, arguments);
      };
    }()
  }, {
    key: "setupCommunication",
    value: function setupCommunication(outStream) {
      var _this4 = this;

      // Setup async rpc stream to UI
      var dnode = dnode_browser_js__WEBPACK_IMPORTED_MODULE_3___default()({
        unlock: function () {
          var _unlock2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee10(_ref6, send) {
            var password;
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    password = _ref6.password;
                    _context10.prev = 1;
                    _context10.next = 4;
                    return _this4.unlock(password);

                  case 4:
                    _context10.next = 11;
                    break;

                  case 6:
                    _context10.prev = 6;
                    _context10.t0 = _context10["catch"](1);
                    console.error(_context10.t0);
                    send({
                      error: '' + _context10.t0
                    });
                    return _context10.abrupt("return");

                  case 11:
                    send({});

                  case 12:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10, this, [[1, 6]]);
          }));

          return function unlock(_x7, _x8) {
            return _unlock2.apply(this, arguments);
          };
        }(),
        lock: function () {
          var _lock = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee11(send) {
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    _this4.lock();

                    send({});

                  case 2:
                  case "end":
                    return _context11.stop();
                }
              }
            }, _callee11, this);
          }));

          return function lock(_x9) {
            return _lock.apply(this, arguments);
          };
        }(),
        setup: function () {
          var _setup = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee12(_ref7, send) {
            var password;
            return regeneratorRuntime.wrap(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    password = _ref7.password;
                    _context12.next = 3;
                    return _this4.setupAndUnlock(password);

                  case 3:
                    send({});

                  case 4:
                  case "end":
                    return _context12.stop();
                }
              }
            }, _callee12, this);
          }));

          return function setup(_x10, _x11) {
            return _setup.apply(this, arguments);
          };
        }(),
        isUnlocked: function () {
          var _isUnlocked = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee13(send) {
            return regeneratorRuntime.wrap(function _callee13$(_context13) {
              while (1) {
                switch (_context13.prev = _context13.next) {
                  case 0:
                    send(_this4.wallet.unlocked);

                  case 1:
                  case "end":
                    return _context13.stop();
                }
              }
            }, _callee13, this);
          }));

          return function isUnlocked(_x12) {
            return _isUnlocked.apply(this, arguments);
          };
        }(),
        reset: function () {
          var _reset = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee14(send) {
            return regeneratorRuntime.wrap(function _callee14$(_context14) {
              while (1) {
                switch (_context14.prev = _context14.next) {
                  case 0:
                    _context14.next = 2;
                    return _this4.wallet.deleteAllData();

                  case 2:
                    send();

                  case 3:
                  case "end":
                    return _context14.stop();
                }
              }
            }, _callee14, this);
          }));

          return function reset(_x13) {
            return _reset.apply(this, arguments);
          };
        }(),
        addNetwork: function () {
          var _addNetwork = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee15(_ref8, send) {
            var chainId, nodeUrl, chains;
            return regeneratorRuntime.wrap(function _callee15$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    chainId = _ref8.chainId, nodeUrl = _ref8.nodeUrl;
                    console.log('Adding chain', {
                      chainId: chainId,
                      nodeUrl: nodeUrl
                    });

                    _this4.wallet.useChain({
                      chainId: chainId,
                      nodeUrl: nodeUrl
                    });

                    chains = {};
                    _context15.prev = 4;
                    _context15.next = 7;
                    return _this4.wallet.datastore.getIndex('settings').get('customChains');

                  case 7:
                    chains = _context15.sent.data;
                    _context15.next = 12;
                    break;

                  case 10:
                    _context15.prev = 10;
                    _context15.t0 = _context15["catch"](4);

                  case 12:
                    chains[chainId] = {
                      chainId: chainId,
                      nodeUrl: nodeUrl
                    };
                    _context15.next = 15;
                    return _this4.wallet.datastore.getIndex('settings').put({
                      key: 'customChains',
                      data: chains
                    });

                  case 15:
                    send({});

                  case 16:
                  case "end":
                    return _context15.stop();
                }
              }
            }, _callee15, this, [[4, 10]]);
          }));

          return function addNetwork(_x14, _x15) {
            return _addNetwork.apply(this, arguments);
          };
        }(),
        getBlockchainStatus: function () {
          var _getBlockchainStatus = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee16(_ref9, send) {
            var chainId, status;
            return regeneratorRuntime.wrap(function _callee16$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    chainId = _ref9.chainId;
                    _context16.next = 3;
                    return _this4.wallet.getClient(chainId).blockchain();

                  case 3:
                    status = _context16.sent;
                    send({
                      blockHeight: status.bestHeight,
                      chainId: chainId
                    });

                  case 5:
                  case "end":
                    return _context16.stop();
                }
              }
            }, _callee16, this);
          }));

          return function getBlockchainStatus(_x16, _x17) {
            return _getBlockchainStatus.apply(this, arguments);
          };
        }(),
        getAccounts: function () {
          var _getAccounts = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee17(send) {
            var accounts, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, account;

            return regeneratorRuntime.wrap(function _callee17$(_context17) {
              while (1) {
                switch (_context17.prev = _context17.next) {
                  case 0:
                    _this4.keepUnlocked();

                    _context17.next = 3;
                    return _this4.wallet.accountManager.getAccounts();

                  case 3:
                    accounts = _context17.sent;
                    _iteratorNormalCompletion3 = true;
                    _didIteratorError3 = false;
                    _iteratorError3 = undefined;
                    _context17.prev = 7;

                    for (_iterator3 = accounts[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                      account = _step3.value;

                      _this4.trackAccount(account);
                    }

                    _context17.next = 15;
                    break;

                  case 11:
                    _context17.prev = 11;
                    _context17.t0 = _context17["catch"](7);
                    _didIteratorError3 = true;
                    _iteratorError3 = _context17.t0;

                  case 15:
                    _context17.prev = 15;
                    _context17.prev = 16;

                    if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                      _iterator3.return();
                    }

                  case 18:
                    _context17.prev = 18;

                    if (!_didIteratorError3) {
                      _context17.next = 21;
                      break;
                    }

                    throw _iteratorError3;

                  case 21:
                    return _context17.finish(18);

                  case 22:
                    return _context17.finish(15);

                  case 23:
                    send(accounts);

                  case 24:
                  case "end":
                    return _context17.stop();
                }
              }
            }, _callee17, this, [[7, 11, 15, 23], [16,, 18, 22]]);
          }));

          return function getAccounts(_x18) {
            return _getAccounts.apply(this, arguments);
          };
        }(),
        createAccount: function () {
          var _createAccount = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee18(_ref10, send) {
            var chainId, account;
            return regeneratorRuntime.wrap(function _callee18$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    chainId = _ref10.chainId;

                    _this4.keepUnlocked();

                    _context18.prev = 2;
                    _context18.next = 5;
                    return _this4.wallet.accountManager.createAccount(chainId);

                  case 5:
                    account = _context18.sent;

                    _this4.trackAccount(account);

                    send(account.data.spec);
                    _context18.next = 13;
                    break;

                  case 10:
                    _context18.prev = 10;
                    _context18.t0 = _context18["catch"](2);
                    send({
                      error: _context18.t0
                    });

                  case 13:
                  case "end":
                    return _context18.stop();
                }
              }
            }, _callee18, this, [[2, 10]]);
          }));

          return function createAccount(_x19, _x20) {
            return _createAccount.apply(this, arguments);
          };
        }(),
        removeAccount: function () {
          var _removeAccount = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee19(_ref11, send) {
            var chainId, address;
            return regeneratorRuntime.wrap(function _callee19$(_context19) {
              while (1) {
                switch (_context19.prev = _context19.next) {
                  case 0:
                    chainId = _ref11.chainId, address = _ref11.address;
                    _context19.next = 3;
                    return _this4.wallet.accountManager.removeAccount({
                      chainId: chainId,
                      address: address
                    });

                  case 3:
                    send();

                  case 4:
                  case "end":
                    return _context19.stop();
                }
              }
            }, _callee19, this);
          }));

          return function removeAccount(_x21, _x22) {
            return _removeAccount.apply(this, arguments);
          };
        }(),
        setActiveAccount: function () {
          var _setActiveAccount2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee20(_ref12, send) {
            var chainId, address;
            return regeneratorRuntime.wrap(function _callee20$(_context20) {
              while (1) {
                switch (_context20.prev = _context20.next) {
                  case 0:
                    chainId = _ref12.chainId, address = _ref12.address;
                    _context20.next = 3;
                    return _this4.setActiveAccount({
                      chainId: chainId,
                      address: address
                    });

                  case 3:
                    send();

                  case 4:
                  case "end":
                    return _context20.stop();
                }
              }
            }, _callee20, this);
          }));

          return function setActiveAccount(_x23, _x24) {
            return _setActiveAccount2.apply(this, arguments);
          };
        }(),
        getActiveAccount: function () {
          var _getActiveAccount2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee21(send) {
            var account;
            return regeneratorRuntime.wrap(function _callee21$(_context21) {
              while (1) {
                switch (_context21.prev = _context21.next) {
                  case 0:
                    _context21.next = 2;
                    return _this4.getActiveAccount();

                  case 2:
                    account = _context21.sent;
                    send(account);

                  case 4:
                  case "end":
                    return _context21.stop();
                }
              }
            }, _callee21, this);
          }));

          return function getActiveAccount(_x25) {
            return _getActiveAccount2.apply(this, arguments);
          };
        }(),
        importAccount: function () {
          var _importAccount = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee22(_ref13, send) {
            var privateKey, chainId, identity, address, account;
            return regeneratorRuntime.wrap(function _callee22$(_context22) {
              while (1) {
                switch (_context22.prev = _context22.next) {
                  case 0:
                    privateKey = _ref13.privateKey, chainId = _ref13.chainId;

                    _this4.keepUnlocked();

                    identity = Object(_herajs_crypto__WEBPACK_IMPORTED_MODULE_8__["identifyFromPrivateKey"])(privateKey);
                    address = identity.address;
                    _context22.prev = 4;
                    _context22.next = 7;
                    return _this4.wallet.accountManager.addAccount({
                      address: address,
                      chainId: chainId
                    });

                  case 7:
                    account = _context22.sent;
                    console.log('importAccount', account, privateKey);
                    _context22.next = 11;
                    return _this4.wallet.keyManager.importKey({
                      account: account,
                      privateKey: privateKey
                    });

                  case 11:
                    _this4.trackAccount(account);

                    send(account.data.spec);
                    _context22.next = 19;
                    break;

                  case 15:
                    _context22.prev = 15;
                    _context22.t0 = _context22["catch"](4);
                    console.error(_context22.t0);
                    send({
                      error: 'Could not import account. ' + _context22.t0
                    });

                  case 19:
                  case "end":
                    return _context22.stop();
                }
              }
            }, _callee22, this, [[4, 15]]);
          }));

          return function importAccount(_x26, _x27) {
            return _importAccount.apply(this, arguments);
          };
        }(),
        exportAccount: function () {
          var _exportAccount = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee23(_ref14, send) {
            var address, chainId, password, account, key, privateKey, privkeyEncrypted;
            return regeneratorRuntime.wrap(function _callee23$(_context23) {
              while (1) {
                switch (_context23.prev = _context23.next) {
                  case 0:
                    address = _ref14.address, chainId = _ref14.chainId, password = _ref14.password;

                    _this4.keepUnlocked();

                    _context23.next = 4;
                    return _this4.wallet.accountManager.getOrAddAccount({
                      address: address,
                      chainId: chainId
                    });

                  case 4:
                    account = _context23.sent;
                    _context23.next = 7;
                    return _this4.wallet.keyManager.getUnlockedKey(account);

                  case 7:
                    key = _context23.sent;
                    console.log(account, key);
                    privateKey = key.data.privateKey;
                    _context23.next = 12;
                    return Object(_herajs_crypto__WEBPACK_IMPORTED_MODULE_8__["encryptPrivateKey"])(privateKey, password);

                  case 12:
                    privkeyEncrypted = _context23.sent;
                    send({
                      privateKey: Object(_herajs_crypto__WEBPACK_IMPORTED_MODULE_8__["encodePrivateKey"])(privkeyEncrypted)
                    });

                  case 14:
                  case "end":
                    return _context23.stop();
                }
              }
            }, _callee23, this);
          }));

          return function exportAccount(_x28, _x29) {
            return _exportAccount.apply(this, arguments);
          };
        }(),
        sendTransaction: function () {
          var _sendTransaction2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee24(tx, chainId, send) {
            var txBody;
            return regeneratorRuntime.wrap(function _callee24$(_context24) {
              while (1) {
                switch (_context24.prev = _context24.next) {
                  case 0:
                    _context24.prev = 0;
                    _context24.next = 3;
                    return _this4.sendTransaction({
                      txBody: tx,
                      chainId: chainId
                    });

                  case 3:
                    txBody = _context24.sent;
                    send({
                      tx: txBody
                    });
                    _context24.next = 11;
                    break;

                  case 7:
                    _context24.prev = 7;
                    _context24.t0 = _context24["catch"](0);
                    console.error(_context24.t0);
                    send({
                      error: _context24.t0.message || '' + _context24.t0
                    });

                  case 11:
                  case "end":
                    return _context24.stop();
                }
              }
            }, _callee24, this, [[0, 7]]);
          }));

          return function sendTransaction(_x30, _x31, _x32) {
            return _sendTransaction2.apply(this, arguments);
          };
        }(),
        signTransaction: function () {
          var _signTransaction2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee25(tx, chainId, send) {
            var txBody;
            return regeneratorRuntime.wrap(function _callee25$(_context25) {
              while (1) {
                switch (_context25.prev = _context25.next) {
                  case 0:
                    _context25.prev = 0;
                    _context25.next = 3;
                    return _this4.signTransaction({
                      txData: tx,
                      address: tx.from,
                      chainId: chainId
                    });

                  case 3:
                    txBody = _context25.sent;
                    send({
                      tx: txBody
                    });
                    _context25.next = 11;
                    break;

                  case 7:
                    _context25.prev = 7;
                    _context25.t0 = _context25["catch"](0);
                    console.error(_context25.t0);
                    send({
                      error: _context25.t0.message || '' + _context25.t0
                    });

                  case 11:
                  case "end":
                    return _context25.stop();
                }
              }
            }, _callee25, this, [[0, 7]]);
          }));

          return function signTransaction(_x33, _x34, _x35) {
            return _signTransaction2.apply(this, arguments);
          };
        }(),
        getAccountTx: function () {
          var _getAccountTx = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee26(accountSpec, send) {
            var txs;
            return regeneratorRuntime.wrap(function _callee26$(_context26) {
              while (1) {
                switch (_context26.prev = _context26.next) {
                  case 0:
                    console.log('getAccountTx', accountSpec);

                    if (accountSpec.address) {
                      _context26.next = 3;
                      break;
                    }

                    return _context26.abrupt("return", send({}));

                  case 3:
                    _context26.next = 5;
                    return _this4.wallet.transactionManager.getAccountTransactions(accountSpec);

                  case 5:
                    txs = _context26.sent;
                    txs.sort(function (a, b) {
                      return a.data.ts < b.data.ts ? 1 : a.data.ts == b.data.ts ? 0 : -1;
                    });
                    send(txs);

                  case 8:
                  case "end":
                    return _context26.stop();
                }
              }
            }, _callee26, this);
          }));

          return function getAccountTx(_x36, _x37) {
            return _getAccountTx.apply(this, arguments);
          };
        }(),
        syncAccountState: function () {
          var _syncAccountState = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee27(accountSpec, send) {
            var account;
            return regeneratorRuntime.wrap(function _callee27$(_context27) {
              while (1) {
                switch (_context27.prev = _context27.next) {
                  case 0:
                    if (accountSpec.address) {
                      _context27.next = 2;
                      break;
                    }

                    return _context27.abrupt("return", send({}));

                  case 2:
                    _context27.next = 4;
                    return _this4.wallet.accountManager.getOrAddAccount(accountSpec);

                  case 4:
                    account = _context27.sent;

                    _this4.trackAccount(account, send);

                  case 6:
                  case "end":
                    return _context27.stop();
                }
              }
            }, _callee27, this);
          }));

          return function syncAccountState(_x38, _x39) {
            return _syncAccountState.apply(this, arguments);
          };
        }(),
        signMessage: function () {
          var _signMessage2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee28(_ref15, send) {
            var address, chainId, message, signedMessage;
            return regeneratorRuntime.wrap(function _callee28$(_context28) {
              while (1) {
                switch (_context28.prev = _context28.next) {
                  case 0:
                    address = _ref15.address, chainId = _ref15.chainId, message = _ref15.message;
                    _context28.prev = 1;
                    _context28.next = 4;
                    return _this4.signMessage({
                      address: address,
                      chainId: chainId,
                      message: message
                    });

                  case 4:
                    signedMessage = _context28.sent;
                    send({
                      signedMessage: signedMessage
                    });
                    _context28.next = 12;
                    break;

                  case 8:
                    _context28.prev = 8;
                    _context28.t0 = _context28["catch"](1);
                    console.error(_context28.t0);
                    send({
                      error: _context28.t0
                    });

                  case 12:
                  case "end":
                    return _context28.stop();
                }
              }
            }, _callee28, this, [[1, 8]]);
          }));

          return function signMessage(_x40, _x41) {
            return _signMessage2.apply(this, arguments);
          };
        }(),
        getStaking: function () {
          var _getStaking = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee29(_ref16, send) {
            var address, chainId, result;
            return regeneratorRuntime.wrap(function _callee29$(_context29) {
              while (1) {
                switch (_context29.prev = _context29.next) {
                  case 0:
                    address = _ref16.address, chainId = _ref16.chainId;

                    _this4.keepUnlocked();

                    _context29.prev = 2;
                    _context29.next = 5;
                    return _this4.wallet.getClient(chainId).getStaking(address);

                  case 5:
                    result = _context29.sent;
                    send({
                      amount: result.amount.toString(),
                      when: result.when
                    });
                    _context29.next = 12;
                    break;

                  case 9:
                    _context29.prev = 9;
                    _context29.t0 = _context29["catch"](2);
                    send({
                      error: _context29.t0
                    });

                  case 12:
                  case "end":
                    return _context29.stop();
                }
              }
            }, _callee29, this, [[2, 9]]);
          }));

          return function getStaking(_x42, _x43) {
            return _getStaking.apply(this, arguments);
          };
        }(),
        getPermissionRequestData: function () {
          var _getPermissionRequestData = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee30(requestId, send) {
            return regeneratorRuntime.wrap(function _callee30$(_context30) {
              while (1) {
                switch (_context30.prev = _context30.next) {
                  case 0:
                    send(_this4.requests[requestId]);

                  case 1:
                  case "end":
                    return _context30.stop();
                }
              }
            }, _callee30, this);
          }));

          return function getPermissionRequestData(_x44, _x45) {
            return _getPermissionRequestData.apply(this, arguments);
          };
        }(),
        respondToPermissionRequest: function () {
          var _respondToPermissionRequest = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee31(_ref17, send) {
            var requestId, result;
            return regeneratorRuntime.wrap(function _callee31$(_context31) {
              while (1) {
                switch (_context31.prev = _context31.next) {
                  case 0:
                    requestId = _ref17.requestId, result = _ref17.result;

                    _this4.respondToPermissionRequest(requestId, result);

                    send();

                  case 3:
                  case "end":
                    return _context31.stop();
                }
              }
            }, _callee31, this);
          }));

          return function respondToPermissionRequest(_x46, _x47) {
            return _respondToPermissionRequest.apply(this, arguments);
          };
        }(),
        denyPermissionRequest: function () {
          var _denyPermissionRequest = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee32(requestId, send) {
            return regeneratorRuntime.wrap(function _callee32$(_context32) {
              while (1) {
                switch (_context32.prev = _context32.next) {
                  case 0:
                    if (_this4.requests[requestId]) {
                      _this4.respondToPermissionRequest(requestId, null, true);

                      delete _this4.requests[requestId];
                    }

                    send();

                  case 2:
                  case "end":
                    return _context32.stop();
                }
              }
            }, _callee32, this);
          }));

          return function denyPermissionRequest(_x48, _x49) {
            return _denyPermissionRequest.apply(this, arguments);
          };
        }()
      });
      pump__WEBPACK_IMPORTED_MODULE_2___default()(outStream, dnode, outStream, function (err) {
        if (err) log.error(err);
      });
      dnode.on('remote', function (remote) {
        var sendUpdate = remote.sendUpdate.bind(remote);

        _this4.on('update', sendUpdate);
      });
      /*setInterval(() => {
          this.emit('update', 'something');
      }, 1000)*/

      this.state.on('change', function (state) {
        _this4.emit('update', {
          state: state
        });
      });
    }
  }]);

  return BackgroundController;
}(events__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]);

/* harmony default export */ __webpack_exports__["default"] = (BackgroundController);

/***/ }),

/***/ "./src/controllers/config.js":
/*!***********************************!*\
  !*** ./src/controllers/config.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  chains: [{
    chainId: 'testnet.aergo.io',
    nodeUrl: 'http://testnet.aergo.io:7845'
  }, {
    chainId: 'main.aergo.io',
    nodeUrl: 'https://mainnet-api-http.aergo.io'
  }, {
    chainId: 'aergo.io',
    nodeUrl: 'https://mainnet-api-http.aergo.io'
  }, {
    chainId: 'sqltestnet.aergo.io',
    nodeUrl: 'https://sqltestnet-api-http.aergo.io'
  }, {
    chainId: 'dev.chain',
    nodeUrl: 'http://127.0.0.1:7845'
  }]
});

/***/ }),

/***/ "./src/controllers/state.js":
/*!**********************************!*\
  !*** ./src/controllers/state.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var IDLE_TIMEOUT = 60 * 1000;

var State =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(State, _EventEmitter);

  function State() {
    var _this;

    _classCallCheck(this, State);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(State).call(this));
    _this._idleTimeout = null;

    _this.set('initial');

    return _this;
  }
  /**
   * App states: initial -> active -> inactive -> idle
   * Opening UI switches state to active. Closing UI switches state to inactive.
   * After being inactive for a certain amount of time, switch to idle.
   * @param {string} nextState 
   */


  _createClass(State, [{
    key: "set",
    value: function set(nextState) {
      var _this2 = this;

      if (nextState != 'inactive') {
        if (this._idleTimeout) {
          clearTimeout(this._idleTimeout);
        }
      }

      if (this.state != nextState && nextState == 'inactive') {
        if (this._idleTimeout) {
          clearTimeout(this._idleTimeout);
        }

        this._idleTimeout = setTimeout(function () {
          _this2.set('idle');
        }, IDLE_TIMEOUT);
      }

      if (this.state != nextState) {
        console.log("[state] ".concat(this.state, " -> ").concat(nextState));
      }

      this.state = nextState;
      this.emit('change', nextState);
      this.emit(nextState);
    }
  }]);

  return State;
}(events__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]);

/* harmony default export */ __webpack_exports__["default"] = (State);

/***/ }),

/***/ "./src/controllers/tx-scanner.js":
/*!***************************************!*\
  !*** ./src/controllers/tx-scanner.js ***!
  \***************************************/
/*! exports provided: AergoscanTransactionScanner */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AergoscanTransactionScanner", function() { return AergoscanTransactionScanner; });
/* harmony import */ var _herajs_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @herajs/client */ "./node_modules/@herajs/client/dist/herajs.js");
/* harmony import */ var _herajs_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_herajs_client__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _herajs_wallet__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @herajs/wallet */ "./node_modules/@herajs/wallet/dist/herajs-wallet.iife.js");
/* harmony import */ var _herajs_wallet__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_herajs_wallet__WEBPACK_IMPORTED_MODULE_1__);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



/**
 * This is a data source for transactionManager.getAccountTransactions.
 * It uses the Aergoscan API which is experimental and subject to change.
 * It is not recommended to use this data source.
 */

var AergoscanTransactionScanner =
/*#__PURE__*/
function () {
  function AergoscanTransactionScanner() {
    _classCallCheck(this, AergoscanTransactionScanner);
  }

  _createClass(AergoscanTransactionScanner, [{
    key: "fetchAccountTransactionsAfter",
    value: function fetchAccountTransactionsAfter(wallet) {
      return function (next) {
        return (
          /*#__PURE__*/
          function () {
            var _ref2 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee(_ref) {
              var account, blockno, limit, chainId, baseUrl, address, q, size, offset, url, response, data;
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      account = _ref.account, blockno = _ref.blockno, limit = _ref.limit;
                      chainId = account.data.spec.chainId;

                      if (!(chainId !== 'testnet.aergo.io' && chainId !== 'aergo.io')) {
                        _context.next = 4;
                        break;
                      }

                      return _context.abrupt("return", next({
                        account: account,
                        blockno: blockno,
                        limit: limit
                      }));

                    case 4:
                      if (chainId == 'testnet.aergo.io') {
                        baseUrl = 'https://api.aergoscan.io/testnet';
                      }

                      if (chainId == 'aergo.io') {
                        baseUrl = 'https://api.aergoscan.io/main';
                      }

                      address = new _herajs_client__WEBPACK_IMPORTED_MODULE_0__["Address"](account.data.spec.address);
                      console.log("[track account] Fetching txs for ".concat(address, " on ").concat(chainId, " since ").concat(blockno, "..."));
                      q = encodeURIComponent("(from:".concat(address, " OR to:").concat(address, ") AND blockno:>").concat(blockno));
                      size = 1000;
                      offset = 0;
                      url = "".concat(baseUrl, "/transactions?q=").concat(q, "&sort=blockno:desc&size=").concat(size, "&from=").concat(offset);
                      _context.next = 14;
                      return fetch(url);

                    case 14:
                      response = _context.sent;
                      _context.next = 17;
                      return response.json();

                    case 17:
                      data = _context.sent;
                      console.log("[track account] Got ".concat(data.hits.length, " (of ").concat(data.total, ") txs for ").concat(address, " since ").concat(blockno, "."));
                      return _context.abrupt("return", data.hits.map(function (tx) {
                        return new _herajs_wallet__WEBPACK_IMPORTED_MODULE_1__["Transaction"](tx.hash, {
                          chainId: chainId,
                          from: tx.meta.from,
                          to: tx.meta.to,
                          hash: tx.hash,
                          ts: tx.meta.ts,
                          blockhash: '',
                          // TODO: remove or add?
                          blockno: tx.meta.blockno,
                          amount: tx.meta.amount,
                          type: tx.meta.type,
                          status: _herajs_wallet__WEBPACK_IMPORTED_MODULE_1__["Transaction"].Status.Confirmed
                        });
                      }));

                    case 20:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee, this);
            }));

            return function (_x) {
              return _ref2.apply(this, arguments);
            };
          }()
        );
      };
    }
  }, {
    key: "fetchAccountTransactions",
    value: function fetchAccountTransactions(wallet) {
      var _this = this;

      return function () {
        return (
          /*#__PURE__*/
          function () {
            var _ref3 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee3(account) {
              var accountSpec, _ref4, bestHeight;

              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      accountSpec = wallet.accountManager.getCompleteAccountSpec(account.data.spec);
                      _context3.next = 3;
                      return wallet.getClient(accountSpec.chainId).blockchain();

                    case 3:
                      _ref4 = _context3.sent;
                      bestHeight = _ref4.bestHeight;
                      return _context3.abrupt("return", _this.fetchAccountTransactionsBefore(wallet)(
                      /*#__PURE__*/
                      _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee2() {
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                return _context2.abrupt("return", []);

                              case 1:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2, this);
                      })))({
                        account: account,
                        blockno: bestHeight
                      }));

                    case 6:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3, this);
            }));

            return function (_x2) {
              return _ref3.apply(this, arguments);
            };
          }()
        );
      };
    }
  }]);

  return AergoscanTransactionScanner;
}();

/***/ }),

/***/ "./src/manifest.json":
/*!***************************!*\
  !*** ./src/manifest.json ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "manifest.json";

/***/ }),

/***/ 2:
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

/******/ });
//# sourceMappingURL=background.js.map