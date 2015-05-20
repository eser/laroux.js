/*jslint node: true */
'use strict';

import Deferred from './laroux.deferred.js';

export default class Async {
    constructor(fnc) {
        this.fnc = fnc;
        this.deferred = new Deferred();

        this.invoke();
    }

    invoke() {
        var self = this,
            args = arguments;

        setTimeout(function () {
            try {
                let result = self.fnc.apply(undefined, args);
                self.deferred.invoke('done', result);
            } catch (err) {
                self.deferred.invoke('fail', err);
            }
        }, 0);

        return this;
    }
}
