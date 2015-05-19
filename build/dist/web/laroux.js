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

var _larouxAjaxJs = require('./laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxDateJs = require('./laroux.date.js');

var _larouxDateJs2 = _interopRequireDefault(_larouxDateJs);

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxEventsJs = require('./laroux.events.js');

var _larouxEventsJs2 = _interopRequireDefault(_larouxEventsJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxStackJs = require('./laroux.stack.js');

var _larouxStackJs2 = _interopRequireDefault(_larouxStackJs);

var _larouxTimersJs = require('./laroux.timers.js');

var _larouxTimersJs2 = _interopRequireDefault(_larouxTimersJs);

var _larouxVarsJs = require('./laroux.vars.js');

var _larouxVarsJs2 = _interopRequireDefault(_larouxVarsJs);

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
        ajax: _larouxAjaxJs2['default'],
        date: _larouxDateJs2['default'],
        deferred: _larouxDeferredJs2['default'],
        events: _larouxEventsJs2['default'],
        stack: _larouxStackJs2['default'],
        timers: _larouxTimersJs2['default'],
        vars: _larouxVarsJs2['default']
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;
})();

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ajax.js":2,"./laroux.date.js":3,"./laroux.deferred.js":4,"./laroux.events.js":5,"./laroux.helpers.js":6,"./laroux.stack.js":7,"./laroux.timers.js":8,"./laroux.vars.js":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxEventsJs = require('./laroux.events.js');

var _larouxEventsJs2 = _interopRequireDefault(_larouxEventsJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    var ajax = {
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
                ajax.wrappers.registry[name] = fnc;
            }
        },

        xDomainObject: false,
        xmlHttpRequestObject: null,
        xDomainRequestObject: null,
        xhr: function xhr(crossDomain) {
            if (ajax.xmlHttpRequestObject === null) {
                ajax.xmlHttpRequestObject = new XMLHttpRequest();
            }

            if (crossDomain) {
                if (!('withCredentials' in ajax.xmlHttpRequestObject) && typeof XDomainRequest !== 'undefined') {
                    ajax.xDomainObject = true;

                    if (ajax.xDomainRequestObject === null) {
                        ajax.xDomainRequestObject = new XDomainRequest();
                    }

                    return ajax.xDomainRequestObject;
                }
            } else {
                ajax.xDomainObject = false;
            }

            return ajax.xmlHttpRequestObject;
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

            if (wrapperFunction && wrapperFunction in ajax.wrappers.registry) {
                response = ajax.wrappers.registry[wrapperFunction](response);
            }

            return {
                response: response,
                wrapperFunc: wrapperFunction
            };
        },

        makeRequest: function makeRequest(options) {
            var promise = new _larouxDeferredJs2['default']();

            return promise.then(function () {
                var cors = options.cors || ajax.corsDefault,
                    xhr = ajax.xhr(cors),
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
                                res = ajax.xhrResp(xhr, options);
                            } catch (e) {
                                promise.invoke('error', e, xhr);
                                promise.complete();

                                _larouxEventsJs2['default'].invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                                isSuccess = false;
                            }

                            if (isSuccess && res !== null) {
                                promise.next(res.response, res.wrapperFunc);

                                _larouxEventsJs2['default'].invoke('ajaxSuccess', [xhr, res.response, res.wrapperFunc, options]);
                            }
                        } else {
                            promise.invoke('error', e, xhr);

                            _larouxEventsJs2['default'].invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                        }

                        _larouxEventsJs2['default'].invoke('ajaxComplete', [xhr, xhr.statusText, options]);
                    } else if (options.progress !== undefined) {
                        /*jslint plusplus: true */
                        options.progress(++n);
                    }
                };

                if (options.getdata !== undefined && options.getdata !== null) {
                    if (options.getdata.constructor === Object) {
                        var queryString = _larouxHelpersJs2['default'].buildQueryString(options.getdata);
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

                if (!ajax.xDomainObject) {
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
                        xhr.send(_larouxHelpersJs2['default'].buildFormData(options.postdata));
                        break;
                    default:
                        xhr.send(options.postdata);
                        break;
                }
            }, true);
        },

        get: function get(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        },

        getJson: function getJson(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        },

        getJsonP: function getJsonP(path, values, method, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                wrapper: false,
                cors: cors || ajax.corsDefault
            });
        },

        getScript: function getScript(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                wrapper: false,
                cors: cors || ajax.corsDefault
            });
        },

        post: function post(path, values, cors) {
            return ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        },

        postJson: function postJson(path, values, cors) {
            return ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                wrapper: true,
                cors: cors || ajax.corsDefault
            });
        }
    };

    return ajax;
})();

