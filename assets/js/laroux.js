/**
 * laroux.js - A jquery substitute for modern browsers (web bundle)
 *
 * @version v2.1.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxJs = require('../laroux.js');

var _larouxJs2 = _interopRequireDefault(_larouxJs);

var _larouxAnimJs = require('./laroux.anim.js');

var _larouxAnimJs2 = _interopRequireDefault(_larouxAnimJs);

var _larouxCssJs = require('./laroux.css.js');

var _larouxCssJs2 = _interopRequireDefault(_larouxCssJs);

var _larouxDomJs = require('./laroux.dom.js');

var _larouxDomJs2 = _interopRequireDefault(_larouxDomJs);

var _larouxFormsJs = require('./laroux.forms.js');

var _larouxFormsJs2 = _interopRequireDefault(_larouxFormsJs);

var _larouxKeysJs = require('./laroux.keys.js');

var _larouxKeysJs2 = _interopRequireDefault(_larouxKeysJs);

var _larouxMvcJs = require('./laroux.mvc.js');

var _larouxMvcJs2 = _interopRequireDefault(_larouxMvcJs);

var _larouxRoutesJs = require('./laroux.routes.js');

var _larouxRoutesJs2 = _interopRequireDefault(_larouxRoutesJs);

var _larouxTouchJs = require('./laroux.touch.js');

var _larouxTouchJs2 = _interopRequireDefault(_larouxTouchJs);

exports['default'] = (function () {
    'use strict';

    _larouxJs2['default'].extend({
        anim: _larouxAnimJs2['default'],
        css: _larouxCssJs2['default'],
        dom: _larouxDomJs2['default'],
        forms: _larouxFormsJs2['default'],
        keys: _larouxKeysJs2['default'],
        mvc: _larouxMvcJs2['default'],
        routes: _larouxRoutesJs2['default'],
        touch: _larouxTouchJs2['default'],

        cached: {
            single: {},
            array: {},
            id: {}
        },

        c: function c(selector) {
            if (selector instanceof Array) {
                return _larouxJs2['default'].cached.array[selector] || (_larouxJs2['default'].cached.array[selector] = helpers.toArray(document.querySelectorAll(selector)));
            }

            return _larouxJs2['default'].cached.single[selector] || (_larouxJs2['default'].cached.single[selector] = document.querySelector(selector));
        },

        id: function id(selector, parent) {
            return (parent || document).getElementById(selector);
        },

        idc: function idc(selector) {
            return _larouxJs2['default'].cached.id[selector] || (_larouxJs2['default'].cached.id[selector] = document.getElementById(selector));
        }
    });

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', _larouxJs2['default'].setReady);
    }

    return _larouxJs2['default'];
})();

module.exports = exports['default'];
},{"../laroux.js":7,"./laroux.anim.js":14,"./laroux.css.js":15,"./laroux.dom.js":16,"./laroux.forms.js":17,"./laroux.keys.js":18,"./laroux.mvc.js":19,"./laroux.routes.js":20,"./laroux.touch.js":21}],2:[function(require,module,exports){
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
            var response = undefined;

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

            return {
                response: response
            };
        },

        makeRequest: function makeRequest(options) {
            var deferred = new _larouxDeferredJs2['default'](),
                cors = options.cors || ajax.corsDefault,
                xhr = ajax.xhr(cors),
                url = options.url,
                timer = null,
                n = 0;

            if (options.timeout !== undefined) {
                timer = setTimeout(function () {
                    xhr.abort();
                    deferred.reject('timeout', options.url);
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
                        } catch (err) {
                            deferred.reject(err, xhr);
                            _larouxEventsJs2['default'].invoke('ajaxError', { exception: err, xhr: xhr });
                            isSuccess = false;
                        }

                        if (isSuccess && res !== null) {
                            deferred.resolve(res.response, xhr);
                            _larouxEventsJs2['default'].invoke('ajaxSuccess', { res: res, xhr: xhr });
                        }
                    } else {
                        deferred.reject(xhr);
                        _larouxEventsJs2['default'].invoke('ajaxError', xhr);
                    }

                    _larouxEventsJs2['default'].invoke('ajaxComplete', { xhr: xhr });
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
            }

            for (var j in headers) {
                if (!headers.hasOwnProperty(j)) {
                    continue;
                }

                xhr.setRequestHeader(j, headers[j]);
            }

            if (options.postdata === undefined || options.postdata === null) {
                xhr.send(null);
                return deferred;
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

            return deferred;
        },

        get: function get(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                cors: cors || ajax.corsDefault
            });
        },

        getJson: function getJson(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
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
                cors: cors || ajax.corsDefault
            });
        },

        getScript: function getScript(path, values, cors) {
            return ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
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

        getCustomDateString: function getCustomDateString(format, timestamp) {
            var now = timestamp || new Date();

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

        getDateDiffString: function getDateDiffString(timestamp) {
            var now = Date.now(),
                timespan = now - timestamp.getTime(),
                absTimespan = Math.abs(timespan),
                past = timespan > 0;

            if (absTimespan <= 3000) {
                return date.strings.now;
            }

            var timespanstring = date.parseEpoch(absTimespan, true);
            if (timespanstring !== null) {
                return timespanstring + ' ' + (past ? date.strings.ago : date.strings.later);
            }

            return date.getShortDateString(timestamp, true);
        },

        getShortDateString: function getShortDateString(timestamp, includeTime) {
            return date.getCustomDateString(includeTime ? date.shortDateFormat + ' ' + date.timeFormat : date.shortDateFormat, timestamp);
        },

        getLongDateString: function getLongDateString(timestamp, includeTime) {
            return date.getCustomDateString(includeTime ? date.longDateFormat + ' ' + date.timeFormat : date.longDateFormat, timestamp);
        }
    };

    return date;
})();

module.exports = exports['default'];
},{}],4:[function(require,module,exports){
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

var Deferred = (function () {
    function Deferred() {
        _classCallCheck(this, Deferred);

        this.events = {};
    }

    _createClass(Deferred, [{
        key: 'invoke',
        value: function invoke(eventName) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var finalEvent = eventName === 'done' || eventName === 'fail';

            if (eventName in this.events) {
                this.events[eventName].invoked = true;
                this.events[eventName].result = args;

                this.invokeCallback(this.events[eventName], args);
            } else {
                this.events[eventName] = { callbacks: [], invoked: true, result: args };
            }

            if (finalEvent && 'completed' in this.events) {
                this.invokeCallback(this.events.completed, [eventName].concat(args));
            }

            return this;
        }
    }, {
        key: 'invokeCallback',
        value: function invokeCallback(event, args) {
            if (!('callbacks' in event)) {
                return;
            }

            var callbacks = event.callbacks;

            while (callbacks.length > 0) {
                var callback = callbacks.shift();
                callback.apply(this, args);
            }
        }
    }, {
        key: 'resolve',
        value: function resolve() {
            var _invoke;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return (_invoke = this.invoke).call.apply(_invoke, [this, 'done'].concat(args));
        }
    }, {
        key: 'reject',
        value: function reject() {
            var _invoke2;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return (_invoke2 = this.invoke).call.apply(_invoke2, [this, 'fail'].concat(args));
        }
    }, {
        key: 'on',
        value: function on(eventName, callback) {
            if (!(eventName in this.events)) {
                this.events[eventName] = {
                    callbacks: [callback],
                    invoked: false,
                    result: undefined
                };

                return this;
            }

            var event = this.events[eventName];

            if (event.invoked) {
                callback.apply(this, event.result);

                return this;
            }

            event.callbacks.push(callback);

            return this;
        }
    }, {
        key: 'done',
        value: function done(callback) {
            return this.on('done', callback);
        }
    }, {
        key: 'fail',
        value: function fail(callback) {
            return this.on('fail', callback);
        }
    }, {
        key: 'completed',
        value: function completed(callback) {
            return this.on('completed', callback);
        }
    }, {
        key: 'is',
        value: function is(eventName) {
            if (!(eventName in this.events)) {
                return false;
            }

            return this.events[eventName].invoked;
        }
    }], [{
        key: 'async',
        value: function async(callback) {
            for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                args[_key4 - 1] = arguments[_key4];
            }

            var deferred = new Deferred();

            setTimeout(function () {
                try {
                    var result = callback.apply(deferred, args);
                    deferred.resolve(result);
                } catch (err) {
                    deferred.reject(err);
                }
            }, 0);

            return deferred;
        }
    }]);

    return Deferred;
})();

exports['default'] = Deferred;
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

        add: function add(event, callback) {
            events.delegates.push({ event: event, callback: callback });
        },

        invoke: function invoke(event, args) {
            for (var item in events.delegates) {
                if (!events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (events.delegates[item].event != event) {
                    continue;
                }

                events.delegates[item].callback(args);
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
},{}],7:[function(require,module,exports){
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

var _larouxStoryboardJs = require('./laroux.storyboard.js');

var _larouxStoryboardJs2 = _interopRequireDefault(_larouxStoryboardJs);

var _larouxTypesJs = require('./laroux.types.js');

var _larouxTypesJs2 = _interopRequireDefault(_larouxTypesJs);

var _larouxTemplatesJs = require('./laroux.templates.js');

var _larouxTemplatesJs2 = _interopRequireDefault(_larouxTemplatesJs);

var _larouxTimersJs = require('./laroux.timers.js');

var _larouxTimersJs2 = _interopRequireDefault(_larouxTimersJs);

var _larouxVarsJs = require('./laroux.vars.js');

var _larouxVarsJs2 = _interopRequireDefault(_larouxVarsJs);

var _larouxWhenJs = require('./laroux.when.js');

var _larouxWhenJs2 = _interopRequireDefault(_larouxWhenJs);

exports['default'] = (function () {
    'use strict';

    var laroux = function laroux(selector, parent) {
        if (selector instanceof Array) {
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
        date: _larouxDateJs2['default'],
        deferred: _larouxDeferredJs2['default'],
        events: _larouxEventsJs2['default'],
        storyboard: _larouxStoryboardJs2['default'],
        types: _larouxTypesJs2['default'],
        templates: _larouxTemplatesJs2['default'],
        timers: _larouxTimersJs2['default'],
        vars: _larouxVarsJs2['default'],
        when: _larouxWhenJs2['default'],

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

    return laroux;
})();

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ajax.js":2,"./laroux.date.js":3,"./laroux.deferred.js":4,"./laroux.events.js":5,"./laroux.helpers.js":6,"./laroux.storyboard.js":8,"./laroux.templates.js":9,"./laroux.timers.js":10,"./laroux.types.js":11,"./laroux.vars.js":12,"./laroux.when.js":13}],8:[function(require,module,exports){
(function (global){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var Storyboard = (function () {
    function Storyboard() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        _classCallCheck(this, Storyboard);

        var self = this;

        this.phases = [];
        this.phaseKeys = {};
        this.currentIteration = 0;
        this.running = false;

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
        value: function add(phase, fnc) {
            if (fnc instanceof _larouxDeferredJs2['default']) {
                return this.addPromise(phase, fnc);
            }

            var phaseId = this.phaseKeys[phase];

            if (phaseId < this.currentIteration) {
                // execute immediately if phase is already passed
                fnc.apply(global);
                return;
            }

            this.phases[phaseId].callbacks.push(fnc);
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
            promise.done(this.checkPromise);
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
},{"./laroux.deferred.js":4}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

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

    return templates;
})();

module.exports = exports['default'];
},{"./laroux.helpers.js":6}],10:[function(require,module,exports){
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
},{"./laroux.helpers.js":6}],11:[function(require,module,exports){
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

        Object.observe(this, this._onupdate);

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
            Object.observe(obj, this._onupdate);
        }
    }, {
        key: 'unobserve',
        value: function unobserve(obj) {
            Object.unobserve(obj);
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

exports['default'] = (function () {
    var types = {
        observable: Observable
    };

    return types;
})();

module.exports = exports['default'];
},{"./laroux.helpers.js":6}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

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

    return vars;
})();

module.exports = exports['default'];
},{"./laroux.helpers.js":6}],13:[function(require,module,exports){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var When = (function () {
    function When() {
        _classCallCheck(this, When);

        var self = this;

        this.queues = [];
        this.remaining = -1;

        this.deferredCompleted = function () {
            self.remaining--;
            self.check();
        };

        if (arguments.length > 0) {
            this.then.apply(this, arguments);
        }
    }

    _createClass(When, [{
        key: 'then',
        value: function then() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this.queues.push(args);
            this.check();

            return this;
        }
    }, {
        key: 'check',
        value: function check() {
            while (this.remaining <= 0) {
                if (this.remaining !== -1) {
                    this.queues.shift();
                }

                if (this.queues.length === 0) {
                    this.remaining = -1;
                    break;
                }

                var queue = this.queues[0];
                // console.log('queue: ', queue);

                this.remaining = 0;
                for (var i = 0, _length = queue.length; i < _length; i++) {
                    if (queue[i].constructor === Function) {
                        queue[i] = _larouxDeferredJs2['default'].async(queue[i]);
                    }

                    if (queue[i] instanceof _larouxDeferredJs2['default'] && !queue[i].is('completed')) {
                        this.remaining++;
                        queue[i].completed(this.deferredCompleted);
                    }
                }
            }
        }
    }]);

    return When;
})();

exports['default'] = When;
module.exports = exports['default'];
},{"./laroux.deferred.js":4,"./laroux.helpers.js":6}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxCssJs = require('./laroux.css.js');

var _larouxCssJs2 = _interopRequireDefault(_larouxCssJs);

var _larouxDeferredJs = require('../laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxHelpersJs = require('../laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var anim = {
        data: [],

        fx: {
            interpolate: function interpolate(source, target, shift) {
                return source + (target - source) * shift;
            },

            easing: function easing(pos) {
                return -Math.cos(pos * Math.PI) / 2 + 0.5;
            }
        },

        // {object, property, from, to, time, unit, reset}
        set: function set(newanim) {
            newanim.deferred = new _larouxDeferredJs2['default']();

            newanim.startTime = undefined;

            if (newanim.unit === null || newanim.unit === undefined) {
                newanim.unit = '';
            }

            if (newanim.from === null || newanim.from === undefined) {
                if (newanim.object === document.body && newanim.property === 'scrollTop') {
                    newanim.from = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
                } else {
                    newanim.from = newanim.object[newanim.property];
                }
            }

            if (newanim.from.constructor === String) {
                newanim.from = Number(newanim.from);
            }

            // if (newanim.id === undefined) {
            //     newanim.id = helpers.getUniqueId();
            // }

            anim.data.push(newanim);
            if (anim.data.length === 1) {
                requestAnimationFrame(anim.onframe);
            }

            return newanim.deferred;
        },

        setCss: function setCss(newanim) {
            if (newanim.from === null || newanim.from === undefined) {
                newanim.from = _larouxCssJs2['default'].getProperty(newanim.object, newanim.property);
            }

            newanim.object = newanim.object.style;
            newanim.property = _larouxHelpersJs2['default'].camelCase(newanim.property);

            return anim.set(newanim);
        },

        remove: function remove(id) {
            var targetKey = null;

            for (var item in anim.data) {
                if (!anim.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = anim.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                var deferred = anim.data[targetKey].deferred;

                deferred.reject('stop');

                anim.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        onframe: function onframe(timestamp) {
            var removeKeys = [];

            for (var item in anim.data) {
                if (!anim.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = anim.data[item];
                if (currentItem.startTime === undefined) {
                    currentItem.startTime = timestamp;
                }

                anim.step(currentItem, timestamp);

                if (timestamp > currentItem.startTime + currentItem.time) {
                    if (currentItem.reset === true) {
                        currentItem.startTime = timestamp;
                        if (currentItem.object === document.body && currentItem.property === 'scrollTop') {
                            scrollTo(0, currentItem.from);
                            // setTimeout(function () { scrollTo(0, currentItem.from); }, 1);
                        } else {
                            currentItem.object[currentItem.property] = currentItem.from;
                        }
                    } else {
                        removeKeys = _larouxHelpersJs2['default'].prependArray(removeKeys, item);
                        currentItem.deferred.resolve();
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                anim.data.splice(removeKeys[item2], 1);
            }

            if (anim.data.length > 0) {
                requestAnimationFrame(anim.onframe);
            }
        },

        step: function step(newanim, timestamp) {
            var finishT = newanim.startTime + newanim.time,
                shift = timestamp > finishT ? 1 : (timestamp - newanim.startTime) / newanim.time;

            var value = anim.fx.interpolate(newanim.from, newanim.to, anim.fx.easing(shift)) + newanim.unit;

            if (newanim.object === document.body && newanim.property === 'scrollTop') {
                scrollTo(0, value);
                // setTimeout(function () { scrollTo(0, value); }, 1);
            } else {
                newanim.object[newanim.property] = value;
            }
        }
    };

    return anim;
})();

module.exports = exports['default'];
},{"../laroux.deferred.js":4,"../laroux.helpers.js":6,"./laroux.css.js":15}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('../laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var css = {
        // class features
        hasClass: function hasClass(element, className) {
            return element.classList.contains(className);
        },

        addClass: function addClass(element, className) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, _length = elements.length; i < _length; i++) {
                elements[i].classList.add(className);
            }
        },

        removeClass: function removeClass(element, className) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, _length2 = elements.length; i < _length2; i++) {
                elements[i].classList.remove(className);
            }
        },

        toggleClass: function toggleClass(element, className) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, _length3 = elements.length; i < _length3; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                } else {
                    elements[i].classList.add(className);
                }
            }
        },

        cycleClass: function cycleClass(elements, className) {
            for (var i = 0, _length4 = elements.length; i < _length4; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                    elements[(i + 1) % _length4].classList.add(className);
                    return;
                }
            }
        },

        // style features
        getProperty: function getProperty(element, styleName) {
            var style = getComputedStyle(element);

            styleName = _larouxHelpersJs2['default'].antiCamelCase(styleName);

            return style.getPropertyValue(styleName);
        },

        setProperty: function setProperty(element, properties, value) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            if (typeof properties === 'string') {
                var oldProperties = properties;
                properties = {};
                properties[oldProperties] = value;
            }

            for (var styleName in properties) {
                if (!properties.hasOwnProperty(styleName)) {
                    continue;
                }

                var newStyleName = _larouxHelpersJs2['default'].camelCase(styleName);

                for (var i = 0, _length5 = elements.length; i < _length5; i++) {
                    elements[i].style[newStyleName] = properties[styleName];
                }
            }
        },

        // transition features
        defaultTransition: '2s ease',

        setTransitionSingle: function setTransitionSingle(element, transition) {
            var transitions = _larouxHelpersJs2['default'].getAsArray(transition),
                style = getComputedStyle(element),
                currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') || style.getPropertyValue('-ms-transition') || '',
                currentTransitionsArray = undefined;

            if (currentTransitions.length > 0) {
                currentTransitionsArray = currentTransitions.split(',');
            } else {
                currentTransitionsArray = [];
            }

            for (var item in transitions) {
                if (!transitions.hasOwnProperty(item)) {
                    continue;
                }

                var styleName = undefined,
                    transitionProperties = undefined,
                    pos = transitions[item].indexOf(' ');

                if (pos !== -1) {
                    styleName = transitions[item].substring(0, pos);
                    transitionProperties = transitions[item].substring(pos + 1);
                } else {
                    styleName = transitions[item];
                    transitionProperties = css.defaultTransition;
                }

                var found = false;
                for (var j = 0; j < currentTransitionsArray.length; j++) {
                    if (currentTransitionsArray[j].trim().localeCompare(styleName) === 0) {
                        currentTransitionsArray[j] = styleName + ' ' + transitionProperties;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    currentTransitionsArray.push(styleName + ' ' + transitionProperties);
                }
            }

            var value = currentTransitionsArray.join(', ');

            element.style.transition = value;
            element.style.webkitTransition = value;
            element.style.msTransition = value;
        },

        setTransition: function setTransition(element, transition) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, _length6 = elements.length; i < _length6; i++) {
                css.setTransitionSingle(elements[i], transition);
            }
        },

        show: function show(element, transitionProperties) {
            if (transitionProperties !== undefined) {
                css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                css.setTransition(element, 'opacity');
            }

            css.setProperty(element, { opacity: 1 });
        },

        hide: function hide(element, transitionProperties) {
            if (transitionProperties !== undefined) {
                css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                css.setTransition(element, 'opacity');
            }

            css.setProperty(element, { opacity: 0 });
        },

        // measurement features
        // height of element without padding, margin and border
        height: function height(element) {
            var style = getComputedStyle(element),
                height = style.getPropertyCSSValue('height');

            return height.getFloatValue(height.primitiveType);
        },

        // height of element with padding but without margin and border
        innerHeight: function innerHeight(element) {
            return element.clientHeight;
        },

        // height of element with padding and border but margin optional
        outerHeight: function outerHeight(element, includeMargin) {
            if (includeMargin || false) {
                return element.offsetHeight;
            }

            var style = getComputedStyle(element),
                marginTop = style.getPropertyCSSValue('margin-top'),
                marginBottom = style.getPropertyCSSValue('margin-bottom'),
                margins = marginTop.getFloatValue(marginTop.primitiveType) + marginBottom.getFloatValue(marginBottom.primitiveType);

            return Math.ceil(element.offsetHeight + margins);
        },

        // width of element without padding, margin and border
        width: function width(element) {
            var style = getComputedStyle(element),
                height = style.getPropertyCSSValue('width');

            return height.getFloatValue(height.primitiveType);
        },

        // width of element with padding but without margin and border
        innerWidth: function innerWidth(element) {
            return element.clientWidth;
        },

        // width of element with padding and border but margin optional
        outerWidth: function outerWidth(element, includeMargin) {
            if (includeMargin || false) {
                return element.offsetWidth;
            }

            var style = getComputedStyle(element),
                marginLeft = style.getPropertyCSSValue('margin-left'),
                marginRight = style.getPropertyCSSValue('margin-right'),
                margins = marginLeft.getFloatValue(marginLeft.primitiveType) + marginRight.getFloatValue(marginRight.primitiveType);

            return Math.ceil(element.offsetWidth + margins);
        },

        top: function top(element) {
            return element.getBoundingClientRect().top + (document.documentElement && document.documentElement.scrollTop || document.body.scrollTop);
        },

        left: function left(element) {
            return element.getBoundingClientRect().left + (document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft);
        },

        aboveTheTop: function aboveTheTop(element) {
            return element.getBoundingClientRect().bottom <= 0;
        },

        belowTheFold: function belowTheFold(element) {
            return element.getBoundingClientRect().top > innerHeight;
        },

        leftOfScreen: function leftOfScreen(element) {
            return element.getBoundingClientRect().right <= 0;
        },

        rightOfScreen: function rightOfScreen(element) {
            return element.getBoundingClientRect().left > innerWidth;
        },

        inViewport: function inViewport(element) {
            var rect = element.getBoundingClientRect();

            return !(rect.bottom <= 0 || rect.top > innerHeight || rect.right <= 0 || rect.left > innerWidth);
        }
    };

    return css;
})();

module.exports = exports['default'];
},{"../laroux.helpers.js":6}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('../laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var dom = {
        docprop: function docprop(propName) {
            return document.documentElement.classList.contains(propName);
        },

        select: function select(selector, parent) {
            return _larouxHelpersJs2['default'].toArray((parent || document).querySelectorAll(selector));
        },

        selectByClass: function selectByClass(selector, parent) {
            return _larouxHelpersJs2['default'].toArray((parent || document).getElementsByClassName(selector));
        },

        selectByTag: function selectByTag(selector, parent) {
            return _larouxHelpersJs2['default'].toArray((parent || document).getElementsByTagName(selector));
        },

        selectById: function selectById(selector, parent) {
            return (parent || document).getElementById(selector);
        },

        selectSingle: function selectSingle(selector, parent) {
            return (parent || document).querySelector(selector);
        },

        attr: function attr(element, attributes, value) {
            if (value === undefined && attributes.constructor !== Object) {
                return element.getAttribute(attributes);
            }

            var elements = _larouxHelpersJs2['default'].getAsArray(element);
            if (typeof attributes === 'string') {
                var oldAttributes = attributes;
                attributes = {};
                attributes[oldAttributes] = value;
            }

            for (var attributeName in attributes) {
                if (!attributes.hasOwnProperty(attributeName)) {
                    continue;
                }

                for (var i = 0, _length = elements.length; i < _length; i++) {
                    if (attributes[attributeName] === null) {
                        element.removeAttribute(attributeName);
                    } else {
                        element.setAttribute(attributeName, attributes[attributeName]);
                    }
                }
            }
        },

        data: function data(element, datanames, value) {
            if (value === undefined && datanames.constructor !== Object) {
                return element.getAttribute('data-' + datanames);
            }

            var elements = _larouxHelpersJs2['default'].getAsArray(element);
            if (typeof datanames === 'string') {
                var oldDatanames = datanames;
                datanames = {};
                datanames[oldDatanames] = value;
            }

            for (var dataName in datanames) {
                if (!datanames.hasOwnProperty(dataName)) {
                    continue;
                }

                for (var i = 0, _length2 = elements.length; i < _length2; i++) {
                    if (datanames[dataName] === null) {
                        element.removeAttribute('data-' + dataName);
                    } else {
                        element.setAttribute('data-' + dataName, datanames[dataName]);
                    }
                }
            }
        },

        eventHistory: [],
        setEvent: function setEvent(element, eventname, callback) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, _length3 = elements.length; i < _length3; i++) {
                dom.setEventSingle(elements[i], eventname, callback);
            }
        },

        setEventSingle: function setEventSingle(element, eventname, callback) {
            var callbackWrapper = function callbackWrapper(e) {
                if (callback(e, element) === false) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
            };

            dom.eventHistory.push({ element: element, eventname: eventname, callback: callback, callbackWrapper: callbackWrapper });
            element.addEventListener(eventname, callbackWrapper, false);
        },

        unsetEvent: function unsetEvent(element, eventname, callback) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i1 = 0, length1 = elements.length; i1 < length1; i1++) {
                for (var i2 = 0, length2 = dom.eventHistory.length; i2 < length2; i2++) {
                    var item = dom.eventHistory[i2];

                    if (item === undefined) {
                        continue;
                    }

                    if (item.element !== elements[i1]) {
                        continue;
                    }

                    if (eventname !== undefined && item.eventname !== eventname) {
                        continue;
                    }

                    if (callback !== undefined && item.callback !== callback) {
                        continue;
                    }

                    item.element.removeEventListener(item.eventname, item.callbackWrapper, false);
                    delete dom.eventHistory[i2];
                }
            }
        },

        dispatchEvent: function dispatchEvent(element, eventname, data) {
            var customEvent = document.createEvent('Event');
            for (var item in data) {
                if (!data.hasOwnProperty(item)) {
                    continue;
                }

                customEvent[item] = data[item];
            }

            customEvent.initEvent(eventname, true, true);
            element.dispatchEvent(customEvent);
        },

        create: function create(html) {
            var frag = document.createDocumentFragment(),
                temp = document.createElement('DIV');

            temp.insertAdjacentHTML('beforeend', html);
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }

            // nulling out the reference, there is no obvious dispose method
            temp = null;

            return frag;
        },

        createElement: function createElement(element, attributes, children) {
            var elem = document.createElement(element);

            if (attributes !== undefined && attributes.constructor === Object) {
                for (var item in attributes) {
                    if (!attributes.hasOwnProperty(item)) {
                        continue;
                    }

                    elem.setAttribute(item, attributes[item]);
                }
            }

            if (children !== undefined) {
                if (children.constructor === Object) {
                    for (var item2 in children) {
                        if (!children.hasOwnProperty(item2)) {
                            continue;
                        }

                        elem.setAttribute(item2, children[item2]);
                    }
                } else if ( /* typeof children === 'string' && */children.length > 0) {
                    dom.append(elem, children);
                }
            }

            return elem;
        },

        createOption: function createOption(element, key, value, isDefault) {
            /* old behaviour, does not support optgroups as parents.
            let count = element.options.length;
            element.options[count] = new Option(value, key);
             if (isDefault === true) {
                element.options.selectedIndex = count - 1;
            }
            */

            var option = document.createElement('OPTION');
            option.setAttribute('value', key);
            if (isDefault === true) {
                option.setAttribute('checked', 'checked');
            }

            dom.append(option, value);
            element.appendChild(option);
        },

        selectByValue: function selectByValue(element, value) {
            for (var i = 0, _length4 = element.options.length; i < _length4; i++) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        }, /*,
           // TODO: it's redundant for now
           loadImage: function () {
             let images = [];
              for (let i = 0, length = arguments.length; i < length; i++) {
                 let image = document.createElement('IMG');
                 image.setAttribute('src', arguments[i]);
                  images.push(image);
             }
              return images;
           },
           loadAsyncScript: function (path, triggerName, async) {
             let elem = document.createElement('script');
              elem.type = 'text/javascript';
             elem.async = (async !== undefined) ? async : true;
             elem.src = path;
              let loaded = false;
             elem.onload = elem.onreadystatechange = function () {
                 if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                     return false;
                 }
                  elem.onload = elem.onreadystatechange = null;
                 loaded = true;
                 if (triggerName) {
                     if (typeof triggerName === 'function') {
                         triggerName();
                     } else {
                         triggers.ontrigger(triggerName);
                     }
                 }
             };
              let head = document.getElementsByTagName('head')[0];
             head.appendChild(elem);
           },
           loadAsyncStyle: function (path, triggerName, async) {
             let elem = document.createElement('LINK');
              elem.type = 'text/css';
             elem.async = (async !== undefined) ? async : true;
             elem.href = path;
             elem.rel = 'stylesheet';
              let loaded = false;
             elem.onload = elem.onreadystatechange = function () {
                 if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                     return false;
                 }
                  elem.onload = elem.onreadystatechange = null;
                 loaded = true;
                 if (triggerName) {
                     if (typeof triggerName === 'function') {
                         triggerName();
                     } else {
                         triggers.ontrigger(triggerName);
                     }
                 }
             };
              let head = document.getElementsByTagName('head')[0];
             head.appendChild(elem);
           },*/

        clear: function clear(element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.firstChild);
            }
        },

        insert: function insert(element, position, content) {
            element.insertAdjacentHTML(position, content);
        },

        prepend: function prepend(element, content) {
            element.insertAdjacentHTML('afterbegin', content);
        },

        append: function append(element, content) {
            element.insertAdjacentHTML('beforeend', content);
        },

        replace: function replace(element, content) {
            dom.clear(element);
            element.insertAdjacentHTML('afterbegin', content);
        },

        replaceText: function replaceText(element, content) {
            // dom.clear(element);
            element.textContent = content;
        },

        remove: function remove(element) {
            element.remove();
        },

        cloneReturn: 0,
        cloneAppend: 1,
        cloneInsertAfter: 2,
        cloneInsertBefore: 3,

        clone: function clone(element, type, container, target) {
            var newElement = element.cloneNode(true);

            if (container === undefined) {
                container = element.parentNode;
            }
            if (target === undefined) {
                target = element;
            }

            if (type !== undefined && type != dom.cloneReturn) {
                if (type == dom.cloneAppend) {
                    container.appendChild(newElement);
                } else if (type == dom.cloneInsertAfter) {
                    container.insertBefore(newElement, target.nextSibling);
                } else {
                    // type == dom.cloneInsertBefore
                    container.insertBefore(newElement, target);
                }
            }

            return newElement;
        } /*,
          // TODO: it's redundant for now
          applyOperations: function (element, operations) {
             for (let operation in operations) {
                 if (!operations.hasOwnProperty(operation)) {
                     continue;
                 }
                  for (let binding in operations[operation]) {
                     if (!operations[operation].hasOwnProperty(binding)) {
                         continue;
                     }
                      let value = operations[operation][binding];
                      switch (operation) {
                         case 'setprop':
                             if (binding.substring(0, 1) === '_') {
                                 element.setAttribute(binding.substring(1), value);
                                 continue;
                             }
                              if (binding === 'content') {
                                 dom.replace(element, value);
                                 continue;
                             }
                             break;
                         case 'addprop':
                             if (binding.substring(0, 1) === '_') {
                                 element.setAttribute(binding.substring(1), element.getAttribute(binding.substring(1)) + value);
                                 continue;
                             }
                              if (binding === 'content') {
                                 dom.append(element, value);
                                 continue;
                             }
                             break;
                         case 'removeprop':
                             if (value.substring(0, 1) === '_') {
                                 element.removeAttribute(value.substring(1));
                                 continue;
                             }
                              if (value === 'content') {
                                 dom.clear(element);
                                 continue;
                             }
                             break;
                         case 'addclass':
                             css.addClass(element, value);
                             break;
                         case 'removeclass':
                             css.removeClass(element, value);
                             break;
                         case 'addstyle':
                             css.setProperty(element, binding, value);
                             break;
                         case 'removestyle':
                             css.setProperty(element, value, 'inherit !important');
                             break;
                         case 'repeat':
                             break;
                         default:
                             console.log(operation);
                     }
                 }
             }
          }*/
    };

    // a fix for Internet Explorer
    if (typeof Element !== 'undefined') {
        if (Element.prototype.remove === undefined) {
            Element.prototype.remove = function () {
                if (this.parentElement !== null) {
                    this.parentElement.removeChild(this);
                }
            };
        }
    }

    return dom;
})();

