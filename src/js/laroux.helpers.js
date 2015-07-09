/*jslint node: true */
/*global FormData, NodeList */
'use strict';

let helpers = {
    uniqueId: 0,

    getUniqueId: function () {
        /*jslint plusplus: true */
        return 'uid-' + (++helpers.uniqueId);
    },

    bindContext: function (method, context) {
        if (method.bind !== undefined) {
            return method.bind(context);
        }

        return function () {
            method.apply(context, arguments);
        };
    },

    async: function (callback) {
        if ('setImmediate' in global) {
            setImmediate(callback);
            return;
        }

        setTimeout(callback, 0);
    },

    clone: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    merge: function (target, source, clone) {
        let result = clone ? helpers.clone(target) : target,
            keys = Object.keys(source);

        for (let i = 0, length = keys.length; i < length; i++) {
            let key = keys[i];

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

    mergeNs: function (target, path, source) {
        let ptr = target,
            pathSlices = path.split('.'),
            keys = Object.keys(source);

        for (let i = 0, length = pathSlices.length; i < length; i++) {
            let current = pathSlices[i];

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

    buildQueryString: function (values, rfc3986) {
        let uri = '',
            regEx = /%20/g;

        for (let name in values) {
            if (!values.hasOwnProperty(name)) {
                continue;
            }

            if (typeof values[name] !== 'function') {
                if (rfc3986 || false) {
                    uri += '&' + encodeURIComponent(name).replace(regEx, '+') + '=' + encodeURIComponent(values[name].toString()).replace(regEx, '+');
                } else {
                    uri += '&' + encodeURIComponent(name) + '=' + encodeURIComponent(values[name].toString());
                }
            }
        }

        return uri.substr(1);
    },

    buildFormData: function (values) {
        let data = new FormData();

        for (let name in values) {
            if (!values.hasOwnProperty(name)) {
                continue;
            }

            if (typeof values[name] !== 'function') {
                data.append(name, values[name]);
            }
        }

        return data;
    },

    format: function (...args) {
        return Array.prototype.shift.call(args).replace(
            /%s/g,
            function () {
                return Array.prototype.shift.call(args);
            }
        );
    },

    replaceAll: function (text, dictionary) {
        let re = new RegExp(Object.keys(dictionary).join('|'), 'g');

        return text.replace(
            re,
            function (match) {
                return dictionary[match];
            }
        );
    },

    camelCase: function (value) {
        let flag = false;
        let output = '';

        for (let j = 0; j < value.length; j++) {
            let currChar = value.charAt(j);
            if (currChar === '-') {
                flag = true;
                continue;
            }

            output += (!flag) ? currChar : currChar.toUpperCase();
            flag = false;
        }

        return output;
    },

    antiCamelCase: function (value) {
        let output = '';

        for (let j = 0; j < value.length; j++) {
            let currChar = value.charAt(j);
            if (currChar !== '-' && currChar == currChar.toUpperCase()) {
                output += '-' + currChar.toLowerCase();
                continue;
            }

            output += currChar;
        }

        return output;
    },

    quoteAttr: function (value) {
        return value.replace(/&/g, '&amp;')
                    .replace(/'/g, '&apos;')
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/\r\n/g, '&#13;')
                    .replace(/[\r\n]/g, '&#13;');
    },

    spliceString: function (value, index, count, add) {
        return value.slice(0, index) + (add || '') + value.slice(index + count);
    },

    assign: function (values, keys) {
        let result = {};

        for (let i = 0, length = keys.length; i < length; i++) {
            result[keys[i]] = values[i];
        }

        return result;
    },

    random: function (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    },

    find: function (obj, iterator, context) {
        let result;

        obj.some(function (value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });

        return result;
    },

    each: function (arr, callback, testOwnProperties) {
        for (let item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            if (callback(item, arr[item]) === false) {
                break;
            }
        }

        return arr;
    },

    map: function (arr, callback, dontSkipReturns, testOwnProperties) {
        let results = [];

        for (let item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            let result = callback(arr[item], item);
            if (result === false) {
                break;
            }

            if (dontSkipReturns || result !== undefined) {
                results.push(result);
            }
        }

        return results;
    },

    index: function (arr, value, testOwnProperties) {
        for (let item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            if (arr[item] === value) {
                return item;
            }
        }

        return null;
    },

    aeach: function (arr, callback) {
        for (let i = 0, length = arr.length; i < length; i++) {
            if (callback(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    },

    amap: function (arr, callback, dontSkipReturns) {
        let results = [];

        for (let i = 0, length = arr.length; i < length; i++) {
            let result = callback(arr[i], i);
            if (result === false) {
                break;
            }

            if (dontSkipReturns || result !== undefined) {
                results.push(result);
            }
        }

        return results;
    },

    aindex: function (arr, value, start) {
        for (let i = (start || 0), length = arr.length; i < length; i++) {
            if (arr[i] === value) {
                return i;
            }
        }

        return -1;
    },

    column: function (obj, key) {
        return helpers.map(
            obj,
            function (value) {
                return value[key];
            },
            true
        );
    },

    shuffle: function (obj) {
        let index = 0,
            shuffled = [];

        for (let item in obj) {
            if (!obj.hasOwnProperty(item)) {
                continue;
            }

            let rand = helpers.random(0, index);
            shuffled[index++] = shuffled[rand];
            shuffled[rand] = obj[item];
        }

        return shuffled;
    },

    prependArray: function (obj, value) {
        let length = obj.length,
            items = new Array(length + 1);

        items[0] = value;
        for (let i = 0, j = 1; i < length; i++, j++) {
            items[j] = obj[i];
        }

        return items;
    },

    removeFromArray: function (obj, value) {
        let targetKey = null;

        for (let item in obj) {
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

    toArray: function (obj) {
        let length = obj.length,
            items = new Array(length);

        for (let i = 0; i < length; i++) {
            items[i] = obj[i];
        }

        return items;
    },

    getAsArray: function (obj) {
        if (obj instanceof Array) {
            return obj;
        }

        if (obj instanceof NodeList) {
            let length = obj.length;

            let items = new Array(length);
            for (let i = 0; i < length; i++) {
                items[i] = obj[i];
            }

            return items;
        }

        return [obj];
    },

    getLength: function (obj) {
        if (obj.constructor === Object) {
            if (obj.length !== undefined) {
                return obj.length;
            }

            return Object.keys(obj).length;
        }

        return -1;
    },

    getKeysRecursive: function (obj, delimiter, prefix, keys) {
        if (delimiter === undefined) {
            delimiter = '.';
        }

        if (prefix === undefined) {
            prefix = '';
            keys = [];
        }

        for (let item in obj) {
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

    getElement: function (obj, path, defaultValue, delimiter) {
        if (defaultValue === undefined) {
            defaultValue = null;
        }

        if (delimiter === undefined) {
            delimiter = '.';
        }

        let pos = path.indexOf(delimiter);
        let key;
        let rest;
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

    callAll: function (callbacks, scope, parameters) {
        for (let i = 0, length = callbacks.length; i < length; i++) {
            callbacks[i].apply(scope, parameters);
        }
    },

    executeScript: function (script) {
        var module = {
                exports: {}
            },
            exports = module.exports,
            require = function () {};

        /*jslint evil:true */
        eval('(function () { ' + script + '})();');

        return module.exports;
    }
};

export default helpers;
