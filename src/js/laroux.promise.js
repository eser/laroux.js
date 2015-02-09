module.exports = (function () {
    'use strict';

    // promise
    var laroux_promise = function (data) {
        if (!(this instanceof laroux_promise)) {
            return new this(data);
        }

        this.when = function (fnc) {
            this._data.push(fnc);
        };

        this.then = function () {
        };

        this.begin = function () {
        };

        if (typeof data !== 'undefined') {
            this._data = [];
        } else {
            this._data = Array.prototype.slice.call(data);
            this.begin();
        }
    };

    return laroux_promise;

}());