module.exports = exports['default'];
},{"../laroux.helpers.js":6}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxAjaxJs = require('../laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxDomJs = require('./laroux.dom.js');

var _larouxDomJs2 = _interopRequireDefault(_larouxDomJs);

exports['default'] = (function () {
    'use strict';

    var forms = {
        ajaxForm: function ajaxForm(formobj, callback, callbackBegin) {
            _larouxDomJs2['default'].setEvent(formobj, 'submit', function () {
                if (callbackBegin !== undefined) {
                    callbackBegin();
                }

                _larouxAjaxJs2['default'].post(formobj.getAttribute('action'), forms.serializeFormData(formobj), callback);

                return false;
            });
        },

        isFormField: function isFormField(element) {
            if (element.tagName === 'SELECT') {
                return true;
            }

            if (element.tagName === 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type === 'FILE' || type === 'CHECKBOX' || type === 'RADIO' || type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                    return true;
                }

                return false;
            }

            if (element.tagName === 'TEXTAREA') {
                return true;
            }

            return false;
        },

        getFormFieldValue: function getFormFieldValue(element) {
            if (element.disabled === true) {
                return null;
            }

            if (element.tagName === 'SELECT') {
                return element.options[element.selectedIndex].value;
            }

            if (element.tagName === 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type === 'FILE') {
                    return element.files[0];
                }

                if (type === 'CHECKBOX' || type === 'RADIO') {
                    if (element.checked) {
                        return element.value;
                    }

                    return null;
                }

                if (type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                    return element.value;
                }

                return null;
            }

            if (element.tagName === 'TEXTAREA') {
                return element.value;
            }

            return null;
        },

        setFormFieldValue: function setFormFieldValue(element, value) {
            if (element.disabled === true) {
                return;
            }

            if (element.tagName === 'SELECT') {
                for (var option in element.options) {
                    if (!element.options.hasOwnProperty(option)) {
                        continue;
                    }

                    if (element.options[option].value == value) {
                        element.selectedIndex = option;
                        return;
                    }
                }

                return;
            }

            if (element.tagName === 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type === 'FILE') {
                    element.files[0] = value;
                    return;
                }

                if (type === 'CHECKBOX' || type === 'RADIO') {
                    if (value === true || value == element.value) {
                        element.checked = true;
                    }

                    return;
                }

                if (type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                    element.value = value;
                    return;
                }

                return;
            }

            if (element.tagName === 'TEXTAREA') {
                element.value = value;
                return;
            }
        },

        toggleFormEditing: function toggleFormEditing(formobj, value) {
            var selection = formobj.querySelectorAll('*[name]');

            if (value === undefined) {
                if (formobj.getAttribute('data-last-enabled') === null) {
                    formobj.setAttribute('data-last-enabled', 'enabled');
                    value = false;
                } else {
                    formobj.removeAttribute('data-last-enabled');
                    value = true;
                }
            }

            for (var selected = 0, _length = selection.length; selected < _length; selected++) {
                if (!forms.isFormField(selection[selected])) {
                    continue;
                }

                var lastDisabled = selection[selected].getAttribute('data-last-disabled');
                if (!value) {
                    if (lastDisabled === null) {
                        if (selection[selected].getAttribute('disabled') !== null) {
                            selection[selected].setAttribute('data-last-disabled', 'disabled');
                        }
                    }

                    selection[selected].setAttribute('disabled', 'disabled');
                    continue;
                }

                if (lastDisabled !== null) {
                    selection[selected].removeAttribute('data-last-disabled');
                } else {
                    selection[selected].removeAttribute('disabled');
                }
            }
        },

        serializeFormData: function serializeFormData(formobj) {
            var formdata = new FormData();
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, _length2 = selection.length; selected < _length2; selected++) {
                var value = forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    formdata.append(selection[selected].getAttribute('name'), value);
                }
            }

            return formdata;
        },

        serialize: function serialize(formobj) {
            var values = {};
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, _length3 = selection.length; selected < _length3; selected++) {
                var value = forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    values[selection[selected].getAttribute('name')] = value;
                }
            }

            return values;
        },

        deserialize: function deserialize(formobj, data) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, _length4 = selection.length; selected < _length4; selected++) {
                forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
            }
        }
    };

    return forms;
})();