module.exports = exports['default'];
},{"./laroux.deferred.js":4,"./laroux.events.js":5,"./laroux.helpers.js":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var date = {
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

                return timespan + ' ' + date.strings.seconds;
            }

            if (timespan < 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 1000));

                if (timespan === 1) {
                    return date.strings.aminute;
                }

                return timespan + ' ' + date.strings.minutes;
            }

            if (timespan < 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.ahour;
                }

                return timespan + ' ' + date.strings.hours;
            }

            if (timespan < 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.aday;
                }

                return timespan + ' ' + date.strings.days;
            }

            if (timespan < 4 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (7 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.aweek;
                }

                return timespan + ' ' + date.strings.weeks;
            }

            if (limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (30 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.amonth;
                }

                return timespan + ' ' + date.strings.months;
            }

            timespan = Math.ceil(timespan / (365 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return date.strings.ayear;
            }

            return timespan + ' ' + date.strings.years;
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
                        return date.monthsLong[now.getMonth()];

                    case 'MMM':
                        return date.monthsShort[now.getMonth()];

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
                return date.strings.now;
            }

            var timespanstring = date.parseEpoch(absTimespan, true);
            if (timespanstring !== null) {
                return timespanstring + ' ' + (past ? date.strings.ago : date.strings.later);
            }

            return date.getShortDateString(date, true);
        },

        getShortDateString: function getShortDateString(date, includeTime) {
            return date.getCustomDateString(includeTime ? date.shortDateFormat + ' ' + date.timeFormat : date.shortDateFormat, date);
        },

        getLongDateString: function getLongDateString(date, includeTime) {
            return date.getCustomDateString(includeTime ? date.longDateFormat + ' ' + date.timeFormat : date.longDateFormat, date);
        }
    };

    return date;
})();

module.exports = exports['default'];
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var Deferred = function Deferred(fnc, isAsync) {
        if (!(this instanceof Deferred)) {
            return new Deferred(fnc, isAsync);
        }

        this._delegates = [];
        this._delegateQueue = null;
        this._events = [];
        this._eventStack = null;
        this.completed = false;

        if (fnc !== undefined) {
            this.then(fnc, isAsync);
        }
    };

    Deferred.prototype.then = function (fnc, isAsync) {
        var delegate = { fnc: fnc, isAsync: isAsync };

        this._delegates.push(delegate);

        return this;
    };

    Deferred.prototype.on = function (condition, fnc) {
        var conditions = _larouxHelpersJs2['default'].getAsArray(condition),
            ev = {
            conditions: conditions,
            fnc: fnc
        };

        this._events.push(ev);

        return this;
    };

    Deferred.prototype.invoke = function () {
        var eventName = Array.prototype.shift.call(arguments),
            removeKeys = [];

        for (var item in this._eventStack) {
            if (!this._eventStack.hasOwnProperty(item)) {
                continue;
            }

            var eventItem = this._eventStack[item],
                eventIdx = _larouxHelpersJs2['default'].aindex(eventItem.conditions, eventName);

            if (eventIdx !== -1) {
                eventItem.conditions.splice(eventIdx, 1);
            }

            if (eventItem.conditions.length > 0) {
                continue;
            }

            removeKeys = _larouxHelpersJs2['default'].prependArray(removeKeys, item);
            eventItem.fnc.apply(this, arguments);
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            this._eventStack.splice(removeKeys[item2], 1);
        }
    };

    Deferred.prototype.complete = function () {
        this.completed = true;
        this.invoke('complete');
    };

    Deferred.prototype.next = function () {
        var self = this,
            delegate = this._delegateQueue.shift(),
            args = _larouxHelpersJs2['default'].toArray(arguments);

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

    Deferred.prototype.start = function () {
        this._delegateQueue = this._delegates.slice();
        this._eventStack = this._events.slice();
        this.completed = false;

        return this.next.apply(this, arguments);
    };

    return Deferred;
})();

module.exports = exports['default'];
},{"./laroux.helpers.js":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var events = {
        delegates: [],

        add: function add(event, fnc) {
            events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function invoke(event, args) {
            for (var item in events.delegates) {
                if (!events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (events.delegates[item].event != event) {
                    continue;
                }

                events.delegates[item].fnc(args);
            }
        }
    };

    return events;
})();

module.exports = exports['default'];
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

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

    return timers;
})();

module.exports = exports['default'];
},{"./laroux.helpers.js":6}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var vars = {
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

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || vars.cookiePath);
        },

        removeCookie: function removeCookie(name, path) {
            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || vars.cookiePath);
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
    };

    return vars;
})();

module.exports = exports['default'];
},{}]},{},[1]);
