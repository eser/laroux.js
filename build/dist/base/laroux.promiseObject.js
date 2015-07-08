/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

// promiseObject - partially taken from 'promise-polyfill' project
//                 can be found at: https://github.com/taylorhakes/promise-polyfill
//                 see laroux.promiseObject.LICENSE file for details

var PromisePolyfill = (function () {
    function PromisePolyfill(callback) {
        _classCallCheck(this, PromisePolyfill);

        this.state = null;
        this.value = null;
        this.deferreds = [];

        this['catch'] = this._catch;

        if (callback !== undefined) {
            this.doResolve(callback, _larouxHelpersJs2['default'].bindContext(this.resolve, this), _larouxHelpersJs2['default'].bindContext(this.reject, this));
        }
    }

    _createClass(PromisePolyfill, [{
        key: 'doResolve',
        value: function doResolve(callback, onFulfilled, onRejected) {
            var done = false;

            try {
                callback(function (value) {
                    if (done) {
                        return;
                    }

                    done = true;
                    onFulfilled(value);
                }, function (reason) {
                    if (done) {
                        return;
                    }

                    done = true;
                    onRejected(reason);
                });
            } catch (err) {
                if (done) {
                    return;
                }

                done = true;
                onRejected(err);
            }
        }
    }, {
        key: 'resolve',
        value: function resolve(newValue) {
            try {
                if (newValue && newValue.then !== undefined && newValue.then.constructor === Function) {
                    this.doResolve(_larouxHelpersJs2['default'].bindContext(newValue.then, newValue), _larouxHelpersJs2['default'].bindContext(this.resolve, this), _larouxHelpersJs2['default'].bindContext(this.reject, this));
                    return;
                }

                this.state = true;
                this.value = newValue;

                this.finale();
            } catch (err) {
                this.reject(err);
            }
        }
    }, {
        key: 'reject',
        value: function reject(newValue) {
            this.state = false;
            this.value = newValue;

            this.finale();
        }
    }, {
        key: 'finale',
        value: function finale() {
            for (var i = 0, _length = this.deferreds.length; i < _length; i++) {
                this.handle(this.deferreds[i]);
            }

            this.deferreds = null;
        }
    }, {
        key: 'handle',
        value: function handle(deferred) {
            var self = this;

            if (this.state === null) {
                this.deferreds.push(deferred);
                return;
            }

            _larouxHelpersJs2['default'].async(function () {
                var callback = self.state ? deferred.onFulfilled : deferred.onRejected;

                if (callback === null) {
                    (self.state ? deferred.resolve : deferred.reject)(self.value);
                    return;
                }

                var result = undefined;
                try {
                    result = callback(self.value);
                } catch (err) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve(result);
            });
        }
    }, {
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            var self = this;

            return new PromisePolyfill(function (resolve, reject) {
                self.handle({
                    onFulfilled: onFulfilled || null,
                    onRejected: onRejected || null,
                    resolve: resolve,
                    reject: reject
                });
            });
        }
    }, {
        key: '_catch',
        value: function _catch(onRejected) {
            this.then(null, onRejected);
        }
    }], [{
        key: 'all',
        value: function all() {
            for (var _len = arguments.length, deferreds = Array(_len), _key = 0; _key < _len; _key++) {
                deferreds[_key] = arguments[_key];
            }

            if (deferreds.length === 1 && deferreds.constructor === Array) {
                deferreds = deferreds[0];
            }

            return new PromisePolyfill(function (resolve, reject) {
                var remaining = deferreds.length;

                if (remaining === 0) {
                    return [];
                }

                var res = function res(i, deferred) {
                    try {
                        if (deferred && deferred.then !== undefined && deferred.then.constructor === Function) {
                            deferred.then.call(deferred, function (value) {
                                res(i, value);
                            }, reject);
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

                for (var i = 0, _length2 = deferreds.length; i < _length2; i++) {
                    res(i, deferreds[i]);
                }
            });
        }
    }, {
        key: 'resolve',
        value: function resolve(value) {
            if (value && value.constructor === PromisePolyfill) {
                return value;
            }

            return new PromisePolyfill(function (resolve) {
                resolve(value);
            });
        }
    }, {
        key: 'reject',
        value: function reject(reason) {
            return new PromisePolyfill(function (resolve, reject) {
                reject(reason);
            });
        }
    }, {
        key: 'race',
        value: function race(values) {
            return new PromisePolyfill(function (resolve, reject) {
                for (var i = 0, _length3 = values.length; i < _length3; i++) {
                    values[i].then(resolve, reject);
                }
            });
        }
    }]);

    return PromisePolyfill;
})();

var promiseExist = ('Promise' in global);

exports['default'] = promiseExist ? Promise : PromisePolyfill;
module.exports = exports['default'];