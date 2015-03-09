(function () {
    'use strict';

    // promise
    laroux.ns('laroux', {
        promise: function (fnc) {
            if (!(this instanceof laroux.promise)) {
                return new laroux.promise(fnc);
            }

            this._delegates = [];
            this._events = [];
            this._permanentEvents = ['error', 'success', 'complete'];
            this._terminated = false;

            if (fnc !== undefined) {
                this.then(fnc);
            }
        }
    });

    laroux.promise.prototype.then = function (fnc) {
        this._delegates.push(fnc);

        return this;
    };

    laroux.promise.prototype.catch = function (condition, fnc) {
        var conditions = laroux.helpers.getAsArray(condition);

        this._events.push({
            conditions: conditions,
            fnc: fnc
        });

        return this;
    };

    laroux.promise.prototype.throw = function () {
        var eventName = Array.prototype.shift.call(arguments),
            terminate = Array.prototype.shift.call(arguments);

        var removeKeys = [];
        for (var item in this._events) {
            if (!this._events.hasOwnProperty(item)) {
                continue;
            }

            var eventItem = this._events[item],
                eventIdx = laroux.helpers.aindex(eventItem.conditions, eventName);

            if (eventIdx !== -1) {
                eventItem.conditions.splice(eventIdx, 1);
            }

            if (eventItem.conditions.length > 0) {
                continue;
            }

            if (laroux.helpers.aindex(this._permanentEvents, item) === -1) {
                removeKeys.unshift(item);
            }
            eventItem.fnc.apply(this, arguments);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._events.splice(removeKeys[item2], 1);
        }

        if (terminate === true) {
            this._terminated = true;
            this.throw('complete', false);
        }
    };

    laroux.promise.prototype.next = function () {
        var self = this,
            delegate = this._delegates.shift(),
            args = laroux.helpers.toArray(arguments);

        if (this._terminated) {
            return;
        }

        if (delegate === undefined) {
            this.throw.apply(this, ['success', true].concat(args));
            return;
        }

        setTimeout(function () {
            try {
                var lastReturn = delegate.apply(self, args);
                self.next.call(self, lastReturn);
            } catch (err) {
                self.throw('error', true, [err]);
            }
        }, 0);
    };

}).call(this);
