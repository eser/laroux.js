/**
 * laroux.js base - A jquery substitute for modern browsers
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
module.exports = (function (scope) {
    'use strict';

    // core
    var laroux = function () {
    };
    if (!('$l' in scope)) {
        scope.$l = laroux;
    }

    // core modules
    laroux.events = require('./laroux.events.js');
    laroux.helpers = require('./laroux.helpers.js');
    laroux.extend = function () {
        Array.prototype.unshift.call(arguments, laroux);
        laroux.helpers.extendObject.apply(this, arguments);
    };

    laroux.extendObject = laroux.helpers.extendObject;
    laroux.each = laroux.helpers.each;
    laroux.map = laroux.helpers.map;
    laroux.index = laroux.helpers.index;
    laroux.aeach = laroux.helpers.aeach;
    laroux.amap = laroux.helpers.amap;
    laroux.aindex = laroux.helpers.aindex;

    // optional modules
    // laroux.wrapper = require('./laroux.wrapper.js');
    laroux.ajax = require('./laroux.ajax.js');
    // laroux.css = require('./laroux.css.js');
    // laroux.dom = require('./laroux.dom.js');
    // laroux.events = require('./laroux.events.js');
    // laroux.forms = require('./laroux.forms.js');
    // laroux.helpers = require('./laroux.helpers.js');
    laroux.timers = require('./laroux.timers.js');
    laroux.triggers = require('./laroux.triggers.js');
    laroux.vars = require('./laroux.vars.js');

    // laroux.anim = require('./laroux.anim.js');
    laroux.date = require('./laroux.date.js');
    // laroux.keys = require('./laroux.keys.js');
    // laroux.mvc = require('./laroux.mvc.js');
    laroux.stack = require('./laroux.stack.js');
    // laroux.templates = require('./laroux.templates.js');
    // laroux.touch = require('./laroux.touch.js');
    // laroux.ui = require('./laroux.ui.js');
    return laroux;

}(typeof window !== 'undefined' ? window : global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./laroux.ajax.js":2,"./laroux.date.js":3,"./laroux.events.js":4,"./laroux.helpers.js":5,"./laroux.stack.js":6,"./laroux.timers.js":7,"./laroux.triggers.js":8,"./laroux.vars.js":9}],2:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_events = require('./laroux.events.js'),
        laroux_helpers = require('./laroux.helpers.js');

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    var laroux_ajax = {
        corsDefault: false,

        wrappers: {
            registry: {
                'laroux.js': function (data) {
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
                    } else { // if (data.format == 'xml') {
                        obj = data.object;
                    }

                    return obj;
                }
            },

            set: function (name, fnc) {
                laroux_ajax.wrappers.registry[name] = fnc;
            }
        },

        xDomainObject: false,
        xmlHttpRequestObject: null,
        xDomainRequestObject: null,
        xhr: function (crossDomain) {
            if (laroux_ajax.xmlHttpRequestObject === null) {
                laroux_ajax.xmlHttpRequestObject = new XMLHttpRequest();
            }

            if (crossDomain) {
                if (!('withCredentials' in laroux_ajax.xmlHttpRequestObject) && typeof XDomainRequest !== 'undefined') {
                    laroux_ajax.xDomainObject = true;

                    if (laroux_ajax.xDomainRequestObject === null) {
                        laroux_ajax.xDomainRequestObject = new XDomainRequest();
                    }

                    return laroux_ajax.xDomainRequestObject;
                }
            } else {
                laroux_ajax.xDomainObject = false;
            }

            return laroux_ajax.xmlHttpRequestObject;
        },

        xhrResp: function (xhr, options) {
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

            if (wrapperFunction && (wrapperFunction in laroux_ajax.wrappers.registry)) {
                response = laroux_ajax.wrappers.registry[wrapperFunction](response);
            }

            return {
                response: response,
                wrapperFunc: wrapperFunction
            };
        },

        makeRequest: function (options) {
            var cors = options.cors || laroux_ajax.corsDefault,
                xhr = laroux_ajax.xhr(cors),
                url = options.url,
                timer = null,
                n = 0;

            if (options.timeout !== undefined) {
                timer = setTimeout(
                    function () {
                        xhr.abort();
                        if (options.timeoutFn !== undefined) {
                            options.timeoutFn(options.url);
                        }
                    },
                    options.timeout
                );
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
                            res = laroux_ajax.xhrResp(xhr, options);
                        } catch (e) {
                            if (options.error !== undefined) {
                                options.error(xhr, xhr.status, xhr.statusText);
                            }

                            laroux_events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                            isSuccess = false;
                        }

                        if (isSuccess) {
                            if (options.success !== undefined && res !== null) {
                                options.success(res.response, res.wrapperFunc);
                            }

                            laroux_events.invoke('ajaxSuccess', [xhr, res.response, res.wrapperFunc, options]);
                        }
                    } else {
                        if (options.error !== undefined) {
                            options.error(xhr, xhr.status, xhr.statusText);
                        }

                        laroux_events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                    }

                    if (options.complete !== undefined) {
                        options.complete(xhr, xhr.statusText);
                    }

                    laroux_events.invoke('ajaxComplete', [xhr, xhr.statusText, options]);
                } else if (options.progress !== undefined) {
                    /*jslint plusplus: true */
                    options.progress(++n);
                }
            };

            if (options.getdata !== undefined && options.getdata !== null) {
                if (options.getdata.constructor === Object) {
                    var queryString = laroux_helpers.buildQueryString(options.getdata);
                    if (queryString.length > 0) {
                        url += ((url.indexOf('?') < 0) ? '?' : '&') + queryString;
                    }
                } else {
                    url += ((url.indexOf('?') < 0) ? '?' : '&') + options.getdata;
                }
            }

            if (options.jsonp !== undefined) {
                url += ((url.indexOf('?') < 0) ? '?' : '&') + 'jsonp=' + options.jsonp;
            }

            if (!laroux_ajax.xDomainObject) {
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
                    xhr.send(laroux_helpers.buildFormData(options.postdata));
                    break;
                default:
                    xhr.send(options.postdata);
                    break;
            }
        },

        get: function (path, values, successfnc, errorfnc, cors) {
            laroux_ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                wrapper: true,
                cors: cors || laroux_ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        getJson: function (path, values, successfnc, errorfnc, cors) {
            laroux_ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                wrapper: true,
                cors: cors || laroux_ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        getJsonP: function (path, values, method, successfnc, errorfnc, cors) {
            laroux_ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                wrapper: false,
                cors: cors || laroux_ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        getScript: function (path, values, successfnc, errorfnc, cors) {
            laroux_ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                wrapper: false,
                cors: cors || laroux_ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        post: function (path, values, successfnc, errorfnc, cors) {
            laroux_ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                wrapper: true,
                cors: cors || laroux_ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        postJson: function (path, values, successfnc, errorfnc, cors) {
            laroux_ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                wrapper: true,
                cors: cors || laroux_ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        }
    };

    return laroux_ajax;

}());

},{"./laroux.events.js":4,"./laroux.helpers.js":5}],3:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    // date
    var laroux_date = {
        shortDateFormat: 'dd.MM.yyyy',
        longDateFormat: 'dd MMMM yyyy',
        timeFormat: 'HH:mm',

        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        strings: {
            now:     'now',
            later:   'later',
            ago:     'ago',
            seconds: 'seconds',
            aminute: 'a minute',
            minutes: 'minutes',
            ahour:   'a hour',
            hours:   'hours',
            aday:    'a day',
            days:    'days',
            aweek:   'a week',
            weeks:   'weeks',
            amonth:  'a month',
            months:  'months',
            ayear:   'a year',
            years:   'years'
        },

        parseEpoch: function (timespan, limitWithWeeks) {
            if (timespan < 60 * 1000) {
                timespan = Math.ceil(timespan / 1000);

                return timespan + ' ' + laroux_date.strings.seconds;
            }

            if (timespan < 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 1000));

                if (timespan === 1) {
                    return laroux_date.strings.aminute;
                }

                return timespan + ' ' + laroux_date.strings.minutes;
            }

            if (timespan < 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux_date.strings.ahour;
                }

                return timespan + ' ' + laroux_date.strings.hours;
            }

            if (timespan < 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux_date.strings.aday;
                }

                return timespan + ' ' + laroux_date.strings.days;
            }

            if (timespan < 4 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (7 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux_date.strings.aweek;
                }

                return timespan + ' ' + laroux_date.strings.weeks;
            }

            if (limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (30 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return laroux_date.strings.amonth;
                }

                return timespan + ' ' + laroux_date.strings.months;
            }

            timespan = Math.ceil(timespan / (365 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return laroux_date.strings.ayear;
            }

            return timespan + ' ' + laroux_date.strings.years;
        },

        getCustomDateString: function (format, date) {
            var now = date || new Date();

            return format.replace(
                /yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|tt|t/g,
                function (match) {
                    switch (match) {
                    case 'yyyy':
                        return now.getFullYear();

                    case 'yy':
                        return now.getYear();

                    case 'MMMM':
                        return laroux_date.monthsLong[now.getMonth()];

                    case 'MMM':
                        return laroux_date.monthsShort[now.getMonth()];

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
                        return ('0' + (((hour1 % 12) > 0) ? hour1 % 12 : 12)).substr(-2, 2);

                    case 'h':
                        var hour2 = now.getHours();
                        return ((hour2 % 12) > 0) ? hour2 % 12 : 12;

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
                }
            );
        },

        getDateDiffString: function (date) {
            var now = Date.now(),
                timespan = now - date.getTime(),
                absTimespan = Math.abs(timespan),
                past = (timespan > 0);

            if (absTimespan <= 3000) {
                return laroux_date.strings.now;
            }

            var timespanstring = laroux_date.parseEpoch(absTimespan, true);
            if (timespanstring !== null) {
                return timespanstring +
                    ' ' +
                    (past ? laroux_date.strings.ago : laroux_date.strings.later);
            }

            return laroux_date.getShortDateString(date, true);
        },

        getShortDateString: function (date, includeTime) {
            return laroux_date.getCustomDateString(
                includeTime ? laroux_date.shortDateFormat + ' ' + laroux_date.timeFormat : laroux_date.shortDateFormat,
                date
            );
        },

        getLongDateString: function (date, includeTime) {
            return laroux_date.getCustomDateString(
                includeTime ? laroux_date.longDateFormat + ' ' + laroux_date.timeFormat : laroux_date.longDateFormat,
                date
            );
        }
    };

    return laroux_date;

}());

},{}],4:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    // events
    var laroux_events = {
        delegates: [],

        add: function (event, fnc) {
            laroux_events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function (event, args) {
            for (var item in laroux_events.delegates) {
                if (!laroux_events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (laroux_events.delegates[item].event != event) {
                    continue;
                }

                laroux_events.delegates[item].fnc(args);
            }
        }
    };

    return laroux_events;

}());

},{}],5:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    // helpers
    var laroux_helpers = {
        uniqueId: 0,

        getUniqueId: function () {
            /*jslint plusplus: true */
            return 'uid-' + (++laroux_helpers.uniqueId);
        },

        buildQueryString: function (values, rfc3986) {
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

        buildFormData: function (values) {
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

        format: function () {
            var args = arguments;
            return Array.prototype.shift.call(args).replace(/%s/g, function () { return Array.prototype.shift.call(args); });
        },

        replaceAll: function (text, dictionary) {
            var re = new RegExp(Object.keys(dictionary).join('|'), 'g');

            return text.replace(
                re,
                function (match) {
                    return dictionary[match];
                }
            );
        },

        camelCase: function (value) {
            var flag = false;
            var output = '';

            for (var j = 0; j < value.length; j++) {
                var currChar = value.charAt(j);
                if (currChar == '-') {
                    flag = true;
                    continue;
                }

                output += (!flag) ? currChar : currChar.toUpperCase();
                flag = false;
            }

            return output;
        },

        antiCamelCase: function (value) {
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

        random: function (min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        find: function (obj, iterator, context) {
            var result;

            obj.some(function (value, index, list) {
                if (iterator.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });

            return result;
        },

        extendObject: function () {
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
                        laroux_helpers.extendObject(target[name], arguments[item][name]);
                        continue;
                    }

                    target[name] = arguments[item][name];
                }
            }
        },

        each: function (arr, fnc, testOwnProperties) {
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

        map: function (arr, fnc, dontSkipReturns, testOwnProperties) {
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

        index: function (arr, value, testOwnProperties) {
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

        aeach: function (arr, fnc) {
            for (var i = 0, length = arr.length; i < length; i++) {
                if (fnc(i, arr[i]) === false) {
                    break;
                }
            }

            return arr;
        },

        amap: function (arr, fnc, dontSkipReturns) {
            var results = [];

            for (var i = 0, length = arr.length; i < length; i++) {
                var result = fnc(arr[i], i);
                if (result === false) {
                    break;
                }

                if (dontSkipReturns || result !== undefined) {
                    results.unshift(result);
                }
            }

            return results;
        },

        aindex: function (arr, value, start) {
            for (var i = (start || 0), length = arr.length; i < length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }

            return -1;
        },

        column: function (obj, key) {
            return laroux_helpers.map(obj, function (value) { return value[key]; }, true);
        },

        shuffle: function (obj) {
            var index = 0,
                shuffled = [];

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                var rand = laroux_helpers.random(0, index);
                shuffled[index++] = shuffled[rand];
                shuffled[rand] = obj[item];
            }

            return shuffled;
        },

        merge: function () {
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

        duplicate: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        toArray: function (obj) {
            var length = obj.length,
                items = new Array(length);

            for (var i = 0; i < length; i++) {
                items[i] = obj[i];
            }

            return items;
        },

        getAsArray: function (obj) {
            var items;

            if (obj instanceof Array) {
                items = obj;
            } else if (obj instanceof NodeList) {
                var length = obj.length;

                items = new Array(length);
                for (var i = 0; i < length; i++) {
                    items[i] = obj[i];
                }
            } else {
                items = [obj];
            }

            return items;
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

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                keys.push(prefix + item);

                if (obj[item] !== undefined && obj[item] !== null && obj[item].constructor === Object) {
                    laroux_helpers.getKeysRecursive(obj[item], delimiter, prefix + item + delimiter, keys);
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

            return laroux_helpers.getElement(obj[key], rest, defaultValue, delimiter);
        }
    };

    return laroux_helpers;

}());

},{}],6:[function(require,module,exports){
/*jslint nomen: true */
module.exports = (function () {
    'use strict';

    // stack
    var laroux_stack = function (data, depth, top) {
        this._data = {};
        this._depth = depth;
        this._top = top || this;

        this.set = function (key, value) {
            // delete this._data[key];

            var type = typeof value;
            switch (type) {
            case 'function':
                this._data[key] = value;

                Object.defineProperty(
                    this,
                    key,
                    {
                        configurable: true,
                        get: function () {
                            return this._data[key]();
                        }
                    }
                );
                break;

            default:
                /*
                if (type == 'object') {
                    this._data[key] = new laroux_stack(
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

                Object.defineProperty(
                    this,
                    key,
                    {
                        configurable: true,
                        get: function () {
                            return this._data[key];
                        },
                        set: function (newValue) {
                            var oldValue = this._data[key];
                            if (this._data[key] === newValue) {
                                return;
                            }

                            // this.set(this, key, newValue);
                            this._data[key] = newValue;
                            this._top.onupdate({ scope: this, key: key, oldValue: oldValue, newValue: newValue });
                        }
                    }
                );
                break;
            }
        };

        this.setRange = function (values) {
            for (var valueKey in values) {
                if (!values.hasOwnProperty(valueKey)) {
                    continue;
                }

                this.set(valueKey, values[valueKey]);
            }
        };

        this.get = function (key, defaultValue) {
            return this[key] || defaultValue || null;
        };

        this.getRange = function (keys) {
            var values = {};

            for (var item in keys) {
                if (!keys.hasOwnProperty(item)) {
                    continue;
                }

                values[keys[item]] = this[keys[item]];
            }

            return values;
        };

        this.keys = function () {
            return Object.keys(this._data);
        };

        this.length = function () {
            return Object.keys(this._data).length;
        };

        this.exists = function (key) {
            return (key in this._data);
        };

        this.remove = function (key) {
            if (key in this._data) {
                delete this[key];
                delete this._data[key];
            }
        };

        this.clear = function () {
            for (var item in this._data) {
                if (!this._data.hasOwnProperty(item)) {
                    continue;
                }

                delete this[item];
                delete this._data[item];
            }

            this._data = {};
        };

        this.onupdate = function (event) {
        };

        if (data) {
            this.setRange(data);
        }
    };

    return laroux_stack;

}());

},{}],7:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    // timers
    var laroux_timers = {
        data: [],

        set: function (timer) {
            timer.next = Date.now() + timer.timeout;
            laroux_timers.data.push(timer);
        },

        remove: function (id) {
            var targetKey = null;

            for (var item in laroux_timers.data) {
                if (!laroux_timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux_timers.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux_timers.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        ontick: function () {
            var now = Date.now();

            var removeKeys = [];
            for (var item in laroux_timers.data) {
                if (!laroux_timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux_timers.data[item];

                if (currentItem.next <= now) {
                    var result = currentItem.ontick(currentItem.state);

                    if (result !== false && currentItem.reset) {
                        currentItem.next = now + currentItem.timeout;
                    } else {
                        removeKeys.unshift(item);
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux_timers.data.splice(removeKeys[item2], 1);
            }
        }
    };

    return laroux_timers;

}());

},{}],8:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_helpers = require('./laroux.helpers.js');

    // triggers
    var laroux_triggers = {
        delegates: [],
        list: [],

        set: function (condition, fnc, state) {
            var conditions = laroux_helpers.getAsArray(condition);

            for (var item in conditions) {
                if (!conditions.hasOwnProperty(item)) {
                    continue;
                }

                if (laroux_helpers.aindex(laroux_triggers.list, conditions[item]) === -1) {
                    laroux_triggers.list.push(conditions[item]);
                }
            }

            laroux_triggers.delegates.push({
                conditions: conditions,
                fnc: fnc,
                state: state
            });
        },

        ontrigger: function (triggerName, args) {
            var eventIdx = laroux_helpers.aindex(laroux_triggers.list, triggerName);
            if (eventIdx !== -1) {
                laroux_triggers.list.splice(eventIdx, 1);
            }

            var removeKeys = [];
            for (var item in laroux_triggers.delegates) {
                if (!laroux_triggers.delegates.hasOwnProperty(item)) {
                    continue;
                }

                var count = 0;
                var currentItem = laroux_triggers.delegates[item];

                for (var conditionKey in currentItem.conditions) {
                    if (!currentItem.conditions.hasOwnProperty(conditionKey)) {
                        continue;
                    }

                    var conditionObj = currentItem.conditions[conditionKey];

                    if (laroux_helpers.aindex(laroux_triggers.list, conditionObj) !== -1) {
                        count++;
                        // break;
                    }
                }

                if (count === 0) {
                    currentItem.fnc(
                        {
                            state: currentItem.state,
                            args: laroux_helpers.getAsArray(args)
                        }
                    );
                    removeKeys.unshift(item);
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux_triggers.delegates.splice(removeKeys[item2], 1);
            }

            // console.log('trigger name: ' + triggerName);
        }
    };

    return laroux_triggers;

}());

},{"./laroux.helpers.js":5}],9:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    // vars
    var laroux_vars = {
        cookiePath: '/',

        getCookie: function (name, defaultValue) {
            var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i'),
                match = document.cookie.match(re);

            if (!match) {
                return defaultValue || null;
            }

            return decodeURIComponent(match[0].split('=')[1]);
        },

        setCookie: function (name, value, expires, path) {
            var expireValue = '';
            if (expires) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || laroux_vars.cookiePath);
        },

        removeCookie: function (name, path) {
            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || laroux_vars.cookiePath);
        },

        getLocal: function (name, defaultValue) {
            if (!(name in localStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(localStorage[name]);
        },

        setLocal: function (name, value) {
            localStorage[name] = JSON.stringify(value);
        },

        removeLocal: function (name) {
            delete localStorage[name];
        },

        getSession: function (name, defaultValue) {
            if (!(name in sessionStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(sessionStorage[name]);
        },

        setSession: function (name, value) {
            sessionStorage[name] = JSON.stringify(value);
        },

        removeSession: function (name) {
            delete sessionStorage[name];
        }
    };

    return laroux_vars;

}());

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwidGVtcFxcYmFzZVxcbGFyb3V4LmpzIiwidGVtcC9iYXNlL2xhcm91eC5hamF4LmpzIiwidGVtcC9iYXNlL2xhcm91eC5kYXRlLmpzIiwidGVtcC9iYXNlL2xhcm91eC5ldmVudHMuanMiLCJ0ZW1wL2Jhc2UvbGFyb3V4LmhlbHBlcnMuanMiLCJ0ZW1wL2Jhc2UvbGFyb3V4LnN0YWNrLmpzIiwidGVtcC9iYXNlL2xhcm91eC50aW1lcnMuanMiLCJ0ZW1wL2Jhc2UvbGFyb3V4LnRyaWdnZXJzLmpzIiwidGVtcC9iYXNlL2xhcm91eC52YXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBjb3JlXG4gICAgdmFyIGxhcm91eCA9IGZ1bmN0aW9uICgpIHtcbiAgICB9O1xuICAgIGlmICghKCckbCcgaW4gc2NvcGUpKSB7XG4gICAgICAgIHNjb3BlLiRsID0gbGFyb3V4O1xuICAgIH1cblxuICAgIC8vIGNvcmUgbW9kdWxlc1xuICAgIGxhcm91eC5ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKTtcbiAgICBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICBsYXJvdXguZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbGFyb3V4KTtcbiAgICAgICAgbGFyb3V4LmhlbHBlcnMuZXh0ZW5kT2JqZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxhcm91eC5leHRlbmRPYmplY3QgPSBsYXJvdXguaGVscGVycy5leHRlbmRPYmplY3Q7XG4gICAgbGFyb3V4LmVhY2ggPSBsYXJvdXguaGVscGVycy5lYWNoO1xuICAgIGxhcm91eC5tYXAgPSBsYXJvdXguaGVscGVycy5tYXA7XG4gICAgbGFyb3V4LmluZGV4ID0gbGFyb3V4LmhlbHBlcnMuaW5kZXg7XG4gICAgbGFyb3V4LmFlYWNoID0gbGFyb3V4LmhlbHBlcnMuYWVhY2g7XG4gICAgbGFyb3V4LmFtYXAgPSBsYXJvdXguaGVscGVycy5hbWFwO1xuICAgIGxhcm91eC5haW5kZXggPSBsYXJvdXguaGVscGVycy5haW5kZXg7XG5cbiAgICAvLyBvcHRpb25hbCBtb2R1bGVzXG4gICAgLy8gbGFyb3V4LndyYXBwZXIgPSByZXF1aXJlKCcuL2xhcm91eC53cmFwcGVyLmpzJyk7XG4gICAgbGFyb3V4LmFqYXggPSByZXF1aXJlKCcuL2xhcm91eC5hamF4LmpzJyk7XG4gICAgLy8gbGFyb3V4LmNzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpO1xuICAgIC8vIGxhcm91eC5kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKTtcbiAgICAvLyBsYXJvdXguZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyk7XG4gICAgLy8gbGFyb3V4LmZvcm1zID0gcmVxdWlyZSgnLi9sYXJvdXguZm9ybXMuanMnKTtcbiAgICAvLyBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICBsYXJvdXgudGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRyaWdnZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudHJpZ2dlcnMuanMnKTtcbiAgICBsYXJvdXgudmFycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnZhcnMuanMnKTtcblxuICAgIC8vIGxhcm91eC5hbmltID0gcmVxdWlyZSgnLi9sYXJvdXguYW5pbS5qcycpO1xuICAgIGxhcm91eC5kYXRlID0gcmVxdWlyZSgnLi9sYXJvdXguZGF0ZS5qcycpO1xuICAgIC8vIGxhcm91eC5rZXlzID0gcmVxdWlyZSgnLi9sYXJvdXgua2V5cy5qcycpO1xuICAgIC8vIGxhcm91eC5tdmMgPSByZXF1aXJlKCcuL2xhcm91eC5tdmMuanMnKTtcbiAgICBsYXJvdXguc3RhY2sgPSByZXF1aXJlKCcuL2xhcm91eC5zdGFjay5qcycpO1xuICAgIC8vIGxhcm91eC50ZW1wbGF0ZXMgPSByZXF1aXJlKCcuL2xhcm91eC50ZW1wbGF0ZXMuanMnKTtcbiAgICAvLyBsYXJvdXgudG91Y2ggPSByZXF1aXJlKCcuL2xhcm91eC50b3VjaC5qcycpO1xuICAgIC8vIGxhcm91eC51aSA9IHJlcXVpcmUoJy4vbGFyb3V4LnVpLmpzJyk7XG4gICAgcmV0dXJuIGxhcm91eDtcblxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gYWpheCAtIHBhcnRpYWxseSB0YWtlbiBmcm9tICdqcXVlcnkgaW4gcGFydHMnIHByb2plY3RcbiAgICAvLyAgICAgICAgY2FuIGJlIGZvdW5kIGF0OiBodHRwczovL2dpdGh1Yi5jb20vbXl0aHovanF1aXAvXG4gICAgdmFyIGxhcm91eF9hamF4ID0ge1xuICAgICAgICBjb3JzRGVmYXVsdDogZmFsc2UsXG5cbiAgICAgICAgd3JhcHBlcnM6IHtcbiAgICAgICAgICAgIHJlZ2lzdHJ5OiB7XG4gICAgICAgICAgICAgICAgJ2xhcm91eC5qcyc6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjogJyArIGRhdGEuZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmo7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuZm9ybWF0ID09PSAnanNvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoZGF0YS5vYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuZm9ybWF0ID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IGV2YWwoZGF0YS5vYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBpZiAoZGF0YS5mb3JtYXQgPT0gJ3htbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IGRhdGEub2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeVtuYW1lXSA9IGZuYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4RG9tYWluT2JqZWN0OiBmYWxzZSxcbiAgICAgICAgeG1sSHR0cFJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhEb21haW5SZXF1ZXN0T2JqZWN0OiBudWxsLFxuICAgICAgICB4aHI6IGZ1bmN0aW9uIChjcm9zc0RvbWFpbikge1xuICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoJ3dpdGhDcmVkZW50aWFscycgaW4gbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QpICYmIHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdCA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgeGhyUmVzcDogZnVuY3Rpb24gKHhociwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHdyYXBwZXJGdW5jdGlvbiA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXNwb25zZS1XcmFwcGVyLUZ1bmN0aW9uJyksXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ3NjcmlwdCcpIHtcbiAgICAgICAgICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAvKmpzbGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGV2YWwoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICd4bWwnKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VYTUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdyYXBwZXJGdW5jdGlvbiAmJiAod3JhcHBlckZ1bmN0aW9uIGluIGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5KSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gbGFyb3V4X2FqYXgud3JhcHBlcnMucmVnaXN0cnlbd3JhcHBlckZ1bmN0aW9uXShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHdyYXBwZXJGdW5jOiB3cmFwcGVyRnVuY3Rpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFrZVJlcXVlc3Q6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29ycyA9IG9wdGlvbnMuY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICB4aHIgPSBsYXJvdXhfYWpheC54aHIoY29ycyksXG4gICAgICAgICAgICAgICAgdXJsID0gb3B0aW9ucy51cmwsXG4gICAgICAgICAgICAgICAgdGltZXIgPSBudWxsLFxuICAgICAgICAgICAgICAgIG4gPSAwO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50aW1lb3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZW91dEZuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRpbWVvdXRGbihvcHRpb25zLnVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGltZW91dFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IGxhcm91eF9hamF4LnhoclJlc3AoeGhyLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3IoeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhFcnJvcicsIFt4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zdWNjZXNzICE9PSB1bmRlZmluZWQgJiYgcmVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyhyZXMucmVzcG9uc2UsIHJlcy53cmFwcGVyRnVuYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhTdWNjZXNzJywgW3hociwgcmVzLnJlc3BvbnNlLCByZXMud3JhcHBlckZ1bmMsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHhociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheEVycm9yJywgW3hociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbXBsZXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29tcGxldGUoeGhyLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheENvbXBsZXRlJywgW3hociwgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucHJvZ3Jlc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBwbHVzcGx1czogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnByb2dyZXNzKCsrbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZ2V0ZGF0YSAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuZ2V0ZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmdldGRhdGEuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnlTdHJpbmcgPSBsYXJvdXhfaGVscGVycy5idWlsZFF1ZXJ5U3RyaW5nKG9wdGlvbnMuZ2V0ZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeVN0cmluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgcXVlcnlTdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgb3B0aW9ucy5nZXRkYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuanNvbnAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyAnanNvbnA9JyArIG9wdGlvbnMuanNvbnA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCkge1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKG9wdGlvbnMudHlwZSwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeGhyLm9wZW4ob3B0aW9ucy50eXBlLCB1cmwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnhockZpZWxkcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucy54aHJGaWVsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy54aHJGaWVsZHMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyW2ldID0gb3B0aW9ucy54aHJGaWVsZHNbaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fTtcblxuICAgICAgICAgICAgICAgIGlmICghY29ycykge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLndyYXBwZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ1gtV3JhcHBlci1GdW5jdGlvbiddID0gJ2xhcm91eC5qcyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqIGluIGhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoZWFkZXJzLmhhc093blByb3BlcnR5KGopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGosIGhlYWRlcnNbal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucG9zdGRhdGEgPT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnBvc3RkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKG9wdGlvbnMucG9zdGRhdGF0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMucG9zdGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZm9ybSc6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKGxhcm91eF9oZWxwZXJzLmJ1aWxkRm9ybURhdGEob3B0aW9ucy5wb3N0ZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChvcHRpb25zLnBvc3RkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEpzb246IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SnNvblA6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIG1ldGhvZCwgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBqc29ucDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNjcmlwdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhdHlwZTogJ2Zvcm0nLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdEpzb246IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLTgnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfYWpheDtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBkYXRlXG4gICAgdmFyIGxhcm91eF9kYXRlID0ge1xuICAgICAgICBzaG9ydERhdGVGb3JtYXQ6ICdkZC5NTS55eXl5JyxcbiAgICAgICAgbG9uZ0RhdGVGb3JtYXQ6ICdkZCBNTU1NIHl5eXknLFxuICAgICAgICB0aW1lRm9ybWF0OiAnSEg6bW0nLFxuXG4gICAgICAgIG1vbnRoc1Nob3J0OiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgICAgIG1vbnRoc0xvbmc6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLFxuXG4gICAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgICAgIG5vdzogICAgICdub3cnLFxuICAgICAgICAgICAgbGF0ZXI6ICAgJ2xhdGVyJyxcbiAgICAgICAgICAgIGFnbzogICAgICdhZ28nLFxuICAgICAgICAgICAgc2Vjb25kczogJ3NlY29uZHMnLFxuICAgICAgICAgICAgYW1pbnV0ZTogJ2EgbWludXRlJyxcbiAgICAgICAgICAgIG1pbnV0ZXM6ICdtaW51dGVzJyxcbiAgICAgICAgICAgIGFob3VyOiAgICdhIGhvdXInLFxuICAgICAgICAgICAgaG91cnM6ICAgJ2hvdXJzJyxcbiAgICAgICAgICAgIGFkYXk6ICAgICdhIGRheScsXG4gICAgICAgICAgICBkYXlzOiAgICAnZGF5cycsXG4gICAgICAgICAgICBhd2VlazogICAnYSB3ZWVrJyxcbiAgICAgICAgICAgIHdlZWtzOiAgICd3ZWVrcycsXG4gICAgICAgICAgICBhbW9udGg6ICAnYSBtb250aCcsXG4gICAgICAgICAgICBtb250aHM6ICAnbW9udGhzJyxcbiAgICAgICAgICAgIGF5ZWFyOiAgICdhIHllYXInLFxuICAgICAgICAgICAgeWVhcnM6ICAgJ3llYXJzJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlRXBvY2g6IGZ1bmN0aW9uICh0aW1lc3BhbiwgbGltaXRXaXRoV2Vla3MpIHtcbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gMTAwMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLnNlY29uZHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYW1pbnV0ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLm1pbnV0ZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFob3VyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MuaG91cnM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFkYXk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5kYXlzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCA0ICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg3ICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmF3ZWVrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Mud2Vla3M7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsaW1pdFdpdGhXZWVrcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCAzMCAqIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYW1vbnRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubW9udGhzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzNjUgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmF5ZWFyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLnllYXJzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEN1c3RvbURhdGVTdHJpbmc6IGZ1bmN0aW9uIChmb3JtYXQsIGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAveXl5eXx5eXxNTU1NfE1NTXxNTXxNfGRkfGR8aGh8aHxISHxIfG1tfG18c3N8c3x0dHx0L2csXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneXl5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldEZ1bGxZZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneXknOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRZZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU1NTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUubW9udGhzTG9uZ1tub3cuZ2V0TW9udGgoKV07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNTaG9ydFtub3cuZ2V0TW9udGgoKV07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyAobm93LmdldE1vbnRoKCkgKyAxKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0TW9udGgoKSArIDE7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0RGF0ZSgpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXREYXRlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaGgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIxID0gbm93LmdldEhvdXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArICgoKGhvdXIxICUgMTIpID4gMCkgPyBob3VyMSAlIDEyIDogMTIpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIyID0gbm93LmdldEhvdXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKChob3VyMiAlIDEyKSA+IDApID8gaG91cjIgJSAxMiA6IDEyO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0hIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgbm93LmdldEhvdXJzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldEhvdXJzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0TWludXRlcygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0U2Vjb25kcygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRTZWNvbmRzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdy5nZXRIb3VycygpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwbSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnYW0nO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdy5nZXRIb3VycygpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGVEaWZmU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBub3cgLSBkYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBhYnNUaW1lc3BhbiA9IE1hdGguYWJzKHRpbWVzcGFuKSxcbiAgICAgICAgICAgICAgICBwYXN0ID0gKHRpbWVzcGFuID4gMCk7XG5cbiAgICAgICAgICAgIGlmIChhYnNUaW1lc3BhbiA8PSAzMDAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3Mubm93O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGltZXNwYW5zdHJpbmcgPSBsYXJvdXhfZGF0ZS5wYXJzZUVwb2NoKGFic1RpbWVzcGFuLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICh0aW1lc3BhbnN0cmluZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbnN0cmluZyArXG4gICAgICAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICAgICAgIChwYXN0ID8gbGFyb3V4X2RhdGUuc3RyaW5ncy5hZ28gOiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmxhdGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldFNob3J0RGF0ZVN0cmluZyhkYXRlLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTaG9ydERhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlLCBpbmNsdWRlVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldEN1c3RvbURhdGVTdHJpbmcoXG4gICAgICAgICAgICAgICAgaW5jbHVkZVRpbWUgPyBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQgKyAnICcgKyBsYXJvdXhfZGF0ZS50aW1lRm9ybWF0IDogbGFyb3V4X2RhdGUuc2hvcnREYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9uZ0RhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlLCBpbmNsdWRlVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldEN1c3RvbURhdGVTdHJpbmcoXG4gICAgICAgICAgICAgICAgaW5jbHVkZVRpbWUgPyBsYXJvdXhfZGF0ZS5sb25nRGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5sb25nRGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICBkYXRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZGF0ZTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBldmVudHNcbiAgICB2YXIgbGFyb3V4X2V2ZW50cyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcblxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChldmVudCwgZm5jKSB7XG4gICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcy5wdXNoKHsgZXZlbnQ6IGV2ZW50LCBmbmM6IGZuYyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnZva2U6IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmV2ZW50ICE9IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmZuYyhhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2V2ZW50cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBoZWxwZXJzXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0ge1xuICAgICAgICB1bmlxdWVJZDogMCxcblxuICAgICAgICBnZXRVbmlxdWVJZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgIHJldHVybiAndWlkLScgKyAoKytsYXJvdXhfaGVscGVycy51bmlxdWVJZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRRdWVyeVN0cmluZzogZnVuY3Rpb24gKHZhbHVlcywgcmZjMzk4Nikge1xuICAgICAgICAgICAgdmFyIHVyaSA9ICcnLFxuICAgICAgICAgICAgICAgIHJlZ0V4ID0gLyUyMC9nO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzW25hbWVdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJmYzM5ODYgfHwgZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVyaSArPSAnJicgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkucmVwbGFjZShyZWdFeCwgJysnKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbbmFtZV0udG9TdHJpbmcoKSkucmVwbGFjZShyZWdFeCwgJysnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVyaSArPSAnJicgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVzW25hbWVdLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXJpLnN1YnN0cigxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZEZvcm1EYXRhOiBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzW25hbWVdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5hcHBlbmQobmFtZSwgdmFsdWVzW25hbWVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJncykucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJncyk7IH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VBbGw6IGZ1bmN0aW9uICh0ZXh0LCBkaWN0aW9uYXJ5KSB7XG4gICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKE9iamVjdC5rZXlzKGRpY3Rpb25hcnkpLmpvaW4oJ3wnKSwgJ2cnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZShcbiAgICAgICAgICAgICAgICByZSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpY3Rpb25hcnlbbWF0Y2hdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FtZWxDYXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyckNoYXIgPSB2YWx1ZS5jaGFyQXQoaik7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJDaGFyID09ICctJykge1xuICAgICAgICAgICAgICAgICAgICBmbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9ICghZmxhZykgPyBjdXJyQ2hhciA6IGN1cnJDaGFyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGFudGlDYW1lbENhc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJDaGFyID0gdmFsdWUuY2hhckF0KGopO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyQ2hhciAhPSAnLScgJiYgY3VyckNoYXIgPT0gY3VyckNoYXIudG9VcHBlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJy0nICsgY3VyckNoYXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGN1cnJDaGFyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHF1b3RlQXR0cjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgJyZhcG9zOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxyXFxuL2csICcmIzEzOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW1xcclxcbl0vZywgJyYjMTM7Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3BsaWNlU3RyaW5nOiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjb3VudCwgYWRkKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UoMCwgaW5kZXgpICsgKGFkZCB8fCAnJykgKyB2YWx1ZS5zbGljZShpbmRleCArIGNvdW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICByYW5kb206IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgICAgICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZDogZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgICAgIG9iai5zb21lKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBleHRlbmRPYmplY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIGlzQXJyYXkgPSB0YXJnZXQgaW5zdGFuY2VvZiBBcnJheTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIGFyZ3VtZW50c1tpdGVtXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGFyZ2V0LnB1c2goYXJndW1lbnRzW2l0ZW1dW25hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICAgICAgLyogdGFyZ2V0W25hbWVdLmNvbnN0cnVjdG9yID09PSBPYmplY3QgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldC5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiB0YXJnZXRbbmFtZV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmV4dGVuZE9iamVjdCh0YXJnZXRbbmFtZV0sIGFyZ3VtZW50c1tpdGVtXVtuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSA9IGFyZ3VtZW50c1tpdGVtXVtuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZWFjaDogZnVuY3Rpb24gKGFyciwgZm5jLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZm5jKGl0ZW0sIGFycltpdGVtXSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfSxcblxuICAgICAgICBtYXA6IGZ1bmN0aW9uIChhcnIsIGZuYywgZG9udFNraXBSZXR1cm5zLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jKGFycltpdGVtXSwgaXRlbSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRvbnRTa2lwUmV0dXJucyB8fCByZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluZGV4OiBmdW5jdGlvbiAoYXJyLCB2YWx1ZSwgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGFycltpdGVtXSA9PT0gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWVhY2g6IGZ1bmN0aW9uIChhcnIsIGZuYykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChmbmMoaSwgYXJyW2ldKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFtYXA6IGZ1bmN0aW9uIChhcnIsIGZuYywgZG9udFNraXBSZXR1cm5zKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYyhhcnJbaV0sIGkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb250U2tpcFJldHVybnMgfHwgcmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy51bnNoaWZ0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSxcblxuICAgICAgICBhaW5kZXg6IGZ1bmN0aW9uIChhcnIsIHZhbHVlLCBzdGFydCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IChzdGFydCB8fCAwKSwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29sdW1uOiBmdW5jdGlvbiAob2JqLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5tYXAob2JqLCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0sIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNodWZmbGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgc2h1ZmZsZWQgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmFuZCA9IGxhcm91eF9oZWxwZXJzLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgc2h1ZmZsZWRbaW5kZXgrK10gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgICAgICAgICAgICBzaHVmZmxlZFtyYW5kXSA9IG9ialtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNodWZmbGVkO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1lcmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICB0bXAgPSB0YXJnZXQsXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IHRtcCBpbnN0YW5jZW9mIEFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcC5jb25jYXQoYXJndW1lbnRzW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBhcmd1bWVudHNbaXRlbV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmd1bWVudHNbaXRlbV0uaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdG1wW2F0dHJdID0gYXJndW1lbnRzW2l0ZW1dW2F0dHJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRtcDtcbiAgICAgICAgfSxcblxuICAgICAgICBkdXBsaWNhdGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGl0ZW1zID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpdGVtc1tpXSA9IG9ialtpXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEFzQXJyYXk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpdGVtcztcblxuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBvYmo7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBpdGVtcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBvYmpbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IFtvYmpdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGVuZ3RoOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEtleXNSZWN1cnNpdmU6IGZ1bmN0aW9uIChvYmosIGRlbGltaXRlciwgcHJlZml4LCBrZXlzKSB7XG4gICAgICAgICAgICBpZiAoZGVsaW1pdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwcmVmaXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHByZWZpeCA9ICcnO1xuICAgICAgICAgICAgICAgIGtleXMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBrZXlzLnB1c2gocHJlZml4ICsgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqW2l0ZW1dICE9PSB1bmRlZmluZWQgJiYgb2JqW2l0ZW1dICE9PSBudWxsICYmIG9ialtpdGVtXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmdldEtleXNSZWN1cnNpdmUob2JqW2l0ZW1dLCBkZWxpbWl0ZXIsIHByZWZpeCArIGl0ZW0gKyBkZWxpbWl0ZXIsIGtleXMpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEVsZW1lbnQ6IGZ1bmN0aW9uIChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSwgZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsaW1pdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwb3MgPSBwYXRoLmluZGV4T2YoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHZhciBrZXk7XG4gICAgICAgICAgICB2YXIgcmVzdDtcbiAgICAgICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGF0aDtcbiAgICAgICAgICAgICAgICByZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGF0aC5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICByZXN0ID0gcGF0aC5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghKGtleSBpbiBvYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3QgPT09IG51bGwgfHwgcmVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KG9ialtrZXldLCByZXN0LCBkZWZhdWx0VmFsdWUsIGRlbGltaXRlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzO1xuXG59KCkpO1xuIiwiLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBzdGFja1xuICAgIHZhciBsYXJvdXhfc3RhY2sgPSBmdW5jdGlvbiAoZGF0YSwgZGVwdGgsIHRvcCkge1xuICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIHRoaXMuX2RlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuX3RvcCA9IHRvcCB8fCB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IG5ldyBsYXJvdXhfc3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcHRoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZXB0aCArICcuJyArIGtleSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGF0YVtrZXldID09PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5zZXQodGhpcywga2V5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wLm9udXBkYXRlKHsgc2NvcGU6IHRoaXMsIGtleToga2V5LCBvbGRWYWx1ZTogb2xkVmFsdWUsIG5ld1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRSYW5nZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHZhbHVlS2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KHZhbHVlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldCh2YWx1ZUtleSwgdmFsdWVzW3ZhbHVlS2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW2tleV0gfHwgZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRSYW5nZSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4ga2V5cykge1xuICAgICAgICAgICAgICAgIGlmICgha2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YWx1ZXNba2V5c1tpdGVtXV0gPSB0aGlzW2tleXNbaXRlbV1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKS5sZW5ndGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGlzdHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gKGtleSBpbiB0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkgaW4gdGhpcy5fZGF0YSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2l0ZW1dO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFJhbmdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfc3RhY2s7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdGltZXJzXG4gICAgdmFyIGxhcm91eF90aW1lcnMgPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgICAgICB0aW1lci5uZXh0ID0gRGF0ZS5ub3coKSArIHRpbWVyLnRpbWVvdXQ7XG4gICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEucHVzaCh0aW1lcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UodGFyZ2V0S2V5LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5uZXh0IDw9IG5vdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY3VycmVudEl0ZW0ub250aWNrKGN1cnJlbnRJdGVtLnN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSAmJiBjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ubmV4dCA9IG5vdyArIGN1cnJlbnRJdGVtLnRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGltZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHRyaWdnZXJzXG4gICAgdmFyIGxhcm91eF90cmlnZ2VycyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcbiAgICAgICAgbGlzdDogW10sXG5cbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoY29uZGl0aW9uLCBmbmMsIHN0YXRlKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9ucyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoY29uZGl0aW9uKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBjb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25kaXRpb25zLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIGNvbmRpdGlvbnNbaXRlbV0pID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMubGlzdC5wdXNoKGNvbmRpdGlvbnNbaXRlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb25zOiBjb25kaXRpb25zLFxuICAgICAgICAgICAgICAgIGZuYzogZm5jLFxuICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb250cmlnZ2VyOiBmdW5jdGlvbiAodHJpZ2dlck5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBldmVudElkeCA9IGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgdHJpZ2dlck5hbWUpO1xuICAgICAgICAgICAgaWYgKGV2ZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5saXN0LnNwbGljZShldmVudElkeCwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzW2l0ZW1dO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29uZGl0aW9uS2V5IGluIGN1cnJlbnRJdGVtLmNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50SXRlbS5jb25kaXRpb25zLmhhc093blByb3BlcnR5KGNvbmRpdGlvbktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbmRpdGlvbk9iaiA9IGN1cnJlbnRJdGVtLmNvbmRpdGlvbnNbY29uZGl0aW9uS2V5XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCBjb25kaXRpb25PYmopICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZuYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogY3VycmVudEl0ZW0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShhcmdzKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLnNwbGljZShyZW1vdmVLZXlzW2l0ZW0yXSwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0cmlnZ2VyIG5hbWU6ICcgKyB0cmlnZ2VyTmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90cmlnZ2VycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyB2YXJzXG4gICAgdmFyIGxhcm91eF92YXJzID0ge1xuICAgICAgICBjb29raWVQYXRoOiAnLycsXG5cbiAgICAgICAgZ2V0Q29va2llOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9W147XSsnLCAnaScpLFxuICAgICAgICAgICAgICAgIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKHJlKTtcblxuICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXS5zcGxpdCgnPScpWzFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb29raWU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCkge1xuICAgICAgICAgICAgdmFyIGV4cGlyZVZhbHVlID0gJyc7XG4gICAgICAgICAgICBpZiAoZXhwaXJlcykge1xuICAgICAgICAgICAgICAgIGV4cGlyZVZhbHVlID0gJzsgZXhwaXJlcz0nICsgZXhwaXJlcy50b0dNVFN0cmluZygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpICsgZXhwaXJlVmFsdWUgKyAnOyBwYXRoPScgKyAocGF0aCB8fCBsYXJvdXhfdmFycy5jb29raWVQYXRoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDb29raWU6IGZ1bmN0aW9uIChuYW1lLCBwYXRoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVDsgcGF0aD0nICsgKHBhdGggfHwgbGFyb3V4X3ZhcnMuY29va2llUGF0aCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9jYWw6IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gbG9jYWxTdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW25hbWVdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMb2NhbDogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTG9jYWw6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgbG9jYWxTdG9yYWdlW25hbWVdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNlc3Npb246IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gc2Vzc2lvblN0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZVtuYW1lXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZVtuYW1lXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHNlc3Npb25TdG9yYWdlW25hbWVdO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdmFycztcblxufSgpKTtcbiJdfQ==
