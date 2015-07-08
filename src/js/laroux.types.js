/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

let staticKeys = ['_callbacks', '_onupdate'];

class Observable {
    constructor(data) {
        let self = this;

        this._callbacks = [];
        this._onupdate = function (changes) {
            helpers.callAll(
                self._callbacks,
                self,
                [changes]
            );
        };

        this.observe(this);

        if (data) {
            this.setRange(data);
        }
    }

    set(key, value) {
        if (staticKeys.indexOf(key) === -1) {
            this[key] = value;
        }
    }

    setRange(values) {
        for (let valueKey in values) {
            this.set(valueKey, values[valueKey]);
        }
    }

    get(key, defaultValue) {
        if (key in this && staticKeys.indexOf(key) === -1) {
            return this[key];
        }

        return defaultValue || null;
    }

    getRange(keys) {
        let values = {};

        for (let item in keys) {
            values[keys[item]] = this[keys[item]];
        }

        return values;
    }

    keys() {
        let keys = [];

        for (let item in this) {
            if (staticKeys.indexOf(item) === -1) {
                keys.push(item);
            }
        }

        return keys;
    }

    length() {
        return this.keys().length;
    }

    exists(key) {
        return (key in this);
    }

    remove(key) {
        if (staticKeys.indexOf(key) === -1) {
            delete this[key];
        }
    }

    clear() {
        for (let item in this) {
            if (!this.hasOwnProperty(item) || staticKeys.indexOf(item) !== -1) {
                continue;
            }

            delete this[item];
        }
    }

    observe(obj) {
        if ('observe' in Object) {
            Object.observe(obj, this._onupdate);
        }
    }

    unobserve(obj) {
        if ('unobserve' in Object) {
            Object.unobserve(obj);
        }
    }

    on(callback) {
        this._callbacks.push(callback);
    }

    off(callback) {
        helpers.removeFromArray(this._callbacks, callback);
    }
}

let types = {
    observable: Observable
};

export default types;