module.exports = exports['default'];
},{"../laroux.ajax.js":2,"./laroux.dom.js":16}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxDomJs = require('./laroux.dom.js');

var _larouxDomJs2 = _interopRequireDefault(_larouxDomJs);

var _larouxFormsJs = require('./laroux.forms.js');

var _larouxFormsJs2 = _interopRequireDefault(_larouxFormsJs);

exports['default'] = (function () {
    'use strict';

    var keys = {
        keyName: function keyName(keycode) {
            keycode = keycode.toLowerCase();

            switch (keycode) {
                case 'backspace':
                    return 8;

                case 'tab':
                    return 9;

                case 'enter':
                case 'return':
                    return 13;

                case 'esc':
                case 'escape':
                    return 27;

                case 'space':
                    return 32;

                case 'pgup':
                    return 33;

                case 'pgdn':
                    return 34;

                case 'end':
                    return 35;

                case 'home':
                    return 36;

                case 'left':
                    return 37;

                case 'up':
                    return 38;

                case 'right':
                    return 39;

                case 'down':
                    return 40;

                case 'insert':
                    return 45;

                case 'delete':
                    return 46;

                case 'f1':
                    return 112;

                case 'f2':
                    return 113;

                case 'f3':
                    return 114;

                case 'f4':
                    return 115;

                case 'f5':
                    return 116;

                case 'f6':
                    return 117;

                case 'f7':
                    return 118;

                case 'f8':
                    return 119;

                case 'f9':
                    return 120;

                case 'f10':
                    return 121;

                case 'f11':
                    return 122;

                case 'f12':
                    return 123;

                case ',':
                    return 188;

                case '.':
                    return 190;
            }

            return String.fromCharCode(keycode);
        },

        // {target, key, shift, ctrl, alt, disableInputs, callback}
        assign: function assign(options) {
            var wrapper = function wrapper(ev) {
                if (!ev) {
                    ev = event;
                }

                var element = ev.target || ev.srcElement;
                if (element.nodeType === 3 || element.nodeType === 11) {
                    // element.nodeType === 1 ||
                    element = element.parentNode;
                }

                if (options.disableInputs && _larouxFormsJs2['default'].isFormField(element)) {
                    return;
                }

                if (options.shift && !ev.shiftKey) {
                    return;
                }

                if (options.ctrl && !ev.ctrlKey) {
                    return;
                }

                if (options.alt && !ev.altKey) {
                    return;
                }

                var key = keys.keyName(options.key);
                if (key !== (ev.keyCode || ev.which)) {
                    return;
                }

                options.callback(ev);

                return false;
            };

            _larouxDomJs2['default'].setEvent(options.target || document, 'keydown', wrapper);
        }
    };

    return keys;
})();

