/**
 * laroux.js - A jquery substitute for modern browsers (web bundle)
 *
 * @version v2.0.0
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

var _larouxHelpersJs = require('../laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

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

var _larouxTouchJs = require('./laroux.touch.js');

var _larouxTouchJs2 = _interopRequireDefault(_larouxTouchJs);

exports['default'] = (function () {
    'use strict';

    _larouxHelpersJs2['default'].extend(_larouxJs2['default'], {
        anim: _larouxAnimJs2['default'],
        css: _larouxCssJs2['default'],
        dom: _larouxDomJs2['default'],
        forms: _larouxFormsJs2['default'],
        keys: _larouxKeysJs2['default'],
        mvc: _larouxMvcJs2['default'],
        touch: _larouxTouchJs2['default']
    });

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', _larouxJs2['default'].setReady);
    }

    return _larouxJs2['default'];
})();

module.exports = exports['default'];
},{"../laroux.helpers.js":7,"../laroux.js":8,"./laroux.anim.js":13,"./laroux.css.js":14,"./laroux.dom.js":15,"./laroux.forms.js":16,"./laroux.keys.js":17,"./laroux.mvc.js":18,"./laroux.touch.js":19}],2:[function(require,module,exports){
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
                        // if (data.format === 'xml') {
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
},{"./laroux.deferred.js":5,"./laroux.events.js":6,"./laroux.helpers.js":7}],3:[function(require,module,exports){
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Async = (function () {
    function Async(fnc, completedCallback) {
        _classCallCheck(this, Async);

        this.fnc = fnc;
        this.completedCallbacks = [];
        this.isCompleted = false;
        this.result = undefined;

        if (completedCallback) {
            this.completedCallbacks.push(completedCallback);
        }
    }

    _createClass(Async, [{
        key: 'onCompleted',
        value: function onCompleted(completedCallback) {
            if (this.isCompleted) {
                completedCallback.call(undefined, this.result);
                return this;
            }

            this.completedCallbacks.push(completedCallback);
            return this;
        }
    }, {
        key: 'invoke',
        value: function invoke() {
            var self = this,
                args = arguments;

            setTimeout(function () {
                var result = {};

                try {
                    result.result = self.fnc.apply(undefined, args);
                    result.success = true;
                } catch (err) {
                    result.exception = err;
                    result.success = false;
                }

                self.result = result;
                self.isCompleted = true;

                while (self.completedCallbacks.length > 0) {
                    var fnc = self.completedCallbacks.shift();
                    fnc.call(undefined, self.result);
                }
            }, 0);

            return this;
        }
    }]);

    return Async;
})();

exports['default'] = Async;
module.exports = exports['default'];
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"./laroux.helpers.js":7}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

        buildFormData: function buildFormData(values) {
            var data = new FormData();

            for (var name in values) {
                if (!values.hasOwnProperty(name)) {
                    continue;
                }

                if (typeof values[name] !== 'function') {
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
},{}],8:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxAjaxJs = require('./laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxAsyncJs = require('./laroux.async.js');

var _larouxAsyncJs2 = _interopRequireDefault(_larouxAsyncJs);

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

var _larouxTemplatesJs = require('./laroux.templates.js');

var _larouxTemplatesJs2 = _interopRequireDefault(_larouxTemplatesJs);

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
        async: _larouxAsyncJs2['default'],
        date: _larouxDateJs2['default'],
        deferred: _larouxDeferredJs2['default'],
        events: _larouxEventsJs2['default'],
        stack: _larouxStackJs2['default'],
        templates: _larouxTemplatesJs2['default'],
        timers: _larouxTimersJs2['default'],
        vars: _larouxVarsJs2['default'],

        cached: {
            single: {},
            array: {},
            id: {}
        },

        c: function c(selector) {
            if (selector instanceof Array) {
                return laroux.cached.array[selector] || (laroux.cached.array[selector] = _larouxHelpersJs2['default'].toArray(document.querySelectorAll(selector)));
            }

            return laroux.cached.single[selector] || (laroux.cached.single[selector] = document.querySelector(selector));
        },

        id: function id(selector, parent) {
            return (parent || document).getElementById(selector);
        },

        idc: function idc(selector) {
            return laroux.cached.id[selector] || (laroux.cached.id[selector] = document.getElementById(selector));
        },

        readyPassed: false,

        ready: function ready(fnc) {
            if (!laroux.readyPassed) {
                _larouxEventsJs2['default'].add('ContentLoaded', fnc);
                return;
            }

            fnc();
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
},{"./laroux.ajax.js":2,"./laroux.async.js":3,"./laroux.date.js":4,"./laroux.deferred.js":5,"./laroux.events.js":6,"./laroux.helpers.js":7,"./laroux.stack.js":9,"./laroux.templates.js":10,"./laroux.timers.js":11,"./laroux.vars.js":12}],9:[function(require,module,exports){
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
                    if (type === 'object') {
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
},{}],10:[function(require,module,exports){
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
                        nextIndex;

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
            var content,
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
            var output = templates.apply(element, model, options);
             dom.insert(target, position || 'beforeend', output);
        },
         replace: function (element, model, target, options) {
            var output = templates.apply(element, model, options);
             dom.replace(target, output);
        }
        */
    };

    return templates;
})();

