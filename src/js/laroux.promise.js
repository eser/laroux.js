(function () {
    'use strict';

    // promise
    laroux.ns('laroux', {
        promise: function (data) {
            if (!(this instanceof laroux.promise)) {
                return new this(data);
            }

            if (typeof data !== 'undefined') {
                this._data = [];
            } else {
                this._data = Array.prototype.slice.call(data);
                this.begin();
            }
        }
    });

    laroux.promise.prototype.when = function (fnc) {
        this._data.push(fnc);
    };

    laroux.promise.prototype.then = function () {
    };

    laroux.promise.prototype.begin = function () {
    };

}).call(this);