module.exports = exports['default'];
},{"./laroux.dom.js":16,"./laroux.forms.js":17}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxDomJs = require('./laroux.dom.js');

var _larouxDomJs2 = _interopRequireDefault(_larouxDomJs);

var _larouxHelpersJs = require('../laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var mvc = {
        apps: {},
        pauseUpdate: false,

        init: function init(element, model) {
            if (element.constructor === String) {
                element = _larouxDomJs2['default'].selectById(element);
            }

            // if (model.constructor !== types.Observable) {
            //     model = new types.Observable(model);
            // }

            var appKey = element.getAttribute('id');

            model.on(function (event) {
                if (!mvc.pauseUpdate) {
                    mvc.update(appKey); // , [event.key]
                }
            });

            mvc.apps[appKey] = {
                element: element,
                model: model // ,
                // modelKeys: null,
                // boundElements: null,
                // eventElements: null
            };

            mvc.rebind(appKey);
        },

        rebind: function rebind(appKey) {
            var app = mvc.apps[appKey];
            /*jslint nomen: true */
            app.modelKeys = _larouxHelpersJs2['default'].getKeysRecursive(app.model); // FIXME: works only for $l.types.Observable
            app.boundElements = {};
            app.eventElements = [];

            mvc.scanElements(app, app.element);
            mvc.update(appKey);

            var callback = function callback(ev, elem) {
                var binding = mvc.bindStringParser(elem.getAttribute('lr-event'));
                // mvc.pauseUpdate = true;
                for (var item in binding) {
                    if (item === null || !binding.hasOwnProperty(item)) {
                        continue;
                    }

                    if (binding[item].charAt(0) === '\'') {
                        app.model[item] = binding[item].substring(1, binding[item].length - 1);
                    } else if (binding[item].substring(0, 5) === 'attr.') {
                        app.model[item] = elem.getAttribute(binding[item].substring(5));
                    } else if (binding[item].substring(0, 5) === 'prop.') {
                        app.model[item] = elem[binding[item].substring(5)];
                    }
                }
                // mvc.pauseUpdate = false;
            };

            for (var i = 0, _length = app.eventElements.length; i < _length; i++) {
                _larouxDomJs2['default'].setEvent(app.eventElements[i].element, app.eventElements[i].binding[null], callback);
            }
        },

        scanElements: function scanElements(app, element) {
            for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
                if (atts[i].name === 'lr-bind') {
                    var binding1 = mvc.bindStringParser(atts[i].value);

                    for (var item in binding1) {
                        if (!binding1.hasOwnProperty(item)) {
                            continue;
                        }

                        if (app.boundElements[binding1[item]] === undefined) {
                            app.boundElements[binding1[item]] = [];
                        }

                        app.boundElements[binding1[item]].push({
                            element: element,
                            target: item
                        });
                    }
                } else if (atts[i].name === 'lr-event') {
                    var binding2 = mvc.bindStringParser(atts[i].value);

                    app.eventElements.push({
                        element: element,
                        binding: binding2
                    });
                }
            }

            for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
                if (chldrn[j].nodeType === 1) {
                    mvc.scanElements(app, chldrn[j]);
                }
            }
        },

        update: function update(appKey, keys) {
            var app = mvc.apps[appKey];

            if (typeof keys === 'undefined') {
                keys = app.modelKeys;
            }

            for (var i = 0, length1 = keys.length; i < length1; i++) {
                if (!(keys[i] in app.boundElements)) {
                    continue;
                }

                var boundElement = app.boundElements[keys[i]],
                    value = _larouxHelpersJs2['default'].getElement(app.model, keys[i]);

                if (value instanceof Function) {
                    value = value.call(app.model);
                }

                for (var j = 0, length2 = boundElement.length; j < length2; j++) {
                    if (boundElement[j].target.substring(0, 6) === 'style.') {
                        boundElement[j].element.style[boundElement[j].target.substring(6)] = value;
                    } else if (boundElement[j].target.substring(0, 5) === 'attr.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element.setAttribute(boundElement[j].target.substring(5), value);
                    } else if (boundElement[j].target.substring(0, 5) === 'prop.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element[boundElement[j].target.substring(5)] = value;
                    }
                }
            }
        },

        bindStringParser: function bindStringParser(text) {
            var lastBuffer = null,
                buffer = '',
                state = 0,
                result = {};

            for (var i = 0, _length2 = text.length; i < _length2; i++) {
                var curr = text.charAt(i);

                if (state === 0) {
                    if (curr === ':') {
                        state = 1;
                        lastBuffer = buffer.trim();
                        buffer = '';
                        continue;
                    }
                }

                if (curr === ',') {
                    state = 0;
                    result[lastBuffer] = buffer.trim();
                    buffer = '';
                    continue;
                }

                buffer += curr;
            }

            if (buffer.length > 0) {
                result[lastBuffer] = buffer.trim();
            }

            return result;
        }
    };

    return mvc;
})();

