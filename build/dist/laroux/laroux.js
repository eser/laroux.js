/**
 * laroux.js - A jquery substitute for modern browsers (laroux bundle)
 *
 * @version v2.2.0
 * @link https://eserozvataf.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global fetch, Headers, Request, Response, Blob, FormData, FileReader, XMLHttpRequest */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

// ajax - partially taken from 'window.fetch polyfill' project
//        can be found at: https://github.com/github/fetch
//        see laroux.ajax.LICENSE file for details
var fetchPolyfill = function fetchPolyfill(request, init) {
    // TODO: Request constructor should accept input, init
    if (init || request.constructor !== RequestPolyfill) {
        request = new RequestPolyfill(request, init);
    }

    return new _larouxPromiseObjectJs2['default'](function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
            var status = xhr.status === 1223 ? 204 : xhr.status;
            if (status < 100 || status >= 600) {
                reject(new TypeError('Network request failed'));
                return;
            }

            var options = {
                status: status,
                statusText: xhr.statusText,
                headers: new HeadersPolyfill()
            },
                allHeaders = xhr.getAllResponseHeaders(),
                pairs = allHeaders.trim().split('\n');

            pairs.forEach(function (header) {
                var split = header.trim().split(':'),
                    key = split.shift().trim(),
                    value = split.join(':').trim();

                options.headers.append(key, value);
            });

            if ('responseURL' in xhr) {
                options.url = xhr.responseURL;
            } else if (options.headers.has('X-Request-URL')) {
                // Avoid security warnings on getResponseHeader when not allowed by CORS
                options.url = options.headers.get('X-Request-URL');
            } else {
                options.url = null;
            }

            resolve(new ResponsePolyfill(xhr.response || xhr.responseText, options));
        };

        xhr.onerror = function () {
            reject(new TypeError('Network request failed'));
        };

        xhr.open(request.method, request.url, true);

        if (request.credentials === 'include') {
            xhr.withCredentials = true;
        }

        if ('Blob' in global && 'responseType' in xhr) {
            xhr.responseType = 'blob';
        }

        request.headers.forEach(function (value, name) {
            xhr.setRequestHeader(name, value);
        });

        xhr.send(request.content);
    });
};

var HeadersPolyfill = (function () {
    function HeadersPolyfill(headers) {
        _classCallCheck(this, HeadersPolyfill);

        this.map = {};

        this['delete'] = this._delete;

        if (headers !== undefined) {
            if (headers.constructor === HeadersPolyfill) {
                headers.forEach(function (value, name) {
                    this.append(name, value);
                }, this);

                return;
            }

            Object.getOwnPropertyNames(headers).forEach(function (name) {
                this.append(name, headers[name]);
            }, this);
        }
    }

    _createClass(HeadersPolyfill, [{
        key: 'normalizeName',
        value: function normalizeName(name) {
            if (name.constructor !== String) {
                name = name.toString();
            }

            if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
                throw new TypeError('Invalid character in header field name');
            }

            return name.toLowerCase();
        }
    }, {
        key: 'normalizeValue',
        value: function normalizeValue(value) {
            if (value.constructor !== String) {
                value = value.toString();
            }

            return value.toLowerCase();
        }
    }, {
        key: 'append',
        value: function append(name, value) {
            name = this.normalizeName(name);

            if (!(name in this.map)) {
                this.map[name] = [];
            }

            this.map[name].push(this.normalizeValue(value));
        }
    }, {
        key: '_delete',
        value: function _delete(name) {
            delete this.map[this.normalizeName(name)];
        }
    }, {
        key: 'get',
        value: function get(name) {
            var values = this.map[this.normalizeName(name)];
            return values ? values[0] : null;
        }
    }, {
        key: 'getAll',
        value: function getAll(name) {
            return this.map[this.normalizeName(name)] || [];
        }
    }, {
        key: 'has',
        value: function has(name) {
            return this.normalizeName(name) in this.map;
        }
    }, {
        key: 'set',
        value: function set(name, value) {
            this.map[this.normalizeName(name)] = [this.normalizeValue(value)];
        }
    }, {
        key: 'forEach',
        value: function forEach(callback, context) {
            Object.getOwnPropertyNames(this.map).forEach(function (name) {
                this.map[name].forEach(function (value) {
                    callback.call(context, value, name, this);
                }, this);
            }, this);
        }
    }]);

    return HeadersPolyfill;
})();

