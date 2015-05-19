/**
 * laroux.js - A jquery substitute for modern browsers (web bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxStackJs = require('./laroux.stack.js');

var _larouxStackJs2 = _interopRequireDefault(_larouxStackJs);

exports['default'] = (function () {
    'use strict';

    var laroux = function laroux(selector, parent) {
        if (selector instanceof Array) {
            return _larouxHelpersJs2['default'].toArray((parent || document).querySelectorAll(selector));
        }

        // FIXME: Laroux: non-chromium optimization, but it runs
        //                slowly in chromium
        //
        // var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        // if (re) {
        //     return (parent || document).getElementById(re[1]);
        // }

        return (parent || document).querySelector(selector);
    };

    _larouxHelpersJs2['default'].extend(laroux, _larouxHelpersJs2['default']);
    _larouxHelpersJs2['default'].extend(laroux, {
        stack: _larouxStackJs2['default']
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;
})();

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.helpers.js":2,"./laroux.stack.js":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var helpers = {
        uniqueId: 0,

        getUniqueId: function getUniqueId() {
            /*jslint plusplus: true */
            return 'uid-' + ++helpers.uniqueId;
        },

        extend: (function (_extend) {
            function extend(_x, _x2) {
                return _extend.apply(this, arguments);
            }

            extend.toString = function () {
                return _extend.toString();
            };

            return extend;
        })(function (target, source) {
            var keys = Object.keys(source);

            for (var i = 0, length = keys.length; i < length; i++) {
                var key = keys[i];

                if (target[key] instanceof Array) {
                    target[key] = target[key].concat(source[key]);
                    continue;
                }

                if (target[key] instanceof Object) {
                    extend(target[key], source[key]);
                    continue;
                }

                target[key] = source[key];
            }

            return target;
        }),

        extendNs: function extendNs(target, path, source) {
            var ptr = target,
                pathSlices = path.split('.'),
                keys = Object.keys(source);

            for (var i = 0, length = pathSlices.length; i < length; i++) {
                var current = pathSlices[i];

                if (ptr[current] === undefined) {
                    ptr[current] = {};
                }

                ptr = ptr[current];
            }

            if (source !== undefined) {
                // might be replaced w/ $l.extend method
                helpers.extend(ptr, source);
            }

            return target;
        },

        buildQueryString: function buildQueryString(values, rfc3986) {
            var uri = '',
                regEx = /%20/g;

            for (var name in values) {
                if (!values.hasOwnProperty(name)) {
                    continue;
                }

                if (typeof values[name] != 'function') {
                    if (rfc3986 || false) {
                        uri += '&' + encodeURIComponent(name).replace(regEx, '+') + '=' + encodeURIComponent(values[name].toString()).replace(regEx, '+');
                    } else {
                        uri += '&' + encodeURIComponent(name) + '=' + encodeURIComponent(values[name].toString());
                    }
                }
            }

            return uri.substr(1);
        },

        buildFormData: function buildFormData(values) {
            var data = new FormData();

            for (var name in values) {
                if (!values.hasOwnProperty(name)) {
                    continue;
                }

                if (typeof values[name] != 'function') {
                    data.append(name, values[name]);
                }
            }

            return data;
        },

        format: function format() {
            var args = arguments;
            return Array.prototype.shift.call(args).replace(/%s/g, function () {
                return Array.prototype.shift.call(args);
            });
        },

        replaceAll: function replaceAll(text, dictionary) {
            var re = new RegExp(Object.keys(dictionary).join('|'), 'g');

            return text.replace(re, function (match) {
                return dictionary[match];
            });
        },

        camelCase: function camelCase(value) {
            var flag = false;
            var output = '';

            for (var j = 0; j < value.length; j++) {
                var currChar = value.charAt(j);
                if (currChar == '-') {
                    flag = true;
                    continue;
                }

                output += !flag ? currChar : currChar.toUpperCase();
                flag = false;
            }

            return output;
        },

        antiCamelCase: function antiCamelCase(value) {
            var output = '';

            for (var j = 0; j < value.length; j++) {
                var currChar = value.charAt(j);
                if (currChar != '-' && currChar == currChar.toUpperCase()) {
                    output += '-' + currChar.toLowerCase();
                    continue;
                }

                output += currChar;
            }

            return output;
        },

        quoteAttr: function quoteAttr(value) {
            return value.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\r\n/g, '&#13;').replace(/[\r\n]/g, '&#13;');
        },

        spliceString: function spliceString(value, index, count, add) {
            return value.slice(0, index) + (add || '') + value.slice(index + count);
        },

        random: function random(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        find: function find(obj, iterator, context) {
            var result;

            obj.some(function (value, index, list) {
                if (iterator.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });

            return result;
        },

        each: function each(arr, fnc, testOwnProperties) {
            for (var item in arr) {
                if (testOwnProperties && !arr.hasOwnProperty(item)) {
                    continue;
                }

                if (fnc(item, arr[item]) === false) {
                    break;
                }
            }

            return arr;
        },

        map: function map(arr, fnc, dontSkipReturns, testOwnProperties) {
            var results = [];

            for (var item in arr) {
                if (testOwnProperties && !arr.hasOwnProperty(item)) {
                    continue;
                }

                var result = fnc(arr[item], item);
                if (result === false) {
                    break;
                }

                if (dontSkipReturns || result !== undefined) {
                    results.push(result);
                }
            }

            return results;
        },

        index: function index(arr, value, testOwnProperties) {
            for (var item in arr) {
                if (testOwnProperties && !arr.hasOwnProperty(item)) {
                    continue;
                }

                if (arr[item] === value) {
                    return item;
                }
            }

            return null;
        },

        aeach: function aeach(arr, fnc) {
            for (var i = 0, length = arr.length; i < length; i++) {
                if (fnc(i, arr[i]) === false) {
                    break;
                }
            }

            return arr;
        },

        amap: function amap(arr, fnc, dontSkipReturns) {
            var results = [];

            for (var i = 0, length = arr.length; i < length; i++) {
                var result = fnc(arr[i], i);
                if (result === false) {
                    break;
                }

                if (dontSkipReturns || result !== undefined) {
                    results.push(result);
                }
            }

            return results;
        },

        aindex: function aindex(arr, value, start) {
            for (var i = start || 0, length = arr.length; i < length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }

            return -1;
        },

        column: function column(obj, key) {
            return helpers.map(obj, function (value) {
                return value[key];
            }, true);
        },

        shuffle: function shuffle(obj) {
            var index = 0,
                shuffled = [];

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                var rand = helpers.random(0, index);
                shuffled[index++] = shuffled[rand];
                shuffled[rand] = obj[item];
            }

            return shuffled;
        },

        merge: function merge() {
            var target = Array.prototype.shift.call(arguments),
                tmp = target,
                isArray = tmp instanceof Array;

            for (var item in arguments) {
                if (isArray) {
                    tmp = tmp.concat(arguments[item]);
                    continue;
                }

                for (var attr in arguments[item]) {
                    if (!arguments[item].hasOwnProperty(attr)) {
                        continue;
                    }

                    tmp[attr] = arguments[item][attr];
                }
            }

            return tmp;
        },

        duplicate: function duplicate(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        prependArray: function prependArray(obj, value) {
            var length = obj.length,
                items = new Array(length + 1);

            items[0] = value;
            for (var i = 0, j = 1; i < length; i++, j++) {
                items[j] = obj[i];
            }

            return items;
        },

        toArray: function toArray(obj) {
            var length = obj.length,
                items = new Array(length);

            for (var i = 0; i < length; i++) {
                items[i] = obj[i];
            }

            return items;
        },

        getAsArray: function getAsArray(obj) {
            if (obj instanceof Array) {
                return obj;
            }

            if (obj instanceof NodeList) {
                var length = obj.length;

                var items = new Array(length);
                for (var i = 0; i < length; i++) {
                    items[i] = obj[i];
                }

                return items;
            }

            return [obj];
        },

        getLength: function getLength(obj) {
            if (obj.constructor === Object) {
                if (obj.length !== undefined) {
                    return obj.length;
                }

                return Object.keys(obj).length;
            }

            return -1;
        },

        getKeysRecursive: function getKeysRecursive(obj, delimiter, prefix, keys) {
            if (delimiter === undefined) {
                delimiter = '.';
            }

            if (prefix === undefined) {
                prefix = '';
                keys = [];
            }

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                keys.push(prefix + item);

                if (obj[item] !== undefined && obj[item] !== null && obj[item].constructor === Object) {
                    helpers.getKeysRecursive(obj[item], delimiter, prefix + item + delimiter, keys);
                    continue;
                }
            }

            return keys;
        },

        getElement: function getElement(obj, path, defaultValue, delimiter) {
            if (defaultValue === undefined) {
                defaultValue = null;
            }

            if (delimiter === undefined) {
                delimiter = '.';
            }

            var pos = path.indexOf(delimiter);
            var key;
            var rest;
            if (pos === -1) {
                key = path;
                rest = null;
            } else {
                key = path.substring(0, pos);
                rest = path.substring(pos + 1);
            }

            if (!(key in obj)) {
                return defaultValue;
            }

            if (rest === null || rest.length === 0) {
                return obj[key];
            }

            return helpers.getElement(obj[key], rest, defaultValue, delimiter);
        }
    };

    return helpers;
})();

module.exports = exports['default'];
},{}],3:[function(require,module,exports){
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
},{}]},{},[1]);