module.exports = exports['default'];
},{"../laroux.helpers.js":6,"./laroux.dom.js":16}],20:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxJs = require('../laroux.js');

var _larouxJs2 = _interopRequireDefault(_larouxJs);

var _larouxHelpersJs = require('../laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    // routes - partially taken from 'routie' project
    //          can be found at: https://github.com/jgallen23/routie
    var routes = {
        map: {},
        attached: false,
        current: null,

        regexConverter: function regexConverter(path, sensitive, strict) {
            var keys = [],
                regexString = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
                keys.push({ name: key, optional: !!optional });
                slash = slash || '';

                return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
            }).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)');

            return {
                regex: new RegExp('^' + regexString + '$', sensitive ? '' : 'i'),
                keys: keys
            };
        },

        add: function add(path, callback) {
            routes.addNamed(null, path, callback);
        },

        addNamed: function addNamed(name, path, callback) {
            if (!(path in routes.map)) {
                var converted = routes.regexConverter(path);

                routes.map[path] = {
                    name: name,
                    callback: callback,
                    params: {},
                    keys: converted.keys,
                    regex: converted.regex
                };
            } else {
                routes.map[path].callback = callback;
            }
        },

        get: function get(path) {
            for (var item in routes.map) {
                if (!routes.map.hasOwnProperty(item)) {
                    continue;
                }

                var route = routes.map[item],
                    match = route.regex.exec(path);

                if (!match) {
                    continue;
                }

                var params = {};
                for (var i = 1, _length = match.length; i < _length; i++) {
                    var key = route.keys[i - 1];

                    if (key !== undefined) {
                        params[key.name] = typeof match[i] == 'string' ? decodeURIComponent(match[i]) : match[i];
                    }
                }

                return {
                    route: item,
                    resolved: path,
                    params: params,
                    callback: route.callback
                };
            }

            return null;
        },

        getNamed: function getNamed(name, params) {
            for (var item in routes.map) {
                if (!routes.map.hasOwnProperty(item)) {
                    continue;
                }

                var route = routes.map[item],
                    path = item;

                for (var i = 0, _length2 = route.keys.length; i < _length2; i++) {
                    var key = route.keys[i];

                    path = path.replace(':' + key.name, params[key.name] || '');
                }

                if (route.name == name) {
                    return {
                        route: item,
                        resolved: path,
                        params: params,
                        callback: route.callback
                    };
                }
            }

            return null;
        },

        link: function link(name, params) {
            var route = routes.getNamed(name, params);

            if (route === null) {
                return null;
            }

            return route.resolved;
        },

        exec: function exec(route) {
            var previous = routes.current,
                args = _larouxHelpersJs2['default'].map(route.params, function (value) {
                return value;
            });

            routes.current = route;
            args.push({
                previous: previous,
                current: routes.current
            });

            return route.callback.apply(global, args);
        },

        go: function go(path, silent) {
            var attached = routes.attached;

            if (silent && attached) {
                routes.detach();
            }

            setTimeout(function () {
                global.location.hash = path;

                if (silent && attached) {
                    setTimeout(function () {
                        routes.attach();
                    }, 1);
                }
            }, 1);
        },

        goNamed: function goNamed(name, params, silent) {
            var path = routes.link(name, params);

            if (path === null) {
                return null;
            }

            routes.go(path, silent);
        },

        reload: function reload() {
            var hash = location.hash.substring(1),
                route = routes.get(hash);

            if (route === null) {
                return;
            }

            routes.exec(route);
        },

        attach: function attach() {
            global.addEventListener('hashchange', routes.reload, false);
            routes.attached = true;
        },

        detach: function detach() {
            global.removeEventListener('hashchange', routes.reload);
            routes.attached = false;
        }
    };

    _larouxJs2['default'].ready(routes.attach);

    return routes;
})();

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../laroux.helpers.js":6,"../laroux.js":7}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxJs = require('../laroux.js');

