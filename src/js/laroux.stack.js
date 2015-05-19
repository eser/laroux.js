/*jslint node: true */
'use strict';

export default class Stack {
    constructor(data, depth, top) {
        this._data = {};
        this._depth = depth;
        this._top = top || this;

        if (data) {
            this.setRange(data);
        }
    }

    set(key, value) {
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
                this._data[key] = new Stack(
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
    }

    setRange(values) {
        for (var valueKey in values) {
            if (!values.hasOwnProperty(valueKey)) {
                continue;
            }

            this.set(valueKey, values[valueKey]);
        }
    }

    get(key, defaultValue) {
        return this[key] || defaultValue || null;
    }

    getRange(keys) {
        var values = {};

        for (var item in keys) {
            if (!keys.hasOwnProperty(item)) {
                continue;
            }

            values[keys[item]] = this[keys[item]];
        }

        return values;
    }

    keys() {
        return Object.keys(this._data);
    }

    length() {
        return Object.keys(this._data).length;
    }

    exists(key) {
        return (key in this._data);
    }

    remove(key) {
        if (key in this._data) {
            delete this[key];
            delete this._data[key];
        }
    }

    clear() {
        for (var item in this._data) {
            if (!this._data.hasOwnProperty(item)) {
                continue;
            }

            delete this[item];
            delete this._data[item];
        }

        this._data = {};
    }

    onupdate(event) {
    }
}
