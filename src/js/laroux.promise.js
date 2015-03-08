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

            if (fnc !== undefined) {
                this.and(fnc);
            }
        }
    });

    laroux.promise.prototype.and = function (fnc) {
        this._delegates.push(fnc);

        return this;
    };

    laroux.promise.prototype.on = function (condition, fnc) {
        var conditions = laroux.helpers.getAsArray(condition);

        this._events.push({
            conditions: conditions,
            fnc: fnc
        });

        return this;
    };

    laroux.promise.prototype.omit = function () {
        var eventName = Array.prototype.shift.call(arguments);
        // fnc.apply(null, [this].concat(laroux.helpers.toArray(arguments)));

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

            removeKeys.unshift(item);
            eventItem.fnc.apply(this, arguments);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._events.splice(removeKeys[item2], 1);
        }
    };

    laroux.promise.prototype.begin = function () {
        for (var item in this._delegates) {
            if (!this._delegates.hasOwnProperty(item)) {
                continue;
            }

            this._delegates[item].apply(this, arguments);
        }

        return this;
    };

}).call(this);
