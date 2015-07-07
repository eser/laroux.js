/*jslint node: true */
'use strict';

import PromiseObject from './laroux.promiseObject.js';

export default class Storyboard {
    constructor(...args) {
        let self = this;

        this.phases = [];
        this.phaseKeys = {};
        this.currentIteration = 0;
        this.running = false;

        for (let i = 0, length = args.length; i < length; i++) {
            this.addPhase(args[i]);
        }

        this.checkPromise = function () {
            if (--self.phases[self.currentIteration].promises === 0 && !self.running) {
                self.start();
            }
        };
    }

    addPhase(key) {
        this.phaseKeys[key] = this.phases.length;
        this.phases.push({
            key: key,
            callbacks: [],
            promises: 0
        });
    }

    add(phase, callback) {
        if (callback.constructor === PromiseObject) {
            return this.addPromise(phase, callback);
        }

        let phaseId = this.phaseKeys[phase];

        if (phaseId < this.currentIteration) {
            // execute immediately if phase is already passed
            callback.apply(global);
            return;
        }

        this.phases[phaseId].callbacks.push(callback);
    }

    addPromise(phase, promise) {
        let phaseId = this.phaseKeys[phase];

        // skips if phase is already passed
        if (phaseId < this.currentIteration) {
            return;
        }

        this.phases[phaseId].promises++;
        // FIXME: must be handled even if it has failed
        promise.then(this.checkPromise);
    }

    start() {
        this.running = true;

        while (this.phases.length > this.currentIteration) {
            let currentPhase = this.phases[this.currentIteration];

            while (currentPhase.callbacks.length > 0) {
                let fnc = currentPhase.callbacks.shift();
                fnc.apply(global);
            }

            if (currentPhase.promises > 0) {
                break;
            }

            this.currentIteration++;
        }

        this.running = false;
    }
}
