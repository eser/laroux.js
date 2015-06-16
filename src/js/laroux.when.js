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

    then(...args) {
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
                break;
            }

            let queue = this.queues[0];
            // console.log('queue: ', queue);

            this.remaining = 0;
            for (let i = 0, length = queue.length; i < length; i++) {
                if (queue[i].constructor === Function) {
                    queue[i] = Deferred.async(queue[i]);
                }

                if (queue[i] instanceof Deferred && !queue[i].is('completed')) {
                    this.remaining++;
                    queue[i].completed(this.deferredCompleted);
                }
            }
        }
    }
}
