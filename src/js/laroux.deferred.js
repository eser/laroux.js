/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

export default class Deferred {
    constructor() {
        this.events = {};
    }

    invoke(eventName, ...args) {
        let finalEvent = (eventName === 'done' || eventName === 'fail');

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

    invokeCallback(event, args) {
        if (!('callbacks' in event)) {
            return;
        }

        let callbacks = event.callbacks;

        while (callbacks.length > 0) {
            let callback = callbacks.shift();
            callback.apply(this, args);
        }
    }

    resolve(...args) {
        return this.invoke.call(this, 'done', ...args);
    }

    reject(...args) {
        return this.invoke.call(this, 'fail', ...args);
    }

    on(eventName, callback) {
        if (!(eventName in this.events)) {
            this.events[eventName] = {
                callbacks: [callback],
                invoked: false,
                result: undefined
            };

            return this;
        }

        let event = this.events[eventName];

        if (event.invoked) {
            callback.apply(this, event.result);

            return this;
        }

        event.callbacks.push(callback);

        return this;
    }

    done(callback) {
        return this.on('done', callback);
    }

    fail(callback) {
        return this.on('fail', callback);
    }

    completed(callback) {
        return this.on('completed', callback);
    }

    is(eventName) {
        if (!(eventName in this.events)) {
            return false;
        }

        return this.events[eventName].invoked;
    }

    static async(callback, ...args) {
        let deferred = new Deferred();

        setTimeout(function () {
            try {
                let result = callback.apply(deferred, args);
                deferred.resolve(result);
            } catch (err) {
                deferred.reject(err);
            }
        }, 0);

        return deferred;
    }
}
