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
                eventName = args.shift();

            if (eventName in this.events) {
                this.events[eventName].completed = true;
                this.events[eventName].result = args;
            } else {
                this.events[eventName] = { callbacks: [], completed: true, result: args };
            }

            if ('callbacks' in this.events[eventName]) {
                var callbacks = this.events[eventName].callbacks;

                while (callbacks.length > 0) {
                    var callback = callbacks.shift();
                    callback.apply(undefined, args);
                }
            }

            return this;
        }
    }, {
        key: 'on',
        value: function on(eventName, callback) {
            if (!(eventName in this.events)) {
                this.events[eventName] = {
                    callbacks: [callback],
                    completed: false,
                    result: undefined
                };

                return this;
            }

            var event = this.events[eventName];

            if (event.completed) {
                callback.apply(undefined, event.result);

                return this;
            }

            event.callbacks.push(callback);

            return this;
        }
    }], [{
        key: 'async',
        value: function async(fnc) {
            var deferred = new Deferred(),
                args = arguments;

            setTimeout(function () {
                try {
                    var result = fnc.apply(undefined, args);
                    deferred.invoke('done', result);
                } catch (err) {
                    deferred.invoke('fail', err);
                }
            }, 0);

            return deferred;
        }
    }]);

    return Deferred;
})();

exports['default'] = Deferred;
module.exports = exports['default'];