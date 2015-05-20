/*jslint node: true */
'use strict';

import Async from './laroux.async.js';
import helpers from './laroux.helpers.js';

export default class Deferred {
    constructor() {
        this.values = [];
        this.missingValues = -1;

        if (arguments.length > 0) {
            this.then.apply(this, arguments);
        }
    }

    then() {
        var args = helpers.toArray(arguments);

        this.values.push(args);
        this.check();

        return this;
    }

    check() {
        while (this.missingValues <= 0) {
            // pop new one
            if (this.missingValues !== -1) {
                this.values.shift();
            }

            if (this.values.length === 0) {
                // this.complete();
                return;
            }

            let current = this.values[0];
            this.missingValues = 0;
            for (let i = 0, length = current.length; i < length; i++) {
                if (current instanceof Async) {
                    current.onCompleted(this.asyncComplete);
                    this.missingValues++;
                }
            }
        }
    }

    asyncComplete(result) {
        this.missingValues--;
        this.check();
    }

    /*
    next() {
        if (this.missingValues !== -1) {
            this.values.shift();
        }

        this.missingValues = 0;
        for (let i = 0, length = args.length; i < length; i++) {
            if (args[i] instanceof Async) {
                args[i].onCompleted(this.asyncComplete);
                this.missingValues++;
            }
        }

        this.check();

        return this;
    }

    check() {
        if (this.missingValues > 0) {
            return;
        }
    }
    */
}