var Body = (function () {
    function Body() {
        _classCallCheck(this, Body);

        this.bodyUsed = false;
    }

    _createClass(Body, [{
        key: 'blob',
        value: function blob() {
            var rejected = this.consumed();
            if (rejected) {
                return rejected;
            }

            if (this.content instanceof Blob) {
                return _larouxPromiseObjectJs2['default'].resolve(this.content);
            }

            if (this.content instanceof FormData) {
                throw new Error('could not read FormData body as blob');
            }

            return _larouxPromiseObjectJs2['default'].resolve(new Blob([this.content]));
        }
    }, {
        key: 'arrayBuffer',
        value: function arrayBuffer() {
            return this.blob().then();
        }
    }, {
        key: 'text',
        value: function text() {
            var rejected = this.consumed();
            if (rejected) {
                return rejected;
            }

            if (this.content instanceof Blob) {
                return this.readBlobAsText(this.content);
            }

            if (this.content instanceof FormData) {
                throw new Error('could not read FormData body as text');
            }

            return _larouxPromiseObjectJs2['default'].resolve(this.content);
        }
    }, {
        key: 'formData',
        value: function formData() {
            return this.text().then(this.decode);
        }
    }, {
        key: 'json',
        value: function json() {
            return this.text().then(JSON.parse);
        }
    }, {
        key: 'consumed',
        value: function consumed() {
            if (this.bodyUsed) {
                return _larouxPromiseObjectJs2['default'].reject(new TypeError('Already read'));
            }

            this.bodyUsed = true;
        }
    }, {
        key: 'readBlobAsArrayBuffer',
        value: function readBlobAsArrayBuffer(blob) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(blob);

            return this.fileReaderReady(reader);
        }
    }, {
        key: 'readBlobAsText',
        value: function readBlobAsText(blob) {
            var reader = new FileReader();
            reader.readAsText(blob);

            return this.fileReaderReady(reader);
        }
    }, {
        key: 'fileReaderReady',
        value: function fileReaderReady(reader) {
            return new _larouxPromiseObjectJs2['default'](function (resolve, reject) {
                reader.onload = function () {
                    resolve(reader.result);
                };

                reader.onerror = function () {
                    reject(reader.error);
                };
            });
        }
    }]);

    return Body;
})();

var RequestPolyfill = (function (_Body) {
    _inherits(RequestPolyfill, _Body);

    function RequestPolyfill(url, options) {
        _classCallCheck(this, RequestPolyfill);

        _get(Object.getPrototypeOf(RequestPolyfill.prototype), 'constructor', this).call(this);

        if (options === undefined) {
            options = {};
        }

        this.url = url;
        this.credentials = options.credentials || 'omit';
        this.headers = new HeadersPolyfill(options.headers);
        this.method = options.method || 'GET';
        this.mode = options.mode || null;
        this.referrer = null;

        if (options.body) {
            this.content = options.body;
        }
    }

    return RequestPolyfill;
})(Body);

var ResponsePolyfill = (function (_Body2) {
    _inherits(ResponsePolyfill, _Body2);

    function ResponsePolyfill(body, options) {
        _classCallCheck(this, ResponsePolyfill);

        _get(Object.getPrototypeOf(ResponsePolyfill.prototype), 'constructor', this).call(this);

        if (options === undefined) {
            options = {};
        }

        this.type = 'default';
        this.url = options.url || '';
        this.status = options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = options.statusText;
        this.headers = options.headers.constructor === HeadersPolyfill ? options.headers : new HeadersPolyfill(options.headers);

        this.content = body;
    }

    return ResponsePolyfill;
})(Body);

var fetchExist = ('fetch' in global);

var ajax = {
    fetch: fetchExist ? _larouxHelpersJs2['default'].bindContext(fetch, global) : fetchPolyfill,
    Headers: fetchExist ? Headers : HeadersPolyfill,
    Request: fetchExist ? Request : RequestPolyfill,
    Response: fetchExist ? Response : ResponsePolyfill
};

exports['default'] = ajax;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.helpers.js":3,"./laroux.promiseObject.js":6}],2:[function(require,module,exports){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var events = {
    delegates: [],

    add: function add(event, callback) {
        events.delegates.push({ event: event, callback: callback });
    },

    invoke: function invoke(event) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        for (var i = 0, _length = events.delegates.length; i < _length; i++) {
            var _events$delegates$i;

            if (events.delegates[i].event != event) {
                continue;
            }

            (_events$delegates$i = events.delegates[i]).callback.apply(_events$delegates$i, args);
        }
    }
};

