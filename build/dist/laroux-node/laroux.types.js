/**
 * laroux.js - A jquery substitute for modern browsers (laroux-node bundle)
 *
 * @version v2.2.0
 * @link https://eserozvataf.github.io/laroux.js
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

var staticKeys = ['_callbacks', '_onupdate'];

var Observable = (function () {
    function Observable(data) {
        _classCallCheck(this, Observable);

        var self = this;

        this._callbacks = [];
        this._onupdate = function (changes) {
            _larouxHelpersJs2['default'].callAll(self._callbacks, self, [changes]);
        };

        this.observe(this);

        if (data) {
            this.setRange(data);
        }
    }

    _createClass(Observable, [{
        key: 'set',
        value: function set(key, value) {
            if (staticKeys.indexOf(key) === -1) {
                this[key] = value;
            }
        }
    }, {
        key: 'setRange',
        value: function setRange(values) {
            for (var valueKey in values) {
                this.set(valueKey, values[valueKey]);
            }
        }
    }, {
        key: 'get',
        value: function get(key, defaultValue) {
            if (key in this && staticKeys.indexOf(key) === -1) {
                return this[key];
            }

            return defaultValue || null;
        }
    }, {
        key: 'getRange',
        value: function getRange(keys) {
            var values = {};

            for (var item in keys) {
                values[keys[item]] = this[keys[item]];
            }

            return values;
        }
    }, {
        key: 'keys',
        value: function keys() {
            var keys = [];

            for (var item in this) {
                if (staticKeys.indexOf(item) === -1) {
                    keys.push(item);
                }
            }

            return keys;
        }
    }, {
        key: 'length',
        value: function length() {
            return this.keys().length;
        }
    }, {
        key: 'exists',
        value: function exists(key) {
            return key in this;
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            if (staticKeys.indexOf(key) === -1) {
                delete this[key];
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            for (var item in this) {
                if (!this.hasOwnProperty(item) || staticKeys.indexOf(item) !== -1) {
                    continue;
                }

                delete this[item];
            }
        }
    }, {
        key: 'observe',
        value: function observe(obj) {
            if ('observe' in Object) {
                Object.observe(obj, this._onupdate);
            }
        }
    }, {
        key: 'unobserve',
        value: function unobserve(obj) {
            if ('unobserve' in Object) {
                Object.unobserve(obj);
            }
        }
    }, {
        key: 'on',
        value: function on(callback) {
            this._callbacks.push(callback);
        }
    }, {
        key: 'off',
        value: function off(callback) {
            _larouxHelpersJs2['default'].removeFromArray(this._callbacks, callback);
        }
    }]);

    return Observable;
})();

var types = {
    observable: Observable
};

exports['default'] = types;
module.exports = exports['default'];