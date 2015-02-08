/**
 * laroux.js - A jquery substitute for modern browsers
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
    laroux.timers = require('./laroux.timers.js');

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
    laroux.wrapper = require('./laroux.wrapper.js');
    laroux.ajax = require('./laroux.ajax.js');
    // laroux.css = require('./laroux.css.js');
    // laroux.dom = require('./laroux.dom.js');
    // laroux.events = require('./laroux.events.js');
    // laroux.forms = require('./laroux.forms.js');
    // laroux.helpers = require('./laroux.helpers.js');
    // laroux.timers = require('./laroux.timers.js');
    laroux.triggers = require('./laroux.triggers.js');
    laroux.vars = require('./laroux.vars.js');

    // laroux.anim = require('./laroux.anim.js');
    laroux.date = require('./laroux.date.js');
    // laroux.keys = require('./laroux.keys.js');
    // laroux.mvc = require('./laroux.mvc.js');
    laroux.stack = require('./laroux.stack.js');
    laroux.templates = require('./laroux.templates.js');
    // laroux.touch = require('./laroux.touch.js');
    // laroux.ui = require('./laroux.ui.js');

    return laroux;

}(typeof window !== 'undefined' ? window : global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./laroux.ajax.js":2,"./laroux.date.js":4,"./laroux.events.js":6,"./laroux.helpers.js":7,"./laroux.stack.js":8,"./laroux.templates.js":9,"./laroux.timers.js":10,"./laroux.triggers.js":11,"./laroux.vars.js":12,"./laroux.wrapper.js":13}],2:[function(require,module,exports){
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

},{"./laroux.events.js":6,"./laroux.helpers.js":7}],3:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_helpers = require('./laroux.helpers.js');

    // css
    var laroux_css = {
        // class features
        hasClass: function (element, className) {
            return element.classList.contains(className);
        },

        addClass: function (element, className) {
            var elements = laroux_helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                elements[i].classList.add(className);
            }
        },

        removeClass: function (element, className) {
            var elements = laroux_helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                elements[i].classList.remove(className);
            }
        },

        toggleClass: function (element, className) {
            var elements = laroux_helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                } else {
                    elements[i].classList.add(className);
                }
            }
        },

        cycleClass: function (elements, className) {
            for (var i = 0, length = elements.length; i < length; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                    elements[(i + 1) % length].classList.add(className);
                    return;
                }
            }
        },

        // style features
        getProperty: function (element, styleName) {
            var style = getComputedStyle(element);

            styleName = laroux_helpers.antiCamelCase(styleName);

            return style.getPropertyValue(styleName);
        },

        setProperty: function (element, properties, value) {
            var elements = laroux_helpers.getAsArray(element);

            if (typeof properties == 'string') {
                var oldProperties = properties;
                properties = {};
                properties[oldProperties] = value;
            }

            for (var styleName in properties) {
                if (!properties.hasOwnProperty(styleName)) {
                    continue;
                }

                var newStyleName = laroux_helpers.camelCase(styleName);

                for (var i = 0, length = elements.length; i < length; i++) {
                    elements[i].style[newStyleName] = properties[styleName];
                }
            }
        },

        // transition features
        defaultTransition: '2s ease',

        setTransitionSingle: function (element, transition) {
            var transitions = laroux_helpers.getAsArray(transition),
                style = getComputedStyle(element),
                currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') ||
                    style.getPropertyValue('-ms-transition') || '',
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
                    transitionProperties = laroux_css.defaultTransition;
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

        setTransition: function (element, transition) {
            var elements = laroux_helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                laroux_css.setTransitionSingle(elements[i], transition);
            }
        },

        show: function (element, transitionProperties) {
            if (transitionProperties !== undefined) {
                laroux_css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                laroux_css.setTransition(element, 'opacity');
            }

            laroux_css.setProperty(element, { opacity: 1 });
        },

        hide: function (element, transitionProperties) {
            if (transitionProperties !== undefined) {
                laroux_css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                laroux_css.setTransition(element, 'opacity');
            }

            laroux_css.setProperty(element, { opacity: 0 });
        },

        // measurement features
        // height of element without padding, margin and border
        height: function (element) {
            var style = getComputedStyle(element),
                height = style.getPropertyCSSValue('height');

            return height.getFloatValue(height.primitiveType);
        },

        // height of element with padding but without margin and border
        innerHeight: function (element) {
            return element.clientHeight;
        },

        // height of element with padding and border but margin optional
        outerHeight: function (element, includeMargin) {
            if (includeMargin || false) {
                return element.offsetHeight;
            }

            var style = getComputedStyle(element),
                marginTop = style.getPropertyCSSValue('margin-top'),
                marginBottom = style.getPropertyCSSValue('margin-bottom'),
                margins = marginTop.getFloatValue(marginTop.primitiveType) +
                    marginBottom.getFloatValue(marginBottom.primitiveType);

            return Math.ceil(element.offsetHeight + margins);
        },

        // width of element without padding, margin and border
        width: function (element) {
            var style = getComputedStyle(element),
                height = style.getPropertyCSSValue('width');

            return height.getFloatValue(height.primitiveType);
        },

        // width of element with padding but without margin and border
        innerWidth: function (element) {
            return element.clientWidth;
        },

        // width of element with padding and border but margin optional
        outerWidth: function (element, includeMargin) {
            if (includeMargin || false) {
                return element.offsetWidth;
            }

            var style = getComputedStyle(element),
                marginLeft = style.getPropertyCSSValue('margin-left'),
                marginRight = style.getPropertyCSSValue('margin-right'),
                margins = marginLeft.getFloatValue(marginLeft.primitiveType) +
                    marginRight.getFloatValue(marginRight.primitiveType);

            return Math.ceil(element.offsetWidth + margins);
        },

        top: function (element) {
            return element.getBoundingClientRect().top +
                ((document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop);
        },

        left: function (element) {
            return element.getBoundingClientRect().left +
                ((document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft);
        },

        aboveTheTop: function (element) {
            return element.getBoundingClientRect().bottom <= 0;
        },

        belowTheFold: function (element) {
            return element.getBoundingClientRect().top > innerHeight;
        },

        leftOfScreen: function (element) {
            return element.getBoundingClientRect().right <= 0;
        },

        rightOfScreen: function (element) {
            return element.getBoundingClientRect().left > innerWidth;
        },

        inViewport: function (element) {
            var rect = element.getBoundingClientRect();

            return !(rect.bottom <= 0 || rect.top > innerHeight ||
                rect.right <= 0 || rect.left > innerWidth);
        }
    };

    return laroux_css;

}());

},{"./laroux.helpers.js":7}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_helpers = require('./laroux.helpers.js');
        // laroux_css = require('./laroux.css.js'),
        // laroux_triggers = require('./laroux.triggers.js');

    // dom
    var laroux_dom = {
        docprop: function (propName) {
            return document.documentElement.classList.contains(propName);
        },

        select: function (selector, parent) {
            return laroux_helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        },

        selectByClass: function (selector, parent) {
            return laroux_helpers.toArray(
                (parent || document).getElementsByClassName(selector)
            );
        },

        selectByTag: function (selector, parent) {
            return laroux_helpers.toArray(
                (parent || document).getElementsByTagName(selector)
            );
        },

        selectById: function (selector, parent) {
            return (parent || document).getElementById(selector);
        },

        selectSingle: function (selector, parent) {
            return (parent || document).querySelector(selector);
        },

        attr: function (element, attributes, value) {
            if (value === undefined && attributes.constructor !== Object) {
                return element.getAttribute(attributes);
            }

            var elements = laroux_helpers.getAsArray(element);
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

        data: function (element, datanames, value) {
            if (value === undefined && datanames.constructor !== Object) {
                return element.getAttribute('data-' + datanames);
            }

            var elements = laroux_helpers.getAsArray(element);
            if (typeof datanames == 'string') {
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
        setEvent: function (element, eventname, fnc) {
            var elements = laroux_helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                laroux_dom.setEventSingle(elements[i], eventname, fnc);
            }
        },

        setEventSingle: function (element, eventname, fnc) {
            var fncWrapper = function (e) {
                if (fnc(e, element) === false) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
            };

            laroux_dom.eventHistory.push({ element: element, eventname: eventname, fnc: fnc, fncWrapper: fncWrapper });
            element.addEventListener(eventname, fncWrapper, false);
        },

        unsetEvent: function (element, eventname, fnc) {
            var elements = laroux_helpers.getAsArray(element);

            for (var i1 = 0, length1 = elements.length; i1 < length1; i1++) {
                for (var i2 = 0, length2 = laroux_dom.eventHistory.length; i2 < length2; i2++) {
                    var item = laroux_dom.eventHistory[i2];

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
                    delete laroux_dom.eventHistory[i2];
                }
            }
        },

        dispatchEvent: function (element, eventname, data) {
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

        create: function (html) {
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

        createElement: function (element, attributes, children) {
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
                } else if (/* typeof children == 'string' && */children.length > 0) {
                    laroux_dom.append(elem, children);
                }
            }

            return elem;
        },

        createOption: function (element, key, value, isDefault) {
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

            laroux_dom.append(option, value);
            element.appendChild(option);
        },

        selectByValue: function (element, value) {
            for (var i = 0, length = element.options.length; i < length; i++) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        },/*,

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
                    if (typeof triggerName == 'function') {
                        triggerName();
                    } else {
                        laroux_triggers.ontrigger(triggerName);
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
                    if (typeof triggerName == 'function') {
                        triggerName();
                    } else {
                        laroux_triggers.ontrigger(triggerName);
                    }
                }
            };

            var head = document.getElementsByTagName('head')[0];
            head.appendChild(elem);
        },*/

        clear: function (element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.firstChild);
            }
        },

        insert: function (element, position, content) {
            element.insertAdjacentHTML(position, content);
        },

        prepend: function (element, content) {
            element.insertAdjacentHTML('afterbegin', content);
        },

        append: function (element, content) {
            element.insertAdjacentHTML('beforeend', content);
        },

        replace: function (element, content) {
            laroux_dom.clear(element);
            element.insertAdjacentHTML('afterbegin', content);
        },

        replaceText: function (element, content) {
            // laroux_dom.clear(element);
            element.textContent = content;
        },

        remove: function (element) {
            element.remove();
        },

        cloneReturn: 0,
        cloneAppend: 1,
        cloneInsertAfter: 2,
        cloneInsertBefore: 3,

        clone: function (element, type, container, target) {
            var newElement = element.cloneNode(true);

            if (container === undefined) {
                container = element.parentNode;
            }
            if (target === undefined) {
                target = element;
            }

            if (type !== undefined && type != laroux_dom.cloneReturn) {
                if (type == laroux_dom.cloneAppend) {
                    container.appendChild(newElement);
                } else if (type == laroux_dom.cloneInsertAfter) {
                    container.insertBefore(newElement, target.nextSibling);
                } else { // type == laroux_dom.cloneInsertBefore
                    container.insertBefore(newElement, target);
                }
            }

            return newElement;
        }/*,

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
                            if (binding.substring(0, 1) == '_') {
                                element.setAttribute(binding.substring(1), value);
                                continue;
                            }

                            if (binding == 'content') {
                                laroux_dom.replace(element, value);
                                continue;
                            }
                            break;
                        case 'addprop':
                            if (binding.substring(0, 1) == '_') {
                                element.setAttribute(binding.substring(1), element.getAttribute(binding.substring(1)) + value);
                                continue;
                            }

                            if (binding == 'content') {
                                laroux_dom.append(element, value);
                                continue;
                            }
                            break;
                        case 'removeprop':
                            if (value.substring(0, 1) == '_') {
                                element.removeAttribute(value.substring(1));
                                continue;
                            }

                            if (value == 'content') {
                                laroux_dom.clear(element);
                                continue;
                            }
                            break;
                        case 'addclass':
                            laroux_css.addClass(element, value);
                            break;
                        case 'removeclass':
                            laroux_css.removeClass(element, value);
                            break;
                        case 'addstyle':
                            laroux_css.setProperty(element, binding, value);
                            break;
                        case 'removestyle':
                            laroux_css.setProperty(element, value, 'inherit !important');
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

    return laroux_dom;

}());

},{"./laroux.helpers.js":7}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_helpers = require('./laroux.helpers.js');

    // templates
    var laroux_templates = {
        engines: {
            plain: {
                compile: function (template, options) {
                    return [template, options];
                },

                render: function (compiled, model) {
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
                        dict['{{' + key + '}}'] = laroux_helpers.getElement(model, key, '');
                        lastIndex = closeIndex + 2;
                    }

                    return laroux_helpers.replaceAll(result, dict);
                }
            },

            hogan: {
                compile: function (template, options) {
                    return Hogan.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled.render(model);
                }
            },

            mustache: {
                compile: function (template, options) {
                    return Mustache.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            handlebars: {
                compile: function (template, options) {
                    return Handlebars.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            lodash: {
                compile: function (template, options) {
                    /*jslint nomen: true */
                    return _.compile(template, null, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            underscore: {
                compile: function (template, options) {
                    /*jslint nomen: true */
                    return _.compile(template, null, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            }
        },
        engine: 'plain',

        apply: function (element, model, options) {
            var content, engine = laroux_templates.engines[laroux_templates.engine];

            if (element.nodeType === 1 || element.nodeType === 3 || element.nodeType === 11) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            var compiled = engine.compile(content, options);
            return engine.render(compiled, model);
        },

        insert: function (element, model, target, position, options) {
            var output = laroux_templates.apply(element, model, options);

            laroux_dom.insert(target, position || 'beforeend', output);
        },

        replace: function (element, model, target, options) {
            var output = laroux_templates.apply(element, model, options);

            laroux_dom.replace(target, output);
        }
    };

    return laroux_templates;

}());

},{"./laroux.dom.js":5,"./laroux.helpers.js":7}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./laroux.helpers.js":7}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/*global NodeList, Node */
module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_css = require('./laroux.css.js'),
        laroux_helpers = require('./laroux.helpers.js');

    // wrapper
    var laroux_wrapper = function (selector, parent) {
        var selection;

        if (selector instanceof Array) {
            selection = selector;
        } else if (selector instanceof NodeList) {
            selection = laroux_helpers.toArray(selector);
        } else if (selector instanceof Node) {
            selection = [selector];
        } else {
            selection = laroux_dom.select(selector, parent);
        }

        if (selection.length === 1) {
            return new laroux_wrapper.singleTemplate(selection[0]);
        }

        return new laroux_wrapper.arrayTemplate(selection);
    };

    laroux_wrapper.singleTemplate = function (element) {
        this.source = element;
        this.isArray = false;

        this.get = function (index) {
            if (index === 0 || index === undefined) {
                return this.source;
            }

            return undefined;
        };

        this.find = function (selector) {
            return laroux_wrapper(selector, this.source);
        };
    };

    laroux_wrapper.arrayTemplate = function (elements) {
        this.source = elements;
        this.isArray = true;

        this.get = function (index) {
            return this.source[index];
        };
    };

    laroux_wrapper.registerBoth = 0;
    laroux_wrapper.registerSingle = 1;
    laroux_wrapper.registerArray = 2;

    laroux_wrapper.register = function (name, fnc, scope) {
        var newFnc = function () {
            var result = fnc.apply(
                this,
                [this.source].concat(laroux_helpers.toArray(arguments))
            );

            return (result === undefined) ? this : result;
        };

        switch (scope) {
        case laroux_wrapper.registerSingle:
            laroux_wrapper.singleTemplate.prototype[name] = newFnc;
            break;
        case laroux_wrapper.registerArray:
            laroux_wrapper.arrayTemplate.prototype[name] = newFnc;
            break;
        default:
            laroux_wrapper.singleTemplate.prototype[name] = newFnc;
            laroux_wrapper.arrayTemplate.prototype[name] = newFnc;
            break;
        }
    };

    laroux_wrapper.register('attr', laroux_dom.attr, laroux_wrapper.registerSingle);
    laroux_wrapper.register('data', laroux_dom.data, laroux_wrapper.registerSingle);
    laroux_wrapper.register('on', laroux_dom.setEventSingle, laroux_wrapper.registerSingle);
    laroux_wrapper.register('on', laroux_dom.setEvent, laroux_wrapper.registerArray);
    laroux_wrapper.register('off', laroux_dom.unsetEvent, laroux_wrapper.registerBoth);
    laroux_wrapper.register('clear', laroux_dom.clear, laroux_wrapper.registerSingle);
    laroux_wrapper.register('insert', laroux_dom.insert, laroux_wrapper.registerSingle);
    laroux_wrapper.register('prepend', laroux_dom.prepend, laroux_wrapper.registerSingle);
    laroux_wrapper.register('append', laroux_dom.append, laroux_wrapper.registerSingle);
    laroux_wrapper.register('replace', laroux_dom.replace, laroux_wrapper.registerSingle);
    laroux_wrapper.register('replaceText', laroux_dom.replaceText, laroux_wrapper.registerSingle);
    laroux_wrapper.register('remove', laroux_dom.remove, laroux_wrapper.registerSingle);

    laroux_wrapper.register('hasClass', laroux_css.hasClass, laroux_wrapper.registerSingle);
    laroux_wrapper.register('addClass', laroux_css.addClass, laroux_wrapper.registerBoth);
    laroux_wrapper.register('removeClass', laroux_css.removeClass, laroux_wrapper.registerBoth);
    laroux_wrapper.register('toggleClass', laroux_css.toggleClass, laroux_wrapper.registerBoth);
    laroux_wrapper.register('getProperty', laroux_css.getProperty, laroux_wrapper.registerSingle);
    laroux_wrapper.register('setProperty', laroux_css.setProperty, laroux_wrapper.registerBoth);
    laroux_wrapper.register('setTransition', laroux_css.setTransition, laroux_wrapper.registerBoth);
    laroux_wrapper.register('show', laroux_css.show, laroux_wrapper.registerBoth);
    laroux_wrapper.register('hide', laroux_css.hide, laroux_wrapper.registerBoth);
    laroux_wrapper.register('height', laroux_css.height, laroux_wrapper.registerSingle);
    laroux_wrapper.register('innerHeight', laroux_css.innerHeight, laroux_wrapper.registerSingle);
    laroux_wrapper.register('outerHeight', laroux_css.outerHeight, laroux_wrapper.registerSingle);
    laroux_wrapper.register('width', laroux_css.width, laroux_wrapper.registerSingle);
    laroux_wrapper.register('innerWidth', laroux_css.innerWidth, laroux_wrapper.registerSingle);
    laroux_wrapper.register('outerWidth', laroux_css.outerWidth, laroux_wrapper.registerSingle);
    laroux_wrapper.register('top', laroux_css.top, laroux_wrapper.registerSingle);
    laroux_wrapper.register('left', laroux_css.left, laroux_wrapper.registerSingle);
    laroux_wrapper.register('aboveTheTop', laroux_css.aboveTheTop, laroux_wrapper.registerSingle);
    laroux_wrapper.register('belowTheFold', laroux_css.belowTheFold, laroux_wrapper.registerSingle);
    laroux_wrapper.register('leftOfScreen', laroux_css.leftOfScreen, laroux_wrapper.registerSingle);
    laroux_wrapper.register('rightOfScreen', laroux_css.rightOfScreen, laroux_wrapper.registerSingle);
    laroux_wrapper.register('inViewport', laroux_css.inViewport, laroux_wrapper.registerSingle);

    return laroux_wrapper;

}());

},{"./laroux.css.js":3,"./laroux.dom.js":5,"./laroux.helpers.js":7}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGFyb3V4e2Jhc2V9LmpzIiwic3JjL2pzL2xhcm91eC5hamF4LmpzIiwic3JjL2pzL2xhcm91eC5jc3MuanMiLCJzcmMvanMvbGFyb3V4LmRhdGUuanMiLCJzcmMvanMvbGFyb3V4LmRvbS5qcyIsInNyYy9qcy9sYXJvdXguZXZlbnRzLmpzIiwic3JjL2pzL2xhcm91eC5oZWxwZXJzLmpzIiwic3JjL2pzL2xhcm91eC5zdGFjay5qcyIsInNyYy9qcy9sYXJvdXgudGVtcGxhdGVzLmpzIiwic3JjL2pzL2xhcm91eC50aW1lcnMuanMiLCJzcmMvanMvbGFyb3V4LnRyaWdnZXJzLmpzIiwic3JjL2pzL2xhcm91eC52YXJzLmpzIiwic3JjL2pzL2xhcm91eC53cmFwcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gY29yZVxuICAgIHZhciBsYXJvdXggPSBmdW5jdGlvbiAoKSB7XG4gICAgfTtcblxuICAgIGlmICghKCckbCcgaW4gc2NvcGUpKSB7XG4gICAgICAgIHNjb3BlLiRsID0gbGFyb3V4O1xuICAgIH1cblxuICAgIC8vIGNvcmUgbW9kdWxlc1xuICAgIGxhcm91eC5ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKTtcbiAgICBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICBsYXJvdXgudGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyk7XG5cbiAgICBsYXJvdXguZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbGFyb3V4KTtcbiAgICAgICAgbGFyb3V4LmhlbHBlcnMuZXh0ZW5kT2JqZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxhcm91eC5leHRlbmRPYmplY3QgPSBsYXJvdXguaGVscGVycy5leHRlbmRPYmplY3Q7XG4gICAgbGFyb3V4LmVhY2ggPSBsYXJvdXguaGVscGVycy5lYWNoO1xuICAgIGxhcm91eC5tYXAgPSBsYXJvdXguaGVscGVycy5tYXA7XG4gICAgbGFyb3V4LmluZGV4ID0gbGFyb3V4LmhlbHBlcnMuaW5kZXg7XG4gICAgbGFyb3V4LmFlYWNoID0gbGFyb3V4LmhlbHBlcnMuYWVhY2g7XG4gICAgbGFyb3V4LmFtYXAgPSBsYXJvdXguaGVscGVycy5hbWFwO1xuICAgIGxhcm91eC5haW5kZXggPSBsYXJvdXguaGVscGVycy5haW5kZXg7XG5cbiAgICAvLyBvcHRpb25hbCBtb2R1bGVzXG4gICAgbGFyb3V4LndyYXBwZXIgPSByZXF1aXJlKCcuL2xhcm91eC53cmFwcGVyLmpzJyk7XG4gICAgbGFyb3V4LmFqYXggPSByZXF1aXJlKCcuL2xhcm91eC5hamF4LmpzJyk7XG4gICAgLy8gbGFyb3V4LmNzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpO1xuICAgIC8vIGxhcm91eC5kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKTtcbiAgICAvLyBsYXJvdXguZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyk7XG4gICAgLy8gbGFyb3V4LmZvcm1zID0gcmVxdWlyZSgnLi9sYXJvdXguZm9ybXMuanMnKTtcbiAgICAvLyBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICAvLyBsYXJvdXgudGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRyaWdnZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudHJpZ2dlcnMuanMnKTtcbiAgICBsYXJvdXgudmFycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnZhcnMuanMnKTtcblxuICAgIC8vIGxhcm91eC5hbmltID0gcmVxdWlyZSgnLi9sYXJvdXguYW5pbS5qcycpO1xuICAgIGxhcm91eC5kYXRlID0gcmVxdWlyZSgnLi9sYXJvdXguZGF0ZS5qcycpO1xuICAgIC8vIGxhcm91eC5rZXlzID0gcmVxdWlyZSgnLi9sYXJvdXgua2V5cy5qcycpO1xuICAgIC8vIGxhcm91eC5tdmMgPSByZXF1aXJlKCcuL2xhcm91eC5tdmMuanMnKTtcbiAgICBsYXJvdXguc3RhY2sgPSByZXF1aXJlKCcuL2xhcm91eC5zdGFjay5qcycpO1xuICAgIGxhcm91eC50ZW1wbGF0ZXMgPSByZXF1aXJlKCcuL2xhcm91eC50ZW1wbGF0ZXMuanMnKTtcbiAgICAvLyBsYXJvdXgudG91Y2ggPSByZXF1aXJlKCcuL2xhcm91eC50b3VjaC5qcycpO1xuICAgIC8vIGxhcm91eC51aSA9IHJlcXVpcmUoJy4vbGFyb3V4LnVpLmpzJyk7XG5cbiAgICByZXR1cm4gbGFyb3V4O1xuXG59KHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyBhamF4IC0gcGFydGlhbGx5IHRha2VuIGZyb20gJ2pxdWVyeSBpbiBwYXJ0cycgcHJvamVjdFxuICAgIC8vICAgICAgICBjYW4gYmUgZm91bmQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9teXRoei9qcXVpcC9cbiAgICB2YXIgbGFyb3V4X2FqYXggPSB7XG4gICAgICAgIGNvcnNEZWZhdWx0OiBmYWxzZSxcblxuICAgICAgICB3cmFwcGVyczoge1xuICAgICAgICAgICAgcmVnaXN0cnk6IHtcbiAgICAgICAgICAgICAgICAnbGFyb3V4LmpzJzogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiAnICsgZGF0YS5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iajtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5mb3JtYXQgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5mb3JtYXQgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZXZhbChkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGlmIChkYXRhLmZvcm1hdCA9PSAneG1sJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5hbWUsIGZuYykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W25hbWVdID0gZm5jO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHhEb21haW5PYmplY3Q6IGZhbHNlLFxuICAgICAgICB4bWxIdHRwUmVxdWVzdE9iamVjdDogbnVsbCxcbiAgICAgICAgeERvbWFpblJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhocjogZnVuY3Rpb24gKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICBpZiAobGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3Jvc3NEb21haW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoISgnd2l0aENyZWRlbnRpYWxzJyBpbiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCkgJiYgdHlwZW9mIFhEb21haW5SZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0ID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdDtcbiAgICAgICAgfSxcblxuICAgICAgICB4aHJSZXNwOiBmdW5jdGlvbiAoeGhyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlckZ1bmN0aW9uID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlc3BvbnNlLVdyYXBwZXItRnVuY3Rpb24nKSxcbiAgICAgICAgICAgICAgICByZXNwb25zZTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgIC8qanNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZXZhbCh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ3htbCcpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVhNTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod3JhcHBlckZ1bmN0aW9uICYmICh3cmFwcGVyRnVuY3Rpb24gaW4gbGFyb3V4X2FqYXgud3JhcHBlcnMucmVnaXN0cnkpKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeVt3cmFwcGVyRnVuY3Rpb25dKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgd3JhcHBlckZ1bmM6IHdyYXBwZXJGdW5jdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBtYWtlUmVxdWVzdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBjb3JzID0gb3B0aW9ucy5jb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHhociA9IGxhcm91eF9hamF4Lnhocihjb3JzKSxcbiAgICAgICAgICAgICAgICB1cmwgPSBvcHRpb25zLnVybCxcbiAgICAgICAgICAgICAgICB0aW1lciA9IG51bGwsXG4gICAgICAgICAgICAgICAgbiA9IDA7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50aW1lb3V0Rm4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGltZW91dEZuKG9wdGlvbnMudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aW1lb3V0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbGFyb3V4X2FqYXgueGhyUmVzcCh4aHIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheEVycm9yJywgW3hociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Y2Nlc3MgIT09IHVuZGVmaW5lZCAmJiByZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zdWNjZXNzKHJlcy5yZXNwb25zZSwgcmVzLndyYXBwZXJGdW5jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheFN1Y2Nlc3MnLCBbeGhyLCByZXMucmVzcG9uc2UsIHJlcy53cmFwcGVyRnVuYywgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3IoeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4RXJyb3InLCBbeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29tcGxldGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5jb21wbGV0ZSh4aHIsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4Q29tcGxldGUnLCBbeGhyLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wcm9ncmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucHJvZ3Jlc3MoKytuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5nZXRkYXRhICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5nZXRkYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZ2V0ZGF0YS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeVN0cmluZyA9IGxhcm91eF9oZWxwZXJzLmJ1aWxkUXVlcnlTdHJpbmcob3B0aW9ucy5nZXRkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyBxdWVyeVN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyBvcHRpb25zLmdldGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5qc29ucCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArICdqc29ucD0nICsgb3B0aW9ucy5qc29ucDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgeGhyLm9wZW4ob3B0aW9ucy50eXBlLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihvcHRpb25zLnR5cGUsIHVybCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMueGhyRmllbGRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zLnhockZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnhockZpZWxkcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHJbaV0gPSBvcHRpb25zLnhockZpZWxkc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMud3JhcHBlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snWC1XcmFwcGVyLUZ1bmN0aW9uJ10gPSAnbGFyb3V4LmpzJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogaW4gaGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWhlYWRlcnMuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaiwgaGVhZGVyc1tqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wb3N0ZGF0YSA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucG9zdGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2VuZChudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAob3B0aW9ucy5wb3N0ZGF0YXR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5wb3N0ZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdmb3JtJzpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQobGFyb3V4X2hlbHBlcnMuYnVpbGRGb3JtRGF0YShvcHRpb25zLnBvc3RkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKG9wdGlvbnMucG9zdGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnaHRtbCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SnNvbjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRKc29uUDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgbWV0aG9kLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGpzb25wOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2NyaXB0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGF0eXBlOiAnZm9ybScsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0SnNvbjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9hamF4O1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIGNzc1xuICAgIHZhciBsYXJvdXhfY3NzID0ge1xuICAgICAgICAvLyBjbGFzcyBmZWF0dXJlc1xuICAgICAgICBoYXNDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3ljbGVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnRzLCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzWyhpICsgMSkgJSBsZW5ndGhdLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBzdHlsZSBmZWF0dXJlc1xuICAgICAgICBnZXRQcm9wZXJ0eTogZnVuY3Rpb24gKGVsZW1lbnQsIHN0eWxlTmFtZSkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcblxuICAgICAgICAgICAgc3R5bGVOYW1lID0gbGFyb3V4X2hlbHBlcnMuYW50aUNhbWVsQ2FzZShzdHlsZU5hbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFByb3BlcnR5OiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydGllcywgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGRQcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1tvbGRQcm9wZXJ0aWVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBzdHlsZU5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgIGlmICghcHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShzdHlsZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdTdHlsZU5hbWUgPSBsYXJvdXhfaGVscGVycy5jYW1lbENhc2Uoc3R5bGVOYW1lKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5zdHlsZVtuZXdTdHlsZU5hbWVdID0gcHJvcGVydGllc1tzdHlsZU5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyB0cmFuc2l0aW9uIGZlYXR1cmVzXG4gICAgICAgIGRlZmF1bHRUcmFuc2l0aW9uOiAnMnMgZWFzZScsXG5cbiAgICAgICAgc2V0VHJhbnNpdGlvblNpbmdsZTogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkodHJhbnNpdGlvbiksXG4gICAgICAgICAgICAgICAgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9ucyA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3RyYW5zaXRpb24nKSB8fCBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctd2Via2l0LXRyYW5zaXRpb24nKSB8fFxuICAgICAgICAgICAgICAgICAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctbXMtdHJhbnNpdGlvbicpIHx8ICcnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5O1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudFRyYW5zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheSA9IGN1cnJlbnRUcmFuc2l0aW9ucy5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0cmFuc2l0aW9ucy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gdHJhbnNpdGlvbnNbaXRlbV0uaW5kZXhPZignICcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVOYW1lID0gdHJhbnNpdGlvbnNbaXRlbV0uc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzID0gdHJhbnNpdGlvbnNbaXRlbV0uc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlTmFtZSA9IHRyYW5zaXRpb25zW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyA9IGxhcm91eF9jc3MuZGVmYXVsdFRyYW5zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFRyYW5zaXRpb25zQXJyYXlbal0udHJpbSgpLmxvY2FsZUNvbXBhcmUoc3R5bGVOYW1lKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXlbal0gPSBzdHlsZU5hbWUgKyAnICcgKyB0cmFuc2l0aW9uUHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5wdXNoKHN0eWxlTmFtZSArICcgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5LmpvaW4oJywgJyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLm1zVHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb25TaW5nbGUoZWxlbWVudHNbaV0sIHRyYW5zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHkgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgeyBvcGFjaXR5OiAxIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHkgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG1lYXN1cmVtZW50IGZlYXR1cmVzXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGhvdXQgcGFkZGluZywgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdoZWlnaHQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodC5nZXRGbG9hdFZhbHVlKGhlaWdodC5wcmltaXRpdmVUeXBlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYnV0IHdpdGhvdXQgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaW5uZXJIZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGFuZCBib3JkZXIgYnV0IG1hcmdpbiBvcHRpb25hbFxuICAgICAgICBvdXRlckhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQsIGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIGlmIChpbmNsdWRlTWFyZ2luIHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi10b3AnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b20gPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tYm90dG9tJyksXG4gICAgICAgICAgICAgICAgbWFyZ2lucyA9IG1hcmdpblRvcC5nZXRGbG9hdFZhbHVlKG1hcmdpblRvcC5wcmltaXRpdmVUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbS5nZXRGbG9hdFZhbHVlKG1hcmdpbkJvdHRvbS5wcmltaXRpdmVUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50Lm9mZnNldEhlaWdodCArIG1hcmdpbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aG91dCBwYWRkaW5nLCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICB3aWR0aDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnd2lkdGgnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodC5nZXRGbG9hdFZhbHVlKGhlaWdodC5wcmltaXRpdmVUeXBlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBidXQgd2l0aG91dCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBpbm5lcldpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYW5kIGJvcmRlciBidXQgbWFyZ2luIG9wdGlvbmFsXG4gICAgICAgIG91dGVyV2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50LCBpbmNsdWRlTWFyZ2luKSB7XG4gICAgICAgICAgICBpZiAoaW5jbHVkZU1hcmdpbiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tbGVmdCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgbWFyZ2lucyA9IG1hcmdpbkxlZnQuZ2V0RmxvYXRWYWx1ZShtYXJnaW5MZWZ0LnByaW1pdGl2ZVR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQuZ2V0RmxvYXRWYWx1ZShtYXJnaW5SaWdodC5wcmltaXRpdmVUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50Lm9mZnNldFdpZHRoICsgbWFyZ2lucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9wOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgICAgICAgICAoKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgK1xuICAgICAgICAgICAgICAgICgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0KSB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFib3ZlVGhlVG9wOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tIDw9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmVsb3dUaGVGb2xkOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wID4gaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICByaWdodE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCA+IGlubmVyV2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5WaWV3cG9ydDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgcmV0dXJuICEocmVjdC5ib3R0b20gPD0gMCB8fCByZWN0LnRvcCA+IGlubmVySGVpZ2h0IHx8XG4gICAgICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAwIHx8IHJlY3QubGVmdCA+IGlubmVyV2lkdGgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfY3NzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGRhdGVcbiAgICB2YXIgbGFyb3V4X2RhdGUgPSB7XG4gICAgICAgIHNob3J0RGF0ZUZvcm1hdDogJ2RkLk1NLnl5eXknLFxuICAgICAgICBsb25nRGF0ZUZvcm1hdDogJ2RkIE1NTU0geXl5eScsXG4gICAgICAgIHRpbWVGb3JtYXQ6ICdISDptbScsXG5cbiAgICAgICAgbW9udGhzU2hvcnQ6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcbiAgICAgICAgbW9udGhzTG9uZzogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10sXG5cbiAgICAgICAgc3RyaW5nczoge1xuICAgICAgICAgICAgbm93OiAgICAgJ25vdycsXG4gICAgICAgICAgICBsYXRlcjogICAnbGF0ZXInLFxuICAgICAgICAgICAgYWdvOiAgICAgJ2FnbycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2Vjb25kcycsXG4gICAgICAgICAgICBhbWludXRlOiAnYSBtaW51dGUnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0ZXMnLFxuICAgICAgICAgICAgYWhvdXI6ICAgJ2EgaG91cicsXG4gICAgICAgICAgICBob3VyczogICAnaG91cnMnLFxuICAgICAgICAgICAgYWRheTogICAgJ2EgZGF5JyxcbiAgICAgICAgICAgIGRheXM6ICAgICdkYXlzJyxcbiAgICAgICAgICAgIGF3ZWVrOiAgICdhIHdlZWsnLFxuICAgICAgICAgICAgd2Vla3M6ICAgJ3dlZWtzJyxcbiAgICAgICAgICAgIGFtb250aDogICdhIG1vbnRoJyxcbiAgICAgICAgICAgIG1vbnRoczogICdtb250aHMnLFxuICAgICAgICAgICAgYXllYXI6ICAgJ2EgeWVhcicsXG4gICAgICAgICAgICB5ZWFyczogICAneWVhcnMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VFcG9jaDogZnVuY3Rpb24gKHRpbWVzcGFuLCBsaW1pdFdpdGhXZWVrcykge1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAxMDAwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Muc2Vjb25kcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbWludXRlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubWludXRlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWhvdXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5ob3VycztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWRheTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmRheXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDQgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXdlZWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy53ZWVrcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpbWl0V2l0aFdlZWtzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDMwICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbW9udGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5tb250aHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDM2NSAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXllYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MueWVhcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q3VzdG9tRGF0ZVN0cmluZzogZnVuY3Rpb24gKGZvcm1hdCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IGRhdGUgfHwgbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIC95eXl5fHl5fE1NTU18TU1NfE1NfE18ZGR8ZHxoaHxofEhIfEh8bW18bXxzc3xzfHR0fHQvZyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eXl5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0RnVsbFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNMb25nW25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLm1vbnRoc1Nob3J0W25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIChub3cuZ2V0TW9udGgoKSArIDEpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNb250aCgpICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXREYXRlKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldERhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjEgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgKCgoaG91cjEgJSAxMikgPiAwKSA/IGhvdXIxICUgMTIgOiAxMikpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjIgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoKGhvdXIyICUgMTIpID4gMCkgPyBob3VyMiAlIDEyIDogMTI7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0SG91cnMoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0SG91cnMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRNaW51dGVzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldE1pbnV0ZXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRTZWNvbmRzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFNlY29uZHMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BtJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhbSc7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3AnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2EnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF0ZURpZmZTdHJpbmc6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IG5vdyAtIGRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGFic1RpbWVzcGFuID0gTWF0aC5hYnModGltZXNwYW4pLFxuICAgICAgICAgICAgICAgIHBhc3QgPSAodGltZXNwYW4gPiAwKTtcblxuICAgICAgICAgICAgaWYgKGFic1RpbWVzcGFuIDw9IDMwMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5ub3c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aW1lc3BhbnN0cmluZyA9IGxhcm91eF9kYXRlLnBhcnNlRXBvY2goYWJzVGltZXNwYW4sIHRydWUpO1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuc3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuc3RyaW5nICtcbiAgICAgICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgKHBhc3QgPyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFnbyA6IGxhcm91eF9kYXRlLnN0cmluZ3MubGF0ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0U2hvcnREYXRlU3RyaW5nKGRhdGUsIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNob3J0RGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLnNob3J0RGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgZGF0ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMb25nRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0ICsgJyAnICsgbGFyb3V4X2RhdGUudGltZUZvcm1hdCA6IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9kYXRlO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICAgICAgLy8gbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICAvLyBsYXJvdXhfdHJpZ2dlcnMgPSByZXF1aXJlKCcuL2xhcm91eC50cmlnZ2Vycy5qcycpO1xuXG4gICAgLy8gZG9tXG4gICAgdmFyIGxhcm91eF9kb20gPSB7XG4gICAgICAgIGRvY3Byb3A6IGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMocHJvcE5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5Q2xhc3M6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeVRhZzogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRzQnlUYWdOYW1lKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeUlkOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RTaW5nbGU6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXR0cjogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBhdHRyaWJ1dGVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzW29sZEF0dHJpYnV0ZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24gKGVsZW1lbnQsIGRhdGFuYW1lcywgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIGRhdGFuYW1lcy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBkYXRhbmFtZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhbmFtZXMgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkRGF0YW5hbWVzID0gZGF0YW5hbWVzO1xuICAgICAgICAgICAgICAgIGRhdGFuYW1lcyA9IHt9O1xuICAgICAgICAgICAgICAgIGRhdGFuYW1lc1tvbGREYXRhbmFtZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGRhdGFOYW1lIGluIGRhdGFuYW1lcykge1xuICAgICAgICAgICAgICAgIGlmICghZGF0YW5hbWVzLmhhc093blByb3BlcnR5KGRhdGFOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFuYW1lc1tkYXRhTmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLScgKyBkYXRhTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YU5hbWUsIGRhdGFuYW1lc1tkYXRhTmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50SGlzdG9yeTogW10sXG4gICAgICAgIHNldEV2ZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZWxlbWVudHNbaV0sIGV2ZW50bmFtZSwgZm5jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRFdmVudFNpbmdsZTogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZm5jV3JhcHBlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuYyhlLCBlbGVtZW50KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeS5wdXNoKHsgZWxlbWVudDogZWxlbWVudCwgZXZlbnRuYW1lOiBldmVudG5hbWUsIGZuYzogZm5jLCBmbmNXcmFwcGVyOiBmbmNXcmFwcGVyIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50bmFtZSwgZm5jV3JhcHBlciwgZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuc2V0RXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaTEgPSAwLCBsZW5ndGgxID0gZWxlbWVudHMubGVuZ3RoOyBpMSA8IGxlbmd0aDE7IGkxKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiA9IDAsIGxlbmd0aDIgPSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeS5sZW5ndGg7IGkyIDwgbGVuZ3RoMjsgaTIrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGxhcm91eF9kb20uZXZlbnRIaXN0b3J5W2kyXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnRzW2kxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRuYW1lICE9PSB1bmRlZmluZWQgJiYgaXRlbS5ldmVudG5hbWUgIT09IGV2ZW50bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZm5jICE9PSB1bmRlZmluZWQgJiYgaXRlbS5mbmMgIT09IGZuYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtLmV2ZW50bmFtZSwgaXRlbS5mbmNXcmFwcGVyLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeVtpMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN1c3RvbUV2ZW50W2l0ZW1dID0gZGF0YVtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VzdG9tRXZlbnQuaW5pdEV2ZW50KGV2ZW50bmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxuICAgICAgICAgICAgICAgIHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcblxuICAgICAgICAgICAgdGVtcC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGh0bWwpO1xuICAgICAgICAgICAgd2hpbGUgKHRlbXAuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGVtcC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbnVsbGluZyBvdXQgdGhlIHJlZmVyZW5jZSwgdGhlcmUgaXMgbm8gb2J2aW91cyBkaXNwb3NlIG1ldGhvZFxuICAgICAgICAgICAgdGVtcCA9IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiBmcmFnO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoaXRlbSwgYXR0cmlidXRlc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShpdGVtMiwgY2hpbGRyZW5baXRlbTJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoLyogdHlwZW9mIGNoaWxkcmVuID09ICdzdHJpbmcnICYmICovY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChlbGVtLCBjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVPcHRpb246IGZ1bmN0aW9uIChlbGVtZW50LCBrZXksIHZhbHVlLCBpc0RlZmF1bHQpIHtcbiAgICAgICAgICAgIC8qIG9sZCBiZWhhdmlvdXIsIGRvZXMgbm90IHN1cHBvcnQgb3B0Z3JvdXBzIGFzIHBhcmVudHMuXG4gICAgICAgICAgICB2YXIgY291bnQgPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zW2NvdW50XSA9IG5ldyBPcHRpb24odmFsdWUsIGtleSk7XG5cbiAgICAgICAgICAgIGlmIChpc0RlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9wdGlvbnMuc2VsZWN0ZWRJbmRleCA9IGNvdW50IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdPUFRJT04nKTtcbiAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywga2V5KTtcbiAgICAgICAgICAgIGlmIChpc0RlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5hcHBlbmQob3B0aW9uLCB2YWx1ZSk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlWYWx1ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudC5vcHRpb25zLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQub3B0aW9uc1tpXS5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJykgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LC8qLFxuXG4gICAgICAgIC8vIFRPRE86IGl0J3MgcmVkdW5kYW50IGZvciBub3dcbiAgICAgICAgbG9hZEltYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2VzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdJTUcnKTtcbiAgICAgICAgICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIGFyZ3VtZW50c1tpXSk7XG5cbiAgICAgICAgICAgICAgICBpbWFnZXMucHVzaChpbWFnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbWFnZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZEFzeW5jU2NyaXB0OiBmdW5jdGlvbiAocGF0aCwgdHJpZ2dlck5hbWUsIGFzeW5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLnNyYyA9IHBhdGg7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRBc3luY1N0eWxlOiBmdW5jdGlvbiAocGF0aCwgdHJpZ2dlck5hbWUsIGFzeW5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJTksnKTtcblxuICAgICAgICAgICAgZWxlbS50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLmhyZWYgPSBwYXRoO1xuICAgICAgICAgICAgZWxlbS5yZWwgPSAnc3R5bGVzaGVldCc7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICB9LCovXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0OiBmdW5jdGlvbiAoZWxlbWVudCwgcG9zaXRpb24sIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKHBvc2l0aW9uLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmVwZW5kOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZTogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VUZXh0OiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgLy8gbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmVSZXR1cm46IDAsXG4gICAgICAgIGNsb25lQXBwZW5kOiAxLFxuICAgICAgICBjbG9uZUluc2VydEFmdGVyOiAyLFxuICAgICAgICBjbG9uZUluc2VydEJlZm9yZTogMyxcblxuICAgICAgICBjbG9uZTogZnVuY3Rpb24gKGVsZW1lbnQsIHR5cGUsIGNvbnRhaW5lciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkICYmIHR5cGUgIT0gbGFyb3V4X2RvbS5jbG9uZVJldHVybikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IGxhcm91eF9kb20uY2xvbmVBcHBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lSW5zZXJ0QWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUluc2VydEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3RWxlbWVudDtcbiAgICAgICAgfS8qLFxuXG4gICAgICAgIC8vIFRPRE86IGl0J3MgcmVkdW5kYW50IGZvciBub3dcbiAgICAgICAgYXBwbHlPcGVyYXRpb25zOiBmdW5jdGlvbiAoZWxlbWVudCwgb3BlcmF0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgb3BlcmF0aW9uIGluIG9wZXJhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnMuaGFzT3duUHJvcGVydHkob3BlcmF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBiaW5kaW5nIGluIG9wZXJhdGlvbnNbb3BlcmF0aW9uXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnNbb3BlcmF0aW9uXS5oYXNPd25Qcm9wZXJ0eShiaW5kaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcGVyYXRpb25zW29wZXJhdGlvbl1bYmluZGluZ107XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZShlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpKSArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3ZlcHJvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodmFsdWUuc3Vic3RyaW5nKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5hZGRDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCBiaW5kaW5nLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB2YWx1ZSwgJ2luaGVyaXQgIWltcG9ydGFudCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVwZWF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob3BlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgfTtcblxuICAgIC8vIGEgZml4IGZvciBJbnRlcm5ldCBFeHBsb3JlclxuICAgIGlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50RWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsYXJvdXhfZG9tO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGV2ZW50c1xuICAgIHZhciBsYXJvdXhfZXZlbnRzID0ge1xuICAgICAgICBkZWxlZ2F0ZXM6IFtdLFxuXG4gICAgICAgIGFkZDogZnVuY3Rpb24gKGV2ZW50LCBmbmMpIHtcbiAgICAgICAgICAgIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzLnB1c2goeyBldmVudDogZXZlbnQsIGZuYzogZm5jIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGludm9rZTogZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXNbaXRlbV0uZXZlbnQgIT0gZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXNbaXRlbV0uZm5jKGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZXZlbnRzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGhlbHBlcnNcbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSB7XG4gICAgICAgIHVuaXF1ZUlkOiAwLFxuXG4gICAgICAgIGdldFVuaXF1ZUlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCBwbHVzcGx1czogdHJ1ZSAqL1xuICAgICAgICAgICAgcmV0dXJuICd1aWQtJyArICgrK2xhcm91eF9oZWxwZXJzLnVuaXF1ZUlkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiAodmFsdWVzLCByZmMzOTg2KSB7XG4gICAgICAgICAgICB2YXIgdXJpID0gJycsXG4gICAgICAgICAgICAgICAgcmVnRXggPSAvJTIwL2c7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmZjMzk4NiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpICs9ICcmJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKS5yZXBsYWNlKHJlZ0V4LCAnKycpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tuYW1lXS50b1N0cmluZygpKS5yZXBsYWNlKHJlZ0V4LCAnKycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpICs9ICcmJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbbmFtZV0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1cmkuc3Vic3RyKDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkRm9ybURhdGE6IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmFwcGVuZChuYW1lLCB2YWx1ZXNbbmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9ybWF0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmdzKS5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbiAoKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmdzKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZUFsbDogZnVuY3Rpb24gKHRleHQsIGRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoT2JqZWN0LmtleXMoZGljdGlvbmFyeSkuam9pbignfCcpLCAnZycpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIHJlLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGljdGlvbmFyeVttYXRjaF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYW1lbENhc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyQ2hhciA9IHZhbHVlLmNoYXJBdChqKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckNoYXIgPT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gKCFmbGFnKSA/IGN1cnJDaGFyIDogY3VyckNoYXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW50aUNhbWVsQ2FzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyckNoYXIgPSB2YWx1ZS5jaGFyQXQoaik7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJDaGFyICE9ICctJyAmJiBjdXJyQ2hhciA9PSBjdXJyQ2hhci50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSAnLScgKyBjdXJyQ2hhci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gY3VyckNoYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcXVvdGVBdHRyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnJmFwb3M7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG4vZywgJyYjMTM7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFxyXFxuXS9nLCAnJiMxMzsnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzcGxpY2VTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNvdW50LCBhZGQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgwLCBpbmRleCkgKyAoYWRkIHx8ICcnKSArIHZhbHVlLnNsaWNlKGluZGV4ICsgY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmRvbTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgICAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kOiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgb2JqLnNvbWUoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV4dGVuZE9iamVjdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IHRhcmdldCBpbnN0YW5jZW9mIEFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gYXJndW1lbnRzW2l0ZW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0YXJnZXQucHVzaChhcmd1bWVudHNbaXRlbV1bbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgICAgICAvKiB0YXJnZXRbbmFtZV0uY29uc3RydWN0b3IgPT09IE9iamVjdCAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KG5hbWUpICYmIHRhcmdldFtuYW1lXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZXh0ZW5kT2JqZWN0KHRhcmdldFtuYW1lXSwgYXJndW1lbnRzW2l0ZW1dW25hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gYXJndW1lbnRzW2l0ZW1dW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlYWNoOiBmdW5jdGlvbiAoYXJyLCBmbmMsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmbmMoaXRlbSwgYXJyW2l0ZW1dKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1hcDogZnVuY3Rpb24gKGFyciwgZm5jLCBkb250U2tpcFJldHVybnMsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMoYXJyW2l0ZW1dLCBpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZG9udFNraXBSZXR1cm5zIHx8IHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5kZXg6IGZ1bmN0aW9uIChhcnIsIHZhbHVlLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJyW2l0ZW1dID09PSBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBhZWFjaDogZnVuY3Rpb24gKGFyciwgZm5jKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuYyhpLCBhcnJbaV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW1hcDogZnVuY3Rpb24gKGFyciwgZm5jLCBkb250U2tpcFJldHVybnMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jKGFycltpXSwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRvbnRTa2lwUmV0dXJucyB8fCByZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnVuc2hpZnQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFpbmRleDogZnVuY3Rpb24gKGFyciwgdmFsdWUsIHN0YXJ0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gKHN0YXJ0IHx8IDApLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb2x1bW46IGZ1bmN0aW9uIChvYmosIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLm1hcChvYmosIGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfSwgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2h1ZmZsZTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgICAgICBzaHVmZmxlZCA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByYW5kID0gbGFyb3V4X2hlbHBlcnMucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgICAgICAgICAgICBzaHVmZmxlZFtpbmRleCsrXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgICAgICAgICAgIHNodWZmbGVkW3JhbmRdID0gb2JqW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWVyZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIHRtcCA9IHRhcmdldCxcbiAgICAgICAgICAgICAgICBpc0FycmF5ID0gdG1wIGluc3RhbmNlb2YgQXJyYXk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gdG1wLmNvbmNhdChhcmd1bWVudHNbaXRlbV0pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGFyZ3VtZW50c1tpdGVtXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpdGVtXS5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0bXBbYXR0cl0gPSBhcmd1bWVudHNbaXRlbV1bYXR0cl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdG1wO1xuICAgICAgICB9LFxuXG4gICAgICAgIGR1cGxpY2F0ZTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9BcnJheTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGl0ZW1zW2ldID0gb2JqW2ldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0QXNBcnJheTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGl0ZW1zO1xuXG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IG9iajtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgTm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGl0ZW1zID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtc1tpXSA9IG9ialtpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gW29ial07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMZW5ndGg6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0S2V5c1JlY3Vyc2l2ZTogZnVuY3Rpb24gKG9iaiwgZGVsaW1pdGVyLCBwcmVmaXgsIGtleXMpIHtcbiAgICAgICAgICAgIGlmIChkZWxpbWl0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9ICcuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcHJlZml4ID0gJyc7XG4gICAgICAgICAgICAgICAga2V5cyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGtleXMucHVzaChwcmVmaXggKyBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChvYmpbaXRlbV0gIT09IHVuZGVmaW5lZCAmJiBvYmpbaXRlbV0gIT09IG51bGwgJiYgb2JqW2l0ZW1dLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZ2V0S2V5c1JlY3Vyc2l2ZShvYmpbaXRlbV0sIGRlbGltaXRlciwgcHJlZml4ICsgaXRlbSArIGRlbGltaXRlciwga2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RWxlbWVudDogZnVuY3Rpb24gKG9iaiwgcGF0aCwgZGVmYXVsdFZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWxpbWl0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9ICcuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBvcyA9IHBhdGguaW5kZXhPZihkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgdmFyIGtleTtcbiAgICAgICAgICAgIHZhciByZXN0O1xuICAgICAgICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBwYXRoO1xuICAgICAgICAgICAgICAgIHJlc3QgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBwYXRoLnN1YnN0cmluZygwLCBwb3MpO1xuICAgICAgICAgICAgICAgIHJlc3QgPSBwYXRoLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCEoa2V5IGluIG9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzdCA9PT0gbnVsbCB8fCByZXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQob2JqW2tleV0sIHJlc3QsIGRlZmF1bHRWYWx1ZSwgZGVsaW1pdGVyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnM7XG5cbn0oKSk7XG4iLCIvKmpzbGludCBub21lbjogdHJ1ZSAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHN0YWNrXG4gICAgdmFyIGxhcm91eF9zdGFjayA9IGZ1bmN0aW9uIChkYXRhLCBkZXB0aCwgdG9wKSB7XG4gICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5fZGVwdGggPSBkZXB0aDtcbiAgICAgICAgdGhpcy5fdG9wID0gdG9wIHx8IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcblxuICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtrZXldKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gbmV3IGxhcm91eF9zdGFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVwdGggP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcHRoICsgJy4nICsga2V5IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3BcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kYXRhW2tleV0gPT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNldCh0aGlzLCBrZXksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3Aub251cGRhdGUoeyBzY29wZTogdGhpcywga2V5OiBrZXksIG9sZFZhbHVlOiBvbGRWYWx1ZSwgbmV3VmFsdWU6IG5ld1ZhbHVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldFJhbmdlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICAgICAgZm9yICh2YXIgdmFsdWVLZXkgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkodmFsdWVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KHZhbHVlS2V5LCB2YWx1ZXNbdmFsdWVLZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNba2V5XSB8fCBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFJhbmdlID0gZnVuY3Rpb24gKGtleXMpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBrZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFrZXlzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhbHVlc1trZXlzW2l0ZW1dXSA9IHRoaXNba2V5c1tpdGVtXV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpLmxlbmd0aDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmV4aXN0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiAoa2V5IGluIHRoaXMuX2RhdGEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleSBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNba2V5XTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHRoaXMuX2RhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbaXRlbV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9udXBkYXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmFuZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9zdGFjaztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHRlbXBsYXRlc1xuICAgIHZhciBsYXJvdXhfdGVtcGxhdGVzID0ge1xuICAgICAgICBlbmdpbmVzOiB7XG4gICAgICAgICAgICBwbGFpbjoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3RlbXBsYXRlLCBvcHRpb25zXTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBjb21waWxlZFswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpY3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXg7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChuZXh0SW5kZXggPSByZXN1bHQuaW5kZXhPZigne3snLCBsYXN0SW5kZXgpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbmRleCArPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsb3NlSW5kZXggPSByZXN1bHQuaW5kZXhPZignfX0nLCBuZXh0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3NlSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSByZXN1bHQuc3Vic3RyaW5nKG5leHRJbmRleCwgY2xvc2VJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWN0Wyd7eycgKyBrZXkgKyAnfX0nXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQobW9kZWwsIGtleSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gY2xvc2VJbmRleCArIDI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMucmVwbGFjZUFsbChyZXN1bHQsIGRpY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhvZ2FuOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIb2dhbi5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZC5yZW5kZXIobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG11c3RhY2hlOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNdXN0YWNoZS5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaGFuZGxlYmFyczoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSGFuZGxlYmFycy5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbG9kYXNoOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IG5vbWVuOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1bmRlcnNjb3JlOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IG5vbWVuOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZ2luZTogJ3BsYWluJyxcblxuICAgICAgICBhcHBseTogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCwgZW5naW5lID0gbGFyb3V4X3RlbXBsYXRlcy5lbmdpbmVzW2xhcm91eF90ZW1wbGF0ZXMuZW5naW5lXTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBlbGVtZW50LnRleHRDb250ZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gZWxlbWVudC5ub2RlVmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21waWxlZCA9IGVuZ2luZS5jb21waWxlKGNvbnRlbnQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGVuZ2luZS5yZW5kZXIoY29tcGlsZWQsIG1vZGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnNlcnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGxhcm91eF90ZW1wbGF0ZXMuYXBwbHkoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmluc2VydCh0YXJnZXQsIHBvc2l0aW9uIHx8ICdiZWZvcmVlbmQnLCBvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbGFyb3V4X3RlbXBsYXRlcy5hcHBseShlbGVtZW50LCBtb2RlbCwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZSh0YXJnZXQsIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90ZW1wbGF0ZXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdGltZXJzXG4gICAgdmFyIGxhcm91eF90aW1lcnMgPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgICAgICB0aW1lci5uZXh0ID0gRGF0ZS5ub3coKSArIHRpbWVyLnRpbWVvdXQ7XG4gICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEucHVzaCh0aW1lcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UodGFyZ2V0S2V5LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5uZXh0IDw9IG5vdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY3VycmVudEl0ZW0ub250aWNrKGN1cnJlbnRJdGVtLnN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSAmJiBjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ubmV4dCA9IG5vdyArIGN1cnJlbnRJdGVtLnRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGltZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHRyaWdnZXJzXG4gICAgdmFyIGxhcm91eF90cmlnZ2VycyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcbiAgICAgICAgbGlzdDogW10sXG5cbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoY29uZGl0aW9uLCBmbmMsIHN0YXRlKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9ucyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoY29uZGl0aW9uKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBjb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25kaXRpb25zLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIGNvbmRpdGlvbnNbaXRlbV0pID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMubGlzdC5wdXNoKGNvbmRpdGlvbnNbaXRlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb25zOiBjb25kaXRpb25zLFxuICAgICAgICAgICAgICAgIGZuYzogZm5jLFxuICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb250cmlnZ2VyOiBmdW5jdGlvbiAodHJpZ2dlck5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBldmVudElkeCA9IGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgdHJpZ2dlck5hbWUpO1xuICAgICAgICAgICAgaWYgKGV2ZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5saXN0LnNwbGljZShldmVudElkeCwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzW2l0ZW1dO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29uZGl0aW9uS2V5IGluIGN1cnJlbnRJdGVtLmNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50SXRlbS5jb25kaXRpb25zLmhhc093blByb3BlcnR5KGNvbmRpdGlvbktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbmRpdGlvbk9iaiA9IGN1cnJlbnRJdGVtLmNvbmRpdGlvbnNbY29uZGl0aW9uS2V5XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCBjb25kaXRpb25PYmopICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZuYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogY3VycmVudEl0ZW0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShhcmdzKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLnNwbGljZShyZW1vdmVLZXlzW2l0ZW0yXSwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0cmlnZ2VyIG5hbWU6ICcgKyB0cmlnZ2VyTmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90cmlnZ2VycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyB2YXJzXG4gICAgdmFyIGxhcm91eF92YXJzID0ge1xuICAgICAgICBjb29raWVQYXRoOiAnLycsXG5cbiAgICAgICAgZ2V0Q29va2llOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9W147XSsnLCAnaScpLFxuICAgICAgICAgICAgICAgIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKHJlKTtcblxuICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXS5zcGxpdCgnPScpWzFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb29raWU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCkge1xuICAgICAgICAgICAgdmFyIGV4cGlyZVZhbHVlID0gJyc7XG4gICAgICAgICAgICBpZiAoZXhwaXJlcykge1xuICAgICAgICAgICAgICAgIGV4cGlyZVZhbHVlID0gJzsgZXhwaXJlcz0nICsgZXhwaXJlcy50b0dNVFN0cmluZygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpICsgZXhwaXJlVmFsdWUgKyAnOyBwYXRoPScgKyAocGF0aCB8fCBsYXJvdXhfdmFycy5jb29raWVQYXRoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDb29raWU6IGZ1bmN0aW9uIChuYW1lLCBwYXRoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVDsgcGF0aD0nICsgKHBhdGggfHwgbGFyb3V4X3ZhcnMuY29va2llUGF0aCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9jYWw6IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gbG9jYWxTdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW25hbWVdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMb2NhbDogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTG9jYWw6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgbG9jYWxTdG9yYWdlW25hbWVdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNlc3Npb246IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gc2Vzc2lvblN0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZVtuYW1lXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZVtuYW1lXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHNlc3Npb25TdG9yYWdlW25hbWVdO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdmFycztcblxufSgpKTtcbiIsIi8qZ2xvYmFsIE5vZGVMaXN0LCBOb2RlICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHdyYXBwZXJcbiAgICB2YXIgbGFyb3V4X3dyYXBwZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uO1xuXG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3RvcjtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBsYXJvdXhfaGVscGVycy50b0FycmF5KHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IFtzZWxlY3Rvcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBsYXJvdXhfZG9tLnNlbGVjdChzZWxlY3RvciwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlKHNlbGVjdGlvblswXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUoc2VsZWN0aW9uKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuaXNBcnJheSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfd3JhcHBlcihzZWxlY3RvciwgdGhpcy5zb3VyY2UpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlID0gZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gZWxlbWVudHM7XG4gICAgICAgIHRoaXMuaXNBcnJheSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZVtpbmRleF07XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCA9IDA7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUgPSAxO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXkgPSAyO1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIgPSBmdW5jdGlvbiAobmFtZSwgZm5jLCBzY29wZSkge1xuICAgICAgICB2YXIgbmV3Rm5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYy5hcHBseShcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIFt0aGlzLnNvdXJjZV0uY29uY2F0KGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiAocmVzdWx0ID09PSB1bmRlZmluZWQpID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICAgIGNhc2UgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGU6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5OlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2F0dHInLCBsYXJvdXhfZG9tLmF0dHIsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignZGF0YScsIGxhcm91eF9kb20uZGF0YSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvbicsIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb24nLCBsYXJvdXhfZG9tLnNldEV2ZW50LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5KTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb2ZmJywgbGFyb3V4X2RvbS51bnNldEV2ZW50LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdjbGVhcicsIGxhcm91eF9kb20uY2xlYXIsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5zZXJ0JywgbGFyb3V4X2RvbS5pbnNlcnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncHJlcGVuZCcsIGxhcm91eF9kb20ucHJlcGVuZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhcHBlbmQnLCBsYXJvdXhfZG9tLmFwcGVuZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZXBsYWNlJywgbGFyb3V4X2RvbS5yZXBsYWNlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlcGxhY2VUZXh0JywgbGFyb3V4X2RvbS5yZXBsYWNlVGV4dCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZW1vdmUnLCBsYXJvdXhfZG9tLnJlbW92ZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hhc0NsYXNzJywgbGFyb3V4X2Nzcy5oYXNDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhZGRDbGFzcycsIGxhcm91eF9jc3MuYWRkQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlbW92ZUNsYXNzJywgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigndG9nZ2xlQ2xhc3MnLCBsYXJvdXhfY3NzLnRvZ2dsZUNsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdnZXRQcm9wZXJ0eScsIGxhcm91eF9jc3MuZ2V0UHJvcGVydHksIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2V0UHJvcGVydHknLCBsYXJvdXhfY3NzLnNldFByb3BlcnR5LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzZXRUcmFuc2l0aW9uJywgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzaG93JywgbGFyb3V4X2Nzcy5zaG93LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoaWRlJywgbGFyb3V4X2Nzcy5oaWRlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoZWlnaHQnLCBsYXJvdXhfY3NzLmhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbm5lckhlaWdodCcsIGxhcm91eF9jc3MuaW5uZXJIZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb3V0ZXJIZWlnaHQnLCBsYXJvdXhfY3NzLm91dGVySGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3dpZHRoJywgbGFyb3V4X2Nzcy53aWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbm5lcldpZHRoJywgbGFyb3V4X2Nzcy5pbm5lcldpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ291dGVyV2lkdGgnLCBsYXJvdXhfY3NzLm91dGVyV2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigndG9wJywgbGFyb3V4X2Nzcy50b3AsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignbGVmdCcsIGxhcm91eF9jc3MubGVmdCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhYm92ZVRoZVRvcCcsIGxhcm91eF9jc3MuYWJvdmVUaGVUb3AsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYmVsb3dUaGVGb2xkJywgbGFyb3V4X2Nzcy5iZWxvd1RoZUZvbGQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignbGVmdE9mU2NyZWVuJywgbGFyb3V4X2Nzcy5sZWZ0T2ZTY3JlZW4sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmlnaHRPZlNjcmVlbicsIGxhcm91eF9jc3MucmlnaHRPZlNjcmVlbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpblZpZXdwb3J0JywgbGFyb3V4X2Nzcy5pblZpZXdwb3J0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG5cbiAgICByZXR1cm4gbGFyb3V4X3dyYXBwZXI7XG5cbn0oKSk7XG4iXX0=