exports['default'] = events;
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global FormData, NodeList */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var helpers = {
    uniqueId: 0,

    getUniqueId: function getUniqueId() {
        /*jslint plusplus: true */
        return 'uid-' + ++helpers.uniqueId;
    },

    bindContext: function bindContext(method, context) {
        if (method.bind !== undefined) {
            return method.bind(context);
        }

        return function () {
            method.apply(context, arguments);
        };
    },

    async: function async(callback) {
        if ('setImmediate' in global) {
            setImmediate(callback);
            return;
        }

        setTimeout(callback, 0);
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

    assign: function assign(values, keys) {
        var result = {};

        for (var i = 0, _length3 = keys.length; i < _length3; i++) {
            result[keys[i]] = values[i];
        }

        return result;
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
        for (var i = 0, _length4 = arr.length; i < _length4; i++) {
            if (callback(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    },

    amap: function amap(arr, callback, dontSkipReturns) {
        var results = [];

        for (var i = 0, _length5 = arr.length; i < _length5; i++) {
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
        for (var i = start || 0, _length6 = arr.length; i < _length6; i++) {
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
            var _length7 = obj.length;

            var items = new Array(_length7);
            for (var i = 0; i < _length7; i++) {
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
        for (var i = 0, _length8 = callbacks.length; i < _length8; i++) {
            callbacks[i].apply(scope, parameters);
        }
    },

    executeScript: function executeScript(script, context) {
        /*jslint evil:true */
        return eval('(function () { ' + script + '}).call(context || global);');
    }
};

exports['default'] = helpers;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var intl = {
    shortDateFormat: 'dd.MM.yyyy',
    longDateFormat: 'dd MMMM yyyy',
    timeFormat: 'HH:mm',

    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    strings: {
        now: 'now',
        later: 'later',
        ago: 'ago',
        seconds: 'seconds',
        aminute: 'a minute',
        minutes: 'minutes',
        ahour: 'a hour',
        hours: 'hours',
        aday: 'a day',
        days: 'days',
        aweek: 'a week',
        weeks: 'weeks',
        amonth: 'a month',
        months: 'months',
        ayear: 'a year',
        years: 'years'
    },

    parseEpoch: function parseEpoch(timespan, limitWithWeeks) {
        if (timespan < 60 * 1000) {
            timespan = Math.ceil(timespan / 1000);

            return timespan + ' ' + intl.strings.seconds;
        }

        if (timespan < 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (60 * 1000));

            if (timespan === 1) {
                return intl.strings.aminute;
            }

            return timespan + ' ' + intl.strings.minutes;
        }

        if (timespan < 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.ahour;
            }

            return timespan + ' ' + intl.strings.hours;
        }

        if (timespan < 7 * 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.aday;
            }

            return timespan + ' ' + intl.strings.days;
        }

        if (timespan < 4 * 7 * 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (7 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.aweek;
            }

            return timespan + ' ' + intl.strings.weeks;
        }

        if (limitWithWeeks === true) {
            return null;
        }

        if (timespan < 30 * 7 * 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (30 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.amonth;
            }

            return timespan + ' ' + intl.strings.months;
        }

        timespan = Math.ceil(timespan / (365 * 24 * 60 * 60 * 1000));

        if (timespan === 1) {
            return intl.strings.ayear;
        }

        return timespan + ' ' + intl.strings.years;
    },

    customDate: function customDate(format, timestamp) {
        var now = timestamp || new Date();

        return format.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|tt|t/g, function (match) {
            switch (match) {
                case 'yyyy':
                    return now.getFullYear();

                case 'yy':
                    return now.getYear();

                case 'MMMM':
                    return intl.monthsLong[now.getMonth()];

                case 'MMM':
                    return intl.monthsShort[now.getMonth()];

                case 'MM':
                    return ('0' + (now.getMonth() + 1)).substr(-2, 2);

                case 'M':
                    return now.getMonth() + 1;

                case 'dd':
                    return ('0' + now.getDate()).substr(-2, 2);

                case 'd':
                    return now.getDate();

                case 'hh':
                    var hour1 = now.getHours();
                    return ('0' + (hour1 % 12 > 0 ? hour1 % 12 : 12)).substr(-2, 2);

                case 'h':
                    var hour2 = now.getHours();
                    return hour2 % 12 > 0 ? hour2 % 12 : 12;

                case 'HH':
                    return ('0' + now.getHours()).substr(-2, 2);

                case 'H':
                    return now.getHours();

                case 'mm':
                    return ('0' + now.getMinutes()).substr(-2, 2);

                case 'm':
                    return now.getMinutes();

                case 'ss':
                    return ('0' + now.getSeconds()).substr(-2, 2);

                case 's':
                    return now.getSeconds();

                case 'tt':
                    if (now.getHours() >= 12) {
                        return 'pm';
                    }

                    return 'am';

                case 't':
                    if (now.getHours() >= 12) {
                        return 'p';
                    }

                    return 'a';
            }

            return match;
        });
    },

    dateDiff: function dateDiff(timestamp) {
        var now = Date.now(),
            timespan = now - timestamp.getTime(),
            absTimespan = Math.abs(timespan),
            past = timespan > 0;

        if (absTimespan <= 3000) {
            return intl.strings.now;
        }

        var timespanstring = intl.parseEpoch(absTimespan, true);
        if (timespanstring !== null) {
            return timespanstring + ' ' + (past ? intl.strings.ago : intl.strings.later);
        }

        return intl.shortDate(timestamp, true);
    },

    shortDate: function shortDate(timestamp, includeTime) {
        return intl.customDate(includeTime ? intl.shortDateFormat + ' ' + intl.timeFormat : intl.shortDateFormat, timestamp);
    },

    longDate: function longDate(timestamp, includeTime) {
        return intl.customDate(includeTime ? intl.longDateFormat + ' ' + intl.timeFormat : intl.longDateFormat, timestamp);
    },

    format: function format(message, dictionary) {
        var temp = {};
        Object.keys(dictionary).forEach(function (x) {
            return temp['{' + x + '}'] = dictionary[x];
        });

        return _larouxHelpersJs2['default'].replaceAll(message, temp);
    },

    translations: {},

    addTranslations: function addTranslations(culture, dictionary) {
        _larouxHelpersJs2['default'].mergeNs(intl.translations, culture, dictionary);
    },

    translate: function translate(culture, message) {
        return intl.format(message, intl.translations[culture]);
    }
};

exports['default'] = intl;
module.exports = exports['default'];
},{"./laroux.helpers.js":3}],5:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global document */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxAjaxJs = require('./laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxEventsJs = require('./laroux.events.js');

var _larouxEventsJs2 = _interopRequireDefault(_larouxEventsJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxIntlJs = require('./laroux.intl.js');

var _larouxIntlJs2 = _interopRequireDefault(_larouxIntlJs);

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

var _larouxRequireJs = require('./laroux.require.js');

var _larouxRequireJs2 = _interopRequireDefault(_larouxRequireJs);

var _larouxStoryboardJs = require('./laroux.storyboard.js');

var _larouxStoryboardJs2 = _interopRequireDefault(_larouxStoryboardJs);

var _larouxTemplatesJs = require('./laroux.templates.js');

var _larouxTemplatesJs2 = _interopRequireDefault(_larouxTemplatesJs);

var _larouxTimersJs = require('./laroux.timers.js');

var _larouxTimersJs2 = _interopRequireDefault(_larouxTimersJs);

var _larouxTypesJs = require('./laroux.types.js');

var _larouxTypesJs2 = _interopRequireDefault(_larouxTypesJs);

var _larouxValidationJs = require('./laroux.validation.js');

var _larouxValidationJs2 = _interopRequireDefault(_larouxValidationJs);

var _larouxVarsJs = require('./laroux.vars.js');

var _larouxVarsJs2 = _interopRequireDefault(_larouxVarsJs);

var laroux = function laroux(selector, parent) {
    if (selector.constructor === Array) {
        return _larouxHelpersJs2['default'].toArray((parent || document).querySelectorAll(selector));
    }

    // FIXME: Laroux: non-chromium optimization, but it runs
    //                slowly in chromium
    //
    // let re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
    // if (re) {
    //     return (parent || document).getElementById(re[1]);
    // }

    return (parent || document).querySelector(selector);
};

_larouxHelpersJs2['default'].merge(laroux, _larouxHelpersJs2['default']);
_larouxHelpersJs2['default'].merge(laroux, {
    ajax: _larouxAjaxJs2['default'],
    events: _larouxEventsJs2['default'],
    intl: _larouxIntlJs2['default'],
    promise: _larouxPromiseObjectJs2['default'],
    require: _larouxRequireJs2['default'],
    storyboard: _larouxStoryboardJs2['default'],
    types: _larouxTypesJs2['default'],
    templates: _larouxTemplatesJs2['default'],
    timers: _larouxTimersJs2['default'],
    validation: _larouxValidationJs2['default'],
    vars: _larouxVarsJs2['default'],

    extend: function extend(source) {
        return _larouxHelpersJs2['default'].merge(laroux, source);
    },

    extendNs: function extendNs(path, source) {
        return _larouxHelpersJs2['default'].mergeNs(laroux, path, source);
    },

    readyPassed: false,

    ready: function ready(callback) {
        if (!laroux.readyPassed) {
            _larouxEventsJs2['default'].add('ContentLoaded', callback);
            return;
        }

        callback();
    },

    setReady: function setReady() {
        if (!laroux.readyPassed) {
            _larouxEventsJs2['default'].invoke('ContentLoaded');
            setInterval(_larouxTimersJs2['default'].ontick, 100);
            laroux.readyPassed = true;
        }
    }
});

if (global.$l === undefined) {
    global.$l = laroux;
}

exports['default'] = laroux;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ajax.js":1,"./laroux.events.js":2,"./laroux.helpers.js":3,"./laroux.intl.js":4,"./laroux.promiseObject.js":6,"./laroux.require.js":7,"./laroux.storyboard.js":8,"./laroux.templates.js":9,"./laroux.timers.js":10,"./laroux.types.js":11,"./laroux.validation.js":12,"./laroux.vars.js":13}],6:[function(require,module,exports){
(function (global){
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

// promiseObject - partially taken from 'promise-polyfill' project
//                 can be found at: https://github.com/taylorhakes/promise-polyfill
//                 see laroux.promiseObject.LICENSE file for details

var PromisePolyfill = (function () {
    function PromisePolyfill(callback) {
        _classCallCheck(this, PromisePolyfill);

        this.state = null;
        this.value = null;
        this.deferreds = [];

        this['catch'] = this._catch;

        if (callback !== undefined) {
            this.doResolve(callback, _larouxHelpersJs2['default'].bindContext(this.resolve, this), _larouxHelpersJs2['default'].bindContext(this.reject, this));
        }
    }

    _createClass(PromisePolyfill, [{
        key: 'doResolve',
        value: function doResolve(callback, onFulfilled, onRejected) {
            var done = false;

            try {
                callback(function (value) {
                    if (done) {
                        return;
                    }

                    done = true;
                    onFulfilled(value);
                }, function (reason) {
                    if (done) {
                        return;
                    }

                    done = true;
                    onRejected(reason);
                });
            } catch (err) {
                if (done) {
                    return;
                }

                done = true;
                onRejected(err);
            }
        }
    }, {
        key: 'resolve',
        value: function resolve(newValue) {
            try {
                if (newValue && newValue.then !== undefined && newValue.then.constructor === Function) {
                    this.doResolve(_larouxHelpersJs2['default'].bindContext(newValue.then, newValue), _larouxHelpersJs2['default'].bindContext(this.resolve, this), _larouxHelpersJs2['default'].bindContext(this.reject, this));
                    return;
                }

                this.state = true;
                this.value = newValue;

                this.finale();
            } catch (err) {
                this.reject(err);
            }
        }
    }, {
        key: 'reject',
        value: function reject(newValue) {
            this.state = false;
            this.value = newValue;

            this.finale();
        }
    }, {
        key: 'finale',
        value: function finale() {
            for (var i = 0, _length = this.deferreds.length; i < _length; i++) {
                this.handle(this.deferreds[i]);
            }

            this.deferreds = null;
        }
    }, {
        key: 'handle',
        value: function handle(deferred) {
            var self = this;

            if (this.state === null) {
                this.deferreds.push(deferred);
                return;
            }

            _larouxHelpersJs2['default'].async(function () {
                var callback = self.state ? deferred.onFulfilled : deferred.onRejected;

                if (callback === null) {
                    (self.state ? deferred.resolve : deferred.reject)(self.value);
                    return;
                }

                var result = undefined;
                try {
                    result = callback(self.value);
                } catch (err) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve(result);
            });
        }
    }, {
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            var self = this;

            return new PromisePolyfill(function (resolve, reject) {
                self.handle({
                    onFulfilled: onFulfilled || null,
                    onRejected: onRejected || null,
                    resolve: resolve,
                    reject: reject
                });
            });
        }
    }, {
        key: '_catch',
        value: function _catch(onRejected) {
            this.then(null, onRejected);
        }
    }], [{
        key: 'all',
        value: function all() {
            for (var _len = arguments.length, deferreds = Array(_len), _key = 0; _key < _len; _key++) {
                deferreds[_key] = arguments[_key];
            }

            if (deferreds.length === 1 && deferreds.constructor === Array) {
                deferreds = deferreds[0];
            }

            return new PromisePolyfill(function (resolve, reject) {
                var remaining = deferreds.length;

                if (remaining === 0) {
                    return [];
                }

                var res = function res(i, deferred) {
                    try {
                        if (deferred && deferred.then !== undefined && deferred.then.constructor === Function) {
                            deferred.then.call(deferred, function (value) {
                                res(i, value);
                            }, reject);
                            return;
                        }

                        deferreds[i] = deferred;
                        if (--remaining === 0) {
                            resolve(deferreds);
                        }
                    } catch (err) {
                        reject(err);
                    }
                };

                for (var i = 0, _length2 = deferreds.length; i < _length2; i++) {
                    res(i, deferreds[i]);
                }
            });
        }
    }, {
        key: 'resolve',
        value: function resolve(value) {
            if (value && value.constructor === PromisePolyfill) {
                return value;
            }

            return new PromisePolyfill(function (resolve) {
                resolve(value);
            });
        }
    }, {
        key: 'reject',
        value: function reject(reason) {
            return new PromisePolyfill(function (resolve, reject) {
                reject(reason);
            });
        }
    }, {
        key: 'race',
        value: function race(values) {
            return new PromisePolyfill(function (resolve, reject) {
                for (var i = 0, _length3 = values.length; i < _length3; i++) {
                    values[i].then(resolve, reject);
                }
            });
        }
    }]);

    return PromisePolyfill;
})();

var promiseExist = ('Promise' in global);

exports['default'] = promiseExist ? Promise : PromisePolyfill;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.helpers.js":3}],7:[function(require,module,exports){
(function (global){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxAjaxJs = require('./laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var require_ = function require_() {
    var name = undefined,
        requirements = undefined,
        callback = undefined;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    if (args.length >= 3) {
        name = args[0];
        requirements = args[1];
        callback = args[2];
    } else if (args.length === 2) {
        if (args[0].constructor === Array) {
            name = null;
            requirements = args[0];
            callback = args[1];
        } else {
            name = args[0];
            requirements = [];
            callback = args[1];
        }
    } else {
        name = null;
        requirements = [];
        callback = args[0];
    }

    var dependencies = [];
    for (var i = 0, _length = requirements.length; i < _length; i++) {
        var requirement = requirements[i];

        if (!(requirement in require_.modules)) {
            throw new Error('dependency not loaded: ' + requirement + '.');
        }

        dependencies.push(require_.modules[requirement]);
    }

    var result = undefined;
    if (callback.constructor === _larouxPromiseObjectJs2['default']) {
        dependencies.push(callback);

        result = _larouxPromiseObjectJs2['default'].all(dependencies);
    } else if (callback.constructor === String) {
        if ('require' in global) {
            result = _larouxPromiseObjectJs2['default'].all(dependencies).then(function (dependencies) {
                return require(callback);
            });
        } else {
            (function () {
                var script = undefined;

                var promise = _larouxAjaxJs2['default'].fetch(callback).then(function (response) {
                    return response.text();
                }).then(function (text) {
                    script = text;
                    return text;
                });

                dependencies.push(promise);

                result = _larouxPromiseObjectJs2['default'].all(dependencies).then(function (dependencies) {
                    return _larouxHelpersJs2['default'].executeScript.call(global, script);
                });
            })();
        }
    } else {
        result = _larouxPromiseObjectJs2['default'].all(dependencies).then(function (dependencies) {
            return callback.apply(global, dependencies);
        });
    }

    if (name !== null) {
        require_.modules[name] = result;
    }

    return result;
};

require_.modules = {};

exports['default'] = require_;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ajax.js":1,"./laroux.helpers.js":3,"./laroux.promiseObject.js":6}],8:[function(require,module,exports){
(function (global){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

var Storyboard = (function () {
    function Storyboard() {
        _classCallCheck(this, Storyboard);

        var self = this;

        this.phases = [];
        this.phaseKeys = {};
        this.currentIteration = 0;
        this.running = false;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        for (var i = 0, _length = args.length; i < _length; i++) {
            this.addPhase(args[i]);
        }

        this.checkPromise = function () {
            if (--self.phases[self.currentIteration].promises === 0 && !self.running) {
                self.start();
            }
        };
    }

    _createClass(Storyboard, [{
        key: 'addPhase',
        value: function addPhase(key) {
            this.phaseKeys[key] = this.phases.length;
            this.phases.push({
                key: key,
                callbacks: [],
                promises: 0
            });
        }
    }, {
        key: 'add',
        value: function add(phase, callback) {
            if (callback.constructor === _larouxPromiseObjectJs2['default']) {
                return this.addPromise(phase, callback);
            }

            var phaseId = this.phaseKeys[phase];

            if (phaseId < this.currentIteration) {
                // execute immediately if phase is already passed
                callback.apply(global);
                return;
            }

            this.phases[phaseId].callbacks.push(callback);
        }
    }, {
        key: 'addPromise',
        value: function addPromise(phase, promise) {
            var phaseId = this.phaseKeys[phase];

            // skips if phase is already passed
            if (phaseId < this.currentIteration) {
                return;
            }

            this.phases[phaseId].promises++;
            // FIXME: must be handled even if it has failed
            promise.then(this.checkPromise);
        }
    }, {
        key: 'start',
        value: function start() {
            this.running = true;

            while (this.phases.length > this.currentIteration) {
                var currentPhase = this.phases[this.currentIteration];

                while (currentPhase.callbacks.length > 0) {
                    var fnc = currentPhase.callbacks.shift();
                    fnc.apply(global);
                }

                if (currentPhase.promises > 0) {
                    break;
                }

                this.currentIteration++;
            }

            this.running = false;
        }
    }]);

    return Storyboard;
})();

exports['default'] = Storyboard;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.promiseObject.js":6}],9:[function(require,module,exports){
/*jslint node: true */
/*global Hogan, Mustache, Handlebars, _ */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var templates = {
    engines: {
        plain: {
            compile: function compile(template, options) {
                return [template, options];
            },

            render: function render(compiled, model) {
                var result = compiled[0],
                    dict = [],
                    lastIndex = 0,
                    nextIndex = undefined;

                while ((nextIndex = result.indexOf('{{', lastIndex)) !== -1) {
                    nextIndex += 2;
                    var closeIndex = result.indexOf('}}', nextIndex);
                    if (closeIndex === -1) {
                        break;
                    }

                    var key = result.substring(nextIndex, closeIndex);
                    dict['{{' + key + '}}'] = _larouxHelpersJs2['default'].getElement(model, key, '');
                    lastIndex = closeIndex + 2;
                }

                return _larouxHelpersJs2['default'].replaceAll(result, dict);
            }
        },

        hogan: {
            compile: function compile(template, options) {
                return Hogan.compile(template, options);
            },

            render: function render(compiled, model) {
                return compiled.render(model);
            }
        },

        mustache: {
            compile: function compile(template, options) {
                return Mustache.compile(template, options);
            },

            render: function render(compiled, model) {
                return compiled(model);
            }
        },

        handlebars: {
            compile: function compile(template, options) {
                return Handlebars.compile(template, options);
            },

            render: function render(compiled, model) {
                return compiled(model);
            }
        },

        lodash: {
            compile: function compile(template, options) {
                /*jslint nomen: true */
                return _.compile(template, null, options);
            },

            render: function render(compiled, model) {
                return compiled(model);
            }
        },

        underscore: {
            compile: function compile(template, options) {
                /*jslint nomen: true */
                return _.compile(template, null, options);
            },

            render: function render(compiled, model) {
                return compiled(model);
            }
        }
    },
    engine: 'plain',

    apply: function apply(element, model, options) {
        var content = undefined,
            engine = templates.engines[templates.engine];

        if (element.nodeType === 1 || element.nodeType === 3 || element.nodeType === 11) {
            content = element.textContent;
        } else {
            content = element.nodeValue;
        }

        var compiled = engine.compile(content, options);
        return engine.render(compiled, model);
    }

    /*
    insert: function (element, model, target, position, options) {
        let output = templates.apply(element, model, options);
         dom.insert(target, position || 'beforeend', output);
    },
     replace: function (element, model, target, options) {
        let output = templates.apply(element, model, options);
         dom.replace(target, output);
    }
    */
};

exports['default'] = templates;
module.exports = exports['default'];
},{"./laroux.helpers.js":3}],10:[function(require,module,exports){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var timers = {
    data: [],

    set: function set(timer) {
        timer.next = Date.now() + timer.timeout;
        timers.data.push(timer);
    },

    remove: function remove(id) {
        var targetKey = null;

        for (var item in timers.data) {
            if (!timers.data.hasOwnProperty(item)) {
                continue;
            }

            var currentItem = timers.data[item];

            if (currentItem.id !== undefined && currentItem.id == id) {
                targetKey = item;
                break;
            }
        }

        if (targetKey !== null) {
            timers.data.splice(targetKey, 1);
            return true;
        }

        return false;
    },

    ontick: function ontick() {
        var now = Date.now(),
            removeKeys = [];

        for (var item in timers.data) {
            if (!timers.data.hasOwnProperty(item)) {
                continue;
            }

            var currentItem = timers.data[item];

            if (currentItem.next <= now) {
                var result = currentItem.ontick(currentItem.state);

                if (result !== false && currentItem.reset) {
                    currentItem.next = now + currentItem.timeout;
                } else {
                    removeKeys = _larouxHelpersJs2['default'].prependArray(removeKeys, item);
                }
            }
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            timers.data.splice(removeKeys[item2], 1);
        }
    }
};

exports['default'] = timers;
module.exports = exports['default'];
},{"./laroux.helpers.js":3}],11:[function(require,module,exports){
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
},{"./laroux.helpers.js":3}],12:[function(require,module,exports){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var validation = {
    // TODO: email, date, equalTo
    rules: {
        required: {
            keys: ['message'],
            callback: function callback(dictionary, name, rule) {
                return name in dictionary;
            }
        },

        minlength: {
            keys: ['length', 'message'],
            callback: function callback(dictionary, name, rule) {
                return dictionary[name].length >= rule.length;
            }
        },

        maxlength: {
            keys: ['length', 'message'],
            callback: function callback(dictionary, name, rule) {
                return dictionary[name].length <= rule.length;
            }
        },

        min: {
            keys: ['value', 'message'],
            callback: function callback(dictionary, name, rule) {
                var floatValue = parseFloat(dictionary[name]);
                return floatValue >= rule.value;
            }
        },

        max: {
            keys: ['value', 'message'],
            callback: function callback(dictionary, name, rule) {
                var floatValue = parseFloat(dictionary[name]);
                return floatValue <= rule.value;
            }
        }
    },

    // {rule: 'required', message: 'isrequired'}
    // 'required'

    // {
    //    'name': 'required',
    //    'age': [
    //        'required|The field is required.',
    //        { rule: 'range', min: 10, max: 18 },
    //    ]
    // }

    validate: function validate(fields, rules) {
        var rulesKeys = Object.keys(rules),
            result = {
            success: true,
            details: {}
        };

        for (var i = 0, _length = rulesKeys.length; i < _length; i++) {
            var key = rulesKeys[i],
                rule = rules[key];

            var fieldRules = _larouxHelpersJs2['default'].getAsArray(rule);
            for (var j = 0, length2 = fieldRules.length; j < length2; j++) {
                var fieldRule = fieldRules[j];

                if (fieldRule.constructor !== Object) {
                    var fieldRuleSplitted = fieldRule.split('|'),
                        fieldRuleName = fieldRuleSplitted[0];

                    fieldRule = _larouxHelpersJs2['default'].assign(fieldRuleSplitted, ['name'].concat(validation.rules[fieldRuleName].keys));
                }

                if (!validation.rules[fieldRule.name].callback(fields, key, fieldRule)) {
                    result.success = false;

                    if (!(key in result.details)) {
                        result.details[key] = [];
                    }

                    result.details[key].push(fieldRule);
                }
            }
        }

        return result;
    }
};

exports['default'] = validation;
module.exports = exports['default'];
},{"./laroux.helpers.js":3}],13:[function(require,module,exports){
/*jslint node: true */
/*global document, localStorage, sessionStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var vars = {
    storages: {
        cookie: {
            defaultPath: '/',

            get: function get(name, defaultValue) {
                var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i'),
                    match = document.cookie.match(re);

                if (!match) {
                    return defaultValue || null;
                }

                return decodeURIComponent(match[0].split('=')[1]);
            },

            set: function set(name, value, expires, path) {
                var expireValue = '';
                if (expires) {
                    expireValue = '; expires=' + expires.toGMTString();
                }

                document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || vars.storages.cookie.defaultPath);
            },

            remove: function remove(name, path) {
                document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || vars.storages.cookie.defaultPath);
            }
        },

        local: {
            get: function get(name, defaultValue) {
                if (!(name in localStorage)) {
                    return defaultValue || null;
                }

                return JSON.parse(localStorage[name]);
            },

            set: function set(name, value) {
                localStorage[name] = JSON.stringify(value);
            },

            remove: function remove(name) {
                delete localStorage[name];
            }
        },

        session: {
            get: function get(name, defaultValue) {
                if (!(name in sessionStorage)) {
                    return defaultValue || null;
                }

                return JSON.parse(sessionStorage[name]);
            },

            set: function set(name, value) {
                sessionStorage[name] = JSON.stringify(value);
            },

            remove: function remove(name) {
                delete sessionStorage[name];
            }
        }
    },

    get: function get(storage) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        return vars.storages[storage].get.apply(this, args);
    },

    set: function set(storage) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        return vars.storages[storage].set.apply(this, args);
    },

    remove: function remove(storage) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            args[_key3 - 1] = arguments[_key3];
        }

        return vars.storages[storage].remove.apply(this, args);
    }
};

exports['default'] = vars;
module.exports = exports['default'];
},{"./laroux.helpers.js":3}]},{},[5]);
