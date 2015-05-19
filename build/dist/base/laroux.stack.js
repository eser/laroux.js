/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Stack = (function () {
    function Stack(data, depth, top) {
        _classCallCheck(this, Stack);

        this._data = {};
        this._depth = depth;
        this._top = top || this;

        if (data) {
            this.setRange(data);
        }
    }

    _createClass(Stack, [{
        key: 'set',
        value: function set(key, value) {
            // delete this._data[key];

            var type = typeof value;
            switch (type) {
                case 'function':
                    this._data[key] = value;

                    Object.defineProperty(this, key, {
                        configurable: true,
                        get: function get() {
                            return this._data[key]();
                        }
                    });
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

                    Object.defineProperty(this, key, {
                        configurable: true,
                        get: function get() {
                            return this._data[key];
                        },
                        set: function set(newValue) {
                            var oldValue = this._data[key];
                            if (this._data[key] === newValue) {
                                return;
                            }

                            // this.set(this, key, newValue);
                            this._data[key] = newValue;
                            this._top.onupdate({ scope: this, key: key, oldValue: oldValue, newValue: newValue });
                        }
                    });
                    break;
            }
        }
    }, {
        key: 'setRange',
        value: function setRange(values) {
            for (var valueKey in values) {
                if (!values.hasOwnProperty(valueKey)) {
                    continue;
                }

                this.set(valueKey, values[valueKey]);
            }
        }
    }, {
        key: 'get',
        value: function get(key, defaultValue) {
            return this[key] || defaultValue || null;
        }
    }, {
        key: 'getRange',
        value: function getRange(keys) {
            var values = {};

            for (var item in keys) {
                if (!keys.hasOwnProperty(item)) {
                    continue;
                }

                values[keys[item]] = this[keys[item]];
            }

            return values;
        }
    }, {
        key: 'keys',
        value: function keys() {
            return Object.keys(this._data);
        }
    }, {
        key: 'length',
        value: function length() {
            return Object.keys(this._data).length;
        }
    }, {
        key: 'exists',
        value: function exists(key) {
            return key in this._data;
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            if (key in this._data) {
                delete this[key];
                delete this._data[key];
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            for (var item in this._data) {
                if (!this._data.hasOwnProperty(item)) {
                    continue;
                }

                delete this[item];
                delete this._data[item];
            }

            this._data = {};
        }
    }, {
        key: 'onupdate',
        value: function onupdate(event) {}
    }]);

    return Stack;
})();

exports['default'] = Stack;
module.exports = exports['default'];