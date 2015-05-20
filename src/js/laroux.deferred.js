/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

export default class Deferred {
    constructor() {
        this.events = {};
    }

    invoke() {
        var args = helpers.toArray(arguments),
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

    on(eventName, callback) {
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

    static async(fnc) {
        var deferred = new Deferred(),
            args = arguments;

        setTimeout(function () {
            try {
                let result = fnc.apply(undefined, args);
                deferred.invoke('done', result);
            } catch (err) {
                deferred.invoke('fail', err);
            }
        }, 0);

        return deferred;
    }
}
