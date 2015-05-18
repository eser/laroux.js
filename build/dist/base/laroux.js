/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

(function () {
    'use strict';

    var top = typeof global !== 'undefined' ? global : window;

    // core
    top.laroux = function () {};
    if (top.$l === undefined) {
        top.$l = laroux;
    }

    laroux.extendObject = function () {
        var target = Array.prototype.shift.call(arguments),
            isArray = target instanceof Array;

        for (var item in arguments) {
            for (var name in arguments[item]) {
                // if (isArray) {
                //     target.push(arguments[item][name]);
                //     continue;
                // }

                /* target[name].constructor === Object */
                if (target.hasOwnProperty(name) && target[name] instanceof Object) {
                    laroux.extendObject(target[name], arguments[item][name]);
                    continue;
                }

                target[name] = arguments[item][name];
            }
        }
    };

    laroux.toArray = function (obj) {
        var length = obj.length,
            items = new Array(length);

        for (var i = 0; i < length; i++) {
            items[i] = obj[i];
        }
        return items;
    };

    laroux.ns = function (path, obj) {
        var pathSlices = path.split('.'),
            parent = top;

        for (var i = 0, length1 = pathSlices.length; i < length1; i++) {
            var current = pathSlices[i];

            if (parent[current] === undefined) {
                parent[current] = {};
            }

            parent = parent[current];
        }

        if (obj !== undefined) {
            laroux.extendObject(parent, obj);
        }

        return parent;
    };
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // helpers
    laroux.ns('laroux', {
        uniqueId: 0,

        getUniqueId: function getUniqueId() {
            /*jslint plusplus: true */
            return 'uid-' + ++laroux.uniqueId;
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

                if (arr[item] === object) {
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
            return laroux.map(obj, function (value) {
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

                var rand = laroux.random(0, index);
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
                    laroux.getKeysRecursive(obj[item], delimiter, prefix + item + delimiter, keys);
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

            return laroux.getElement(obj[key], rest, defaultValue, delimiter);
        }
    });
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // events
    laroux.ns('laroux.events', {
        delegates: [],

        add: function add(event, fnc) {
            laroux.events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function invoke(event, args) {
            for (var item in laroux.events.delegates) {
                if (!laroux.events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (laroux.events.delegates[item].event != event) {
                    continue;
                }

                laroux.events.delegates[item].fnc(args);
            }
        }
    });
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    laroux.ns('laroux.ajax', {
        corsDefault: false,

        wrappers: {
            registry: {
                'laroux.js': function larouxJs(data) {
                    if (!data.isSuccess) {
                        console.log('Error: ' + data.errorMessage);
                        return;
                    }

                    var obj;

                    if (data.format === 'json') {
                        obj = JSON.parse(data.object);
                    } else if (data.format === 'script') {
                        /*jshint evil:true */
                        /*jslint evil:true */
                        obj = eval(data.object);
                    } else {
                        // if (data.format == 'xml') {
                        obj = data.object;
                    }

                    return obj;
                }
            },

            set: function set(name, fnc) {
                laroux.ajax.wrappers.registry[name] = fnc;
            }
        },

        xDomainObject: false,
        xmlHttpRequestObject: null,
        xDomainRequestObject: null,
        xhr: function xhr(crossDomain) {
            if (laroux.ajax.xmlHttpRequestObject === null) {
                laroux.ajax.xmlHttpRequestObject = new XMLHttpRequest();
            }

            if (crossDomain) {
                if (!('withCredentials' in laroux.ajax.xmlHttpRequestObject) && typeof XDomainRequest !== 'undefined') {
                    laroux.ajax.xDomainObject = true;

                    if (laroux.ajax.xDomainRequestObject === null) {
                        laroux.ajax.xDomainRequestObject = new XDomainRequest();
                    }

                    return laroux.ajax.xDomainRequestObject;
                }
            } else {
                laroux.ajax.xDomainObject = false;
            }

            return laroux.ajax.xmlHttpRequestObject;
        },

        xhrResp: function xhrResp(xhr, options) {
            var wrapperFunction = xhr.getResponseHeader('X-Response-Wrapper-Function'),
                response;

            if (options.datatype === undefined) {
                response = xhr.responseText;
            } else if (options.datatype === 'json') {
                response = JSON.parse(xhr.responseText);
            } else if (options.datatype === 'script') {
                /*jshint evil:true */
                /*jslint evil:true */
                response = eval(xhr.responseText);
            } else if (options.datatype === 'xml') {
                response = xhr.responseXML;
            } else {
                response = xhr.responseText;
            }

            if (wrapperFunction && wrapperFunction in laroux.ajax.wrappers.registry) {
                response = laroux.ajax.wrappers.registry[wrapperFunction](response);
            }

            return {
                response: response,
                wrapperFunc: wrapperFunction
            };
        },

        makeRequest: function makeRequest(options) {
            var promise = new laroux.promise();

            return promise.then(function () {
                var cors = options.cors || laroux.ajax.corsDefault,
                    xhr = laroux.ajax.xhr(cors),
                    url = options.url,
                    timer = null,
                    n = 0;

                if (options.timeout !== undefined) {
                    timer = setTimeout(function () {
                        xhr.abort();
                        promise.invoke('timeout', options.url);
                        promise.complete();
                    }, options.timeout);
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (timer !== null) {
                            clearTimeout(timer);
                        }

                        if (xhr.status < 300) {
                            var res = null,
                                isSuccess = true;

                            try {
                                res = laroux.ajax.xhrResp(xhr, options);
                            } catch (e) {
                                promise.invoke('error', e, xhr);
                                promise.complete();

                                laroux.events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                                isSuccess = false;
                            }

                            if (isSuccess && res !== null) {
                                promise.next(res.response, res.wrapperFunc);

                                laroux.events.invoke('ajaxSuccess', [xhr, res.response, res.wrapperFunc, options]);
                            }
                        } else {
                            promise.invoke('error', e, xhr);

                            laroux.events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                        }

                        laroux.events.invoke('ajaxComplete', [xhr, xhr.statusText, options]);
                    } else if (options.progress !== undefined) {
                        /*jslint plusplus: true */
                        options.progress(++n);
                    }
                };

                if (options.getdata !== undefined && options.getdata !== null) {
                    if (options.getdata.constructor === Object) {
                        var queryString = laroux.buildQueryString(options.getdata);
                        if (queryString.length > 0) {
                            url += (url.indexOf('?') < 0 ? '?' : '&') + queryString;
                        }
                    } else {
                        url += (url.indexOf('?') < 0 ? '?' : '&') + options.getdata;
                    }
                }

                if (options.jsonp !== undefined) {
                    url += (url.indexOf('?') < 0 ? '?' : '&') + 'jsonp=' + options.jsonp;
                }

                if (!laroux.ajax.xDomainObject) {
                    xhr.open(options.type, url, true);
                } else {
                    xhr.open(options.type, url);
                }

                try {
                    if (options.xhrFields !== undefined) {
                        for (var i in options.xhrFields) {
                            if (!options.xhrFields.hasOwnProperty(i)) {
                                continue;
                            }

                            xhr[i] = options.xhrFields[i];
                        }
                    }

                    var headers = options.headers || {};

                    if (!cors) {
                        headers['X-Requested-With'] = 'XMLHttpRequest';

                        if (options.wrapper) {
                            headers['X-Wrapper-Function'] = 'laroux.js';
                        }
                    }

                    for (var j in headers) {
                        if (!headers.hasOwnProperty(j)) {
                            continue;
                        }

                        xhr.setRequestHeader(j, headers[j]);
                    }
                } catch (e) {
                    console.log(e);
                }

                if (options.postdata === undefined || options.postdata === null) {
                    xhr.send(null);
                    return;
                }

                switch (options.postdatatype) {
                    case 'json':
                        xhr.send(JSON.stringify(options.postdata));
                        break;
                    case 'form':
                        xhr.send(laroux.buildFormData(options.postdata));
                        break;
                    default:
                        xhr.send(options.postdata);
                        break;
                }
            }, true);
        },

        get: function get(path, values, cors) {
            return laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault
            });
        },

        getJson: function getJson(path, values, cors) {
            return laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault
            });
        },

        getJsonP: function getJsonP(path, values, method, cors) {
            return laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                wrapper: false,
                cors: cors || laroux.ajax.corsDefault
            });
        },

        getScript: function getScript(path, values, cors) {
            return laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                wrapper: false,
                cors: cors || laroux.ajax.corsDefault
            });
        },

        post: function post(path, values, cors) {
            return laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault
            });
        },

        postJson: function postJson(path, values, cors) {
            return laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault
            });
        }
    });
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // timers
    laroux.ns('laroux.timers', {
        data: [],

        set: function set(timer) {
            timer.next = Date.now() + timer.timeout;
            laroux.timers.data.push(timer);
        },

        remove: function remove(id) {
            var targetKey = null;

            for (var item in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux.timers.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux.timers.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        ontick: function ontick() {
            var now = Date.now(),
                removeKeys = [];

            for (var item in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux.timers.data[item];

                if (currentItem.next <= now) {
                    var result = currentItem.ontick(currentItem.state);

                    if (result !== false && currentItem.reset) {
                        currentItem.next = now + currentItem.timeout;
                    } else {
                        removeKeys = laroux.prependArray(removeKeys, item);
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux.timers.data.splice(removeKeys[item2], 1);
            }
        }
    });
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // promise
    laroux.ns('laroux', {
        promise: function promise(fnc, isAsync) {
            if (!(this instanceof laroux.promise)) {
                return new laroux.promise(fnc, isAsync);
            }

            this._delegates = [];
            this._delegateQueue = null;
            this._events = [];
            this._eventStack = null;
            this.completed = false;

            if (fnc !== undefined) {
                this.then(fnc, isAsync);
            }
        }
    });

    laroux.promise.prototype.then = function (fnc, isAsync) {
        var delegate = { fnc: fnc, isAsync: isAsync };

        this._delegates.push(delegate);

        return this;
    };

    laroux.promise.prototype.on = function (condition, fnc) {
        var conditions = laroux.getAsArray(condition),
            ev = {
            conditions: conditions,
            fnc: fnc
        };

        this._events.push(ev);

        return this;
    };

    laroux.promise.prototype.invoke = function () {
        var eventName = Array.prototype.shift.call(arguments),
            removeKeys = [];

        for (var item in this._eventStack) {
            if (!this._eventStack.hasOwnProperty(item)) {
                continue;
            }

            var eventItem = this._eventStack[item],
                eventIdx = laroux.aindex(eventItem.conditions, eventName);

            if (eventIdx !== -1) {
                eventItem.conditions.splice(eventIdx, 1);
            }

            if (eventItem.conditions.length > 0) {
                continue;
            }

            removeKeys = laroux.prependArray(removeKeys, item);
            eventItem.fnc.apply(this, arguments);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._eventStack.splice(removeKeys[item2], 1);
        }
    };

    laroux.promise.prototype.complete = function () {
        this.completed = true;
        this.invoke('complete');
    };

    laroux.promise.prototype.next = function () {
        var self = this,
            delegate = this._delegateQueue.shift(),
            args = laroux.toArray(arguments);

        if (this.completed) {
            return this;
        }

        if (delegate === undefined) {
            var parameters = ['success'].concat(args);

            this.invoke.apply(this, parameters);
            this.complete();

            return this;
        }

        setTimeout(function () {
            try {
                var lastReturn = delegate.fnc.apply(self, args);
                if (delegate.isAsync !== true) {
                    self.next.call(self, lastReturn);
                }
            } catch (err) {
                self.invoke('error', err);
                self.complete();
            }
        }, 0);

        return this;
    };

    laroux.promise.prototype.start = function () {
        this._delegateQueue = this._delegates.slice();
        this._eventStack = this._events.slice();
        this.completed = false;

        return this.next.apply(this, arguments);
    };
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // vars
    laroux.ns('laroux.vars', {
        cookiePath: '/',

        getCookie: function getCookie(name, defaultValue) {
            var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i'),
                match = document.cookie.match(re);

            if (!match) {
                return defaultValue || null;
            }

            return decodeURIComponent(match[0].split('=')[1]);
        },

        setCookie: function setCookie(name, value, expires, path) {
            var expireValue = '';
            if (expires) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || laroux.vars.cookiePath);
        },

        removeCookie: function removeCookie(name, path) {
            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || laroux.vars.cookiePath);
        },

        getLocal: function getLocal(name, defaultValue) {
            if (!(name in localStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(localStorage[name]);
        },

        setLocal: function setLocal(name, value) {
            localStorage[name] = JSON.stringify(value);
        },

        removeLocal: function removeLocal(name) {
            delete localStorage[name];
        },

        getSession: function getSession(name, defaultValue) {
            if (!(name in sessionStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(sessionStorage[name]);
        },

        setSession: function setSession(name, value) {
            sessionStorage[name] = JSON.stringify(value);
        },

        removeSession: function removeSession(name) {
            delete sessionStorage[name];
        }
    });
}).call(undefined);
'use strict';

(function () {
    'use strict';

    // date
    laroux.ns('laroux.date', {
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

                return timespan + ' ' + laroux.date.strings.seconds;
            }

            if (timespan < 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 1000));

                if (timespan === 1) {
                    return laroux.date.strings.aminute;
                }

                return timespan + ' ' + laroux.date.strings.minutes;
            }

            if (timespan < 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux.date.strings.ahour;
                }

                return timespan + ' ' + laroux.date.strings.hours;
            }

            if (timespan < 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux.date.strings.aday;
                }

                return timespan + ' ' + laroux.date.strings.days;
            }

            if (timespan < 4 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (7 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux.date.strings.aweek;
                }

                return timespan + ' ' + laroux.date.strings.weeks;
            }

            if (limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (30 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux.date.strings.amonth;
                }

                return timespan + ' ' + laroux.date.strings.months;
            }

            timespan = Math.ceil(timespan / (365 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return laroux.date.strings.ayear;
            }

            return timespan + ' ' + laroux.date.strings.years;
        },

        getCustomDateString: function getCustomDateString(format, date) {
            var now = date || new Date();

            return format.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|tt|t/g, function (match) {
                switch (match) {
                    case 'yyyy':
                        return now.getFullYear();

                    case 'yy':
                        return now.getYear();

                    case 'MMMM':
                        return laroux.date.monthsLong[now.getMonth()];

                    case 'MMM':
                        return laroux.date.monthsShort[now.getMonth()];

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

        getDateDiffString: function getDateDiffString(date) {
            var now = Date.now(),
                timespan = now - date.getTime(),
                absTimespan = Math.abs(timespan),
                past = timespan > 0;

            if (absTimespan <= 3000) {
                return laroux.date.strings.now;
            }

            var timespanstring = laroux.date.parseEpoch(absTimespan, true);
            if (timespanstring !== null) {
                return timespanstring + ' ' + (past ? laroux.date.strings.ago : laroux.date.strings.later);
            }

            return laroux.date.getShortDateString(date, true);
        },

        getShortDateString: function getShortDateString(date, includeTime) {
            return laroux.date.getCustomDateString(includeTime ? laroux.date.shortDateFormat + ' ' + laroux.date.timeFormat : laroux.date.shortDateFormat, date);
        },

        getLongDateString: function getLongDateString(date, includeTime) {
            return laroux.date.getCustomDateString(includeTime ? laroux.date.longDateFormat + ' ' + laroux.date.timeFormat : laroux.date.longDateFormat, date);
        }
    });
}).call(undefined);
/*jslint nomen: true */
'use strict';

(function () {
    'use strict';

    // stack
    laroux.ns('laroux', {
        stack: function stack(data, depth, top) {
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
        return key in this._data;
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

    laroux.stack.prototype.onupdate = function (event) {};
}).call(undefined);