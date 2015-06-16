/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
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

        clone: function clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        merge: function merge(target, source, clone) {
            var result = clone ? helpers.clone(target) : target,
                keys = Object.keys(source);

            for (var i = 0, _length = keys.length; i < _length; i++) {
                var key = keys[i];

                if (result[key] instanceof Array) {
                    result[key] = result[key].concat(source[key]);
                    continue;
                }

                if (result[key] instanceof Object) {
                    helpers.merge(result[key], source[key]);
                    continue;
                }

                result[key] = source[key];
            }

            return result;
        },

        mergeNs: function mergeNs(target, path, source) {
            var ptr = target,
                pathSlices = path.split('.'),
                keys = Object.keys(source);

            for (var i = 0, _length2 = pathSlices.length; i < _length2; i++) {
                var current = pathSlices[i];

                if (ptr[current] === undefined) {
                    ptr[current] = {};
                }

                ptr = ptr[current];
            }

            if (source !== undefined) {
                // might be replaced w/ $l.merge method
                helpers.merge(ptr, source);
            }

            return target;
        },

        buildQueryString: function buildQueryString(values, rfc3986) {
            var uri = '',
                regEx = /%20/g;

            for (var _name in values) {
                if (!values.hasOwnProperty(_name)) {
                    continue;
                }

                if (typeof values[_name] !== 'function') {
                    if (rfc3986 || false) {
                        uri += '&' + encodeURIComponent(_name).replace(regEx, '+') + '=' + encodeURIComponent(values[_name].toString()).replace(regEx, '+');
                    } else {
                        uri += '&' + encodeURIComponent(_name) + '=' + encodeURIComponent(values[_name].toString());
                    }
                }
            }

            return uri.substr(1);
        },

        buildFormData: function buildFormData(values) {
            var data = new FormData();

            for (var _name2 in values) {
                if (!values.hasOwnProperty(_name2)) {
                    continue;
                }

                if (typeof values[_name2] !== 'function') {
                    data.append(_name2, values[_name2]);
                }
            }

            return data;
        },

        format: function format() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

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
                if (currChar === '-') {
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
                if (currChar !== '-' && currChar == currChar.toUpperCase()) {
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
            var result = undefined;

            obj.some(function (value, index, list) {
                if (iterator.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });

            return result;
        },

        each: function each(arr, callback, testOwnProperties) {
            for (var item in arr) {
                if (testOwnProperties && !arr.hasOwnProperty(item)) {
                    continue;
                }

                if (callback(item, arr[item]) === false) {
                    break;
                }
            }

            return arr;
        },

        map: function map(arr, callback, dontSkipReturns, testOwnProperties) {
            var results = [];

            for (var item in arr) {
                if (testOwnProperties && !arr.hasOwnProperty(item)) {
                    continue;
                }

                var result = callback(arr[item], item);
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

        aeach: function aeach(arr, callback) {
            for (var i = 0, _length3 = arr.length; i < _length3; i++) {
                if (callback(i, arr[i]) === false) {
                    break;
                }
            }

            return arr;
        },

        amap: function amap(arr, callback, dontSkipReturns) {
            var results = [];

            for (var i = 0, _length4 = arr.length; i < _length4; i++) {
                var result = callback(arr[i], i);
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
            for (var i = start || 0, _length5 = arr.length; i < _length5; i++) {
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

        prependArray: function prependArray(obj, value) {
            var length = obj.length,
                items = new Array(length + 1);

            items[0] = value;
            for (var i = 0, j = 1; i < length; i++, j++) {
                items[j] = obj[i];
            }

            return items;
        },

        removeFromArray: function removeFromArray(obj, value) {
            var targetKey = null;

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                if (obj[item] === value) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                obj.splice(targetKey, 1);
                return true;
            }

            return false;
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
                var _length6 = obj.length;

                var items = new Array(_length6);
                for (var i = 0; i < _length6; i++) {
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
            var key = undefined;
            var rest = undefined;
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
        },

        callAll: function callAll(callbacks, scope, parameters) {
            for (var i = 0, _length7 = callbacks.length; i < _length7; i++) {
                callbacks[i].apply(scope, parameters);
            }
        }
    };

    return helpers;
})();

module.exports = exports['default'];