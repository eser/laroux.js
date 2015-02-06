/**
 * laroux.js - A jquery substitute for modern browsers
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                if (!('withCredentials' in laroux_ajax.xmlHttpRequestObject) && window.XDomainRequest !== undefined) {
                    laroux_ajax.xDomainObject = true;

                    if (laroux_ajax.xDomainRequestObject === null) {
                        laroux_ajax.xDomainRequestObject = new window.XDomainRequest();
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

},{"./laroux.events.js":6,"./laroux.helpers.js":8}],2:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_helpers = require('./laroux.helpers.js'),
        laroux_css = require('./laroux.css.js');

    // anim
    var laroux_anim = {
        data: [],

        fx: {
            interpolate: function (source, target, shift) {
                return (source + (target - source) * shift);
            },

            easing: function (pos) {
                return (-Math.cos(pos * Math.PI) / 2) + 0.5;
            }
        },

        // {object, property, from, to, time, unit, reset}
        set: function (newanim) {
            newanim.startTime = null;

            if (newanim.unit === undefined || newanim.unit === null) {
                newanim.unit = '';
            }

            if (newanim.from === undefined || newanim.from === null) {
                if (newanim.object === window.document.body && newanim.property === 'scrollTop') {
                    newanim.from = (window.document.documentElement && window.document.documentElement.scrollTop) || window.document.body.scrollTop;
                } else {
                    newanim.from = newanim.object[newanim.property];
                }
            }

            if (typeof newanim.from === 'string') {
                newanim.from = Number(newanim.from);
            }

            if (newanim.reset === undefined || newanim.reset === null) {
                newanim.reset = false;
            }

            // if (newanim.id === undefined) {
            //     newanim.id = laroux_helpers.getUniqueId();
            // }

            laroux_anim.data.push(newanim);
            if (laroux_anim.data.length === 1) {
                window.requestAnimationFrame(laroux_anim.onframe);
            }
        },

        setCss: function (newanim) {
            if (newanim.from === undefined || newanim.from === null) {
                newanim.from = laroux_css.getProperty(newanim.object, newanim.property);
            }

            newanim.object = newanim.object.style;
            newanim.property = laroux_helpers.camelCase(newanim.property);

            laroux_anim.set(newanim);
        },

        remove: function (id) {
            var targetKey = null;

            for (var item in laroux_anim.data) {
                if (!laroux_anim.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux_anim.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux_anim.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        onframe: function (timestamp) {
            var removeKeys = [];
            for (var item in laroux_anim.data) {
                if (!laroux_anim.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux_anim.data[item];
                if (currentItem.startTime === null) {
                    currentItem.startTime = timestamp;
                }

                var result = laroux_anim.step(currentItem, timestamp);

                if (result === false) {
                    removeKeys.unshift(item);
                } else if (timestamp > currentItem.startTime + currentItem.time) {
                    if (currentItem.reset) {
                        currentItem.startTime = timestamp;
                        if (newanim.object === window.document.body && newanim.property == 'scrollTop') {
                            scrollTo(0, currentItem.from);
                            // setTimeout(function () { scrollTo(0, currentItem.from); }, 1);
                        } else {
                            currentItem.object[currentItem.property] = currentItem.from;
                        }
                    } else {
                        removeKeys.unshift(item);
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux_anim.data.splice(removeKeys[item2], 1);
            }

            if (laroux_anim.data.length > 0) {
                requestAnimationFrame(laroux_anim.onframe);
            }
        },

        step: function (newanim, timestamp) {
            var finishT = newanim.startTime + newanim.time,
                shift = (timestamp > finishT) ? 1 : (timestamp - newanim.startTime) / newanim.time;

            var value = laroux_anim.fx.interpolate(
                newanim.from,
                newanim.to,
                laroux_anim.fx.easing(shift)
            ) + newanim.unit;

            if (newanim.object === window.document.body && newanim.property == 'scrollTop') {
                scrollTo(0, value);
                // setTimeout(function () { scrollTo(0, value); }, 1);
            } else {
                newanim.object[newanim.property] = value;
            }
        }
    };

    return laroux_anim;

}());

},{"./laroux.css.js":3,"./laroux.helpers.js":8}],3:[function(require,module,exports){
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
                ((window.document.documentElement && window.document.documentElement.scrollTop) || window.document.body.scrollTop);
        },

        left: function (element) {
            return element.getBoundingClientRect().left +
                ((window.document.documentElement && window.document.documentElement.scrollLeft) || window.document.body.scrollLeft);
        },

        aboveTheTop: function (element) {
            return element.getBoundingClientRect().bottom <= 0;
        },

        belowTheFold: function (element) {
            return element.getBoundingClientRect().top > window.innerHeight;
        },

        leftOfScreen: function (element) {
            return element.getBoundingClientRect().right <= 0;
        },

        rightOfScreen: function (element) {
            return element.getBoundingClientRect().left > window.innerWidth;
        },

        inViewport: function (element) {
            var rect = element.getBoundingClientRect();

            return !(rect.bottom <= 0 || rect.top > window.innerHeight ||
                rect.right <= 0 || rect.left > window.innerWidth);
        }
    };

    return laroux_css;

}());

},{"./laroux.helpers.js":8}],4:[function(require,module,exports){
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
            return window.document.documentElement.classList.contains(propName);
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
                        window.event.returnValue = false;
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
            var customEvent = window.document.createEvent('Event');
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
            var frag = window.document.createDocumentFragment(),
                temp = window.document.createElement('DIV');

            temp.insertAdjacentHTML('beforeend', html);
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }

            // nulling out the reference, there is no obvious dispose method
            temp = null;

            return frag;
        },

        createElement: function (element, attributes, children) {
            var elem = window.document.createElement(element);

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

            var option = window.document.createElement('OPTION');
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
                var image = window.document.createElement('IMG');
                image.setAttribute('src', arguments[i]);

                images.push(image);
            }

            return images;
        },

        loadAsyncScript: function (path, triggerName, async) {
            var elem = window.document.createElement('script');

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

            var head = window.document.getElementsByTagName('head')[0];
            head.appendChild(elem);
        },

        loadAsyncStyle: function (path, triggerName, async) {
            var elem = window.document.createElement('LINK');

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

            var head = window.document.getElementsByTagName('head')[0];
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
    if (typeof window !== 'undefined') {
        if (window.Element.prototype.remove === undefined) {
            window.Element.prototype.remove = function () {
                if (this.parentElement !== null) {
                    this.parentElement.removeChild(this);
                }
            };
        }
    }

    return laroux_dom;

}());

},{"./laroux.helpers.js":8}],6:[function(require,module,exports){
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

    var laroux_dom = require('./laroux.dom.js'),
        laroux_ajax = require('./laroux.ajax.js');

    // forms
    var laroux_forms = {
        ajaxForm: function (formobj, fnc, fncBegin) {
            laroux_dom.setEvent(formobj, 'submit', function () {
                if (fncBegin !== undefined) {
                    fncBegin();
                }

                laroux_ajax.post(
                    formobj.getAttribute('action'),
                    laroux_forms.serializeFormData(formobj),
                    fnc
                );

                return false;
            });
        },

        isFormField: function (element) {
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

        getFormFieldValue: function (element) {
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

        setFormFieldValue: function (element, value) {
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

            if (element.tagName == 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type == 'FILE') {
                    element.files[0] = value;
                    return;
                }

                if (type == 'CHECKBOX' || type == 'RADIO') {
                    if (value === true || value == element.value) {
                        element.checked = true;
                    }

                    return;
                }

                if (type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
                    element.value = value;
                    return;
                }

                return;
            }

            if (element.tagName == 'TEXTAREA') {
                element.value = value;
                return;
            }
        },

        toggleFormEditing: function (formobj, value) {
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
                if (!laroux_forms.isFormField(selection[selected])) {
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

        serializeFormData: function (formobj) {
            var formdata = new FormData();
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = laroux_forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    formdata.append(selection[selected].getAttribute('name'), value);
                }
            }

            return formdata;
        },

        serialize: function (formobj) {
            var values = {};
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = laroux_forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    values[selection[selected].getAttribute('name')] = value;
                }
            }

            return values;
        },

        deserialize: function (formobj, data) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                laroux_forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
            }
        }
    };

    return laroux_forms;

}());

},{"./laroux.ajax.js":1,"./laroux.dom.js":5}],8:[function(require,module,exports){
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

                if (!dontSkipReturns && result !== undefined) {
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

                if (!dontSkipReturns && result !== undefined) {
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

},{}],9:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    // core
    var laroux = function (selector, parent) {
        if (selector instanceof Array) {
            return laroux.helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        }

        /*
        // FIXME: non-chrome optimization
        var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        if (re) {
            if (parent === undefined) {
                return document.getElementById(re[1]);
            }

            return parent.getElementById(re[1]);
        }
        */

        return (parent || document).querySelector(selector);
    };

    laroux.events = require('./laroux.events.js');
    laroux.helpers = require('./laroux.helpers.js');
    laroux.timers = require('./laroux.timers.js');

    laroux.cached = {
        single: {},
        array: {},
        id: {}
    };

    laroux.c = function (selector) {
        if (selector instanceof Array) {
            return laroux.cached.array[selector] || (
                laroux.cached.array[selector] = laroux.helpers.toArray(
                    document.querySelectorAll(selector)
                )
            );
        }

        return laroux.cached.single[selector] || (
            laroux.cached.single[selector] = document.querySelector(selector)
        );
    };

    laroux.id = function (selector, parent) {
        return (parent || document).getElementById(selector);
    };

    laroux.idc = function (selector) {
        return laroux.cached.id[selector] ||
            (laroux.cached.id[selector] = document.getElementById(selector));
    };

    laroux.readyPassed = false;

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

    laroux.ready = function (fnc) {
        if (!laroux.readyPassed) {
            laroux.events.add('ContentLoaded', fnc);
            return;
        }

        fnc();
    };

    if (typeof window !== 'undefined') {
        window.document.addEventListener(
            'DOMContentLoaded',
            function () {
                if (!laroux.readyPassed) {
                    laroux.events.invoke('ContentLoaded');
                    window.setInterval(laroux.timers.ontick, 100);
                    laroux.readyPassed = true;
                }
            }
        );

        if (!('$l' in window)) {
            window.$l = laroux;
        }
    }

    // optional modules
    laroux.wrapper = require('./laroux.wrapper.js');
    laroux.ajax = require('./laroux.ajax.js');
    laroux.css = require('./laroux.css.js');
    laroux.dom = require('./laroux.dom.js');
    laroux.events = require('./laroux.events.js');
    laroux.forms = require('./laroux.forms.js');
    laroux.helpers = require('./laroux.helpers.js');
    laroux.timers = require('./laroux.timers.js');
    laroux.triggers = require('./laroux.triggers.js');
    laroux.vars = require('./laroux.vars.js');

    laroux.anim = require('./laroux.anim.js');
    laroux.date = require('./laroux.date.js');
    laroux.keys = require('./laroux.keys.js');
    laroux.mvc = require('./laroux.mvc.js');
    laroux.stack = require('./laroux.stack.js');
    laroux.templates = require('./laroux.templates.js');
    laroux.touch = require('./laroux.touch.js');
    laroux.ui = require('./laroux.ui.js');

    return laroux;

}());

},{"./laroux.ajax.js":1,"./laroux.anim.js":2,"./laroux.css.js":3,"./laroux.date.js":4,"./laroux.dom.js":5,"./laroux.events.js":6,"./laroux.forms.js":7,"./laroux.helpers.js":8,"./laroux.keys.js":10,"./laroux.mvc.js":11,"./laroux.stack.js":12,"./laroux.templates.js":13,"./laroux.timers.js":14,"./laroux.touch.js":15,"./laroux.triggers.js":16,"./laroux.ui.js":17,"./laroux.vars.js":18,"./laroux.wrapper.js":19}],10:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_forms = require('./laroux.forms.js');

    // keys
    var laroux_keys = {
        keyName: function (keycode) {
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
        assign: function (options) {
            var wrapper = function (event) {
                if (!event) {
                    event = window.event;
                }

                var element = event.target || event.srcElement;
                if (element.nodeType === 3 || element.nodeType === 11) { // element.nodeType === 1 ||
                    element = element.parentNode;
                }

                if (options.disableInputs && laroux_forms.isFormField(element)) {
                    return;
                }

                if (options.shift && !event.shiftKey) {
                    return;
                }

                if (options.ctrl && !event.ctrlKey) {
                    return;
                }

                if (options.alt && !event.altKey) {
                    return;
                }

                var key = laroux_keys.keyName(options.key);
                if (key !== (event.keyCode || event.which)) {
                    return;
                }

                options.fnc(event);

                return false;
            };

            laroux_dom.setEvent(options.target || window.document, 'keydown', wrapper);
        }
    };

    return laroux_keys;

}());

},{"./laroux.dom.js":5,"./laroux.forms.js":7}],11:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_helpers = require('./laroux.helpers.js'),
        laroux_stack = require('./laroux.stack.js');

    // mvc
    var laroux_mvc = {
        apps: {},
        pauseUpdate: false,

        init: function (element, model) {
            if (element.constructor === String) {
                element = laroux_dom.selectById(element);
            }

            // if (model.constructor !== laroux_stack) {
            //     model = new laroux_stack(model);
            // }

            var appKey = element.getAttribute('id');

            model.onupdate = function (event) {
                if (!laroux_mvc.pauseUpdate) {
                    laroux_mvc.update(appKey); // , [event.key]
                }
            };

            laroux_mvc.apps[appKey] = {
                element: element,
                model: model // ,
                // modelKeys: null,
                // boundElements: null,
                // eventElements: null
            };

            laroux_mvc.rebind(appKey);
        },

        rebind: function (appKey) {
            var app = laroux_mvc.apps[appKey];
            /*jslint nomen: true */
            app.modelKeys = laroux_helpers.getKeysRecursive(app.model._data); // FIXME: works only for $l.stack
            app.boundElements = {};
            app.eventElements = [];

            laroux_mvc.scanElements(app, app.element);
            laroux_mvc.update(appKey);

            var fnc = function (ev, elem) {
                var binding = laroux_mvc.bindStringParser(elem.getAttribute('lr-event'));
                // laroux_mvc.pauseUpdate = true;
                for (var item in binding) {
                    if (item === null || !binding.hasOwnProperty(item)) {
                        continue;
                    }

                    if (binding[item].charAt(0) == '\'') {
                        app.model[item] = binding[item].substring(1, binding[item].length - 1);
                    } else if (binding[item].substring(0, 5) == 'attr.') {
                        app.model[item] = elem.getAttribute(binding[item].substring(5));
                    } else if (binding[item].substring(0, 5) == 'prop.') {
                        app.model[item] = elem[binding[item].substring(5)];
                    }
                }
                // laroux_mvc.pauseUpdate = false;
            };

            for (var i = 0, length = app.eventElements.length; i < length; i++) {
                laroux_dom.setEvent(
                    app.eventElements[i].element,
                    app.eventElements[i].binding[null],
                    fnc
                );
            }
        },

        scanElements: function (app, element) {
            for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
                if (atts[i].name == 'lr-bind') {
                    var binding1 = laroux_mvc.bindStringParser(atts[i].value);

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
                } else if (atts[i].name == 'lr-event') {
                    var binding2 = laroux_mvc.bindStringParser(atts[i].value);

                    app.eventElements.push({
                        element: element,
                        binding: binding2
                    });
                }
            }

            for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
                if (chldrn[j].nodeType === 1) {
                    laroux_mvc.scanElements(app, chldrn[j]);
                }
            }
        },

        update: function (appKey, keys) {
            var app = laroux_mvc.apps[appKey];

            if (typeof keys == 'undefined') {
                keys = app.modelKeys;
            }

            for (var i = 0, length1 = keys.length; i < length1; i++) {
                if (!(keys[i] in app.boundElements)) {
                    continue;
                }

                var boundElement = app.boundElements[keys[i]];

                for (var j = 0, length2 = boundElement.length; j < length2; j++) {
                    if (boundElement[j].target.substring(0, 6) == 'style.') {
                        boundElement[j].element.style[boundElement[j].target.substring(6)] = laroux_helpers.getElement(app.model, keys[i]);
                    } else if (boundElement[j].target.substring(0, 5) == 'attr.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element.setAttribute(boundElement[j].target.substring(5), laroux_helpers.getElement(app.model, keys[i]));
                    } else if (boundElement[j].target.substring(0, 5) == 'prop.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element[boundElement[j].target.substring(5)] = laroux_helpers.getElement(app.model, keys[i]);
                    }
                }
            }
        },

        bindStringParser: function (text) {
            var lastBuffer = null,
                buffer = '',
                state = 0,
                result = {};

            for (var i = 0, length = text.length; i < length; i++) {
                var curr = text.charAt(i);

                if (state === 0) {
                    if (curr == ':') {
                        state = 1;
                        lastBuffer = buffer.trim();
                        buffer = '';
                        continue;
                    }
                }

                if (curr == ',') {
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

    return laroux_mvc;

}());

},{"./laroux.dom.js":5,"./laroux.helpers.js":8,"./laroux.stack.js":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
                    return window.Hogan.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled.render(model);
                }
            },

            mustache: {
                compile: function (template, options) {
                    return window.Mustache.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            handlebars: {
                compile: function (template, options) {
                    return window.Handlebars.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            lodash: {
                compile: function (template, options) {
                    /*jslint nomen: true */
                    return window._.compile(template, null, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            underscore: {
                compile: function (template, options) {
                    /*jslint nomen: true */
                    return window._.compile(template, null, options);
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

},{"./laroux.dom.js":5,"./laroux.helpers.js":8}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js');

    // touch - partially taken from 'tocca.js' project
    //         can be found at: https://github.com/GianlucaGuarini/Tocca.js
    var laroux_touch = {
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

        locatePointer: function (event) {
            if (event.targetTouches) {
                event = event.targetTouches[0];
            }

            laroux_touch.pos = [event.pageX, event.pageY];
        },

        init: function () {
            var events = [
                0,
                (navigator.msPointerEnabled) ? 2 : 1,
                3
            ];

            for (var i = 0, length = events.length; i < length; i++) {
                laroux_dom.setEventSingle(document, laroux_touch.events.start[events[i]], laroux_touch.onstart);
                laroux_dom.setEventSingle(document, laroux_touch.events.end[events[i]], laroux_touch.onend);
                laroux_dom.setEventSingle(document, laroux_touch.events.move[events[i]], laroux_touch.locatePointer);
            }
        },

        onstart: function (event) {
            laroux_touch.locatePointer(event);
            laroux_touch.cached = [laroux_touch.pos[0], laroux_touch.pos[1]];
            laroux_touch.touchStarted = Date.now();
            /*jslint plusplus: true */
            laroux_touch.tapCount++;

            var fnc = function () {
                if (laroux_touch.cached[0] >= laroux_touch.pos[0] - laroux_touch.precision &&
                        laroux_touch.cached[0] <= laroux_touch.pos[0] + laroux_touch.precision &&
                        laroux_touch.cached[1] >= laroux_touch.pos[1] - laroux_touch.precision &&
                        laroux_touch.cached[1] <= laroux_touch.pos[1] + laroux_touch.precision) {
                    if (laroux_touch.touchStarted === null) {
                        laroux_dom.dispatchEvent(
                            event.target,
                            (laroux_touch.tapCount === 2) ? 'dbltap' : 'tap',
                            {
                                innerEvent: event,
                                x: laroux_touch.pos[0],
                                y: laroux_touch.pos[1]
                            }
                        );

                        laroux_touch.tapCount = 0;
                        return;
                    }

                    if (Date.now() - laroux_touch.touchStarted > laroux_touch.longTapTreshold) {
                        laroux_dom.dispatchEvent(
                            event.target,
                            'longtap',
                            {
                                innerEvent: event,
                                x: laroux_touch.pos[0],
                                y: laroux_touch.pos[1]
                            }
                        );

                        laroux_touch.touchStarted = null;
                        laroux_touch.tapCount = 0;
                        return;
                    }

                    laroux_touch.tapTimer = setTimeout(fnc, laroux_touch.tapTreshold);
                    return;
                }

                laroux_touch.tapCount = 0;
            };

            clearTimeout(laroux_touch.tapTimer);
            laroux_touch.tapTimer = setTimeout(fnc, laroux_touch.tapTreshold);
        },

        onend: function (event) {
            var delta = [
                    laroux_touch.pos[0] - laroux_touch.cached[0],
                    laroux_touch.pos[1] - laroux_touch.cached[1]
                ],
                data = {
                    innerEvent: event,
                    x: laroux_touch.pos[0],
                    y: laroux_touch.pos[1],
                    distance: {
                        x: Math.abs(delta[0]),
                        y: Math.abs(delta[1])
                    }
                };

            laroux_touch.touchStarted = null;

            if (delta[0] <= -laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swiperight', data);
            }

            if (delta[0] >= laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swipeleft', data);
            }

            if (delta[1] <= -laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swipedown', data);
            }

            if (delta[1] >= laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swipeup', data);
            }
        }
    };

    return laroux_touch;

}());

},{"./laroux.dom.js":5}],16:[function(require,module,exports){
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

},{"./laroux.helpers.js":8}],17:[function(require,module,exports){
module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_helpers = require('./laroux.helpers.js'),
        laroux_css = require('./laroux.css.js'),
        laroux_timers = require('./laroux.timers.js'),
        laroux_date = require('./laroux.date.js');

    // ui
    var laroux_ui = {
        floatContainer: null,

        popup: {
            defaultTimeout: 500,

            createBox: function (id, xclass, message) {
                return laroux_dom.createElement('DIV', { id: id, 'class': xclass }, message);
            },

            msgbox: function (timeout, message) {
                var id = laroux_helpers.getUniqueId(),
                    obj = laroux_ui.popup.createBox(id, 'larouxMsgBox', message);
                laroux_ui.floatContainer.appendChild(obj);

                laroux_css.setProperty(obj, { opacity: 1 });

                laroux_timers.set({
                    timeout: timeout,
                    reset: false,
                    ontick: function (x) {
                        // laroux_css.setProperty(x, { opacity: 0 });
                        laroux_dom.remove(x);
                    },
                    state: obj
                });
            }
        },

        loading: {
            elementSelector: null,
            element: null,
            defaultDelay: 1500,
            timer: null,

            killTimer: function () {
                clearTimeout(laroux_ui.loading.timer);
            },

            hide: function () {
                laroux_ui.loading.killTimer();

                laroux_css.setProperty(laroux_ui.loading.element, { display: 'none' });
                localStorage.loadingIndicator = 'false';
            },

            show: function (delay) {
                laroux_ui.loading.killTimer();

                if (delay === undefined) {
                    delay = laroux_ui.loading.defaultDelay;
                }

                if (delay > 0) {
                    setTimeout(function () { laroux_ui.loading.show(0); }, delay);
                } else {
                    laroux_css.setProperty(laroux_ui.loading.element, { display: 'block' });
                    localStorage.loadingIndicator = 'true';
                }
            },

            init: function () {
                if (laroux_ui.loading.element === null && laroux_ui.loading.elementSelector !== null) {
                    laroux_ui.loading.element = laroux_dom.selectSingle(laroux_ui.loading.elementSelector);
                }

                if (laroux_ui.loading.element !== null) {
                    laroux_dom.setEvent(window, 'load', laroux_ui.loading.hide);
                    laroux_dom.setEvent(window, 'beforeunload', laroux_ui.loading.show);

                    if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator === 'true') {
                        laroux_ui.loading.show(0);
                    } else {
                        laroux_ui.loading.show();
                    }
                }
            }
        },

        dynamicDates: {
            updateDatesElements: null,

            updateDates: function () {
                if (laroux_ui.dynamicDates.updateDatesElements === null) {
                    laroux_ui.dynamicDates.updateDatesElements = laroux_dom.select('*[data-epoch]');
                }

                for (var item in laroux_ui.dynamicDates.updateDatesElements) {
                    if (!laroux_ui.dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                        continue;
                    }

                    var obj = laroux_ui.dynamicDates.updateDatesElements[item];
                    // bitshifting (str >> 0) used instead of parseInt(str, 10)
                    var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

                    laroux_dom.replace(
                        obj,
                        laroux_date.getDateString(date)
                    );

                    obj.setAttribute('title', laroux_date.getLongDateString(date));
                }
            },

            init: function () {
                laroux_timers.set({
                    timeout: 500,
                    reset: true,
                    ontick: laroux_ui.dynamicDates.updateDates
                });
            }
        },

        scrollView: {
            selectedElements: [],

            onhidden: function (elements) {
                laroux_css.setProperty(elements, { opacity: 0 });
                laroux_css.setTransition(elements, ['opacity']);
            },

            onreveal: function (elements) {
                laroux_css.setProperty(elements, { opacity: 1 });
            },

            set: function (element) {
                var elements = laroux_helpers.getAsArray(element);

                for (var i = 0, length = elements.length; i < length; i++) {
                    if (!laroux_css.inViewport(elements[i])) {
                        laroux_ui.scrollView.selectedElements.push(elements[i]);
                    }
                }

                laroux_ui.scrollView.onhidden(laroux_ui.scrollView.selectedElements);
                laroux_dom.setEvent(window, 'scroll', laroux_ui.scrollView.reveal);
            },

            reveal: function () {
                var removeKeys = [],
                    elements = [];

                laroux_helpers.each(
                    laroux_ui.scrollView.selectedElements,
                    function (i, element) {
                        if (laroux_css.inViewport(element)) {
                            removeKeys.unshift(i);
                            elements.push(element);
                        }
                    }
                );

                for (var item in removeKeys) {
                    if (!removeKeys.hasOwnProperty(item)) {
                        continue;
                    }

                    laroux_ui.scrollView.selectedElements.splice(removeKeys[item], 1);
                }

                if (laroux_ui.scrollView.selectedElements.length === 0) {
                    laroux_dom.unsetEvent(window, 'scroll', laroux_ui.scrollView.reveal);
                }

                if (elements.length > 0) {
                    laroux_ui.scrollView.onreveal(elements);
                }
            }
        },

        createFloatContainer: function () {
            if (!laroux_ui.floatContainer) {
                laroux_ui.floatContainer = laroux_dom.createElement('DIV', { 'class': 'larouxFloatDiv' });
                window.document.body.insertBefore(laroux_ui.floatContainer, window.document.body.firstChild);
            }
        },

        init: function () {
            laroux_ui.createFloatContainer();
            laroux_ui.loading.init();
            laroux_ui.dynamicDates.init();
        }
    };

    return laroux_ui;

}());

},{"./laroux.css.js":3,"./laroux.date.js":4,"./laroux.dom.js":5,"./laroux.helpers.js":8,"./laroux.timers.js":14}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"./laroux.css.js":3,"./laroux.dom.js":5,"./laroux.helpers.js":8}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGFyb3V4LmFqYXguanMiLCJzcmMvbGFyb3V4LmFuaW0uanMiLCJzcmMvbGFyb3V4LmNzcy5qcyIsInNyYy9sYXJvdXguZGF0ZS5qcyIsInNyYy9sYXJvdXguZG9tLmpzIiwic3JjL2xhcm91eC5ldmVudHMuanMiLCJzcmMvbGFyb3V4LmZvcm1zLmpzIiwic3JjL2xhcm91eC5oZWxwZXJzLmpzIiwic3JjL2xhcm91eC5qcyIsInNyYy9sYXJvdXgua2V5cy5qcyIsInNyYy9sYXJvdXgubXZjLmpzIiwic3JjL2xhcm91eC5zdGFjay5qcyIsInNyYy9sYXJvdXgudGVtcGxhdGVzLmpzIiwic3JjL2xhcm91eC50aW1lcnMuanMiLCJzcmMvbGFyb3V4LnRvdWNoLmpzIiwic3JjL2xhcm91eC50cmlnZ2Vycy5qcyIsInNyYy9sYXJvdXgudWkuanMiLCJzcmMvbGFyb3V4LnZhcnMuanMiLCJzcmMvbGFyb3V4LndyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyBhamF4IC0gcGFydGlhbGx5IHRha2VuIGZyb20gJ2pxdWVyeSBpbiBwYXJ0cycgcHJvamVjdFxuICAgIC8vICAgICAgICBjYW4gYmUgZm91bmQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9teXRoei9qcXVpcC9cbiAgICB2YXIgbGFyb3V4X2FqYXggPSB7XG4gICAgICAgIGNvcnNEZWZhdWx0OiBmYWxzZSxcblxuICAgICAgICB3cmFwcGVyczoge1xuICAgICAgICAgICAgcmVnaXN0cnk6IHtcbiAgICAgICAgICAgICAgICAnbGFyb3V4LmpzJzogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiAnICsgZGF0YS5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iajtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5mb3JtYXQgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5mb3JtYXQgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZXZhbChkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGlmIChkYXRhLmZvcm1hdCA9PSAneG1sJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5hbWUsIGZuYykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W25hbWVdID0gZm5jO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHhEb21haW5PYmplY3Q6IGZhbHNlLFxuICAgICAgICB4bWxIdHRwUmVxdWVzdE9iamVjdDogbnVsbCxcbiAgICAgICAgeERvbWFpblJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhocjogZnVuY3Rpb24gKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICBpZiAobGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3Jvc3NEb21haW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoISgnd2l0aENyZWRlbnRpYWxzJyBpbiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCkgJiYgd2luZG93LlhEb21haW5SZXF1ZXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdCA9IG5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5PYmplY3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHhoclJlc3A6IGZ1bmN0aW9uICh4aHIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyRnVuY3Rpb24gPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVzcG9uc2UtV3JhcHBlci1GdW5jdGlvbicpLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAnanNvbicpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgLypqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBldmFsKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAneG1sJykge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlWE1MO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3cmFwcGVyRnVuY3Rpb24gJiYgKHdyYXBwZXJGdW5jdGlvbiBpbiBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeSkpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W3dyYXBwZXJGdW5jdGlvbl0ocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB3cmFwcGVyRnVuYzogd3JhcHBlckZ1bmN0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ha2VSZXF1ZXN0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGNvcnMgPSBvcHRpb25zLmNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgeGhyID0gbGFyb3V4X2FqYXgueGhyKGNvcnMpLFxuICAgICAgICAgICAgICAgIHVybCA9IG9wdGlvbnMudXJsLFxuICAgICAgICAgICAgICAgIHRpbWVyID0gbnVsbCxcbiAgICAgICAgICAgICAgICBuID0gMDtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWVvdXRGbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aW1lb3V0Rm4ob3B0aW9ucy51cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRpbWVvdXRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBsYXJvdXhfYWpheC54aHJSZXNwKHhociwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHhociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4RXJyb3InLCBbeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VjY2VzcyAhPT0gdW5kZWZpbmVkICYmIHJlcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MocmVzLnJlc3BvbnNlLCByZXMud3JhcHBlckZ1bmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4U3VjY2VzcycsIFt4aHIsIHJlcy5yZXNwb25zZSwgcmVzLndyYXBwZXJGdW5jLCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhFcnJvcicsIFt4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jb21wbGV0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbXBsZXRlKHhociwgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhDb21wbGV0ZScsIFt4aHIsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByb2dyZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wcm9ncmVzcygrK24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmdldGRhdGEgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmdldGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5nZXRkYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gbGFyb3V4X2hlbHBlcnMuYnVpbGRRdWVyeVN0cmluZyhvcHRpb25zLmdldGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnlTdHJpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArIHF1ZXJ5U3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArIG9wdGlvbnMuZ2V0ZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmpzb25wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgJ2pzb25wPScgKyBvcHRpb25zLmpzb25wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWxhcm91eF9hamF4LnhEb21haW5PYmplY3QpIHtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihvcHRpb25zLnR5cGUsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKG9wdGlvbnMudHlwZSwgdXJsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy54aHJGaWVsZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMueGhyRmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMueGhyRmllbGRzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhocltpXSA9IG9wdGlvbnMueGhyRmllbGRzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy53cmFwcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydYLVdyYXBwZXItRnVuY3Rpb24nXSA9ICdsYXJvdXguanMnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiBpbiBoZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihqLCBoZWFkZXJzW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnBvc3RkYXRhID09PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5wb3N0ZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChvcHRpb25zLnBvc3RkYXRhdHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLnBvc3RkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChsYXJvdXhfaGVscGVycy5idWlsZEZvcm1EYXRhKG9wdGlvbnMucG9zdGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQob3B0aW9ucy5wb3N0ZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRKc29uOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEpzb25QOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBtZXRob2QsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAganNvbnA6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTY3JpcHQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YXR5cGU6ICdmb3JtJyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3RKc29uOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2FqYXg7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyk7XG5cbiAgICAvLyBhbmltXG4gICAgdmFyIGxhcm91eF9hbmltID0ge1xuICAgICAgICBkYXRhOiBbXSxcblxuICAgICAgICBmeDoge1xuICAgICAgICAgICAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uIChzb3VyY2UsIHRhcmdldCwgc2hpZnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHNvdXJjZSArICh0YXJnZXQgLSBzb3VyY2UpICogc2hpZnQpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgtTWF0aC5jb3MocG9zICogTWF0aC5QSSkgLyAyKSArIDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyB7b2JqZWN0LCBwcm9wZXJ0eSwgZnJvbSwgdG8sIHRpbWUsIHVuaXQsIHJlc2V0fVxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdhbmltKSB7XG4gICAgICAgICAgICBuZXdhbmltLnN0YXJ0VGltZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLnVuaXQgPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLnVuaXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLnVuaXQgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0uZnJvbSA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0uZnJvbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gd2luZG93LmRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PT0gJ3Njcm9sbFRvcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gKHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8IHdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSBuZXdhbmltLm9iamVjdFtuZXdhbmltLnByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmV3YW5pbS5mcm9tID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IE51bWJlcihuZXdhbmltLmZyb20pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS5yZXNldCA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0ucmVzZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChuZXdhbmltLmlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vICAgICBuZXdhbmltLmlkID0gbGFyb3V4X2hlbHBlcnMuZ2V0VW5pcXVlSWQoKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgbGFyb3V4X2FuaW0uZGF0YS5wdXNoKG5ld2FuaW0pO1xuICAgICAgICAgICAgaWYgKGxhcm91eF9hbmltLmRhdGEubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsYXJvdXhfYW5pbS5vbmZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDc3M6IGZ1bmN0aW9uIChuZXdhbmltKSB7XG4gICAgICAgICAgICBpZiAobmV3YW5pbS5mcm9tID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS5mcm9tID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gbGFyb3V4X2Nzcy5nZXRQcm9wZXJ0eShuZXdhbmltLm9iamVjdCwgbmV3YW5pbS5wcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5ld2FuaW0ub2JqZWN0ID0gbmV3YW5pbS5vYmplY3Quc3R5bGU7XG4gICAgICAgICAgICBuZXdhbmltLnByb3BlcnR5ID0gbGFyb3V4X2hlbHBlcnMuY2FtZWxDYXNlKG5ld2FuaW0ucHJvcGVydHkpO1xuXG4gICAgICAgICAgICBsYXJvdXhfYW5pbS5zZXQobmV3YW5pbSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF9hbmltLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9hbmltLmRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X2FuaW0uZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEuc3BsaWNlKHRhcmdldEtleSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbmZyYW1lOiBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfYW5pbS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfYW5pbS5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF9hbmltLmRhdGFbaXRlbV07XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLnN0YXJ0VGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5zdGFydFRpbWUgPSB0aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxhcm91eF9hbmltLnN0ZXAoY3VycmVudEl0ZW0sIHRpbWVzdGFtcCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aW1lc3RhbXAgPiBjdXJyZW50SXRlbS5zdGFydFRpbWUgKyBjdXJyZW50SXRlbS50aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uc3RhcnRUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld2FuaW0ub2JqZWN0ID09PSB3aW5kb3cuZG9jdW1lbnQuYm9keSAmJiBuZXdhbmltLnByb3BlcnR5ID09ICdzY3JvbGxUb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG8oMCwgY3VycmVudEl0ZW0uZnJvbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNjcm9sbFRvKDAsIGN1cnJlbnRJdGVtLmZyb20pOyB9LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ub2JqZWN0W2N1cnJlbnRJdGVtLnByb3BlcnR5XSA9IGN1cnJlbnRJdGVtLmZyb207XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhcm91eF9hbmltLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsYXJvdXhfYW5pbS5vbmZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdGVwOiBmdW5jdGlvbiAobmV3YW5pbSwgdGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgZmluaXNoVCA9IG5ld2FuaW0uc3RhcnRUaW1lICsgbmV3YW5pbS50aW1lLFxuICAgICAgICAgICAgICAgIHNoaWZ0ID0gKHRpbWVzdGFtcCA+IGZpbmlzaFQpID8gMSA6ICh0aW1lc3RhbXAgLSBuZXdhbmltLnN0YXJ0VGltZSkgLyBuZXdhbmltLnRpbWU7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxhcm91eF9hbmltLmZ4LmludGVycG9sYXRlKFxuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSxcbiAgICAgICAgICAgICAgICBuZXdhbmltLnRvLFxuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmZ4LmVhc2luZyhzaGlmdClcbiAgICAgICAgICAgICkgKyBuZXdhbmltLnVuaXQ7XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gd2luZG93LmRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PSAnc2Nyb2xsVG9wJykge1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvKDAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2Nyb2xsVG8oMCwgdmFsdWUpOyB9LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5vYmplY3RbbmV3YW5pbS5wcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2FuaW07XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gY3NzXG4gICAgdmFyIGxhcm91eF9jc3MgPSB7XG4gICAgICAgIC8vIGNsYXNzIGZlYXR1cmVzXG4gICAgICAgIGhhc0NsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjeWNsZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudHMsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbKGkgKyAxKSAlIGxlbmd0aF0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHN0eWxlIGZlYXR1cmVzXG4gICAgICAgIGdldFByb3BlcnR5OiBmdW5jdGlvbiAoZWxlbWVudCwgc3R5bGVOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBzdHlsZU5hbWUgPSBsYXJvdXhfaGVscGVycy5hbnRpQ2FtZWxDYXNlKHN0eWxlTmFtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0UHJvcGVydHk6IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0aWVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW29sZFByb3BlcnRpZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHN0eWxlTmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHN0eWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1N0eWxlTmFtZSA9IGxhcm91eF9oZWxwZXJzLmNhbWVsQ2FzZShzdHlsZU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLnN0eWxlW25ld1N0eWxlTmFtZV0gPSBwcm9wZXJ0aWVzW3N0eWxlTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHRyYW5zaXRpb24gZmVhdHVyZXNcbiAgICAgICAgZGVmYXVsdFRyYW5zaXRpb246ICcycyBlYXNlJyxcblxuICAgICAgICBzZXRUcmFuc2l0aW9uU2luZ2xlOiBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNpdGlvbikge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheSh0cmFuc2l0aW9uKSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgndHJhbnNpdGlvbicpIHx8IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy13ZWJraXQtdHJhbnNpdGlvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy1tcy10cmFuc2l0aW9uJykgfHwgJycsXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5ID0gY3VycmVudFRyYW5zaXRpb25zLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5ID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRyYW5zaXRpb25zLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzdHlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3MgPSB0cmFuc2l0aW9uc1tpdGVtXS5pbmRleE9mKCcgJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZU5hbWUgPSB0cmFuc2l0aW9uc1tpdGVtXS5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvblByb3BlcnRpZXMgPSB0cmFuc2l0aW9uc1tpdGVtXS5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVOYW1lID0gdHJhbnNpdGlvbnNbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzID0gbGFyb3V4X2Nzcy5kZWZhdWx0VHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbnNBcnJheVtqXS50cmltKCkubG9jYWxlQ29tcGFyZShzdHlsZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheVtqXSA9IHN0eWxlTmFtZSArICcgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5LnB1c2goc3R5bGVOYW1lICsgJyAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3VycmVudFRyYW5zaXRpb25zQXJyYXkuam9pbignLCAnKTtcblxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUubXNUcmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvblNpbmdsZShlbGVtZW50c1tpXSwgdHJhbnNpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eSAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB7IG9wYWNpdHk6IDEgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eSAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gbWVhc3VyZW1lbnQgZmVhdHVyZXNcbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aG91dCBwYWRkaW5nLCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBoZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ2hlaWdodCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0LmdldEZsb2F0VmFsdWUoaGVpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBidXQgd2l0aG91dCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBpbm5lckhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYW5kIGJvcmRlciBidXQgbWFyZ2luIG9wdGlvbmFsXG4gICAgICAgIG91dGVySGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCwgaW5jbHVkZU1hcmdpbikge1xuICAgICAgICAgICAgaWYgKGluY2x1ZGVNYXJnaW4gfHwgZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLXRvcCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbSA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1ib3R0b20nKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5zID0gbWFyZ2luVG9wLmdldEZsb2F0VmFsdWUobWFyZ2luVG9wLnByaW1pdGl2ZVR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tLmdldEZsb2F0VmFsdWUobWFyZ2luQm90dG9tLnByaW1pdGl2ZVR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgbWFyZ2lucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRob3V0IHBhZGRpbmcsIG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIHdpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCd3aWR0aCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0LmdldEZsb2F0VmFsdWUoaGVpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGJ1dCB3aXRob3V0IG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIGlubmVyV2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBhbmQgYm9yZGVyIGJ1dCBtYXJnaW4gb3B0aW9uYWxcbiAgICAgICAgb3V0ZXJXaWR0aDogZnVuY3Rpb24gKGVsZW1lbnQsIGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIGlmIChpbmNsdWRlTWFyZ2luIHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1sZWZ0JyksXG4gICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tcmlnaHQnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5zID0gbWFyZ2luTGVmdC5nZXRGbG9hdFZhbHVlKG1hcmdpbkxlZnQucHJpbWl0aXZlVHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodC5nZXRGbG9hdFZhbHVlKG1hcmdpblJpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnQub2Zmc2V0V2lkdGggKyBtYXJnaW5zKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b3A6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgICAgICAgICAgICgod2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHwgd2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsZWZ0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArXG4gICAgICAgICAgICAgICAgKCh3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCkgfHwgd2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWJvdmVUaGVUb3A6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICBiZWxvd1RoZUZvbGQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICByaWdodE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCA+IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluVmlld3BvcnQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiAhKHJlY3QuYm90dG9tIDw9IDAgfHwgcmVjdC50b3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQgfHxcbiAgICAgICAgICAgICAgICByZWN0LnJpZ2h0IDw9IDAgfHwgcmVjdC5sZWZ0ID4gd2luZG93LmlubmVyV2lkdGgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfY3NzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGRhdGVcbiAgICB2YXIgbGFyb3V4X2RhdGUgPSB7XG4gICAgICAgIHNob3J0RGF0ZUZvcm1hdDogJ2RkLk1NLnl5eXknLFxuICAgICAgICBsb25nRGF0ZUZvcm1hdDogJ2RkIE1NTU0geXl5eScsXG4gICAgICAgIHRpbWVGb3JtYXQ6ICdISDptbScsXG5cbiAgICAgICAgbW9udGhzU2hvcnQ6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcbiAgICAgICAgbW9udGhzTG9uZzogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10sXG5cbiAgICAgICAgc3RyaW5nczoge1xuICAgICAgICAgICAgbm93OiAgICAgJ25vdycsXG4gICAgICAgICAgICBsYXRlcjogICAnbGF0ZXInLFxuICAgICAgICAgICAgYWdvOiAgICAgJ2FnbycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2Vjb25kcycsXG4gICAgICAgICAgICBhbWludXRlOiAnYSBtaW51dGUnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0ZXMnLFxuICAgICAgICAgICAgYWhvdXI6ICAgJ2EgaG91cicsXG4gICAgICAgICAgICBob3VyczogICAnaG91cnMnLFxuICAgICAgICAgICAgYWRheTogICAgJ2EgZGF5JyxcbiAgICAgICAgICAgIGRheXM6ICAgICdkYXlzJyxcbiAgICAgICAgICAgIGF3ZWVrOiAgICdhIHdlZWsnLFxuICAgICAgICAgICAgd2Vla3M6ICAgJ3dlZWtzJyxcbiAgICAgICAgICAgIGFtb250aDogICdhIG1vbnRoJyxcbiAgICAgICAgICAgIG1vbnRoczogICdtb250aHMnLFxuICAgICAgICAgICAgYXllYXI6ICAgJ2EgeWVhcicsXG4gICAgICAgICAgICB5ZWFyczogICAneWVhcnMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VFcG9jaDogZnVuY3Rpb24gKHRpbWVzcGFuLCBsaW1pdFdpdGhXZWVrcykge1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAxMDAwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Muc2Vjb25kcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbWludXRlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubWludXRlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWhvdXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5ob3VycztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWRheTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmRheXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDQgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXdlZWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy53ZWVrcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpbWl0V2l0aFdlZWtzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDMwICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbW9udGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5tb250aHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDM2NSAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXllYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MueWVhcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q3VzdG9tRGF0ZVN0cmluZzogZnVuY3Rpb24gKGZvcm1hdCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IGRhdGUgfHwgbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIC95eXl5fHl5fE1NTU18TU1NfE1NfE18ZGR8ZHxoaHxofEhIfEh8bW18bXxzc3xzfHR0fHQvZyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eXl5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0RnVsbFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNMb25nW25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLm1vbnRoc1Nob3J0W25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIChub3cuZ2V0TW9udGgoKSArIDEpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNb250aCgpICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXREYXRlKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldERhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjEgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgKCgoaG91cjEgJSAxMikgPiAwKSA/IGhvdXIxICUgMTIgOiAxMikpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjIgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoKGhvdXIyICUgMTIpID4gMCkgPyBob3VyMiAlIDEyIDogMTI7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0SG91cnMoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0SG91cnMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRNaW51dGVzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldE1pbnV0ZXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRTZWNvbmRzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFNlY29uZHMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BtJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhbSc7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3AnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2EnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF0ZURpZmZTdHJpbmc6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IG5vdyAtIGRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGFic1RpbWVzcGFuID0gTWF0aC5hYnModGltZXNwYW4pLFxuICAgICAgICAgICAgICAgIHBhc3QgPSAodGltZXNwYW4gPiAwKTtcblxuICAgICAgICAgICAgaWYgKGFic1RpbWVzcGFuIDw9IDMwMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5ub3c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aW1lc3BhbnN0cmluZyA9IGxhcm91eF9kYXRlLnBhcnNlRXBvY2goYWJzVGltZXNwYW4sIHRydWUpO1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuc3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuc3RyaW5nICtcbiAgICAgICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgKHBhc3QgPyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFnbyA6IGxhcm91eF9kYXRlLnN0cmluZ3MubGF0ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0U2hvcnREYXRlU3RyaW5nKGRhdGUsIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNob3J0RGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLnNob3J0RGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgZGF0ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMb25nRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0ICsgJyAnICsgbGFyb3V4X2RhdGUudGltZUZvcm1hdCA6IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9kYXRlO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICAgICAgLy8gbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICAvLyBsYXJvdXhfdHJpZ2dlcnMgPSByZXF1aXJlKCcuL2xhcm91eC50cmlnZ2Vycy5qcycpO1xuXG4gICAgLy8gZG9tXG4gICAgdmFyIGxhcm91eF9kb20gPSB7XG4gICAgICAgIGRvY3Byb3A6IGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHByb3BOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeUNsYXNzOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlUYWc6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlJZDogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0U2luZ2xlOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHI6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGRBdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlc1tvbGRBdHRyaWJ1dGVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uIChlbGVtZW50LCBkYXRhbmFtZXMsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBkYXRhbmFtZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YW5hbWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YW5hbWVzID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZERhdGFuYW1lcyA9IGRhdGFuYW1lcztcbiAgICAgICAgICAgICAgICBkYXRhbmFtZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBkYXRhbmFtZXNbb2xkRGF0YW5hbWVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBkYXRhTmFtZSBpbiBkYXRhbmFtZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGFuYW1lcy5oYXNPd25Qcm9wZXJ0eShkYXRhTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhbmFtZXNbZGF0YU5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFOYW1lLCBkYXRhbmFtZXNbZGF0YU5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudEhpc3Rvcnk6IFtdLFxuICAgICAgICBzZXRFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGVsZW1lbnRzW2ldLCBldmVudG5hbWUsIGZuYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RXZlbnRTaW5nbGU6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGZuY1dyYXBwZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChmbmMoZSwgZWxlbWVudCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uZXZlbnRIaXN0b3J5LnB1c2goeyBlbGVtZW50OiBlbGVtZW50LCBldmVudG5hbWU6IGV2ZW50bmFtZSwgZm5jOiBmbmMsIGZuY1dyYXBwZXI6IGZuY1dyYXBwZXIgfSk7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRuYW1lLCBmbmNXcmFwcGVyLCBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5zZXRFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpMSA9IDAsIGxlbmd0aDEgPSBlbGVtZW50cy5sZW5ndGg7IGkxIDwgbGVuZ3RoMTsgaTErKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuZ3RoMiA9IGxhcm91eF9kb20uZXZlbnRIaXN0b3J5Lmxlbmd0aDsgaTIgPCBsZW5ndGgyOyBpMisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gbGFyb3V4X2RvbS5ldmVudEhpc3RvcnlbaTJdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudHNbaTFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudG5hbWUgIT09IHVuZGVmaW5lZCAmJiBpdGVtLmV2ZW50bmFtZSAhPT0gZXZlbnRuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChmbmMgIT09IHVuZGVmaW5lZCAmJiBpdGVtLmZuYyAhPT0gZm5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGl0ZW0uZXZlbnRuYW1lLCBpdGVtLmZuY1dyYXBwZXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGxhcm91eF9kb20uZXZlbnRIaXN0b3J5W2kyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcGF0Y2hFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbUV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN1c3RvbUV2ZW50W2l0ZW1dID0gZGF0YVtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VzdG9tRXZlbnQuaW5pdEV2ZW50KGV2ZW50bmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgICAgIHZhciBmcmFnID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcbiAgICAgICAgICAgICAgICB0ZW1wID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuXG4gICAgICAgICAgICB0ZW1wLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgaHRtbCk7XG4gICAgICAgICAgICB3aGlsZSAodGVtcC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBudWxsaW5nIG91dCB0aGUgcmVmZXJlbmNlLCB0aGVyZSBpcyBubyBvYnZpb3VzIGRpc3Bvc2UgbWV0aG9kXG4gICAgICAgICAgICB0ZW1wID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIGZyYWc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoaXRlbSwgYXR0cmlidXRlc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShpdGVtMiwgY2hpbGRyZW5baXRlbTJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoLyogdHlwZW9mIGNoaWxkcmVuID09ICdzdHJpbmcnICYmICovY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChlbGVtLCBjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVPcHRpb246IGZ1bmN0aW9uIChlbGVtZW50LCBrZXksIHZhbHVlLCBpc0RlZmF1bHQpIHtcbiAgICAgICAgICAgIC8qIG9sZCBiZWhhdmlvdXIsIGRvZXMgbm90IHN1cHBvcnQgb3B0Z3JvdXBzIGFzIHBhcmVudHMuXG4gICAgICAgICAgICB2YXIgY291bnQgPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zW2NvdW50XSA9IG5ldyBPcHRpb24odmFsdWUsIGtleSk7XG5cbiAgICAgICAgICAgIGlmIChpc0RlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9wdGlvbnMuc2VsZWN0ZWRJbmRleCA9IGNvdW50IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHZhciBvcHRpb24gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnT1BUSU9OJyk7XG4gICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSk7XG4gICAgICAgICAgICBpZiAoaXNEZWZhdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKG9wdGlvbiwgdmFsdWUpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5VmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnQub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbaV0uZ2V0QXR0cmlidXRlKCd2YWx1ZScpID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwvKixcblxuICAgICAgICAvLyBUT0RPOiBpdCdzIHJlZHVuZGFudCBmb3Igbm93XG4gICAgICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGltYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lNRycpO1xuICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgYXJndW1lbnRzW2ldKTtcblxuICAgICAgICAgICAgICAgIGltYWdlcy5wdXNoKGltYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGltYWdlcztcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQXN5bmNTY3JpcHQ6IGZ1bmN0aW9uIChwYXRoLCB0cmlnZ2VyTmFtZSwgYXN5bmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLnNyYyA9IHBhdGg7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IHdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQXN5bmNTdHlsZTogZnVuY3Rpb24gKHBhdGgsIHRyaWdnZXJOYW1lLCBhc3luYykge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTElOSycpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICAgICAgZWxlbS5hc3luYyA9IChhc3luYyAhPT0gdW5kZWZpbmVkKSA/IGFzeW5jIDogdHJ1ZTtcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IHBhdGg7XG4gICAgICAgICAgICBlbGVtLnJlbCA9ICdzdHlsZXNoZWV0JztcblxuICAgICAgICAgICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGVsZW0ucmVhZHlTdGF0ZSAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnbG9hZGVkJykgfHwgbG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRyaWdnZXJOYW1lID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJOYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMub250cmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBoZWFkID0gd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICB9LCovXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0OiBmdW5jdGlvbiAoZWxlbWVudCwgcG9zaXRpb24sIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKHBvc2l0aW9uLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmVwZW5kOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZTogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VUZXh0OiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgLy8gbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmVSZXR1cm46IDAsXG4gICAgICAgIGNsb25lQXBwZW5kOiAxLFxuICAgICAgICBjbG9uZUluc2VydEFmdGVyOiAyLFxuICAgICAgICBjbG9uZUluc2VydEJlZm9yZTogMyxcblxuICAgICAgICBjbG9uZTogZnVuY3Rpb24gKGVsZW1lbnQsIHR5cGUsIGNvbnRhaW5lciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkICYmIHR5cGUgIT0gbGFyb3V4X2RvbS5jbG9uZVJldHVybikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IGxhcm91eF9kb20uY2xvbmVBcHBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lSW5zZXJ0QWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUluc2VydEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3RWxlbWVudDtcbiAgICAgICAgfS8qLFxuXG4gICAgICAgIC8vIFRPRE86IGl0J3MgcmVkdW5kYW50IGZvciBub3dcbiAgICAgICAgYXBwbHlPcGVyYXRpb25zOiBmdW5jdGlvbiAoZWxlbWVudCwgb3BlcmF0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgb3BlcmF0aW9uIGluIG9wZXJhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnMuaGFzT3duUHJvcGVydHkob3BlcmF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBiaW5kaW5nIGluIG9wZXJhdGlvbnNbb3BlcmF0aW9uXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnNbb3BlcmF0aW9uXS5oYXNPd25Qcm9wZXJ0eShiaW5kaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcGVyYXRpb25zW29wZXJhdGlvbl1bYmluZGluZ107XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZShlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpKSArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3ZlcHJvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodmFsdWUuc3Vic3RyaW5nKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5hZGRDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCBiaW5kaW5nLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB2YWx1ZSwgJ2luaGVyaXQgIWltcG9ydGFudCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVwZWF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob3BlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgfTtcblxuICAgIC8vIGEgZml4IGZvciBJbnRlcm5ldCBFeHBsb3JlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAod2luZG93LkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGFyb3V4X2RvbTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBldmVudHNcbiAgICB2YXIgbGFyb3V4X2V2ZW50cyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcblxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChldmVudCwgZm5jKSB7XG4gICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcy5wdXNoKHsgZXZlbnQ6IGV2ZW50LCBmbmM6IGZuYyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnZva2U6IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmV2ZW50ICE9IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmZuYyhhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2V2ZW50cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfYWpheCA9IHJlcXVpcmUoJy4vbGFyb3V4LmFqYXguanMnKTtcblxuICAgIC8vIGZvcm1zXG4gICAgdmFyIGxhcm91eF9mb3JtcyA9IHtcbiAgICAgICAgYWpheEZvcm06IGZ1bmN0aW9uIChmb3Jtb2JqLCBmbmMsIGZuY0JlZ2luKSB7XG4gICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KGZvcm1vYmosICdzdWJtaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuY0JlZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm5jQmVnaW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC5wb3N0KFxuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyksXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9mb3Jtcy5zZXJpYWxpemVGb3JtRGF0YShmb3Jtb2JqKSxcbiAgICAgICAgICAgICAgICAgICAgZm5jXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRm9ybUZpZWxkOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdGSUxFJyB8fCB0eXBlID09PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT09ICdSQURJTycgfHwgdHlwZSA9PT0gJ1RFWFQnIHx8IHR5cGUgPT09ICdQQVNTV09SRCcgfHwgdHlwZSA9PT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGb3JtRmllbGRWYWx1ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub3B0aW9uc1tlbGVtZW50LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ0ZJTEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT09ICdSQURJTycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ1RFWFQnIHx8IHR5cGUgPT09ICdQQVNTV09SRCcgfHwgdHlwZSA9PT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Rm9ybUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgb3B0aW9uIGluIGVsZW1lbnQub3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShvcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbb3B0aW9uXS52YWx1ZSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gb3B0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdGSUxFJykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbGVzWzBdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT0gJ1JBRElPJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT0gZWxlbWVudC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnVEVYVCcgfHwgdHlwZSA9PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUZvcm1FZGl0aW5nOiBmdW5jdGlvbiAoZm9ybW9iaiwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm9ybW9iai5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJykgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJywgJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1sYXN0LWVuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2Zvcm1zLmlzRm9ybUZpZWxkKHNlbGVjdGlvbltzZWxlY3RlZF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBsYXN0RGlzYWJsZWQgPSBzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdERpc2FibGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnNldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REaXNhYmxlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmlhbGl6ZUZvcm1EYXRhOiBmdW5jdGlvbiAoZm9ybW9iaikge1xuICAgICAgICAgICAgdmFyIGZvcm1kYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfZm9ybXMuZ2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWRhdGEuYXBwZW5kKHNlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb3JtZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChmb3Jtb2JqKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfZm9ybXMuZ2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzW3NlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoZm9ybW9iaiwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Zvcm1zLnNldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0sIGRhdGFbc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZm9ybXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gaGVscGVyc1xuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHtcbiAgICAgICAgdW5pcXVlSWQ6IDAsXG5cbiAgICAgICAgZ2V0VW5pcXVlSWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICByZXR1cm4gJ3VpZC0nICsgKCsrbGFyb3V4X2hlbHBlcnMudW5pcXVlSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkUXVlcnlTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZXMsIHJmYzM5ODYpIHtcbiAgICAgICAgICAgIHZhciB1cmkgPSAnJyxcbiAgICAgICAgICAgICAgICByZWdFeCA9IC8lMjAvZztcblxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1tuYW1lXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZmMzOTg2IHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmkgKz0gJyYnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpLnJlcGxhY2UocmVnRXgsICcrJykgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVzW25hbWVdLnRvU3RyaW5nKCkpLnJlcGxhY2UocmVnRXgsICcrJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmkgKz0gJyYnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tuYW1lXS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVyaS5zdWJzdHIoMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRGb3JtRGF0YTogZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1tuYW1lXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuYXBwZW5kKG5hbWUsIHZhbHVlc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3MpLnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3MpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlQWxsOiBmdW5jdGlvbiAodGV4dCwgZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChPYmplY3Qua2V5cyhkaWN0aW9uYXJ5KS5qb2luKCd8JyksICdnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgcmUsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaWN0aW9uYXJ5W21hdGNoXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbWVsQ2FzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJDaGFyID0gdmFsdWUuY2hhckF0KGopO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyQ2hhciA9PSAnLScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dCArPSAoIWZsYWcpID8gY3VyckNoYXIgOiBjdXJyQ2hhci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBhbnRpQ2FtZWxDYXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyQ2hhciA9IHZhbHVlLmNoYXJBdChqKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckNoYXIgIT0gJy0nICYmIGN1cnJDaGFyID09IGN1cnJDaGFyLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICctJyArIGN1cnJDaGFyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBjdXJyQ2hhcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBxdW90ZUF0dHI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csICcmYXBvczsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcclxcbi9nLCAnJiMxMzsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHJcXG5dL2csICcmIzEzOycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNwbGljZVN0cmluZzogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY291bnQsIGFkZCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIGluZGV4KSArIChhZGQgfHwgJycpICsgdmFsdWUuc2xpY2UoaW5kZXggKyBjb3VudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgICAgICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmQ6IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICBvYmouc29tZShmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXh0ZW5kT2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICBpc0FycmF5ID0gdGFyZ2V0IGluc3RhbmNlb2YgQXJyYXk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBhcmd1bWVudHNbaXRlbV0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRhcmdldC5wdXNoKGFyZ3VtZW50c1tpdGVtXVtuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qIHRhcmdldFtuYW1lXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgdGFyZ2V0W25hbWVdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5leHRlbmRPYmplY3QodGFyZ2V0W25hbWVdLCBhcmd1bWVudHNbaXRlbV1bbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBhcmd1bWVudHNbaXRlbV1bbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVhY2g6IGZ1bmN0aW9uIChhcnIsIGZuYywgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZuYyhpdGVtLCBhcnJbaXRlbV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFwOiBmdW5jdGlvbiAoYXJyLCBmbmMsIGRvbnRTa2lwUmV0dXJucywgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYyhhcnJbaXRlbV0sIGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZG9udFNraXBSZXR1cm5zICYmIHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5kZXg6IGZ1bmN0aW9uIChhcnIsIHZhbHVlLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJyW2l0ZW1dID09PSBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBhZWFjaDogZnVuY3Rpb24gKGFyciwgZm5jKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuYyhpLCBhcnJbaV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW1hcDogZnVuY3Rpb24gKGFyciwgZm5jLCBkb250U2tpcFJldHVybnMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jKGFycltpXSwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFkb250U2tpcFJldHVybnMgJiYgcmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy51bnNoaWZ0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSxcblxuICAgICAgICBhaW5kZXg6IGZ1bmN0aW9uIChhcnIsIHZhbHVlLCBzdGFydCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IChzdGFydCB8fCAwKSwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29sdW1uOiBmdW5jdGlvbiAob2JqLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5tYXAob2JqLCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0sIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNodWZmbGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgc2h1ZmZsZWQgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmFuZCA9IGxhcm91eF9oZWxwZXJzLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgc2h1ZmZsZWRbaW5kZXgrK10gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgICAgICAgICAgICBzaHVmZmxlZFtyYW5kXSA9IG9ialtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNodWZmbGVkO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1lcmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICB0bXAgPSB0YXJnZXQsXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IHRtcCBpbnN0YW5jZW9mIEFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcC5jb25jYXQoYXJndW1lbnRzW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBhcmd1bWVudHNbaXRlbV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmd1bWVudHNbaXRlbV0uaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdG1wW2F0dHJdID0gYXJndW1lbnRzW2l0ZW1dW2F0dHJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRtcDtcbiAgICAgICAgfSxcblxuICAgICAgICBkdXBsaWNhdGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGl0ZW1zID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpdGVtc1tpXSA9IG9ialtpXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEFzQXJyYXk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpdGVtcztcblxuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBvYmo7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBpdGVtcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBvYmpbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IFtvYmpdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGVuZ3RoOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEtleXNSZWN1cnNpdmU6IGZ1bmN0aW9uIChvYmosIGRlbGltaXRlciwgcHJlZml4LCBrZXlzKSB7XG4gICAgICAgICAgICBpZiAoZGVsaW1pdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwcmVmaXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHByZWZpeCA9ICcnO1xuICAgICAgICAgICAgICAgIGtleXMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBrZXlzLnB1c2gocHJlZml4ICsgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqW2l0ZW1dICE9PSB1bmRlZmluZWQgJiYgb2JqW2l0ZW1dICE9PSBudWxsICYmIG9ialtpdGVtXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmdldEtleXNSZWN1cnNpdmUob2JqW2l0ZW1dLCBkZWxpbWl0ZXIsIHByZWZpeCArIGl0ZW0gKyBkZWxpbWl0ZXIsIGtleXMpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEVsZW1lbnQ6IGZ1bmN0aW9uIChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSwgZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsaW1pdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwb3MgPSBwYXRoLmluZGV4T2YoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHZhciBrZXk7XG4gICAgICAgICAgICB2YXIgcmVzdDtcbiAgICAgICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGF0aDtcbiAgICAgICAgICAgICAgICByZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGF0aC5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICByZXN0ID0gcGF0aC5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghKGtleSBpbiBvYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3QgPT09IG51bGwgfHwgcmVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KG9ialtrZXldLCByZXN0LCBkZWZhdWx0VmFsdWUsIGRlbGltaXRlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGNvcmVcbiAgICB2YXIgbGFyb3V4ID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXguaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgLy8gRklYTUU6IG5vbi1jaHJvbWUgb3B0aW1pemF0aW9uXG4gICAgICAgIHZhciByZSA9IC9eIyhbXlxcK1xcPlxcW1xcXVxcLiMgXSopJC8uZXhlYyhzZWxlY3Rvcik7XG4gICAgICAgIGlmIChyZSkge1xuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJlWzFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5nZXRFbGVtZW50QnlJZChyZVsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cblxuICAgICAgICByZXR1cm4gKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgfTtcblxuICAgIGxhcm91eC5ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKTtcbiAgICBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICBsYXJvdXgudGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyk7XG5cbiAgICBsYXJvdXguY2FjaGVkID0ge1xuICAgICAgICBzaW5nbGU6IHt9LFxuICAgICAgICBhcnJheToge30sXG4gICAgICAgIGlkOiB7fVxuICAgIH07XG5cbiAgICBsYXJvdXguYyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuYXJyYXlbc2VsZWN0b3JdIHx8IChcbiAgICAgICAgICAgICAgICBsYXJvdXguY2FjaGVkLmFycmF5W3NlbGVjdG9yXSA9IGxhcm91eC5oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsYXJvdXguY2FjaGVkLnNpbmdsZVtzZWxlY3Rvcl0gfHwgKFxuICAgICAgICAgICAgbGFyb3V4LmNhY2hlZC5zaW5nbGVbc2VsZWN0b3JdID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LmlkID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LmlkYyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gbGFyb3V4LmNhY2hlZC5pZFtzZWxlY3Rvcl0gfHxcbiAgICAgICAgICAgIChsYXJvdXguY2FjaGVkLmlkW3NlbGVjdG9yXSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKSk7XG4gICAgfTtcblxuICAgIGxhcm91eC5yZWFkeVBhc3NlZCA9IGZhbHNlO1xuXG4gICAgbGFyb3V4LmV4dGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIGxhcm91eCk7XG4gICAgICAgIGxhcm91eC5oZWxwZXJzLmV4dGVuZE9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBsYXJvdXguZXh0ZW5kT2JqZWN0ID0gbGFyb3V4LmhlbHBlcnMuZXh0ZW5kT2JqZWN0O1xuICAgIGxhcm91eC5lYWNoID0gbGFyb3V4LmhlbHBlcnMuZWFjaDtcbiAgICBsYXJvdXgubWFwID0gbGFyb3V4LmhlbHBlcnMubWFwO1xuICAgIGxhcm91eC5pbmRleCA9IGxhcm91eC5oZWxwZXJzLmluZGV4O1xuICAgIGxhcm91eC5hZWFjaCA9IGxhcm91eC5oZWxwZXJzLmFlYWNoO1xuICAgIGxhcm91eC5hbWFwID0gbGFyb3V4LmhlbHBlcnMuYW1hcDtcbiAgICBsYXJvdXguYWluZGV4ID0gbGFyb3V4LmhlbHBlcnMuYWluZGV4O1xuXG4gICAgbGFyb3V4LnJlYWR5ID0gZnVuY3Rpb24gKGZuYykge1xuICAgICAgICBpZiAoIWxhcm91eC5yZWFkeVBhc3NlZCkge1xuICAgICAgICAgICAgbGFyb3V4LmV2ZW50cy5hZGQoJ0NvbnRlbnRMb2FkZWQnLCBmbmMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm5jKCk7XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdET01Db250ZW50TG9hZGVkJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eC5yZWFkeVBhc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXguZXZlbnRzLmludm9rZSgnQ29udGVudExvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwobGFyb3V4LnRpbWVycy5vbnRpY2ssIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eC5yZWFkeVBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGlmICghKCckbCcgaW4gd2luZG93KSkge1xuICAgICAgICAgICAgd2luZG93LiRsID0gbGFyb3V4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gb3B0aW9uYWwgbW9kdWxlc1xuICAgIGxhcm91eC53cmFwcGVyID0gcmVxdWlyZSgnLi9sYXJvdXgud3JhcHBlci5qcycpO1xuICAgIGxhcm91eC5hamF4ID0gcmVxdWlyZSgnLi9sYXJvdXguYWpheC5qcycpO1xuICAgIGxhcm91eC5jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKTtcbiAgICBsYXJvdXguZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyk7XG4gICAgbGFyb3V4LmV2ZW50cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmV2ZW50cy5qcycpO1xuICAgIGxhcm91eC5mb3JtcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmZvcm1zLmpzJyk7XG4gICAgbGFyb3V4LmhlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpO1xuICAgIGxhcm91eC50cmlnZ2VycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRyaWdnZXJzLmpzJyk7XG4gICAgbGFyb3V4LnZhcnMgPSByZXF1aXJlKCcuL2xhcm91eC52YXJzLmpzJyk7XG5cbiAgICBsYXJvdXguYW5pbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmFuaW0uanMnKTtcbiAgICBsYXJvdXguZGF0ZSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRhdGUuanMnKTtcbiAgICBsYXJvdXgua2V5cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmtleXMuanMnKTtcbiAgICBsYXJvdXgubXZjID0gcmVxdWlyZSgnLi9sYXJvdXgubXZjLmpzJyk7XG4gICAgbGFyb3V4LnN0YWNrID0gcmVxdWlyZSgnLi9sYXJvdXguc3RhY2suanMnKTtcbiAgICBsYXJvdXgudGVtcGxhdGVzID0gcmVxdWlyZSgnLi9sYXJvdXgudGVtcGxhdGVzLmpzJyk7XG4gICAgbGFyb3V4LnRvdWNoID0gcmVxdWlyZSgnLi9sYXJvdXgudG91Y2guanMnKTtcbiAgICBsYXJvdXgudWkgPSByZXF1aXJlKCcuL2xhcm91eC51aS5qcycpO1xuXG4gICAgcmV0dXJuIGxhcm91eDtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfZm9ybXMgPSByZXF1aXJlKCcuL2xhcm91eC5mb3Jtcy5qcycpO1xuXG4gICAgLy8ga2V5c1xuICAgIHZhciBsYXJvdXhfa2V5cyA9IHtcbiAgICAgICAga2V5TmFtZTogZnVuY3Rpb24gKGtleWNvZGUpIHtcbiAgICAgICAgICAgIGtleWNvZGUgPSBrZXljb2RlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoa2V5Y29kZSkge1xuICAgICAgICAgICAgY2FzZSAnYmFja3NwYWNlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gODtcblxuICAgICAgICAgICAgY2FzZSAndGFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gOTtcblxuICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxuICAgICAgICAgICAgY2FzZSAncmV0dXJuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTM7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VzYyc6XG4gICAgICAgICAgICBjYXNlICdlc2NhcGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAyNztcblxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzMjtcblxuICAgICAgICAgICAgY2FzZSAncGd1cCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDMzO1xuXG4gICAgICAgICAgICBjYXNlICdwZ2RuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzQ7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM1O1xuXG4gICAgICAgICAgICBjYXNlICdob21lJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNztcblxuICAgICAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzODtcblxuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzOTtcblxuICAgICAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDQwO1xuXG4gICAgICAgICAgICBjYXNlICdpbnNlcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiA0NTtcblxuICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gNDY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTEyO1xuXG4gICAgICAgICAgICBjYXNlICdmMic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExMztcblxuICAgICAgICAgICAgY2FzZSAnZjMnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTQ7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE1O1xuXG4gICAgICAgICAgICBjYXNlICdmNSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNjtcblxuICAgICAgICAgICAgY2FzZSAnZjYnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTc7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y3JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE4O1xuXG4gICAgICAgICAgICBjYXNlICdmOCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExOTtcblxuICAgICAgICAgICAgY2FzZSAnZjknOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjA7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxMCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMTtcblxuICAgICAgICAgICAgY2FzZSAnZjExJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIyO1xuXG4gICAgICAgICAgICBjYXNlICdmMTInOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjM7XG5cbiAgICAgICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxODg7XG5cbiAgICAgICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgICAgIHJldHVybiAxOTA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleWNvZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHt0YXJnZXQsIGtleSwgc2hpZnQsIGN0cmwsIGFsdCwgZGlzYWJsZUlucHV0cywgZm5jfVxuICAgICAgICBhc3NpZ246IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSB3aW5kb3cuZXZlbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkgeyAvLyBlbGVtZW50Lm5vZGVUeXBlID09PSAxIHx8XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzYWJsZUlucHV0cyAmJiBsYXJvdXhfZm9ybXMuaXNGb3JtRmllbGQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNoaWZ0ICYmICFldmVudC5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY3RybCAmJiAhZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWx0ICYmICFldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBsYXJvdXhfa2V5cy5rZXlOYW1lKG9wdGlvbnMua2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAoZXZlbnQua2V5Q29kZSB8fCBldmVudC53aGljaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm5jKGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQob3B0aW9ucy50YXJnZXQgfHwgd2luZG93LmRvY3VtZW50LCAna2V5ZG93bicsIHdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfa2V5cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X3N0YWNrID0gcmVxdWlyZSgnLi9sYXJvdXguc3RhY2suanMnKTtcblxuICAgIC8vIG12Y1xuICAgIHZhciBsYXJvdXhfbXZjID0ge1xuICAgICAgICBhcHBzOiB7fSxcbiAgICAgICAgcGF1c2VVcGRhdGU6IGZhbHNlLFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBsYXJvdXhfZG9tLnNlbGVjdEJ5SWQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChtb2RlbC5jb25zdHJ1Y3RvciAhPT0gbGFyb3V4X3N0YWNrKSB7XG4gICAgICAgICAgICAvLyAgICAgbW9kZWwgPSBuZXcgbGFyb3V4X3N0YWNrKG1vZGVsKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgdmFyIGFwcEtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpO1xuXG4gICAgICAgICAgICBtb2RlbC5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X212Yy5wYXVzZVVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfbXZjLnVwZGF0ZShhcHBLZXkpOyAvLyAsIFtldmVudC5rZXldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5hcHBzW2FwcEtleV0gPSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwgLy8gLFxuICAgICAgICAgICAgICAgIC8vIG1vZGVsS2V5czogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBib3VuZEVsZW1lbnRzOiBudWxsLFxuICAgICAgICAgICAgICAgIC8vIGV2ZW50RWxlbWVudHM6IG51bGxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMucmViaW5kKGFwcEtleSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmViaW5kOiBmdW5jdGlvbiAoYXBwS2V5KSB7XG4gICAgICAgICAgICB2YXIgYXBwID0gbGFyb3V4X212Yy5hcHBzW2FwcEtleV07XG4gICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgYXBwLm1vZGVsS2V5cyA9IGxhcm91eF9oZWxwZXJzLmdldEtleXNSZWN1cnNpdmUoYXBwLm1vZGVsLl9kYXRhKTsgLy8gRklYTUU6IHdvcmtzIG9ubHkgZm9yICRsLnN0YWNrXG4gICAgICAgICAgICBhcHAuYm91bmRFbGVtZW50cyA9IHt9O1xuICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5zY2FuRWxlbWVudHMoYXBwLCBhcHAuZWxlbWVudCk7XG4gICAgICAgICAgICBsYXJvdXhfbXZjLnVwZGF0ZShhcHBLZXkpO1xuXG4gICAgICAgICAgICB2YXIgZm5jID0gZnVuY3Rpb24gKGV2LCBlbGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSBsYXJvdXhfbXZjLmJpbmRTdHJpbmdQYXJzZXIoZWxlbS5nZXRBdHRyaWJ1dGUoJ2xyLWV2ZW50JykpO1xuICAgICAgICAgICAgICAgIC8vIGxhcm91eF9tdmMucGF1c2VVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYmluZGluZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PT0gbnVsbCB8fCAhYmluZGluZy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZ1tpdGVtXS5jaGFyQXQoMCkgPT0gJ1xcJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDEsIGJpbmRpbmdbaXRlbV0ubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoMCwgNSkgPT0gJ2F0dHIuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLm1vZGVsW2l0ZW1dID0gZWxlbS5nZXRBdHRyaWJ1dGUoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoNSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDAsIDUpID09ICdwcm9wLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGVsZW1bYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoNSldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGxhcm91eF9tdmMucGF1c2VVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcHAuZXZlbnRFbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzW2ldLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzW2ldLmJpbmRpbmdbbnVsbF0sXG4gICAgICAgICAgICAgICAgICAgIGZuY1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2NhbkVsZW1lbnRzOiBmdW5jdGlvbiAoYXBwLCBlbGVtZW50KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYXR0cyA9IGVsZW1lbnQuYXR0cmlidXRlcywgbSA9IGF0dHMubGVuZ3RoOyBpIDwgbTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHNbaV0ubmFtZSA9PSAnbHItYmluZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcxID0gbGFyb3V4X212Yy5iaW5kU3RyaW5nUGFyc2VyKGF0dHNbaV0udmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYmluZGluZzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmluZGluZzEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwLmJvdW5kRWxlbWVudHNbYmluZGluZzFbaXRlbV1dID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHNbaV0ubmFtZSA9PSAnbHItZXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nMiA9IGxhcm91eF9tdmMuYmluZFN0cmluZ1BhcnNlcihhdHRzW2ldLnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiBiaW5kaW5nMlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBjaGxkcm4gPSBlbGVtZW50LmNoaWxkTm9kZXMsIG4gPSBjaGxkcm4ubGVuZ3RoOyBqIDwgbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNobGRybltqXS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfbXZjLnNjYW5FbGVtZW50cyhhcHAsIGNobGRybltqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGFwcEtleSwga2V5cykge1xuICAgICAgICAgICAgdmFyIGFwcCA9IGxhcm91eF9tdmMuYXBwc1thcHBLZXldO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleXMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBrZXlzID0gYXBwLm1vZGVsS2V5cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aDEgPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICghKGtleXNbaV0gaW4gYXBwLmJvdW5kRWxlbWVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBib3VuZEVsZW1lbnQgPSBhcHAuYm91bmRFbGVtZW50c1trZXlzW2ldXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBsZW5ndGgyID0gYm91bmRFbGVtZW50Lmxlbmd0aDsgaiA8IGxlbmd0aDI7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNikgPT0gJ3N0eWxlLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50LnN0eWxlW2JvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDYpXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA1KSA9PSAnYXR0ci4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSByZW1vdmVBdHRyaWJ1dGUgb24gbnVsbCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50LnNldEF0dHJpYnV0ZShib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg1KSwgbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChhcHAubW9kZWwsIGtleXNbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA1KSA9PSAncHJvcC4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSByZW1vdmVBdHRyaWJ1dGUgb24gbnVsbCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50W2JvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDUpXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBiaW5kU3RyaW5nUGFyc2VyOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgdmFyIGxhc3RCdWZmZXIgPSBudWxsLFxuICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICcnLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gMCxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHRleHQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyciA9IHRleHQuY2hhckF0KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyID09ICc6Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJ1ZmZlciA9IGJ1ZmZlci50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnIgPT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2xhc3RCdWZmZXJdID0gYnVmZmVyLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBjdXJyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbGFzdEJ1ZmZlcl0gPSBidWZmZXIudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfbXZjO1xuXG59KCkpO1xuIiwiLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBzdGFja1xuICAgIHZhciBsYXJvdXhfc3RhY2sgPSBmdW5jdGlvbiAoZGF0YSwgZGVwdGgsIHRvcCkge1xuICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIHRoaXMuX2RlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuX3RvcCA9IHRvcCB8fCB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IG5ldyBsYXJvdXhfc3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcHRoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZXB0aCArICcuJyArIGtleSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGF0YVtrZXldID09PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5zZXQodGhpcywga2V5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wLm9udXBkYXRlKHsgc2NvcGU6IHRoaXMsIGtleToga2V5LCBvbGRWYWx1ZTogb2xkVmFsdWUsIG5ld1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRSYW5nZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHZhbHVlS2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KHZhbHVlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldCh2YWx1ZUtleSwgdmFsdWVzW3ZhbHVlS2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW2tleV0gfHwgZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRSYW5nZSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4ga2V5cykge1xuICAgICAgICAgICAgICAgIGlmICgha2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YWx1ZXNba2V5c1tpdGVtXV0gPSB0aGlzW2tleXNbaXRlbV1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKS5sZW5ndGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGlzdHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gKGtleSBpbiB0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkgaW4gdGhpcy5fZGF0YSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2l0ZW1dO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFJhbmdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfc3RhY2s7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB0ZW1wbGF0ZXNcbiAgICB2YXIgbGFyb3V4X3RlbXBsYXRlcyA9IHtcbiAgICAgICAgZW5naW5lczoge1xuICAgICAgICAgICAgcGxhaW46IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt0ZW1wbGF0ZSwgb3B0aW9uc107XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY29tcGlsZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4O1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgobmV4dEluZGV4ID0gcmVzdWx0LmluZGV4T2YoJ3t7JywgbGFzdEluZGV4KSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXggKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbG9zZUluZGV4ID0gcmVzdWx0LmluZGV4T2YoJ319JywgbmV4dEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZUluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gcmVzdWx0LnN1YnN0cmluZyhuZXh0SW5kZXgsIGNsb3NlSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGljdFsne3snICsga2V5ICsgJ319J10gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KG1vZGVsLCBrZXksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IGNsb3NlSW5kZXggKyAyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnJlcGxhY2VBbGwocmVzdWx0LCBkaWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBob2dhbjoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LkhvZ2FuLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkLnJlbmRlcihtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbXVzdGFjaGU6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5NdXN0YWNoZS5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaGFuZGxlYmFyczoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LkhhbmRsZWJhcnMuY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGxvZGFzaDoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93Ll8uY29tcGlsZSh0ZW1wbGF0ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVuZGVyc2NvcmU6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5fLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZ2luZTogJ3BsYWluJyxcblxuICAgICAgICBhcHBseTogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCwgZW5naW5lID0gbGFyb3V4X3RlbXBsYXRlcy5lbmdpbmVzW2xhcm91eF90ZW1wbGF0ZXMuZW5naW5lXTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBlbGVtZW50LnRleHRDb250ZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gZWxlbWVudC5ub2RlVmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21waWxlZCA9IGVuZ2luZS5jb21waWxlKGNvbnRlbnQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGVuZ2luZS5yZW5kZXIoY29tcGlsZWQsIG1vZGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnNlcnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGxhcm91eF90ZW1wbGF0ZXMuYXBwbHkoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmluc2VydCh0YXJnZXQsIHBvc2l0aW9uIHx8ICdiZWZvcmVlbmQnLCBvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbGFyb3V4X3RlbXBsYXRlcy5hcHBseShlbGVtZW50LCBtb2RlbCwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZSh0YXJnZXQsIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90ZW1wbGF0ZXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdGltZXJzXG4gICAgdmFyIGxhcm91eF90aW1lcnMgPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgICAgICB0aW1lci5uZXh0ID0gRGF0ZS5ub3coKSArIHRpbWVyLnRpbWVvdXQ7XG4gICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEucHVzaCh0aW1lcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UodGFyZ2V0S2V5LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5uZXh0IDw9IG5vdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY3VycmVudEl0ZW0ub250aWNrKGN1cnJlbnRJdGVtLnN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSAmJiBjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ubmV4dCA9IG5vdyArIGN1cnJlbnRJdGVtLnRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGltZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyk7XG5cbiAgICAvLyB0b3VjaCAtIHBhcnRpYWxseSB0YWtlbiBmcm9tICd0b2NjYS5qcycgcHJvamVjdFxuICAgIC8vICAgICAgICAgY2FuIGJlIGZvdW5kIGF0OiBodHRwczovL2dpdGh1Yi5jb20vR2lhbmx1Y2FHdWFyaW5pL1RvY2NhLmpzXG4gICAgdmFyIGxhcm91eF90b3VjaCA9IHtcbiAgICAgICAgdG91Y2hTdGFydGVkOiBudWxsLFxuICAgICAgICBzd2lwZVRyZXNob2xkOiA4MCxcbiAgICAgICAgcHJlY2lzaW9uOiAzMCxcbiAgICAgICAgdGFwQ291bnQ6IDAsXG4gICAgICAgIHRhcFRyZXNob2xkOiAyMDAsXG4gICAgICAgIGxvbmdUYXBUcmVzaG9sZDogODAwLFxuICAgICAgICB0YXBUaW1lcjogbnVsbCxcbiAgICAgICAgcG9zOiBudWxsLFxuICAgICAgICBjYWNoZWQ6IG51bGwsXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICBzdGFydDogWyd0b3VjaHN0YXJ0JywgJ3BvaW50ZXJkb3duJywgJ01TUG9pbnRlckRvd24nLCAnbW91c2Vkb3duJ10sXG4gICAgICAgICAgICBlbmQ6IFsndG91Y2hlbmQnLCAncG9pbnRlcnVwJywgJ01TUG9pbnRlclVwJywgJ21vdXNldXAnXSxcbiAgICAgICAgICAgIG1vdmU6IFsndG91Y2htb3ZlJywgJ3BvaW50ZXJtb3ZlJywgJ01TUG9pbnRlck1vdmUnLCAnbW91c2Vtb3ZlJ11cbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhdGVQb2ludGVyOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gucG9zID0gW2V2ZW50LnBhZ2VYLCBldmVudC5wYWdlWV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIChuYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkgPyAyIDogMSxcbiAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShkb2N1bWVudCwgbGFyb3V4X3RvdWNoLmV2ZW50cy5zdGFydFtldmVudHNbaV1dLCBsYXJvdXhfdG91Y2gub25zdGFydCk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShkb2N1bWVudCwgbGFyb3V4X3RvdWNoLmV2ZW50cy5lbmRbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLm9uZW5kKTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGRvY3VtZW50LCBsYXJvdXhfdG91Y2guZXZlbnRzLm1vdmVbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLmxvY2F0ZVBvaW50ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uc3RhcnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmxvY2F0ZVBvaW50ZXIoZXZlbnQpO1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZCA9IFtsYXJvdXhfdG91Y2gucG9zWzBdLCBsYXJvdXhfdG91Y2gucG9zWzFdXTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCsrO1xuXG4gICAgICAgICAgICB2YXIgZm5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdG91Y2guY2FjaGVkWzBdID49IGxhcm91eF90b3VjaC5wb3NbMF0gLSBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzBdIDw9IGxhcm91eF90b3VjaC5wb3NbMF0gKyBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzFdID49IGxhcm91eF90b3VjaC5wb3NbMV0gLSBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzFdIDw9IGxhcm91eF90b3VjaC5wb3NbMV0gKyBsYXJvdXhfdG91Y2gucHJlY2lzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsYXJvdXhfdG91Y2gudGFwQ291bnQgPT09IDIpID8gJ2RibHRhcCcgOiAndGFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXJvdXhfdG91Y2gucG9zWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXJvdXhfdG91Y2gucG9zWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA+IGxhcm91eF90b3VjaC5sb25nVGFwVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvbmd0YXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGxhcm91eF90b3VjaC5wb3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxhcm91eF90b3VjaC5wb3NbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwVGltZXIgPSBzZXRUaW1lb3V0KGZuYywgbGFyb3V4X3RvdWNoLnRhcFRyZXNob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQobGFyb3V4X3RvdWNoLnRhcFRpbWVyKTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBUaW1lciA9IHNldFRpbWVvdXQoZm5jLCBsYXJvdXhfdG91Y2gudGFwVHJlc2hvbGQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uZW5kOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IFtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnBvc1swXSAtIGxhcm91eF90b3VjaC5jYWNoZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5wb3NbMV0gLSBsYXJvdXhfdG91Y2guY2FjaGVkWzFdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBpbm5lckV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgeDogbGFyb3V4X3RvdWNoLnBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgeTogbGFyb3V4X3RvdWNoLnBvc1sxXSxcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IE1hdGguYWJzKGRlbHRhWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IE1hdGguYWJzKGRlbHRhWzFdKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVswXSA8PSAtbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVyaWdodCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMF0gPj0gbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVsZWZ0JywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVsxXSA8PSAtbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVkb3duJywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVsxXSA+PSBsYXJvdXhfdG91Y2guc3dpcGVUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChldmVudC50YXJnZXQsICdzd2lwZXVwJywgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90b3VjaDtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB0cmlnZ2Vyc1xuICAgIHZhciBsYXJvdXhfdHJpZ2dlcnMgPSB7XG4gICAgICAgIGRlbGVnYXRlczogW10sXG4gICAgICAgIGxpc3Q6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKGNvbmRpdGlvbiwgZm5jLCBzdGF0ZSkge1xuICAgICAgICAgICAgdmFyIGNvbmRpdGlvbnMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGNvbmRpdGlvbik7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gY29uZGl0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghY29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCBjb25kaXRpb25zW2l0ZW1dKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmxpc3QucHVzaChjb25kaXRpb25zW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29uZGl0aW9uczogY29uZGl0aW9ucyxcbiAgICAgICAgICAgICAgICBmbmM6IGZuYyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogc3RhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udHJpZ2dlcjogZnVuY3Rpb24gKHRyaWdnZXJOYW1lLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRJZHggPSBsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIHRyaWdnZXJOYW1lKTtcbiAgICAgICAgICAgIGlmIChldmVudElkeCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMubGlzdC5zcGxpY2UoZXZlbnRJZHgsIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlc1tpdGVtXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGNvbmRpdGlvbktleSBpbiBjdXJyZW50SXRlbS5jb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudEl0ZW0uY29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShjb25kaXRpb25LZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb25kaXRpb25PYmogPSBjdXJyZW50SXRlbS5jb25kaXRpb25zW2NvbmRpdGlvbktleV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgY29uZGl0aW9uT2JqKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5mbmMoXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IGN1cnJlbnRJdGVtLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoYXJncylcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbTIgaW4gcmVtb3ZlS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtMikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndHJpZ2dlciBuYW1lOiAnICsgdHJpZ2dlck5hbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdHJpZ2dlcnM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyksXG4gICAgICAgIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgbGFyb3V4X3RpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpLFxuICAgICAgICBsYXJvdXhfZGF0ZSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRhdGUuanMnKTtcblxuICAgIC8vIHVpXG4gICAgdmFyIGxhcm91eF91aSA9IHtcbiAgICAgICAgZmxvYXRDb250YWluZXI6IG51bGwsXG5cbiAgICAgICAgcG9wdXA6IHtcbiAgICAgICAgICAgIGRlZmF1bHRUaW1lb3V0OiA1MDAsXG5cbiAgICAgICAgICAgIGNyZWF0ZUJveDogZnVuY3Rpb24gKGlkLCB4Y2xhc3MsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RvbS5jcmVhdGVFbGVtZW50KCdESVYnLCB7IGlkOiBpZCwgJ2NsYXNzJzogeGNsYXNzIH0sIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbXNnYm94OiBmdW5jdGlvbiAodGltZW91dCwgbWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IGxhcm91eF9oZWxwZXJzLmdldFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IGxhcm91eF91aS5wb3B1cC5jcmVhdGVCb3goaWQsICdsYXJvdXhNc2dCb3gnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZmxvYXRDb250YWluZXIuYXBwZW5kQ2hpbGQob2JqKTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkob2JqLCB7IG9wYWNpdHk6IDEgfSk7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgb250aWNrOiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eSh4LCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlbW92ZSh4KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IG9ialxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRpbmc6IHtcbiAgICAgICAgICAgIGVsZW1lbnRTZWxlY3RvcjogbnVsbCxcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBkZWZhdWx0RGVsYXk6IDE1MDAsXG4gICAgICAgICAgICB0aW1lcjogbnVsbCxcblxuICAgICAgICAgICAga2lsbFRpbWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGxhcm91eF91aS5sb2FkaW5nLnRpbWVyKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5raWxsVGltZXIoKTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCwgeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmxvYWRpbmdJbmRpY2F0b3IgPSAnZmFsc2UnO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcua2lsbFRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxheSA9IGxhcm91eF91aS5sb2FkaW5nLmRlZmF1bHREZWxheTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBsYXJvdXhfdWkubG9hZGluZy5zaG93KDApOyB9LCBkZWxheSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50LCB7IGRpc3BsYXk6ICdibG9jaycgfSk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID0gJ3RydWUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCA9PT0gbnVsbCAmJiBsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50U2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCA9IGxhcm91eF9kb20uc2VsZWN0U2luZ2xlKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudCh3aW5kb3csICdsb2FkJywgbGFyb3V4X3VpLmxvYWRpbmcuaGlkZSk7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQod2luZG93LCAnYmVmb3JldW5sb2FkJywgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yICE9PSB1bmRlZmluZWQgJiYgbG9jYWxTdG9yYWdlLmxvYWRpbmdJbmRpY2F0b3IgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdygwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkeW5hbWljRGF0ZXM6IHtcbiAgICAgICAgICAgIHVwZGF0ZURhdGVzRWxlbWVudHM6IG51bGwsXG5cbiAgICAgICAgICAgIHVwZGF0ZURhdGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMgPSBsYXJvdXhfZG9tLnNlbGVjdCgnKltkYXRhLWVwb2NoXScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmogPSBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHNbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHNoaWZ0aW5nIChzdHIgPj4gMCkgdXNlZCBpbnN0ZWFkIG9mIHBhcnNlSW50KHN0ciwgMTApXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKG9iai5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXBvY2gnKSA+PiAwKSAqIDEwMDApO1xuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kYXRlLmdldERhdGVTdHJpbmcoZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBvYmouc2V0QXR0cmlidXRlKCd0aXRsZScsIGxhcm91eF9kYXRlLmdldExvbmdEYXRlU3RyaW5nKGRhdGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5zZXQoe1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvbnRpY2s6IGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzY3JvbGxWaWV3OiB7XG4gICAgICAgICAgICBzZWxlY3RlZEVsZW1lbnRzOiBbXSxcblxuICAgICAgICAgICAgb25oaWRkZW46IGZ1bmN0aW9uIChlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudHMsIHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudHMsIFsnb3BhY2l0eSddKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9ucmV2ZWFsOiBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnRzLCB7IG9wYWNpdHk6IDEgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9jc3MuaW5WaWV3cG9ydChlbGVtZW50c1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMucHVzaChlbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5vbmhpZGRlbihsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzKTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIGxhcm91eF91aS5zY3JvbGxWaWV3LnJldmVhbCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZXZlYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZWFjaChcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfY3NzLmluVmlld3BvcnQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMuc3BsaWNlKHJlbW92ZUtleXNbaXRlbV0sIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnVuc2V0RXZlbnQod2luZG93LCAnc2Nyb2xsJywgbGFyb3V4X3VpLnNjcm9sbFZpZXcucmV2ZWFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5vbnJldmVhbChlbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUZsb2F0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWxhcm91eF91aS5mbG9hdENvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5mbG9hdENvbnRhaW5lciA9IGxhcm91eF9kb20uY3JlYXRlRWxlbWVudCgnRElWJywgeyAnY2xhc3MnOiAnbGFyb3V4RmxvYXREaXYnIH0pO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShsYXJvdXhfdWkuZmxvYXRDb250YWluZXIsIHdpbmRvdy5kb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxhcm91eF91aS5jcmVhdGVGbG9hdENvbnRhaW5lcigpO1xuICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuaW5pdCgpO1xuICAgICAgICAgICAgbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy5pbml0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF91aTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyB2YXJzXG4gICAgdmFyIGxhcm91eF92YXJzID0ge1xuICAgICAgICBjb29raWVQYXRoOiAnLycsXG5cbiAgICAgICAgZ2V0Q29va2llOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9W147XSsnLCAnaScpLFxuICAgICAgICAgICAgICAgIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKHJlKTtcblxuICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXS5zcGxpdCgnPScpWzFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb29raWU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCkge1xuICAgICAgICAgICAgdmFyIGV4cGlyZVZhbHVlID0gJyc7XG4gICAgICAgICAgICBpZiAoZXhwaXJlcykge1xuICAgICAgICAgICAgICAgIGV4cGlyZVZhbHVlID0gJzsgZXhwaXJlcz0nICsgZXhwaXJlcy50b0dNVFN0cmluZygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpICsgZXhwaXJlVmFsdWUgKyAnOyBwYXRoPScgKyAocGF0aCB8fCBsYXJvdXhfdmFycy5jb29raWVQYXRoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDb29raWU6IGZ1bmN0aW9uIChuYW1lLCBwYXRoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVDsgcGF0aD0nICsgKHBhdGggfHwgbGFyb3V4X3ZhcnMuY29va2llUGF0aCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9jYWw6IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gbG9jYWxTdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW25hbWVdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMb2NhbDogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTG9jYWw6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgbG9jYWxTdG9yYWdlW25hbWVdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNlc3Npb246IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gc2Vzc2lvblN0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZVtuYW1lXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZVtuYW1lXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHNlc3Npb25TdG9yYWdlW25hbWVdO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdmFycztcblxufSgpKTtcbiIsIi8qZ2xvYmFsIE5vZGVMaXN0LCBOb2RlICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHdyYXBwZXJcbiAgICB2YXIgbGFyb3V4X3dyYXBwZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uO1xuXG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3RvcjtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBsYXJvdXhfaGVscGVycy50b0FycmF5KHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IFtzZWxlY3Rvcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBsYXJvdXhfZG9tLnNlbGVjdChzZWxlY3RvciwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlKHNlbGVjdGlvblswXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUoc2VsZWN0aW9uKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuaXNBcnJheSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfd3JhcHBlcihzZWxlY3RvciwgdGhpcy5zb3VyY2UpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlID0gZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gZWxlbWVudHM7XG4gICAgICAgIHRoaXMuaXNBcnJheSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZVtpbmRleF07XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCA9IDA7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUgPSAxO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXkgPSAyO1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIgPSBmdW5jdGlvbiAobmFtZSwgZm5jLCBzY29wZSkge1xuICAgICAgICB2YXIgbmV3Rm5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYy5hcHBseShcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIFt0aGlzLnNvdXJjZV0uY29uY2F0KGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiAocmVzdWx0ID09PSB1bmRlZmluZWQpID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICAgIGNhc2UgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGU6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5OlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2F0dHInLCBsYXJvdXhfZG9tLmF0dHIsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignZGF0YScsIGxhcm91eF9kb20uZGF0YSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvbicsIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb24nLCBsYXJvdXhfZG9tLnNldEV2ZW50LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5KTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb2ZmJywgbGFyb3V4X2RvbS51bnNldEV2ZW50LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdjbGVhcicsIGxhcm91eF9kb20uY2xlYXIsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5zZXJ0JywgbGFyb3V4X2RvbS5pbnNlcnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncHJlcGVuZCcsIGxhcm91eF9kb20ucHJlcGVuZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhcHBlbmQnLCBsYXJvdXhfZG9tLmFwcGVuZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZXBsYWNlJywgbGFyb3V4X2RvbS5yZXBsYWNlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlcGxhY2VUZXh0JywgbGFyb3V4X2RvbS5yZXBsYWNlVGV4dCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZW1vdmUnLCBsYXJvdXhfZG9tLnJlbW92ZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hhc0NsYXNzJywgbGFyb3V4X2Nzcy5oYXNDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhZGRDbGFzcycsIGxhcm91eF9jc3MuYWRkQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlbW92ZUNsYXNzJywgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigndG9nZ2xlQ2xhc3MnLCBsYXJvdXhfY3NzLnRvZ2dsZUNsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdnZXRQcm9wZXJ0eScsIGxhcm91eF9jc3MuZ2V0UHJvcGVydHksIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2V0UHJvcGVydHknLCBsYXJvdXhfY3NzLnNldFByb3BlcnR5LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzZXRUcmFuc2l0aW9uJywgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzaG93JywgbGFyb3V4X2Nzcy5zaG93LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoaWRlJywgbGFyb3V4X2Nzcy5oaWRlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoZWlnaHQnLCBsYXJvdXhfY3NzLmhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbm5lckhlaWdodCcsIGxhcm91eF9jc3MuaW5uZXJIZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb3V0ZXJIZWlnaHQnLCBsYXJvdXhfY3NzLm91dGVySGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3dpZHRoJywgbGFyb3V4X2Nzcy53aWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbm5lcldpZHRoJywgbGFyb3V4X2Nzcy5pbm5lcldpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ291dGVyV2lkdGgnLCBsYXJvdXhfY3NzLm91dGVyV2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigndG9wJywgbGFyb3V4X2Nzcy50b3AsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignbGVmdCcsIGxhcm91eF9jc3MubGVmdCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhYm92ZVRoZVRvcCcsIGxhcm91eF9jc3MuYWJvdmVUaGVUb3AsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYmVsb3dUaGVGb2xkJywgbGFyb3V4X2Nzcy5iZWxvd1RoZUZvbGQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignbGVmdE9mU2NyZWVuJywgbGFyb3V4X2Nzcy5sZWZ0T2ZTY3JlZW4sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmlnaHRPZlNjcmVlbicsIGxhcm91eF9jc3MucmlnaHRPZlNjcmVlbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpblZpZXdwb3J0JywgbGFyb3V4X2Nzcy5pblZpZXdwb3J0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG5cbiAgICByZXR1cm4gbGFyb3V4X3dyYXBwZXI7XG5cbn0oKSk7XG4iXX0=
