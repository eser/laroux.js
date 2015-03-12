(function () {
    'use strict';

    // promise
    laroux.ns('laroux', {
        promise: function (fnc, isAsync) {
            if (!(this instanceof laroux.promise)) {
                return new laroux.promise(fnc, isAsync);
            }

            this._delegates = [];
            this._delegateQueue = null;
            this._events = [];
            this._eventStack = null;
            this.completed = false;

            if (fnc !== undefined) {
                this.then(fnc, isAsync);
            }
        }
    });

    laroux.promise.prototype.then = function (fnc, isAsync) {
        var delegate = { fnc: fnc, isAsync: isAsync };

        this._delegates.push(delegate);

        return this;
    };

    laroux.promise.prototype.on = function (condition, fnc) {
        var conditions = laroux.getAsArray(condition),
            ev = {
                conditions: conditions,
                fnc: fnc
            };

        this._events.push(ev);

        return this;
    };

    laroux.promise.prototype.invoke = function () {
        var eventName = Array.prototype.shift.call(arguments),
            removeKeys = [];

        for (var item in this._eventStack) {
            if (!this._eventStack.hasOwnProperty(item)) {
                continue;
            }

            var eventItem = this._eventStack[item],
                eventIdx = laroux.aindex(eventItem.conditions, eventName);

            if (eventIdx !== -1) {
                eventItem.conditions.splice(eventIdx, 1);
            }

            if (eventItem.conditions.length > 0) {
                continue;
            }

            removeKeys = laroux.prependArray(removeKeys, item);
            eventItem.fnc.apply(this, arguments);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._eventStack.splice(removeKeys[item2], 1);
        }
    };

    laroux.promise.prototype.complete = function () {
        this.completed = true;
        this.invoke('complete');
    };

    laroux.promise.prototype.next = function () {
        var self = this,
            delegate = this._delegateQueue.shift(),
            args = laroux.toArray(arguments);

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

    laroux.promise.prototype.start = function () {
        this._delegateQueue = this._delegates.slice();
        this._eventStack = this._events.slice();
        this.completed = false;

        return this.next.apply(this, arguments);
    };

}).call(this);
