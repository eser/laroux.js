/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
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
        value: function invoke() {
            var args = _larouxHelpersJs2['default'].toArray(arguments),
                eventName = args.shift(),
                finalEvent = eventName === 'done' || eventName === 'fail';

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
                callback.apply(undefined, args);
            }
        }
    }, {
        key: 'resolve',
        value: function resolve() {
            var args = _larouxHelpersJs2['default'].toArray(arguments);
            args.unshift('done');

            return this.invoke.apply(this, args);
        }
    }, {
        key: 'reject',
        value: function reject() {
            var args = _larouxHelpersJs2['default'].toArray(arguments);
            args.unshift('fail');

            return this.invoke.apply(this, args);
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
                callback.apply(undefined, event.result);

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
        value: function async(fnc) {
            var deferred = new Deferred(),
                args = arguments;

            setTimeout(function () {
                try {
                    var result = fnc.apply(undefined, args);
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