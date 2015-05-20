/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

export default class Deferred {
    constructor() {
        this.events = {};
    }

    invoke() {
        let args = helpers.toArray(arguments),
            eventName = args.shift(),
            finalEvent = (eventName === 'done' || eventName === 'fail');

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
            callback.apply(undefined, args);
        }
    }

    resolve() {
        let args = helpers.toArray(arguments);
        args.unshift('done');

        return this.invoke.apply(this, args);
    }

    reject() {
        let args = helpers.toArray(arguments);
        args.unshift('fail');

        return this.invoke.apply(this, args);
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
            callback.apply(undefined, event.result);

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

    static async(fnc) {
        let deferred = new Deferred(),
            args = arguments;

        setTimeout(function () {
            try {
                let result = fnc.apply(undefined, args);
                deferred.resolve(result);
            } catch (err) {
                deferred.reject(err);
            }
        }, 0);

        return deferred;
    }
}
