/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

// promise - partially taken from 'promise-polyfill' project
//           can be found at: https://github.com/taylorhakes/promise-polyfill
class PromisePolyfill {
    constructor(callback) {
        this.state = null;
        this.value = null;
        this.deferreds = [];

        this.catch = this._catch;

        if (callback !== undefined) {
            this.doResolve(
                callback,
                helpers.bind(this.resolve, this),
                helpers.bind(this.reject, this)
            );
        }
    }

    doResolve(callback, onFulfilled, onRejected) {
        let done = false;

        try {
            callback(
                function (value) {
                    if (done) {
                        return;
                    }

                    done = true;
                    onFulfilled(value);
                },
                function (reason) {
                    if (done) {
                        return;
                    }

                    done = true;
                    onRejected(reason);
                }
            );
        } catch (err) {
            if (done) {
                return;
            }

            done = true;
            onRejected(err);
        }
    }

    resolve(newValue) {
        try {
            if (newValue && newValue.then !== undefined && newValue.then.constructor === Function) {
                this.doResolve(
                    helpers.bind(newValue.then, newValue),
                    helpers.bind(this.resolve, this),
                    helpers.bind(this.reject, this)
                );
                return;
            }

            this.state = true;
            this.value = newValue;

            this.finale();
        } catch (err) {
            this.reject(err);
        }
    }

    reject(newValue) {
        this.state = false;
        this.value = newValue;

        this.finale();
    }

    finale() {
        for (let i = 0, length = this.deferreds.length; i < length; i++) {
            this.handle(this.deferreds[i]);
        }

        this.deferreds = null;
    }

    handle(deferred) {
        let self = this;

        if (this.state === null) {
            this.deferreds.push(deferred);
            return;
        }

        helpers.async(function () {
            let callback = self.state ? deferred.onFulfilled : deferred.onRejected;

            if (callback === null) {
                (self.state ? deferred.resolve : deferred.reject)(self.value);
                return;
            }

            let result;
            try {
                result = callback(self.value);
            } catch (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(result);
        });
    }

    then(onFulfilled, onRejected) {
        let self = this;

        return new PromisePolyfill(function (resolve, reject) {
            self.handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        });
    }

    _catch(onRejected) {
        this.then(null, onRejected);
    }

    static all(...deferreds) {
        if (deferreds.length === 1 && deferreds.constructor === Array) {
            deferreds = deferreds[0];
        }

        return new PromisePolyfill(function (resolve, reject) {
            let remaining = deferreds.length;

            if (remaining === 0) {
                return [];
            }

            let res = function (i, deferred) {
                try {
                    if (deferred && deferred.then !== undefined && deferred.then.constructor === Function) {
                        deferred.then.call(deferred, function (value) { res(i, value); }, reject);
                        return;
                    }

                    deferreds[i] = deferred;
                    if (--remaining === 0) {
                        resolve(deferreds);
                    }
                } catch (err) {
                    reject(err);
                }
            };

            for (let i = 0, length = deferreds.length; i < length; i++) {
                res(i, deferreds[i]);
            }
        });
    }

    static resolve(value) {
        if (value && value.constructor === PromisePolyfill) {
            return value;
        }

        return new PromisePolyfill(function (resolve) {
            resolve(value);
        });
    }

    static reject(reason) {
        return new PromisePolyfill(function (resolve, reject) {
            reject(reason);
        });
    }

    static race(values) {
        return new PromisePolyfill(function (resolve, reject) {
            for (let i = 0, length = values.length; i < length; i++) {
                values[i].then(resolve, reject);
            }
        });
    }
}

export default (Promise || PromisePolyfill);
