(function () {
    'use strict';

    // promise
    laroux.ns('laroux', {
        promise: function (fnc) {
            if (!(this instanceof laroux.promise)) {
                return new laroux.promise(fnc);
            }

            this._delegates = [];
            this._delegateQueue = [];
            this._events = [];
            this._eventStack = [];
            this._terminated = false;

            if (fnc !== undefined) {
                this.then(fnc);
            }
        }
    });

    laroux.promise.prototype.then = function (fnc) {
        this._delegates.push(fnc);
        this._delegateQueue.push(fnc);

        return this;
    };

    laroux.promise.prototype.on = function (condition, fnc) {
        var conditions = laroux.helpers.getAsArray(condition),
            ev = {
                conditions: conditions,
                fnc: fnc
            };

        this._events.push(ev);
        this._eventStack.push(ev);

        return this;
    };

    laroux.promise.prototype.invoke = function (eventName, terminate, args) {
        var removeKeys = [];
        for (var item in this._eventStack) {
            if (!this._eventStack.hasOwnProperty(item)) {
                continue;
            }

            var eventItem = this._eventStack[item],
                eventIdx = laroux.helpers.aindex(eventItem.conditions, eventName);

            if (eventIdx !== -1) {
                eventItem.conditions.splice(eventIdx, 1);
            }

            if (eventItem.conditions.length > 0) {
                continue;
            }

            removeKeys.unshift(item);
            eventItem.fnc.apply(this, args);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._eventStack.splice(removeKeys[item2], 1);
        }

        if (terminate === true) {
            this._terminated = true;
            this.invoke('complete', false);
        }
    };

    laroux.promise.prototype.start = function () {
        var self = this,
            delegate = this._delegateQueue.shift(),
            args = laroux.helpers.toArray(arguments);

        if (this._terminated) {
            return;
        }

        if (delegate === undefined) {
            this.invoke('success', true, args);
            return;
        }

        setTimeout(function () {
            try {
                var lastReturn = delegate.apply(self, args);
                self.start.call(self, lastReturn);
            } catch (err) {
                self.invoke('error', true, [err]);
            }
        }, 0);

        return this;
    };

    laroux.promise.prototype.reset = function () {
        this._delegateQueue = this._delegates.slice();
        this._eventStack = this._events.slice();
        this._terminated = false;

        return this;
    };

}).call(this);