var _larouxJs2 = _interopRequireDefault(_larouxJs);

var _larouxDomJs = require('./laroux.dom.js');

var _larouxDomJs2 = _interopRequireDefault(_larouxDomJs);

exports['default'] = (function () {
    'use strict';

    // touch - partially taken from 'tocca.js' project
    //         can be found at: https://github.com/GianlucaGuarini/Tocca.js
    var touch = {
        touchStarted: null,
        swipeTreshold: 80,
        precision: 30,
        tapCount: 0,
        tapTreshold: 200,
        longTapTreshold: 800,
        tapTimer: null,
        pos: null,
        cached: null,

        events: {
            start: ['touchstart', 'pointerdown', 'MSPointerDown', 'mousedown'],
            end: ['touchend', 'pointerup', 'MSPointerUp', 'mouseup'],
            move: ['touchmove', 'pointermove', 'MSPointerMove', 'mousemove']
        },

        locatePointer: function locatePointer(event) {
            if (event.targetTouches) {
                event = event.targetTouches[0];
            }

            touch.pos = [event.pageX, event.pageY];
        },

        init: function init() {
            var events = [0, navigator.msPointerEnabled ? 2 : 1, 3];

            for (var i = 0, _length = events.length; i < _length; i++) {
                _larouxDomJs2['default'].setEventSingle(document, touch.events.start[events[i]], touch.onstart);
                _larouxDomJs2['default'].setEventSingle(document, touch.events.end[events[i]], touch.onend);
                _larouxDomJs2['default'].setEventSingle(document, touch.events.move[events[i]], touch.locatePointer);
            }
        },

        onstart: function onstart(event) {
            touch.locatePointer(event);
            touch.cached = [touch.pos[0], touch.pos[1]];
            touch.touchStarted = Date.now();
            /*jslint plusplus: true */
            touch.tapCount++;

            var callback = function callback() {
                if (touch.cached[0] >= touch.pos[0] - touch.precision && touch.cached[0] <= touch.pos[0] + touch.precision && touch.cached[1] >= touch.pos[1] - touch.precision && touch.cached[1] <= touch.pos[1] + touch.precision) {
                    if (touch.touchStarted === null) {
                        _larouxDomJs2['default'].dispatchEvent(event.target, touch.tapCount === 2 ? 'dbltap' : 'tap', {
                            innerEvent: event,
                            x: touch.pos[0],
                            y: touch.pos[1]
                        });

                        touch.tapCount = 0;
                        return;
                    }

                    if (Date.now() - touch.touchStarted > touch.longTapTreshold) {
                        _larouxDomJs2['default'].dispatchEvent(event.target, 'longtap', {
                            innerEvent: event,
                            x: touch.pos[0],
                            y: touch.pos[1]
                        });

                        touch.touchStarted = null;
                        touch.tapCount = 0;
                        return;
                    }

                    touch.tapTimer = setTimeout(callback, touch.tapTreshold);
                    return;
                }

                touch.tapCount = 0;
            };

            clearTimeout(touch.tapTimer);
            touch.tapTimer = setTimeout(callback, touch.tapTreshold);
        },

        onend: function onend(event) {
            var delta = [touch.pos[0] - touch.cached[0], touch.pos[1] - touch.cached[1]],
                data = {
                innerEvent: event,
                x: touch.pos[0],
                y: touch.pos[1],
                distance: {
                    x: Math.abs(delta[0]),
                    y: Math.abs(delta[1])
                }
            };

            touch.touchStarted = null;

            if (delta[0] <= -touch.swipeTreshold) {
                _larouxDomJs2['default'].dispatchEvent(event.target, 'swiperight', data);
            }

            if (delta[0] >= touch.swipeTreshold) {
                _larouxDomJs2['default'].dispatchEvent(event.target, 'swipeleft', data);
            }

            if (delta[1] <= -touch.swipeTreshold) {
                _larouxDomJs2['default'].dispatchEvent(event.target, 'swipedown', data);
            }

            if (delta[1] >= touch.swipeTreshold) {
                _larouxDomJs2['default'].dispatchEvent(event.target, 'swipeup', data);
            }
        }
    };

    _larouxJs2['default'].ready(touch.init);

    return touch;
})();

module.exports = exports['default'];
},{"../laroux.js":7,"./laroux.dom.js":16}]},{},[1]);
