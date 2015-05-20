/*jslint node: true */
'use strict';

export default class Async {
    constructor(fnc, completedCallback) {
        this.fnc = fnc;
        this.completedCallbacks = [];
        this.isCompleted = false;
        this.result = undefined;

        if (completedCallback) {
            this.completedCallbacks.push(completedCallback);
        }
    }

    onCompleted(completedCallback) {
        if (this.isCompleted) {
            completedCallback.call(undefined, this.result);
            return this;
        }

        this.completedCallbacks.push(completedCallback);
        return this;
    }

    invoke() {
        var self = this,
            args = arguments;

        setTimeout(function () {
            let result = {};

            try {
                result.result = self.fnc.apply(undefined, args);
                result.success = true;
            } catch (err) {
                result.exception = err;
                result.success = false;
            }

            self.result = result;
            self.isCompleted = true;

            while (self.completedCallbacks.length > 0) {
                var fnc = self.completedCallbacks.shift();
                fnc.call(undefined, self.result);
            }
        }, 0);

        return this;
    }
}
