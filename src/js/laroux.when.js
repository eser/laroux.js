/*jslint node: true */
'use strict';

import Deferred from './laroux.deferred.js';
import helpers from './laroux.helpers.js';

export default class When {
    constructor() {
        let self = this;

        this.queues = [];
        this.remaining = -1;

        this.deferredCompleted = function () {
            self.remaining--;
            self.check();
        };

        if (arguments.length > 0) {
            this.then.apply(this, arguments);
        }
    }

    then() {
        let args = helpers.toArray(arguments);
        this.queues.push(args);

        this.check();

        return this;
    }

    check() {
        while (this.remaining <= 0) {
            if (this.remaining !== -1) {
                this.queues.shift();
            }

            if (this.queues.length === 0) {
                this.remaining = -1;
                return;
            }

            let queue = this.queues[0];
            console.log('queue: ', queue);

            this.remaining = 0;
            for (let i = 0, length = queue.length; i < length; i++) {
                if (queue[i] instanceof Deferred) { // and still pending
                    this.remaining++;
                    queue[i].on('completed', this.deferredCompleted);
                }
            }
        }
    }
}
