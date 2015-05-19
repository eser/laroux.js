/*jslint nomen: true */
(function () {
    'use strict';

    // stack
    laroux.ns('laroux', {
        stack: function (data, depth, top) {
            if (!(this instanceof laroux.stack)) {
                return new this(data, depth, top);
            }

            this._data = {};
            this._depth = depth;
            this._top = top || this;

            if (data) {
                this.setRange(data);
            }
        }
    });

    laroux.stack.prototype.set = function (key, value) {
        // delete this._data[key];

        var type = typeof value;
        switch (type) {
        case 'function':
            this._data[key] = value;

            Object.defineProperty(
                this,
                key,
                {
                    configurable: true,
                    get: function () {
                        return this._data[key]();
                    }
                }
            );
            break;

        default:
            /*
            if (type == 'object') {
                this._data[key] = new laroux.stack(
                    value,
                    this._depth ?
                        this._depth + '.' + key :
                        key,
                    this._top
                );
            } else {
                this._data[key] = value;
            }
            */
            this._data[key] = value;

            Object.defineProperty(
                this,
                key,
                {
                    configurable: true,
                    get: function () {
                        return this._data[key];
                    },
                    set: function (newValue) {
                        var oldValue = this._data[key];
                        if (this._data[key] === newValue) {
                            return;
                        }

                        // this.set(this, key, newValue);
                        this._data[key] = newValue;
                        this._top.onupdate({ scope: this, key: key, oldValue: oldValue, newValue: newValue });
                    }
                }
            );
            break;
        }
    };

    laroux.stack.prototype.setRange = function (values) {
        for (var valueKey in values) {
            if (!values.hasOwnProperty(valueKey)) {
                continue;
            }

            this.set(valueKey, values[valueKey]);
        }
    };

    laroux.stack.prototype.get = function (key, defaultValue) {
        return this[key] || defaultValue || null;
    };

    laroux.stack.prototype.getRange = function (keys) {
        var values = {};

        for (var item in keys) {
            if (!keys.hasOwnProperty(item)) {
                continue;
            }

            values[keys[item]] = this[keys[item]];
        }

        return values;
    };

    laroux.stack.prototype.keys = function () {
        return Object.keys(this._data);
    };

    laroux.stack.prototype.length = function () {
        return Object.keys(this._data).length;
    };

    laroux.stack.prototype.exists = function (key) {
        return (key in this._data);
    };

    laroux.stack.prototype.remove = function (key) {
        if (key in this._data) {
            delete this[key];
            delete this._data[key];
        }
    };

    laroux.stack.prototype.clear = function () {
        for (var item in this._data) {
            if (!this._data.hasOwnProperty(item)) {
                continue;
            }

            delete this[item];
            delete this._data[item];
        }

        this._data = {};
    };

    laroux.stack.prototype.onupdate = function (event) {
    };

}).call(this);
