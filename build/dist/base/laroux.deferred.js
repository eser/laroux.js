/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var Deferred = function Deferred(fnc, isAsync) {
        if (!(this instanceof Deferred)) {
            return new Deferred(fnc, isAsync);
        }

        this._delegates = [];
        this._delegateQueue = null;
        this._events = [];
        this._eventStack = null;
        this.completed = false;

        if (fnc !== undefined) {
            this.then(fnc, isAsync);
        }
    };

    Deferred.prototype.then = function (fnc, isAsync) {
        var delegate = { fnc: fnc, isAsync: isAsync };

        this._delegates.push(delegate);

        return this;
    };

    Deferred.prototype.on = function (condition, fnc) {
        var conditions = _larouxHelpersJs2['default'].getAsArray(condition),
            ev = {
            conditions: conditions,
            fnc: fnc
        };

        this._events.push(ev);

        return this;
    };

    Deferred.prototype.invoke = function () {
        var eventName = Array.prototype.shift.call(arguments),
            removeKeys = [];

        for (var item in this._eventStack) {
            if (!this._eventStack.hasOwnProperty(item)) {
                continue;
            }

            var eventItem = this._eventStack[item],
                eventIdx = _larouxHelpersJs2['default'].aindex(eventItem.conditions, eventName);

            if (eventIdx !== -1) {
                eventItem.conditions.splice(eventIdx, 1);
            }

            if (eventItem.conditions.length > 0) {
                continue;
            }

            removeKeys = _larouxHelpersJs2['default'].prependArray(removeKeys, item);
            eventItem.fnc.apply(this, arguments);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._eventStack.splice(removeKeys[item2], 1);
        }
    };

    Deferred.prototype.complete = function () {
        this.completed = true;
        this.invoke('complete');
    };

    Deferred.prototype.next = function () {
        var self = this,
            delegate = this._delegateQueue.shift(),
            args = _larouxHelpersJs2['default'].toArray(arguments);

        if (this.completed) {
            return this;
        }

        if (delegate === undefined) {
            var parameters = ['success'].concat(args);

            this.invoke.apply(this, parameters);
            this.complete();

            return this;
        }

        setTimeout(function () {
            try {
                var lastReturn = delegate.fnc.apply(self, args);
                if (delegate.isAsync !== true) {
                    self.next.call(self, lastReturn);
                }
            } catch (err) {
                self.invoke('error', err);
                self.complete();
            }
        }, 0);

        return this;
    };

    Deferred.prototype.start = function () {
        this._delegateQueue = this._delegates.slice();
        this._eventStack = this._events.slice();
        this.completed = false;

        return this.next.apply(this, arguments);
    };

    return Deferred;
})();

module.exports = exports['default'];