module.exports = exports['default'];
},{"./laroux.helpers.js":7}],11:[function(require,module,exports){
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
},{"./laroux.helpers.js":7}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
            newanim.promise = new _larouxDeferredJs2['default']();

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

            return newanim.promise.then(function () {
                anim.data.push(newanim);
                if (anim.data.length === 1) {
                    requestAnimationFrame(anim.onframe);
                }
            }, true);
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
                var promise = anim.data[targetKey].promise;

                promise.invoke('stop');
                promise.complete();

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
                        currentItem.promise.next();
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
},{"../laroux.deferred.js":5,"../laroux.helpers.js":7,"./laroux.css.js":14}],14:[function(require,module,exports){
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

            for (var i = 0, length = elements.length; i < length; i++) {
                elements[i].classList.add(className);
            }
        },

        removeClass: function removeClass(element, className) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                elements[i].classList.remove(className);
            }
        },

        toggleClass: function toggleClass(element, className) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                } else {
                    elements[i].classList.add(className);
                }
            }
        },

        cycleClass: function cycleClass(elements, className) {
            for (var i = 0, length = elements.length; i < length; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                    elements[(i + 1) % length].classList.add(className);
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

                for (var i = 0, length = elements.length; i < length; i++) {
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
                currentTransitionsArray;

            if (currentTransitions.length > 0) {
                currentTransitionsArray = currentTransitions.split(',');
            } else {
                currentTransitionsArray = [];
            }

            for (var item in transitions) {
                if (!transitions.hasOwnProperty(item)) {
                    continue;
                }

                var styleName,
                    transitionProperties,
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

            for (var i = 0, length = elements.length; i < length; i++) {
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
},{"../laroux.helpers.js":7}],15:[function(require,module,exports){
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

                for (var i = 0, length = elements.length; i < length; i++) {
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

                for (var i = 0, length = elements.length; i < length; i++) {
                    if (datanames[dataName] === null) {
                        element.removeAttribute('data-' + dataName);
                    } else {
                        element.setAttribute('data-' + dataName, datanames[dataName]);
                    }
                }
            }
        },

        eventHistory: [],
        setEvent: function setEvent(element, eventname, fnc) {
            var elements = _larouxHelpersJs2['default'].getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                dom.setEventSingle(elements[i], eventname, fnc);
            }
        },

        setEventSingle: function setEventSingle(element, eventname, fnc) {
            var fncWrapper = function fncWrapper(e) {
                if (fnc(e, element) === false) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
            };

            dom.eventHistory.push({ element: element, eventname: eventname, fnc: fnc, fncWrapper: fncWrapper });
            element.addEventListener(eventname, fncWrapper, false);
        },

        unsetEvent: function unsetEvent(element, eventname, fnc) {
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

                    if (fnc !== undefined && item.fnc !== fnc) {
                        continue;
                    }

                    item.element.removeEventListener(item.eventname, item.fncWrapper, false);
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
            var count = element.options.length;
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
            for (var i = 0, length = element.options.length; i < length; i++) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        }, /*,
           // TODO: it's redundant for now
           loadImage: function () {
             var images = [];
              for (var i = 0, length = arguments.length; i < length; i++) {
                 var image = document.createElement('IMG');
                 image.setAttribute('src', arguments[i]);
                  images.push(image);
             }
              return images;
           },
           loadAsyncScript: function (path, triggerName, async) {
             var elem = document.createElement('script');
              elem.type = 'text/javascript';
             elem.async = (async !== undefined) ? async : true;
             elem.src = path;
              var loaded = false;
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
              var head = document.getElementsByTagName('head')[0];
             head.appendChild(elem);
           },
           loadAsyncStyle: function (path, triggerName, async) {
             var elem = document.createElement('LINK');
              elem.type = 'text/css';
             elem.async = (async !== undefined) ? async : true;
             elem.href = path;
             elem.rel = 'stylesheet';
              var loaded = false;
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
              var head = document.getElementsByTagName('head')[0];
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
             for (var operation in operations) {
                 if (!operations.hasOwnProperty(operation)) {
                     continue;
                 }
                  for (var binding in operations[operation]) {
                     if (!operations[operation].hasOwnProperty(binding)) {
                         continue;
                     }
                      var value = operations[operation][binding];
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
},{"../laroux.helpers.js":7}],16:[function(require,module,exports){
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
        ajaxForm: function ajaxForm(formobj, fnc, fncBegin) {
            _larouxDomJs2['default'].setEvent(formobj, 'submit', function () {
                if (fncBegin !== undefined) {
                    fncBegin();
                }

                _larouxAjaxJs2['default'].post(formobj.getAttribute('action'), forms.serializeFormData(formobj), fnc);

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

            for (var selected = 0, length = selection.length; selected < length; selected++) {
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

            for (var selected = 0, length = selection.length; selected < length; selected++) {
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

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    values[selection[selected].getAttribute('name')] = value;
                }
            }

            return values;
        },

        deserialize: function deserialize(formobj, data) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
            }
        }
    };

    return forms;
})();

module.exports = exports['default'];
},{"../laroux.ajax.js":2,"./laroux.dom.js":15}],17:[function(require,module,exports){
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

        // {target, key, shift, ctrl, alt, disableInputs, fnc}
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

                options.fnc(ev);

                return false;
            };

            _larouxDomJs2['default'].setEvent(options.target || document, 'keydown', wrapper);
        }
    };

    return keys;
})();

module.exports = exports['default'];
},{"./laroux.dom.js":15,"./laroux.forms.js":16}],18:[function(require,module,exports){
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

            // if (model.constructor !== Stack) {
            //     model = new Stack(model);
            // }

            var appKey = element.getAttribute('id');

            model.onupdate = function (event) {
                if (!mvc.pauseUpdate) {
                    mvc.update(appKey); // , [event.key]
                }
            };

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
            app.modelKeys = _larouxHelpersJs2['default'].getKeysRecursive(app.model._data); // FIXME: works only for $l.stack
            app.boundElements = {};
            app.eventElements = [];

            mvc.scanElements(app, app.element);
            mvc.update(appKey);

            var fnc = function fnc(ev, elem) {
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

            for (var i = 0, length = app.eventElements.length; i < length; i++) {
                _larouxDomJs2['default'].setEvent(app.eventElements[i].element, app.eventElements[i].binding[null], fnc);
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

                var boundElement = app.boundElements[keys[i]];

                for (var j = 0, length2 = boundElement.length; j < length2; j++) {
                    if (boundElement[j].target.substring(0, 6) === 'style.') {
                        boundElement[j].element.style[boundElement[j].target.substring(6)] = _larouxHelpersJs2['default'].getElement(app.model, keys[i]);
                    } else if (boundElement[j].target.substring(0, 5) === 'attr.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element.setAttribute(boundElement[j].target.substring(5), _larouxHelpersJs2['default'].getElement(app.model, keys[i]));
                    } else if (boundElement[j].target.substring(0, 5) === 'prop.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element[boundElement[j].target.substring(5)] = _larouxHelpersJs2['default'].getElement(app.model, keys[i]);
                    }
                }
            }
        },

        bindStringParser: function bindStringParser(text) {
            var lastBuffer = null,
                buffer = '',
                state = 0,
                result = {};

            for (var i = 0, length = text.length; i < length; i++) {
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
},{"../laroux.helpers.js":7,"./laroux.dom.js":15}],19:[function(require,module,exports){
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

            for (var i = 0, length = events.length; i < length; i++) {
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

            var fnc = function fnc() {
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

                    touch.tapTimer = setTimeout(fnc, touch.tapTreshold);
                    return;
                }

                touch.tapCount = 0;
            };

            clearTimeout(touch.tapTimer);
            touch.tapTimer = setTimeout(fnc, touch.tapTreshold);
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
},{"../laroux.js":8,"./laroux.dom.js":15}]},{},[1]);
