/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.1.0
 * @link https://eserozvataf.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var Deferred = (function () {
    function Deferred() {
        _classCallCheck(this, Deferred);

        this.events = {};
    }

    _createClass(Deferred, [{
        key: 'invoke',
        value: function invoke(eventName) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var finalEvent = eventName === 'done' || eventName === 'fail';

            if (eventName in this.events) {
                this.events[eventName].invoked = true;
                this.events[eventName].result = args;

                this.invokeCallback(this.events[eventName], args);
            } else {
                this.events[eventName] = { callbacks: [], invoked: true, result: args };
            }

            if (finalEvent && 'completed' in this.events) {
                this.invokeCallback(this.events.completed, [eventName].concat(args));
            }

            return this;
        }
    }, {
        key: 'invokeCallback',
        value: function invokeCallback(event, args) {
            if (!('callbacks' in event)) {
                return;
            }

            var callbacks = event.callbacks;

            while (callbacks.length > 0) {
                var callback = callbacks.shift();
                callback.apply(this, args);
            }
        }
    }, {
        key: 'resolve',
        value: function resolve() {
            var _invoke;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return (_invoke = this.invoke).call.apply(_invoke, [this, 'done'].concat(args));
        }
    }, {
        key: 'reject',
        value: function reject() {
            var _invoke2;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return (_invoke2 = this.invoke).call.apply(_invoke2, [this, 'fail'].concat(args));
        }
    }, {
        key: 'on',
        value: function on(eventName, callback) {
            if (!(eventName in this.events)) {
                this.events[eventName] = {
                    callbacks: [callback],
                    invoked: false,
                    result: undefined
                };

                return this;
            }

            var event = this.events[eventName];

            if (event.invoked) {
                callback.apply(this, event.result);

                return this;
            }

            event.callbacks.push(callback);

            return this;
        }
    }, {
        key: 'done',
        value: function done(callback) {
            return this.on('done', callback);
        }
    }, {
        key: 'fail',
        value: function fail(callback) {
            return this.on('fail', callback);
        }
    }, {
        key: 'completed',
        value: function completed(callback) {
            return this.on('completed', callback);
        }
    }, {
        key: 'is',
        value: function is(eventName) {
            if (!(eventName in this.events)) {
                return false;
            }

            return this.events[eventName].invoked;
        }
    }], [{
        key: 'async',
        value: function async(callback) {
            for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                args[_key4 - 1] = arguments[_key4];
            }

            var deferred = new Deferred();

            setTimeout(function () {
                try {
                    var result = callback.apply(deferred, args);
                    deferred.resolve(result);
                } catch (err) {
                    deferred.reject(err);
                }
            }, 0);

            return deferred;
        }
    }]);

    return Deferred;
})();

exports['default'] = Deferred;
module.exports = exports['default'];