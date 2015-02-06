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
(function (laroux) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGFyb3V4LmFqYXguanMiLCJzcmMvbGFyb3V4LmFuaW0uanMiLCJzcmMvbGFyb3V4LmNzcy5qcyIsInNyYy9sYXJvdXguZGF0ZS5qcyIsInNyYy9sYXJvdXguZG9tLmpzIiwic3JjL2xhcm91eC5ldmVudHMuanMiLCJzcmMvbGFyb3V4LmZvcm1zLmpzIiwic3JjL2xhcm91eC5oZWxwZXJzLmpzIiwic3JjL2xhcm91eC5qcyIsInNyYy9sYXJvdXgua2V5cy5qcyIsInNyYy9sYXJvdXgubXZjLmpzIiwic3JjL2xhcm91eC5zdGFjay5qcyIsInNyYy9sYXJvdXgudGVtcGxhdGVzLmpzIiwic3JjL2xhcm91eC50aW1lcnMuanMiLCJzcmMvbGFyb3V4LnRvdWNoLmpzIiwic3JjL2xhcm91eC50cmlnZ2Vycy5qcyIsInNyYy9sYXJvdXgudWkuanMiLCJzcmMvbGFyb3V4LnZhcnMuanMiLCJzcmMvbGFyb3V4LndyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyBhamF4IC0gcGFydGlhbGx5IHRha2VuIGZyb20gJ2pxdWVyeSBpbiBwYXJ0cycgcHJvamVjdFxuICAgIC8vICAgICAgICBjYW4gYmUgZm91bmQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9teXRoei9qcXVpcC9cbiAgICB2YXIgbGFyb3V4X2FqYXggPSB7XG4gICAgICAgIGNvcnNEZWZhdWx0OiBmYWxzZSxcblxuICAgICAgICB3cmFwcGVyczoge1xuICAgICAgICAgICAgcmVnaXN0cnk6IHtcbiAgICAgICAgICAgICAgICAnbGFyb3V4LmpzJzogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiAnICsgZGF0YS5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iajtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5mb3JtYXQgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5mb3JtYXQgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZXZhbChkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGlmIChkYXRhLmZvcm1hdCA9PSAneG1sJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5hbWUsIGZuYykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W25hbWVdID0gZm5jO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHhEb21haW5PYmplY3Q6IGZhbHNlLFxuICAgICAgICB4bWxIdHRwUmVxdWVzdE9iamVjdDogbnVsbCxcbiAgICAgICAgeERvbWFpblJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhocjogZnVuY3Rpb24gKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICBpZiAobGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3Jvc3NEb21haW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoISgnd2l0aENyZWRlbnRpYWxzJyBpbiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCkgJiYgd2luZG93LlhEb21haW5SZXF1ZXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdCA9IG5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5PYmplY3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHhoclJlc3A6IGZ1bmN0aW9uICh4aHIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyRnVuY3Rpb24gPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVzcG9uc2UtV3JhcHBlci1GdW5jdGlvbicpLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAnanNvbicpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgLypqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBldmFsKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAneG1sJykge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlWE1MO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3cmFwcGVyRnVuY3Rpb24gJiYgKHdyYXBwZXJGdW5jdGlvbiBpbiBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeSkpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W3dyYXBwZXJGdW5jdGlvbl0ocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB3cmFwcGVyRnVuYzogd3JhcHBlckZ1bmN0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ha2VSZXF1ZXN0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGNvcnMgPSBvcHRpb25zLmNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgeGhyID0gbGFyb3V4X2FqYXgueGhyKGNvcnMpLFxuICAgICAgICAgICAgICAgIHVybCA9IG9wdGlvbnMudXJsLFxuICAgICAgICAgICAgICAgIHRpbWVyID0gbnVsbCxcbiAgICAgICAgICAgICAgICBuID0gMDtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWVvdXRGbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aW1lb3V0Rm4ob3B0aW9ucy51cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRpbWVvdXRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBsYXJvdXhfYWpheC54aHJSZXNwKHhociwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHhociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4RXJyb3InLCBbeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VjY2VzcyAhPT0gdW5kZWZpbmVkICYmIHJlcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MocmVzLnJlc3BvbnNlLCByZXMud3JhcHBlckZ1bmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4U3VjY2VzcycsIFt4aHIsIHJlcy5yZXNwb25zZSwgcmVzLndyYXBwZXJGdW5jLCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhFcnJvcicsIFt4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jb21wbGV0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbXBsZXRlKHhociwgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhDb21wbGV0ZScsIFt4aHIsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByb2dyZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wcm9ncmVzcygrK24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmdldGRhdGEgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmdldGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5nZXRkYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gbGFyb3V4X2hlbHBlcnMuYnVpbGRRdWVyeVN0cmluZyhvcHRpb25zLmdldGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnlTdHJpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArIHF1ZXJ5U3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArIG9wdGlvbnMuZ2V0ZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmpzb25wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgJ2pzb25wPScgKyBvcHRpb25zLmpzb25wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWxhcm91eF9hamF4LnhEb21haW5PYmplY3QpIHtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihvcHRpb25zLnR5cGUsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKG9wdGlvbnMudHlwZSwgdXJsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy54aHJGaWVsZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMueGhyRmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMueGhyRmllbGRzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhocltpXSA9IG9wdGlvbnMueGhyRmllbGRzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy53cmFwcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydYLVdyYXBwZXItRnVuY3Rpb24nXSA9ICdsYXJvdXguanMnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiBpbiBoZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihqLCBoZWFkZXJzW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnBvc3RkYXRhID09PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5wb3N0ZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChvcHRpb25zLnBvc3RkYXRhdHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLnBvc3RkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChsYXJvdXhfaGVscGVycy5idWlsZEZvcm1EYXRhKG9wdGlvbnMucG9zdGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQob3B0aW9ucy5wb3N0ZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRKc29uOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEpzb25QOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBtZXRob2QsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAganNvbnA6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTY3JpcHQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YXR5cGU6ICdmb3JtJyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3RKc29uOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2FqYXg7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyk7XG5cbiAgICAvLyBhbmltXG4gICAgdmFyIGxhcm91eF9hbmltID0ge1xuICAgICAgICBkYXRhOiBbXSxcblxuICAgICAgICBmeDoge1xuICAgICAgICAgICAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uIChzb3VyY2UsIHRhcmdldCwgc2hpZnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHNvdXJjZSArICh0YXJnZXQgLSBzb3VyY2UpICogc2hpZnQpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgtTWF0aC5jb3MocG9zICogTWF0aC5QSSkgLyAyKSArIDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyB7b2JqZWN0LCBwcm9wZXJ0eSwgZnJvbSwgdG8sIHRpbWUsIHVuaXQsIHJlc2V0fVxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdhbmltKSB7XG4gICAgICAgICAgICBuZXdhbmltLnN0YXJ0VGltZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLnVuaXQgPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLnVuaXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLnVuaXQgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0uZnJvbSA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0uZnJvbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gd2luZG93LmRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PT0gJ3Njcm9sbFRvcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gKHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8IHdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSBuZXdhbmltLm9iamVjdFtuZXdhbmltLnByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmV3YW5pbS5mcm9tID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IE51bWJlcihuZXdhbmltLmZyb20pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS5yZXNldCA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0ucmVzZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChuZXdhbmltLmlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vICAgICBuZXdhbmltLmlkID0gbGFyb3V4X2hlbHBlcnMuZ2V0VW5pcXVlSWQoKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgbGFyb3V4X2FuaW0uZGF0YS5wdXNoKG5ld2FuaW0pO1xuICAgICAgICAgICAgaWYgKGxhcm91eF9hbmltLmRhdGEubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShsYXJvdXhfYW5pbS5vbmZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDc3M6IGZ1bmN0aW9uIChuZXdhbmltKSB7XG4gICAgICAgICAgICBpZiAobmV3YW5pbS5mcm9tID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS5mcm9tID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gbGFyb3V4X2Nzcy5nZXRQcm9wZXJ0eShuZXdhbmltLm9iamVjdCwgbmV3YW5pbS5wcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5ld2FuaW0ub2JqZWN0ID0gbmV3YW5pbS5vYmplY3Quc3R5bGU7XG4gICAgICAgICAgICBuZXdhbmltLnByb3BlcnR5ID0gbGFyb3V4X2hlbHBlcnMuY2FtZWxDYXNlKG5ld2FuaW0ucHJvcGVydHkpO1xuXG4gICAgICAgICAgICBsYXJvdXhfYW5pbS5zZXQobmV3YW5pbSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF9hbmltLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9hbmltLmRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X2FuaW0uZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEuc3BsaWNlKHRhcmdldEtleSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbmZyYW1lOiBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfYW5pbS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfYW5pbS5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF9hbmltLmRhdGFbaXRlbV07XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLnN0YXJ0VGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5zdGFydFRpbWUgPSB0aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxhcm91eF9hbmltLnN0ZXAoY3VycmVudEl0ZW0sIHRpbWVzdGFtcCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aW1lc3RhbXAgPiBjdXJyZW50SXRlbS5zdGFydFRpbWUgKyBjdXJyZW50SXRlbS50aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uc3RhcnRUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld2FuaW0ub2JqZWN0ID09PSB3aW5kb3cuZG9jdW1lbnQuYm9keSAmJiBuZXdhbmltLnByb3BlcnR5ID09ICdzY3JvbGxUb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG8oMCwgY3VycmVudEl0ZW0uZnJvbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNjcm9sbFRvKDAsIGN1cnJlbnRJdGVtLmZyb20pOyB9LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ub2JqZWN0W2N1cnJlbnRJdGVtLnByb3BlcnR5XSA9IGN1cnJlbnRJdGVtLmZyb207XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhcm91eF9hbmltLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsYXJvdXhfYW5pbS5vbmZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdGVwOiBmdW5jdGlvbiAobmV3YW5pbSwgdGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgZmluaXNoVCA9IG5ld2FuaW0uc3RhcnRUaW1lICsgbmV3YW5pbS50aW1lLFxuICAgICAgICAgICAgICAgIHNoaWZ0ID0gKHRpbWVzdGFtcCA+IGZpbmlzaFQpID8gMSA6ICh0aW1lc3RhbXAgLSBuZXdhbmltLnN0YXJ0VGltZSkgLyBuZXdhbmltLnRpbWU7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxhcm91eF9hbmltLmZ4LmludGVycG9sYXRlKFxuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSxcbiAgICAgICAgICAgICAgICBuZXdhbmltLnRvLFxuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmZ4LmVhc2luZyhzaGlmdClcbiAgICAgICAgICAgICkgKyBuZXdhbmltLnVuaXQ7XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gd2luZG93LmRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PSAnc2Nyb2xsVG9wJykge1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvKDAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2Nyb2xsVG8oMCwgdmFsdWUpOyB9LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5vYmplY3RbbmV3YW5pbS5wcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2FuaW07XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gY3NzXG4gICAgdmFyIGxhcm91eF9jc3MgPSB7XG4gICAgICAgIC8vIGNsYXNzIGZlYXR1cmVzXG4gICAgICAgIGhhc0NsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjeWNsZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudHMsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbKGkgKyAxKSAlIGxlbmd0aF0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHN0eWxlIGZlYXR1cmVzXG4gICAgICAgIGdldFByb3BlcnR5OiBmdW5jdGlvbiAoZWxlbWVudCwgc3R5bGVOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBzdHlsZU5hbWUgPSBsYXJvdXhfaGVscGVycy5hbnRpQ2FtZWxDYXNlKHN0eWxlTmFtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0UHJvcGVydHk6IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0aWVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW29sZFByb3BlcnRpZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHN0eWxlTmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHN0eWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1N0eWxlTmFtZSA9IGxhcm91eF9oZWxwZXJzLmNhbWVsQ2FzZShzdHlsZU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLnN0eWxlW25ld1N0eWxlTmFtZV0gPSBwcm9wZXJ0aWVzW3N0eWxlTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHRyYW5zaXRpb24gZmVhdHVyZXNcbiAgICAgICAgZGVmYXVsdFRyYW5zaXRpb246ICcycyBlYXNlJyxcblxuICAgICAgICBzZXRUcmFuc2l0aW9uU2luZ2xlOiBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNpdGlvbikge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheSh0cmFuc2l0aW9uKSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgndHJhbnNpdGlvbicpIHx8IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy13ZWJraXQtdHJhbnNpdGlvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy1tcy10cmFuc2l0aW9uJykgfHwgJycsXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5ID0gY3VycmVudFRyYW5zaXRpb25zLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5ID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRyYW5zaXRpb25zLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzdHlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3MgPSB0cmFuc2l0aW9uc1tpdGVtXS5pbmRleE9mKCcgJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZU5hbWUgPSB0cmFuc2l0aW9uc1tpdGVtXS5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvblByb3BlcnRpZXMgPSB0cmFuc2l0aW9uc1tpdGVtXS5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVOYW1lID0gdHJhbnNpdGlvbnNbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzID0gbGFyb3V4X2Nzcy5kZWZhdWx0VHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbnNBcnJheVtqXS50cmltKCkubG9jYWxlQ29tcGFyZShzdHlsZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheVtqXSA9IHN0eWxlTmFtZSArICcgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5LnB1c2goc3R5bGVOYW1lICsgJyAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3VycmVudFRyYW5zaXRpb25zQXJyYXkuam9pbignLCAnKTtcblxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUubXNUcmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvblNpbmdsZShlbGVtZW50c1tpXSwgdHJhbnNpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eSAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB7IG9wYWNpdHk6IDEgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eSAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gbWVhc3VyZW1lbnQgZmVhdHVyZXNcbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aG91dCBwYWRkaW5nLCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBoZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ2hlaWdodCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0LmdldEZsb2F0VmFsdWUoaGVpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBidXQgd2l0aG91dCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBpbm5lckhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYW5kIGJvcmRlciBidXQgbWFyZ2luIG9wdGlvbmFsXG4gICAgICAgIG91dGVySGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCwgaW5jbHVkZU1hcmdpbikge1xuICAgICAgICAgICAgaWYgKGluY2x1ZGVNYXJnaW4gfHwgZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLXRvcCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbSA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1ib3R0b20nKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5zID0gbWFyZ2luVG9wLmdldEZsb2F0VmFsdWUobWFyZ2luVG9wLnByaW1pdGl2ZVR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tLmdldEZsb2F0VmFsdWUobWFyZ2luQm90dG9tLnByaW1pdGl2ZVR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgbWFyZ2lucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRob3V0IHBhZGRpbmcsIG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIHdpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCd3aWR0aCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0LmdldEZsb2F0VmFsdWUoaGVpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGJ1dCB3aXRob3V0IG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIGlubmVyV2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBhbmQgYm9yZGVyIGJ1dCBtYXJnaW4gb3B0aW9uYWxcbiAgICAgICAgb3V0ZXJXaWR0aDogZnVuY3Rpb24gKGVsZW1lbnQsIGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIGlmIChpbmNsdWRlTWFyZ2luIHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1sZWZ0JyksXG4gICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tcmlnaHQnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5zID0gbWFyZ2luTGVmdC5nZXRGbG9hdFZhbHVlKG1hcmdpbkxlZnQucHJpbWl0aXZlVHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodC5nZXRGbG9hdFZhbHVlKG1hcmdpblJpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnQub2Zmc2V0V2lkdGggKyBtYXJnaW5zKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b3A6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgICAgICAgICAgICgod2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHwgd2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsZWZ0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArXG4gICAgICAgICAgICAgICAgKCh3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCkgfHwgd2luZG93LmRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWJvdmVUaGVUb3A6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICBiZWxvd1RoZUZvbGQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICByaWdodE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCA+IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluVmlld3BvcnQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiAhKHJlY3QuYm90dG9tIDw9IDAgfHwgcmVjdC50b3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQgfHxcbiAgICAgICAgICAgICAgICByZWN0LnJpZ2h0IDw9IDAgfHwgcmVjdC5sZWZ0ID4gd2luZG93LmlubmVyV2lkdGgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfY3NzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGRhdGVcbiAgICB2YXIgbGFyb3V4X2RhdGUgPSB7XG4gICAgICAgIHNob3J0RGF0ZUZvcm1hdDogJ2RkLk1NLnl5eXknLFxuICAgICAgICBsb25nRGF0ZUZvcm1hdDogJ2RkIE1NTU0geXl5eScsXG4gICAgICAgIHRpbWVGb3JtYXQ6ICdISDptbScsXG5cbiAgICAgICAgbW9udGhzU2hvcnQ6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcbiAgICAgICAgbW9udGhzTG9uZzogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10sXG5cbiAgICAgICAgc3RyaW5nczoge1xuICAgICAgICAgICAgbm93OiAgICAgJ25vdycsXG4gICAgICAgICAgICBsYXRlcjogICAnbGF0ZXInLFxuICAgICAgICAgICAgYWdvOiAgICAgJ2FnbycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2Vjb25kcycsXG4gICAgICAgICAgICBhbWludXRlOiAnYSBtaW51dGUnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0ZXMnLFxuICAgICAgICAgICAgYWhvdXI6ICAgJ2EgaG91cicsXG4gICAgICAgICAgICBob3VyczogICAnaG91cnMnLFxuICAgICAgICAgICAgYWRheTogICAgJ2EgZGF5JyxcbiAgICAgICAgICAgIGRheXM6ICAgICdkYXlzJyxcbiAgICAgICAgICAgIGF3ZWVrOiAgICdhIHdlZWsnLFxuICAgICAgICAgICAgd2Vla3M6ICAgJ3dlZWtzJyxcbiAgICAgICAgICAgIGFtb250aDogICdhIG1vbnRoJyxcbiAgICAgICAgICAgIG1vbnRoczogICdtb250aHMnLFxuICAgICAgICAgICAgYXllYXI6ICAgJ2EgeWVhcicsXG4gICAgICAgICAgICB5ZWFyczogICAneWVhcnMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VFcG9jaDogZnVuY3Rpb24gKHRpbWVzcGFuLCBsaW1pdFdpdGhXZWVrcykge1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAxMDAwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Muc2Vjb25kcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbWludXRlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubWludXRlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWhvdXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5ob3VycztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWRheTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmRheXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDQgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXdlZWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy53ZWVrcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpbWl0V2l0aFdlZWtzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDMwICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbW9udGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5tb250aHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDM2NSAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXllYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MueWVhcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q3VzdG9tRGF0ZVN0cmluZzogZnVuY3Rpb24gKGZvcm1hdCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IGRhdGUgfHwgbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIC95eXl5fHl5fE1NTU18TU1NfE1NfE18ZGR8ZHxoaHxofEhIfEh8bW18bXxzc3xzfHR0fHQvZyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eXl5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0RnVsbFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNMb25nW25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLm1vbnRoc1Nob3J0W25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIChub3cuZ2V0TW9udGgoKSArIDEpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNb250aCgpICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXREYXRlKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldERhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjEgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgKCgoaG91cjEgJSAxMikgPiAwKSA/IGhvdXIxICUgMTIgOiAxMikpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjIgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoKGhvdXIyICUgMTIpID4gMCkgPyBob3VyMiAlIDEyIDogMTI7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0SG91cnMoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0SG91cnMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRNaW51dGVzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldE1pbnV0ZXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRTZWNvbmRzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFNlY29uZHMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BtJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhbSc7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3AnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2EnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF0ZURpZmZTdHJpbmc6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IG5vdyAtIGRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGFic1RpbWVzcGFuID0gTWF0aC5hYnModGltZXNwYW4pLFxuICAgICAgICAgICAgICAgIHBhc3QgPSAodGltZXNwYW4gPiAwKTtcblxuICAgICAgICAgICAgaWYgKGFic1RpbWVzcGFuIDw9IDMwMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5ub3c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aW1lc3BhbnN0cmluZyA9IGxhcm91eF9kYXRlLnBhcnNlRXBvY2goYWJzVGltZXNwYW4sIHRydWUpO1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuc3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuc3RyaW5nICtcbiAgICAgICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgKHBhc3QgPyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFnbyA6IGxhcm91eF9kYXRlLnN0cmluZ3MubGF0ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0U2hvcnREYXRlU3RyaW5nKGRhdGUsIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNob3J0RGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLnNob3J0RGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgZGF0ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMb25nRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0ICsgJyAnICsgbGFyb3V4X2RhdGUudGltZUZvcm1hdCA6IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9kYXRlO1xuXG59KCkpO1xuIiwiKGZ1bmN0aW9uIChsYXJvdXgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgICAgIC8vIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgLy8gbGFyb3V4X3RyaWdnZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudHJpZ2dlcnMuanMnKTtcblxuICAgIC8vIGRvbVxuICAgIHZhciBsYXJvdXhfZG9tID0ge1xuICAgICAgICBkb2Nwcm9wOiBmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhwcm9wTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlDbGFzczogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5VGFnOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5SWQ6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdFNpbmdsZTogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhdHRyOiBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlcywgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbb2xkQXR0cmlidXRlc10gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbiAoZWxlbWVudCwgZGF0YW5hbWVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgZGF0YW5hbWVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFuYW1lcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFuYW1lcyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGREYXRhbmFtZXMgPSBkYXRhbmFtZXM7XG4gICAgICAgICAgICAgICAgZGF0YW5hbWVzID0ge307XG4gICAgICAgICAgICAgICAgZGF0YW5hbWVzW29sZERhdGFuYW1lc10gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgZGF0YU5hbWUgaW4gZGF0YW5hbWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhbmFtZXMuaGFzT3duUHJvcGVydHkoZGF0YU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YW5hbWVzW2RhdGFOYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLScgKyBkYXRhTmFtZSwgZGF0YW5hbWVzW2RhdGFOYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRIaXN0b3J5OiBbXSxcbiAgICAgICAgc2V0RXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShlbGVtZW50c1tpXSwgZXZlbnRuYW1lLCBmbmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldEV2ZW50U2luZ2xlOiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgIHZhciBmbmNXcmFwcGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm5jKGUsIGVsZW1lbnQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeS5wdXNoKHsgZWxlbWVudDogZWxlbWVudCwgZXZlbnRuYW1lOiBldmVudG5hbWUsIGZuYzogZm5jLCBmbmNXcmFwcGVyOiBmbmNXcmFwcGVyIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50bmFtZSwgZm5jV3JhcHBlciwgZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuc2V0RXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaTEgPSAwLCBsZW5ndGgxID0gZWxlbWVudHMubGVuZ3RoOyBpMSA8IGxlbmd0aDE7IGkxKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiA9IDAsIGxlbmd0aDIgPSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeS5sZW5ndGg7IGkyIDwgbGVuZ3RoMjsgaTIrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGxhcm91eF9kb20uZXZlbnRIaXN0b3J5W2kyXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnRzW2kxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRuYW1lICE9PSB1bmRlZmluZWQgJiYgaXRlbS5ldmVudG5hbWUgIT09IGV2ZW50bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZm5jICE9PSB1bmRlZmluZWQgJiYgaXRlbS5mbmMgIT09IGZuYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtLmV2ZW50bmFtZSwgaXRlbS5mbmNXcmFwcGVyLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeVtpMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBjdXN0b21FdmVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjdXN0b21FdmVudFtpdGVtXSA9IGRhdGFbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1c3RvbUV2ZW50LmluaXRFdmVudChldmVudG5hbWUsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbUV2ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgICAgICB2YXIgZnJhZyA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgICAgICAgICAgdGVtcCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcblxuICAgICAgICAgICAgdGVtcC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGh0bWwpO1xuICAgICAgICAgICAgd2hpbGUgKHRlbXAuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGVtcC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbnVsbGluZyBvdXQgdGhlIHJlZmVyZW5jZSwgdGhlcmUgaXMgbm8gb2J2aW91cyBkaXNwb3NlIG1ldGhvZFxuICAgICAgICAgICAgdGVtcCA9IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiBmcmFnO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMgIT09IHVuZGVmaW5lZCAmJiBhdHRyaWJ1dGVzLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKGl0ZW0sIGF0dHJpYnV0ZXNbaXRlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiBjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjaGlsZHJlbi5oYXNPd25Qcm9wZXJ0eShpdGVtMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoaXRlbTIsIGNoaWxkcmVuW2l0ZW0yXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC8qIHR5cGVvZiBjaGlsZHJlbiA9PSAnc3RyaW5nJyAmJiAqL2NoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5hcHBlbmQoZWxlbSwgY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlT3B0aW9uOiBmdW5jdGlvbiAoZWxlbWVudCwga2V5LCB2YWx1ZSwgaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICAvKiBvbGQgYmVoYXZpb3VyLCBkb2VzIG5vdCBzdXBwb3J0IG9wdGdyb3VwcyBhcyBwYXJlbnRzLlxuICAgICAgICAgICAgdmFyIGNvdW50ID0gZWxlbWVudC5vcHRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGVsZW1lbnQub3B0aW9uc1tjb3VudF0gPSBuZXcgT3B0aW9uKHZhbHVlLCBrZXkpO1xuXG4gICAgICAgICAgICBpZiAoaXNEZWZhdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zLnNlbGVjdGVkSW5kZXggPSBjb3VudCAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB2YXIgb3B0aW9uID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ09QVElPTicpO1xuICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBrZXkpO1xuICAgICAgICAgICAgaWYgKGlzRGVmYXVsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChvcHRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeVZhbHVlOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5vcHRpb25zW2ldLmdldEF0dHJpYnV0ZSgndmFsdWUnKSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sLyosXG5cbiAgICAgICAgLy8gVE9ETzogaXQncyByZWR1bmRhbnQgZm9yIG5vd1xuICAgICAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdJTUcnKTtcbiAgICAgICAgICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIGFyZ3VtZW50c1tpXSk7XG5cbiAgICAgICAgICAgICAgICBpbWFnZXMucHVzaChpbWFnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbWFnZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZEFzeW5jU2NyaXB0OiBmdW5jdGlvbiAocGF0aCwgdHJpZ2dlck5hbWUsIGFzeW5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuICAgICAgICAgICAgZWxlbS50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgICBlbGVtLmFzeW5jID0gKGFzeW5jICE9PSB1bmRlZmluZWQpID8gYXN5bmMgOiB0cnVlO1xuICAgICAgICAgICAgZWxlbS5zcmMgPSBwYXRoO1xuXG4gICAgICAgICAgICB2YXIgbG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgoZWxlbS5yZWFkeVN0YXRlICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJyAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdsb2FkZWQnKSB8fCBsb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdHJpZ2dlck5hbWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlck5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5vbnRyaWdnZXIodHJpZ2dlck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGhlYWQgPSB3aW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZEFzeW5jU3R5bGU6IGZ1bmN0aW9uIChwYXRoLCB0cmlnZ2VyTmFtZSwgYXN5bmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJTksnKTtcblxuICAgICAgICAgICAgZWxlbS50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLmhyZWYgPSBwYXRoO1xuICAgICAgICAgICAgZWxlbS5yZWwgPSAnc3R5bGVzaGVldCc7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IHdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgfSwqL1xuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluc2VydDogZnVuY3Rpb24gKGVsZW1lbnQsIHBvc2l0aW9uLCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChwb3NpdGlvbiwgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJlcGVuZDogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlVGV4dDogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIC8vIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb25lUmV0dXJuOiAwLFxuICAgICAgICBjbG9uZUFwcGVuZDogMSxcbiAgICAgICAgY2xvbmVJbnNlcnRBZnRlcjogMixcbiAgICAgICAgY2xvbmVJbnNlcnRCZWZvcmU6IDMsXG5cbiAgICAgICAgY2xvbmU6IGZ1bmN0aW9uIChlbGVtZW50LCB0eXBlLCBjb250YWluZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgdmFyIG5ld0VsZW1lbnQgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZWxlbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlICE9IGxhcm91eF9kb20uY2xvbmVSZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lQXBwZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUluc2VydEFmdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyB0eXBlID09IGxhcm91eF9kb20uY2xvbmVJbnNlcnRCZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ld0VsZW1lbnQ7XG4gICAgICAgIH0vKixcblxuICAgICAgICAvLyBUT0RPOiBpdCdzIHJlZHVuZGFudCBmb3Igbm93XG4gICAgICAgIGFwcGx5T3BlcmF0aW9uczogZnVuY3Rpb24gKGVsZW1lbnQsIG9wZXJhdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIG9wZXJhdGlvbiBpbiBvcGVyYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcGVyYXRpb25zLmhhc093blByb3BlcnR5KG9wZXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYmluZGluZyBpbiBvcGVyYXRpb25zW29wZXJhdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvcGVyYXRpb25zW29wZXJhdGlvbl0uaGFzT3duUHJvcGVydHkoYmluZGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3BlcmF0aW9uc1tvcGVyYXRpb25dW2JpbmRpbmddO1xuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXRwcm9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZy5zdWJzdHJpbmcoMCwgMSkgPT0gJ18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRwcm9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZy5zdWJzdHJpbmcoMCwgMSkgPT0gJ18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpLCBlbGVtZW50LmdldEF0dHJpYnV0ZShiaW5kaW5nLnN1YnN0cmluZygxKSkgKyB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZXByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5zdWJzdHJpbmcoMCwgMSkgPT0gJ18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHZhbHVlLnN1YnN0cmluZygxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWRkY2xhc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3MuYWRkQ2xhc3MoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3ZlY2xhc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3MucmVtb3ZlQ2xhc3MoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWRkc3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgYmluZGluZywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3Zlc3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgdmFsdWUsICdpbmhlcml0ICFpbXBvcnRhbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlcGVhdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wZXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0qL1xuICAgIH07XG5cbiAgICAvLyBhIGZpeCBmb3IgSW50ZXJuZXQgRXhwbG9yZXJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgd2luZG93LkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnRFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhcm91eF9kb207XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gZXZlbnRzXG4gICAgdmFyIGxhcm91eF9ldmVudHMgPSB7XG4gICAgICAgIGRlbGVnYXRlczogW10sXG5cbiAgICAgICAgYWRkOiBmdW5jdGlvbiAoZXZlbnQsIGZuYykge1xuICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMucHVzaCh7IGV2ZW50OiBldmVudCwgZm5jOiBmbmMgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW52b2tlOiBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9ldmVudHMuZGVsZWdhdGVzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfZXZlbnRzLmRlbGVnYXRlc1tpdGVtXS5ldmVudCAhPSBldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlc1tpdGVtXS5mbmMoYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9ldmVudHM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2FqYXggPSByZXF1aXJlKCcuL2xhcm91eC5hamF4LmpzJyk7XG5cbiAgICAvLyBmb3Jtc1xuICAgIHZhciBsYXJvdXhfZm9ybXMgPSB7XG4gICAgICAgIGFqYXhGb3JtOiBmdW5jdGlvbiAoZm9ybW9iaiwgZm5jLCBmbmNCZWdpbikge1xuICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudChmb3Jtb2JqLCAnc3VibWl0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChmbmNCZWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuY0JlZ2luKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgucG9zdChcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5nZXRBdHRyaWJ1dGUoJ2FjdGlvbicpLFxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZm9ybXMuc2VyaWFsaXplRm9ybURhdGEoZm9ybW9iaiksXG4gICAgICAgICAgICAgICAgICAgIGZuY1xuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0Zvcm1GaWVsZDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnRklMRScgfHwgdHlwZSA9PT0gJ0NIRUNLQk9YJyB8fCB0eXBlID09PSAnUkFESU8nIHx8IHR5cGUgPT09ICdURVhUJyB8fCB0eXBlID09PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT09ICdISURERU4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Rm9ybUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5kaXNhYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdGSUxFJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5maWxlc1swXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ0NIRUNLQk9YJyB8fCB0eXBlID09PSAnUkFESU8nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdURVhUJyB8fCB0eXBlID09PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT09ICdISURERU4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEZvcm1GaWVsZFZhbHVlOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG9wdGlvbiBpbiBlbGVtZW50Lm9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lm9wdGlvbnMuaGFzT3duUHJvcGVydHkob3B0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5vcHRpb25zW29wdGlvbl0udmFsdWUgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IG9wdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnRklMRScpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5maWxlc1swXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ0NIRUNLQk9YJyB8fCB0eXBlID09ICdSQURJTycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09IGVsZW1lbnQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ1RFWFQnIHx8IHR5cGUgPT0gJ1BBU1NXT1JEJyB8fCB0eXBlID09ICdISURERU4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0b2dnbGVGb3JtRWRpdGluZzogZnVuY3Rpb24gKGZvcm1vYmosIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZvcm1vYmouZ2V0QXR0cmlidXRlKCdkYXRhLWxhc3QtZW5hYmxlZCcpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1vYmouc2V0QXR0cmlidXRlKCdkYXRhLWxhc3QtZW5hYmxlZCcsICdlbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9mb3Jtcy5pc0Zvcm1GaWVsZChzZWxlY3Rpb25bc2VsZWN0ZWRdKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbGFzdERpc2FibGVkID0gc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3REaXNhYmxlZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1kaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXN0RGlzYWJsZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbltzZWxlY3RlZF0ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpYWxpemVGb3JtRGF0YTogZnVuY3Rpb24gKGZvcm1vYmopIHtcbiAgICAgICAgICAgIHZhciBmb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbGFyb3V4X2Zvcm1zLmdldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1kYXRhLmFwcGVuZChzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnbmFtZScpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZm9ybWRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoZm9ybW9iaikge1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbGFyb3V4X2Zvcm1zLmdldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc1tzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfSxcblxuICAgICAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKGZvcm1vYmosIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9mb3Jtcy5zZXRGb3JtRmllbGRWYWx1ZShzZWxlY3Rpb25bc2VsZWN0ZWRdLCBkYXRhW3NlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2Zvcm1zO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGhlbHBlcnNcbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSB7XG4gICAgICAgIHVuaXF1ZUlkOiAwLFxuXG4gICAgICAgIGdldFVuaXF1ZUlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCBwbHVzcGx1czogdHJ1ZSAqL1xuICAgICAgICAgICAgcmV0dXJuICd1aWQtJyArICgrK2xhcm91eF9oZWxwZXJzLnVuaXF1ZUlkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiAodmFsdWVzLCByZmMzOTg2KSB7XG4gICAgICAgICAgICB2YXIgdXJpID0gJycsXG4gICAgICAgICAgICAgICAgcmVnRXggPSAvJTIwL2c7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmZjMzk4NiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpICs9ICcmJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKS5yZXBsYWNlKHJlZ0V4LCAnKycpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tuYW1lXS50b1N0cmluZygpKS5yZXBsYWNlKHJlZ0V4LCAnKycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpICs9ICcmJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbbmFtZV0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1cmkuc3Vic3RyKDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkRm9ybURhdGE6IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmFwcGVuZChuYW1lLCB2YWx1ZXNbbmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9ybWF0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmdzKS5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbiAoKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmdzKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZUFsbDogZnVuY3Rpb24gKHRleHQsIGRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoT2JqZWN0LmtleXMoZGljdGlvbmFyeSkuam9pbignfCcpLCAnZycpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIHJlLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGljdGlvbmFyeVttYXRjaF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYW1lbENhc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyQ2hhciA9IHZhbHVlLmNoYXJBdChqKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckNoYXIgPT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gKCFmbGFnKSA/IGN1cnJDaGFyIDogY3VyckNoYXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW50aUNhbWVsQ2FzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyckNoYXIgPSB2YWx1ZS5jaGFyQXQoaik7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJDaGFyICE9ICctJyAmJiBjdXJyQ2hhciA9PSBjdXJyQ2hhci50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSAnLScgKyBjdXJyQ2hhci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gY3VyckNoYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcXVvdGVBdHRyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnJmFwb3M7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG4vZywgJyYjMTM7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFxyXFxuXS9nLCAnJiMxMzsnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzcGxpY2VTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNvdW50LCBhZGQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgwLCBpbmRleCkgKyAoYWRkIHx8ICcnKSArIHZhbHVlLnNsaWNlKGluZGV4ICsgY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmRvbTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgICAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kOiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgb2JqLnNvbWUoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV4dGVuZE9iamVjdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IHRhcmdldCBpbnN0YW5jZW9mIEFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gYXJndW1lbnRzW2l0ZW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0YXJnZXQucHVzaChhcmd1bWVudHNbaXRlbV1bbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgICAgICAvKiB0YXJnZXRbbmFtZV0uY29uc3RydWN0b3IgPT09IE9iamVjdCAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KG5hbWUpICYmIHRhcmdldFtuYW1lXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZXh0ZW5kT2JqZWN0KHRhcmdldFtuYW1lXSwgYXJndW1lbnRzW2l0ZW1dW25hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gYXJndW1lbnRzW2l0ZW1dW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlYWNoOiBmdW5jdGlvbiAoYXJyLCBmbmMsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmbmMoaXRlbSwgYXJyW2l0ZW1dKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1hcDogZnVuY3Rpb24gKGFyciwgZm5jLCBkb250U2tpcFJldHVybnMsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMoYXJyW2l0ZW1dLCBpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWRvbnRTa2lwUmV0dXJucyAmJiByZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluZGV4OiBmdW5jdGlvbiAoYXJyLCB2YWx1ZSwgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGFycltpdGVtXSA9PT0gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWVhY2g6IGZ1bmN0aW9uIChhcnIsIGZuYykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChmbmMoaSwgYXJyW2ldKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFtYXA6IGZ1bmN0aW9uIChhcnIsIGZuYywgZG9udFNraXBSZXR1cm5zKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYyhhcnJbaV0sIGkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZG9udFNraXBSZXR1cm5zICYmIHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMudW5zaGlmdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWluZGV4OiBmdW5jdGlvbiAoYXJyLCB2YWx1ZSwgc3RhcnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAoc3RhcnQgfHwgMCksIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbHVtbjogZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMubWFwKG9iaiwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaHVmZmxlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgIHNodWZmbGVkID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJhbmQgPSBsYXJvdXhfaGVscGVycy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHNodWZmbGVkW2luZGV4KytdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICAgICAgICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBvYmpbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzaHVmZmxlZDtcbiAgICAgICAgfSxcblxuICAgICAgICBtZXJnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgdG1wID0gdGFyZ2V0LFxuICAgICAgICAgICAgICAgIGlzQXJyYXkgPSB0bXAgaW5zdGFuY2VvZiBBcnJheTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgPSB0bXAuY29uY2F0KGFyZ3VtZW50c1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gYXJndW1lbnRzW2l0ZW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXJndW1lbnRzW2l0ZW1dLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRtcFthdHRyXSA9IGFyZ3VtZW50c1tpdGVtXVthdHRyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0bXA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHVwbGljYXRlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0FycmF5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpdGVtcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBvYmpbaV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRBc0FycmF5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXM7XG5cbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gb2JqO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBOb2RlTGlzdCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zW2ldID0gb2JqW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBbb2JqXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExlbmd0aDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRLZXlzUmVjdXJzaXZlOiBmdW5jdGlvbiAob2JqLCBkZWxpbWl0ZXIsIHByZWZpeCwga2V5cykge1xuICAgICAgICAgICAgaWYgKGRlbGltaXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gJy4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwcmVmaXggPSAnJztcbiAgICAgICAgICAgICAgICBrZXlzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKHByZWZpeCArIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9ialtpdGVtXSAhPT0gdW5kZWZpbmVkICYmIG9ialtpdGVtXSAhPT0gbnVsbCAmJiBvYmpbaXRlbV0uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5nZXRLZXlzUmVjdXJzaXZlKG9ialtpdGVtXSwgZGVsaW1pdGVyLCBwcmVmaXggKyBpdGVtICsgZGVsaW1pdGVyLCBrZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFbGVtZW50OiBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUsIGRlbGltaXRlcikge1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbGltaXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gJy4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcG9zID0gcGF0aC5pbmRleE9mKGRlbGltaXRlcik7XG4gICAgICAgICAgICB2YXIga2V5O1xuICAgICAgICAgICAgdmFyIHJlc3Q7XG4gICAgICAgICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhdGg7XG4gICAgICAgICAgICAgICAgcmVzdCA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhdGguc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgcmVzdCA9IHBhdGguc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIShrZXkgaW4gb2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXN0ID09PSBudWxsIHx8IHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChvYmpba2V5XSwgcmVzdCwgZGVmYXVsdFZhbHVlLCBkZWxpbWl0ZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfaGVscGVycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBjb3JlXG4gICAgdmFyIGxhcm91eCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4LmhlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgIC8vIEZJWE1FOiBub24tY2hyb21lIG9wdGltaXphdGlvblxuICAgICAgICB2YXIgcmUgPSAvXiMoW15cXCtcXD5cXFtcXF1cXC4jIF0qKSQvLmV4ZWMoc2VsZWN0b3IpO1xuICAgICAgICBpZiAocmUpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyZVsxXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuZ2V0RWxlbWVudEJ5SWQocmVbMV0pO1xuICAgICAgICB9XG4gICAgICAgICovXG5cbiAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH07XG5cbiAgICBsYXJvdXguZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyk7XG4gICAgbGFyb3V4LmhlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpO1xuXG4gICAgbGFyb3V4LmNhY2hlZCA9IHtcbiAgICAgICAgc2luZ2xlOiB7fSxcbiAgICAgICAgYXJyYXk6IHt9LFxuICAgICAgICBpZDoge31cbiAgICB9O1xuXG4gICAgbGFyb3V4LmMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXguY2FjaGVkLmFycmF5W3NlbGVjdG9yXSB8fCAoXG4gICAgICAgICAgICAgICAgbGFyb3V4LmNhY2hlZC5hcnJheVtzZWxlY3Rvcl0gPSBsYXJvdXguaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGFyb3V4LmNhY2hlZC5zaW5nbGVbc2VsZWN0b3JdIHx8IChcbiAgICAgICAgICAgIGxhcm91eC5jYWNoZWQuc2luZ2xlW3NlbGVjdG9yXSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZGMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuaWRbc2VsZWN0b3JdIHx8XG4gICAgICAgICAgICAobGFyb3V4LmNhY2hlZC5pZFtzZWxlY3Rvcl0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikpO1xuICAgIH07XG5cbiAgICBsYXJvdXgucmVhZHlQYXNzZWQgPSBmYWxzZTtcblxuICAgIGxhcm91eC5leHRlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmNhbGwoYXJndW1lbnRzLCBsYXJvdXgpO1xuICAgICAgICBsYXJvdXguaGVscGVycy5leHRlbmRPYmplY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LmV4dGVuZE9iamVjdCA9IGxhcm91eC5oZWxwZXJzLmV4dGVuZE9iamVjdDtcbiAgICBsYXJvdXguZWFjaCA9IGxhcm91eC5oZWxwZXJzLmVhY2g7XG4gICAgbGFyb3V4Lm1hcCA9IGxhcm91eC5oZWxwZXJzLm1hcDtcbiAgICBsYXJvdXguaW5kZXggPSBsYXJvdXguaGVscGVycy5pbmRleDtcbiAgICBsYXJvdXguYWVhY2ggPSBsYXJvdXguaGVscGVycy5hZWFjaDtcbiAgICBsYXJvdXguYW1hcCA9IGxhcm91eC5oZWxwZXJzLmFtYXA7XG4gICAgbGFyb3V4LmFpbmRleCA9IGxhcm91eC5oZWxwZXJzLmFpbmRleDtcblxuICAgIGxhcm91eC5yZWFkeSA9IGZ1bmN0aW9uIChmbmMpIHtcbiAgICAgICAgaWYgKCFsYXJvdXgucmVhZHlQYXNzZWQpIHtcbiAgICAgICAgICAgIGxhcm91eC5ldmVudHMuYWRkKCdDb250ZW50TG9hZGVkJywgZm5jKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZuYygpO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnRE9NQ29udGVudExvYWRlZCcsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXgucmVhZHlQYXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4LmV2ZW50cy5pbnZva2UoJ0NvbnRlbnRMb2FkZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldEludGVydmFsKGxhcm91eC50aW1lcnMub250aWNrLCAxMDApO1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXgucmVhZHlQYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoISgnJGwnIGluIHdpbmRvdykpIHtcbiAgICAgICAgICAgIHdpbmRvdy4kbCA9IGxhcm91eDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIG9wdGlvbmFsIG1vZHVsZXNcbiAgICBsYXJvdXgud3JhcHBlciA9IHJlcXVpcmUoJy4vbGFyb3V4LndyYXBwZXIuanMnKTtcbiAgICBsYXJvdXguYWpheCA9IHJlcXVpcmUoJy4vbGFyb3V4LmFqYXguanMnKTtcbiAgICBsYXJvdXguY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyk7XG4gICAgbGFyb3V4LmRvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpO1xuICAgIGxhcm91eC5ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKTtcbiAgICBsYXJvdXguZm9ybXMgPSByZXF1aXJlKCcuL2xhcm91eC5mb3Jtcy5qcycpO1xuICAgIGxhcm91eC5oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuICAgIGxhcm91eC50aW1lcnMgPSByZXF1aXJlKCcuL2xhcm91eC50aW1lcnMuanMnKTtcbiAgICBsYXJvdXgudHJpZ2dlcnMgPSByZXF1aXJlKCcuL2xhcm91eC50cmlnZ2Vycy5qcycpO1xuICAgIGxhcm91eC52YXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudmFycy5qcycpO1xuXG4gICAgbGFyb3V4LmFuaW0gPSByZXF1aXJlKCcuL2xhcm91eC5hbmltLmpzJyk7XG4gICAgbGFyb3V4LmRhdGUgPSByZXF1aXJlKCcuL2xhcm91eC5kYXRlLmpzJyk7XG4gICAgbGFyb3V4LmtleXMgPSByZXF1aXJlKCcuL2xhcm91eC5rZXlzLmpzJyk7XG4gICAgbGFyb3V4Lm12YyA9IHJlcXVpcmUoJy4vbGFyb3V4Lm12Yy5qcycpO1xuICAgIGxhcm91eC5zdGFjayA9IHJlcXVpcmUoJy4vbGFyb3V4LnN0YWNrLmpzJyk7XG4gICAgbGFyb3V4LnRlbXBsYXRlcyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRlbXBsYXRlcy5qcycpO1xuICAgIGxhcm91eC50b3VjaCA9IHJlcXVpcmUoJy4vbGFyb3V4LnRvdWNoLmpzJyk7XG4gICAgbGFyb3V4LnVpID0gcmVxdWlyZSgnLi9sYXJvdXgudWkuanMnKTtcblxuICAgIHJldHVybiBsYXJvdXg7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2Zvcm1zID0gcmVxdWlyZSgnLi9sYXJvdXguZm9ybXMuanMnKTtcblxuICAgIC8vIGtleXNcbiAgICB2YXIgbGFyb3V4X2tleXMgPSB7XG4gICAgICAgIGtleU5hbWU6IGZ1bmN0aW9uIChrZXljb2RlKSB7XG4gICAgICAgICAgICBrZXljb2RlID0ga2V5Y29kZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGtleWNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2JhY2tzcGFjZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDg7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDk7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcbiAgICAgICAgICAgIGNhc2UgJ3JldHVybic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEzO1xuXG4gICAgICAgICAgICBjYXNlICdlc2MnOlxuICAgICAgICAgICAgY2FzZSAnZXNjYXBlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMjc7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzI7XG5cbiAgICAgICAgICAgIGNhc2UgJ3BndXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzMztcblxuICAgICAgICAgICAgY2FzZSAncGdkbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM0O1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNTtcblxuICAgICAgICAgICAgY2FzZSAnaG9tZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM2O1xuXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzc7XG5cbiAgICAgICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzg7XG5cbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzk7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgICAgICAgIHJldHVybiA0MDtcblxuICAgICAgICAgICAgY2FzZSAnaW5zZXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gNDU7XG5cbiAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ2O1xuXG4gICAgICAgICAgICBjYXNlICdmMSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExMjtcblxuICAgICAgICAgICAgY2FzZSAnZjInOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTM7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE0O1xuXG4gICAgICAgICAgICBjYXNlICdmNCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNTtcblxuICAgICAgICAgICAgY2FzZSAnZjUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y2JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE3O1xuXG4gICAgICAgICAgICBjYXNlICdmNyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExODtcblxuICAgICAgICAgICAgY2FzZSAnZjgnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTk7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y5JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIwO1xuXG4gICAgICAgICAgICBjYXNlICdmMTAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjE7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxMSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMjtcblxuICAgICAgICAgICAgY2FzZSAnZjEyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIzO1xuXG4gICAgICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTg4O1xuXG4gICAgICAgICAgICBjYXNlICcuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTkwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShrZXljb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB7dGFyZ2V0LCBrZXksIHNoaWZ0LCBjdHJsLCBhbHQsIGRpc2FibGVJbnB1dHMsIGZuY31cbiAgICAgICAgYXNzaWduOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gd2luZG93LmV2ZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDMgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMTEpIHsgLy8gZWxlbWVudC5ub2RlVHlwZSA9PT0gMSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpc2FibGVJbnB1dHMgJiYgbGFyb3V4X2Zvcm1zLmlzRm9ybUZpZWxkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaGlmdCAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmN0cmwgJiYgIWV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFsdCAmJiAhZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gbGFyb3V4X2tleXMua2V5TmFtZShvcHRpb25zLmtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gKGV2ZW50LmtleUNvZGUgfHwgZXZlbnQud2hpY2gpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmZuYyhldmVudCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KG9wdGlvbnMudGFyZ2V0IHx8IHdpbmRvdy5kb2N1bWVudCwgJ2tleWRvd24nLCB3cmFwcGVyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2tleXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyksXG4gICAgICAgIGxhcm91eF9zdGFjayA9IHJlcXVpcmUoJy4vbGFyb3V4LnN0YWNrLmpzJyk7XG5cbiAgICAvLyBtdmNcbiAgICB2YXIgbGFyb3V4X212YyA9IHtcbiAgICAgICAgYXBwczoge30sXG4gICAgICAgIHBhdXNlVXBkYXRlOiBmYWxzZSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gbGFyb3V4X2RvbS5zZWxlY3RCeUlkKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiAobW9kZWwuY29uc3RydWN0b3IgIT09IGxhcm91eF9zdGFjaykge1xuICAgICAgICAgICAgLy8gICAgIG1vZGVsID0gbmV3IGxhcm91eF9zdGFjayhtb2RlbCk7XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIHZhciBhcHBLZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaWQnKTtcblxuICAgICAgICAgICAgbW9kZWwub251cGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9tdmMucGF1c2VVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X212Yy51cGRhdGUoYXBwS2V5KTsgLy8gLCBbZXZlbnQua2V5XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMuYXBwc1thcHBLZXldID0ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsIC8vICxcbiAgICAgICAgICAgICAgICAvLyBtb2RlbEtleXM6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gYm91bmRFbGVtZW50czogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBldmVudEVsZW1lbnRzOiBudWxsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfbXZjLnJlYmluZChhcHBLZXkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYmluZDogZnVuY3Rpb24gKGFwcEtleSkge1xuICAgICAgICAgICAgdmFyIGFwcCA9IGxhcm91eF9tdmMuYXBwc1thcHBLZXldO1xuICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgIGFwcC5tb2RlbEtleXMgPSBsYXJvdXhfaGVscGVycy5nZXRLZXlzUmVjdXJzaXZlKGFwcC5tb2RlbC5fZGF0YSk7IC8vIEZJWE1FOiB3b3JrcyBvbmx5IGZvciAkbC5zdGFja1xuICAgICAgICAgICAgYXBwLmJvdW5kRWxlbWVudHMgPSB7fTtcbiAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzID0gW107XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMuc2NhbkVsZW1lbnRzKGFwcCwgYXBwLmVsZW1lbnQpO1xuICAgICAgICAgICAgbGFyb3V4X212Yy51cGRhdGUoYXBwS2V5KTtcblxuICAgICAgICAgICAgdmFyIGZuYyA9IGZ1bmN0aW9uIChldiwgZWxlbSkge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nID0gbGFyb3V4X212Yy5iaW5kU3RyaW5nUGFyc2VyKGVsZW0uZ2V0QXR0cmlidXRlKCdsci1ldmVudCcpKTtcbiAgICAgICAgICAgICAgICAvLyBsYXJvdXhfbXZjLnBhdXNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gPT09IG51bGwgfHwgIWJpbmRpbmcuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdbaXRlbV0uY2hhckF0KDApID09ICdcXCcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAubW9kZWxbaXRlbV0gPSBiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZygxLCBiaW5kaW5nW2l0ZW1dLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDAsIDUpID09ICdhdHRyLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGVsZW0uZ2V0QXR0cmlidXRlKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZygwLCA1KSA9PSAncHJvcC4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAubW9kZWxbaXRlbV0gPSBlbGVtW2JpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDUpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBsYXJvdXhfbXZjLnBhdXNlVXBkYXRlID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXBwLmV2ZW50RWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50c1tpXS5lbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50c1tpXS5iaW5kaW5nW251bGxdLFxuICAgICAgICAgICAgICAgICAgICBmbmNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNjYW5FbGVtZW50czogZnVuY3Rpb24gKGFwcCwgZWxlbWVudCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGF0dHMgPSBlbGVtZW50LmF0dHJpYnV0ZXMsIG0gPSBhdHRzLmxlbmd0aDsgaSA8IG07IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRzW2ldLm5hbWUgPT0gJ2xyLWJpbmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nMSA9IGxhcm91eF9tdmMuYmluZFN0cmluZ1BhcnNlcihhdHRzW2ldLnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGJpbmRpbmcxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJpbmRpbmcxLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHAuYm91bmRFbGVtZW50c1tiaW5kaW5nMVtpdGVtXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAuYm91bmRFbGVtZW50c1tiaW5kaW5nMVtpdGVtXV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRzW2ldLm5hbWUgPT0gJ2xyLWV2ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmluZGluZzIgPSBsYXJvdXhfbXZjLmJpbmRTdHJpbmdQYXJzZXIoYXR0c1tpXS52YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzogYmluZGluZzJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgY2hsZHJuID0gZWxlbWVudC5jaGlsZE5vZGVzLCBuID0gY2hsZHJuLmxlbmd0aDsgaiA8IG47IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChjaGxkcm5bal0ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X212Yy5zY2FuRWxlbWVudHMoYXBwLCBjaGxkcm5bal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChhcHBLZXksIGtleXMpIHtcbiAgICAgICAgICAgIHZhciBhcHAgPSBsYXJvdXhfbXZjLmFwcHNbYXBwS2V5XTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXlzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAga2V5cyA9IGFwcC5tb2RlbEtleXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGgxID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGgxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXlzW2ldIGluIGFwcC5ib3VuZEVsZW1lbnRzKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgYm91bmRFbGVtZW50ID0gYXBwLmJvdW5kRWxlbWVudHNba2V5c1tpXV07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgbGVuZ3RoMiA9IGJvdW5kRWxlbWVudC5sZW5ndGg7IGogPCBsZW5ndGgyOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDAsIDYpID09ICdzdHlsZS4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZEVsZW1lbnRbal0uZWxlbWVudC5zdHlsZVtib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg2KV0gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KGFwcC5tb2RlbCwga2V5c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNSkgPT0gJ2F0dHIuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRklYTUUgcmVtb3ZlQXR0cmlidXRlIG9uIG51bGwgdmFsdWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZEVsZW1lbnRbal0uZWxlbWVudC5zZXRBdHRyaWJ1dGUoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoNSksIGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNSkgPT0gJ3Byb3AuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRklYTUUgcmVtb3ZlQXR0cmlidXRlIG9uIG51bGwgdmFsdWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZEVsZW1lbnRbal0uZWxlbWVudFtib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg1KV0gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KGFwcC5tb2RlbCwga2V5c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmluZFN0cmluZ1BhcnNlcjogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgICAgIHZhciBsYXN0QnVmZmVyID0gbnVsbCxcbiAgICAgICAgICAgICAgICBidWZmZXIgPSAnJyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IDAsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSB0ZXh0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnIgPSB0ZXh0LmNoYXJBdChpKTtcblxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyciA9PSAnOicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RCdWZmZXIgPSBidWZmZXIudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyID09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtsYXN0QnVmZmVyXSA9IGJ1ZmZlci50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gY3VycjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2xhc3RCdWZmZXJdID0gYnVmZmVyLnRyaW0oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X212YztcblxufSgpKTtcbiIsIi8qanNsaW50IG5vbWVuOiB0cnVlICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gc3RhY2tcbiAgICB2YXIgbGFyb3V4X3N0YWNrID0gZnVuY3Rpb24gKGRhdGEsIGRlcHRoLCB0b3ApIHtcbiAgICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgICAgICB0aGlzLl9kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLl90b3AgPSB0b3AgfHwgdGhpcztcblxuICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBkZWxldGUgdGhpcy5fZGF0YVtrZXldO1xuXG4gICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW2tleV0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSBuZXcgbGFyb3V4X3N0YWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZXB0aCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVwdGggKyAnLicgKyBrZXkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvcFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLl9kYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RhdGFba2V5XSA9PT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuc2V0KHRoaXMsIGtleSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvcC5vbnVwZGF0ZSh7IHNjb3BlOiB0aGlzLCBrZXk6IGtleSwgb2xkVmFsdWU6IG9sZFZhbHVlLCBuZXdWYWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0UmFuZ2UgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB2YWx1ZUtleSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eSh2YWx1ZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQodmFsdWVLZXksIHZhbHVlc1t2YWx1ZUtleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1trZXldIHx8IGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0UmFuZ2UgPSBmdW5jdGlvbiAoa2V5cykge1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWtleXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFsdWVzW2tleXNbaXRlbV1dID0gdGhpc1trZXlzW2l0ZW1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YSkubGVuZ3RoO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZXhpc3RzID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIChrZXkgaW4gdGhpcy5fZGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5IGluIHRoaXMuX2RhdGEpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1trZXldO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdGhpcy5fZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1tpdGVtXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub251cGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZXRSYW5nZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3N0YWNrO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gdGVtcGxhdGVzXG4gICAgdmFyIGxhcm91eF90ZW1wbGF0ZXMgPSB7XG4gICAgICAgIGVuZ2luZXM6IHtcbiAgICAgICAgICAgIHBsYWluOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbdGVtcGxhdGUsIG9wdGlvbnNdO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbXBpbGVkWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGljdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbmRleDtcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKG5leHRJbmRleCA9IHJlc3VsdC5pbmRleE9mKCd7eycsIGxhc3RJbmRleCkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4ICs9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xvc2VJbmRleCA9IHJlc3VsdC5pbmRleE9mKCd9fScsIG5leHRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHJlc3VsdC5zdWJzdHJpbmcobmV4dEluZGV4LCBjbG9zZUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpY3RbJ3t7JyArIGtleSArICd9fSddID0gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChtb2RlbCwga2V5LCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBjbG9zZUluZGV4ICsgMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5yZXBsYWNlQWxsKHJlc3VsdCwgZGljdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaG9nYW46IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5Ib2dhbi5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZC5yZW5kZXIobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG11c3RhY2hlOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuTXVzdGFjaGUuY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhhbmRsZWJhcnM6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5IYW5kbGViYXJzLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBsb2Rhc2g6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5fLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1bmRlcnNjb3JlOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IG5vbWVuOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuXy5jb21waWxlKHRlbXBsYXRlLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmdpbmU6ICdwbGFpbicsXG5cbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQsIGVuZ2luZSA9IGxhcm91eF90ZW1wbGF0ZXMuZW5naW5lc1tsYXJvdXhfdGVtcGxhdGVzLmVuZ2luZV07XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxIHx8IGVsZW1lbnQubm9kZVR5cGUgPT09IDMgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gZWxlbWVudC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IGVsZW1lbnQubm9kZVZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29tcGlsZWQgPSBlbmdpbmUuY29tcGlsZShjb250ZW50LCBvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBlbmdpbmUucmVuZGVyKGNvbXBpbGVkLCBtb2RlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0OiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwsIHRhcmdldCwgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBsYXJvdXhfdGVtcGxhdGVzLmFwcGx5KGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5pbnNlcnQodGFyZ2V0LCBwb3NpdGlvbiB8fCAnYmVmb3JlZW5kJywgb3V0cHV0KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlOiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwsIHRhcmdldCwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGxhcm91eF90ZW1wbGF0ZXMuYXBwbHkoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UodGFyZ2V0LCBvdXRwdXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGVtcGxhdGVzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHRpbWVyc1xuICAgIHZhciBsYXJvdXhfdGltZXJzID0ge1xuICAgICAgICBkYXRhOiBbXSxcblxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh0aW1lcikge1xuICAgICAgICAgICAgdGltZXIubmV4dCA9IERhdGUubm93KCkgKyB0aW1lci50aW1lb3V0O1xuICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5kYXRhLnB1c2godGltZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0S2V5ID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdGltZXJzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90aW1lcnMuZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdGltZXJzLmRhdGFbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0uaWQgIT09IHVuZGVmaW5lZCAmJiBjdXJyZW50SXRlbS5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRLZXkgPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEuc3BsaWNlKHRhcmdldEtleSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbnRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdGltZXJzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90aW1lcnMuZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdGltZXJzLmRhdGFbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0ubmV4dCA8PSBub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGN1cnJlbnRJdGVtLm9udGljayhjdXJyZW50SXRlbS5zdGF0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UgJiYgY3VycmVudEl0ZW0ucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLm5leHQgPSBub3cgKyBjdXJyZW50SXRlbS50aW1lb3V0O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3RpbWVycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpO1xuXG4gICAgLy8gdG91Y2ggLSBwYXJ0aWFsbHkgdGFrZW4gZnJvbSAndG9jY2EuanMnIHByb2plY3RcbiAgICAvLyAgICAgICAgIGNhbiBiZSBmb3VuZCBhdDogaHR0cHM6Ly9naXRodWIuY29tL0dpYW5sdWNhR3VhcmluaS9Ub2NjYS5qc1xuICAgIHZhciBsYXJvdXhfdG91Y2ggPSB7XG4gICAgICAgIHRvdWNoU3RhcnRlZDogbnVsbCxcbiAgICAgICAgc3dpcGVUcmVzaG9sZDogODAsXG4gICAgICAgIHByZWNpc2lvbjogMzAsXG4gICAgICAgIHRhcENvdW50OiAwLFxuICAgICAgICB0YXBUcmVzaG9sZDogMjAwLFxuICAgICAgICBsb25nVGFwVHJlc2hvbGQ6IDgwMCxcbiAgICAgICAgdGFwVGltZXI6IG51bGwsXG4gICAgICAgIHBvczogbnVsbCxcbiAgICAgICAgY2FjaGVkOiBudWxsLFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgc3RhcnQ6IFsndG91Y2hzdGFydCcsICdwb2ludGVyZG93bicsICdNU1BvaW50ZXJEb3duJywgJ21vdXNlZG93biddLFxuICAgICAgICAgICAgZW5kOiBbJ3RvdWNoZW5kJywgJ3BvaW50ZXJ1cCcsICdNU1BvaW50ZXJVcCcsICdtb3VzZXVwJ10sXG4gICAgICAgICAgICBtb3ZlOiBbJ3RvdWNobW92ZScsICdwb2ludGVybW92ZScsICdNU1BvaW50ZXJNb3ZlJywgJ21vdXNlbW92ZSddXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYXRlUG9pbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcykge1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnBvcyA9IFtldmVudC5wYWdlWCwgZXZlbnQucGFnZVldO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAobmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpID8gMiA6IDEsXG4gICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGV2ZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZG9jdW1lbnQsIGxhcm91eF90b3VjaC5ldmVudHMuc3RhcnRbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLm9uc3RhcnQpO1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZG9jdW1lbnQsIGxhcm91eF90b3VjaC5ldmVudHMuZW5kW2V2ZW50c1tpXV0sIGxhcm91eF90b3VjaC5vbmVuZCk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShkb2N1bWVudCwgbGFyb3V4X3RvdWNoLmV2ZW50cy5tb3ZlW2V2ZW50c1tpXV0sIGxhcm91eF90b3VjaC5sb2NhdGVQb2ludGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbnN0YXJ0OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC5sb2NhdGVQb2ludGVyKGV2ZW50KTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC5jYWNoZWQgPSBbbGFyb3V4X3RvdWNoLnBvc1swXSwgbGFyb3V4X3RvdWNoLnBvc1sxXV07XG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQrKztcblxuICAgICAgICAgICAgdmFyIGZuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3RvdWNoLmNhY2hlZFswXSA+PSBsYXJvdXhfdG91Y2gucG9zWzBdIC0gbGFyb3V4X3RvdWNoLnByZWNpc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZFswXSA8PSBsYXJvdXhfdG91Y2gucG9zWzBdICsgbGFyb3V4X3RvdWNoLnByZWNpc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZFsxXSA+PSBsYXJvdXhfdG91Y2gucG9zWzFdIC0gbGFyb3V4X3RvdWNoLnByZWNpc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZFsxXSA8PSBsYXJvdXhfdG91Y2gucG9zWzFdICsgbGFyb3V4X3RvdWNoLnByZWNpc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGFyb3V4X3RvdWNoLnRhcENvdW50ID09PSAyKSA/ICdkYmx0YXAnIDogJ3RhcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lckV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogbGFyb3V4X3RvdWNoLnBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogbGFyb3V4X3RvdWNoLnBvc1sxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPiBsYXJvdXhfdG91Y2gubG9uZ1RhcFRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsb25ndGFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXJvdXhfdG91Y2gucG9zWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXJvdXhfdG91Y2gucG9zWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcFRpbWVyID0gc2V0VGltZW91dChmbmMsIGxhcm91eF90b3VjaC50YXBUcmVzaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQgPSAwO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGxhcm91eF90b3VjaC50YXBUaW1lcik7XG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwVGltZXIgPSBzZXRUaW1lb3V0KGZuYywgbGFyb3V4X3RvdWNoLnRhcFRyZXNob2xkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbmVuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBbXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5wb3NbMF0gLSBsYXJvdXhfdG91Y2guY2FjaGVkWzBdLFxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gucG9zWzFdIC0gbGFyb3V4X3RvdWNoLmNhY2hlZFsxXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHg6IGxhcm91eF90b3VjaC5wb3NbMF0sXG4gICAgICAgICAgICAgICAgICAgIHk6IGxhcm91eF90b3VjaC5wb3NbMV0sXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBNYXRoLmFicyhkZWx0YVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBNYXRoLmFicyhkZWx0YVsxXSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMF0gPD0gLWxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBlcmlnaHQnLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbHRhWzBdID49IGxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBlbGVmdCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMV0gPD0gLWxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBlZG93bicsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMV0gPj0gbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGV1cCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdG91Y2g7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gdHJpZ2dlcnNcbiAgICB2YXIgbGFyb3V4X3RyaWdnZXJzID0ge1xuICAgICAgICBkZWxlZ2F0ZXM6IFtdLFxuICAgICAgICBsaXN0OiBbXSxcblxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChjb25kaXRpb24sIGZuYywgc3RhdGUpIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb25zID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShjb25kaXRpb24pO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgY29uZGl0aW9uc1tpdGVtXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5saXN0LnB1c2goY29uZGl0aW9uc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbmRpdGlvbnM6IGNvbmRpdGlvbnMsXG4gICAgICAgICAgICAgICAgZm5jOiBmbmMsXG4gICAgICAgICAgICAgICAgc3RhdGU6IHN0YXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbnRyaWdnZXI6IGZ1bmN0aW9uICh0cmlnZ2VyTmFtZSwgYXJncykge1xuICAgICAgICAgICAgdmFyIGV2ZW50SWR4ID0gbGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCB0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICBpZiAoZXZlbnRJZHggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmxpc3Quc3BsaWNlKGV2ZW50SWR4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXNbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjb25kaXRpb25LZXkgaW4gY3VycmVudEl0ZW0uY29uZGl0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRJdGVtLmNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoY29uZGl0aW9uS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZGl0aW9uT2JqID0gY3VycmVudEl0ZW0uY29uZGl0aW9uc1tjb25kaXRpb25LZXldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIGNvbmRpdGlvbk9iaikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZm5jKFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiBjdXJyZW50SXRlbS5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RyaWdnZXIgbmFtZTogJyArIHRyaWdnZXJOYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3RyaWdnZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyksXG4gICAgICAgIGxhcm91eF90aW1lcnMgPSByZXF1aXJlKCcuL2xhcm91eC50aW1lcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X2RhdGUgPSByZXF1aXJlKCcuL2xhcm91eC5kYXRlLmpzJyk7XG5cbiAgICAvLyB1aVxuICAgIHZhciBsYXJvdXhfdWkgPSB7XG4gICAgICAgIGZsb2F0Q29udGFpbmVyOiBudWxsLFxuXG4gICAgICAgIHBvcHVwOiB7XG4gICAgICAgICAgICBkZWZhdWx0VGltZW91dDogNTAwLFxuXG4gICAgICAgICAgICBjcmVhdGVCb3g6IGZ1bmN0aW9uIChpZCwgeGNsYXNzLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kb20uY3JlYXRlRWxlbWVudCgnRElWJywgeyBpZDogaWQsICdjbGFzcyc6IHhjbGFzcyB9LCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1zZ2JveDogZnVuY3Rpb24gKHRpbWVvdXQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBsYXJvdXhfaGVscGVycy5nZXRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgICAgICAgICBvYmogPSBsYXJvdXhfdWkucG9wdXAuY3JlYXRlQm94KGlkLCAnbGFyb3V4TXNnQm94JywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyLmFwcGVuZENoaWxkKG9iaik7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KG9iaiwgeyBvcGFjaXR5OiAxIH0pO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5zZXQoe1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICByZXNldDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG9udGljazogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoeCwgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5yZW1vdmUoeCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBvYmpcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkaW5nOiB7XG4gICAgICAgICAgICBlbGVtZW50U2VsZWN0b3I6IG51bGwsXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgZGVmYXVsdERlbGF5OiAxNTAwLFxuICAgICAgICAgICAgdGltZXI6IG51bGwsXG5cbiAgICAgICAgICAgIGtpbGxUaW1lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChsYXJvdXhfdWkubG9hZGluZy50aW1lcik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcua2lsbFRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQsIHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID0gJ2ZhbHNlJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChkZWxheSkge1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmtpbGxUaW1lcigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsYXkgPSBsYXJvdXhfdWkubG9hZGluZy5kZWZhdWx0RGVsYXk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdygwKTsgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCwgeyBkaXNwbGF5OiAnYmxvY2snIH0pO1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciA9ICd0cnVlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgPT09IG51bGwgJiYgbGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudFNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgPSBsYXJvdXhfZG9tLnNlbGVjdFNpbmdsZShsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50U2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQod2luZG93LCAnbG9hZCcsIGxhcm91eF91aS5sb2FkaW5nLmhpZGUpO1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KHdpbmRvdywgJ2JlZm9yZXVubG9hZCcsIGxhcm91eF91aS5sb2FkaW5nLnNob3cpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciAhPT0gdW5kZWZpbmVkICYmIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLnNob3coMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHluYW1pY0RhdGVzOiB7XG4gICAgICAgICAgICB1cGRhdGVEYXRlc0VsZW1lbnRzOiBudWxsLFxuXG4gICAgICAgICAgICB1cGRhdGVEYXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzID0gbGFyb3V4X2RvbS5zZWxlY3QoJypbZGF0YS1lcG9jaF0nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAvLyBiaXRzaGlmdGluZyAoc3RyID4+IDApIHVzZWQgaW5zdGVhZCBvZiBwYXJzZUludChzdHIsIDEwKVxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKChvYmouZ2V0QXR0cmlidXRlKCdkYXRhLWVwb2NoJykgPj4gMCkgKiAxMDAwKTtcblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmosXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZGF0ZS5nZXREYXRlU3RyaW5nKGRhdGUpXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBsYXJvdXhfZGF0ZS5nZXRMb25nRGF0ZVN0cmluZyhkYXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwLFxuICAgICAgICAgICAgICAgICAgICByZXNldDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb250aWNrOiBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2Nyb2xsVmlldzoge1xuICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50czogW10sXG5cbiAgICAgICAgICAgIG9uaGlkZGVuOiBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnRzLCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnRzLCBbJ29wYWNpdHknXSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbnJldmVhbDogZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50cywgeyBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfY3NzLmluVmlld3BvcnQoZWxlbWVudHNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLnB1c2goZWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcub25oaWRkZW4obGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudCh3aW5kb3csICdzY3JvbGwnLCBsYXJvdXhfdWkuc2Nyb2xsVmlldy5yZXZlYWwpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmV2ZWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmVhY2goXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2Nzcy5pblZpZXdwb3J0KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLnNwbGljZShyZW1vdmVLZXlzW2l0ZW1dLCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS51bnNldEV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIGxhcm91eF91aS5zY3JvbGxWaWV3LnJldmVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcub25yZXZlYWwoZWxlbWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVGbG9hdENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFsYXJvdXhfdWkuZmxvYXRDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZmxvYXRDb250YWluZXIgPSBsYXJvdXhfZG9tLmNyZWF0ZUVsZW1lbnQoJ0RJVicsIHsgJ2NsYXNzJzogJ2xhcm91eEZsb2F0RGl2JyB9KTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUobGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyLCB3aW5kb3cuZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYXJvdXhfdWkuY3JlYXRlRmxvYXRDb250YWluZXIoKTtcbiAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmluaXQoKTtcbiAgICAgICAgICAgIGxhcm91eF91aS5keW5hbWljRGF0ZXMuaW5pdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdWk7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdmFyc1xuICAgIHZhciBsYXJvdXhfdmFycyA9IHtcbiAgICAgICAgY29va2llUGF0aDogJy8nLFxuXG4gICAgICAgIGdldENvb2tpZTogZnVuY3Rpb24gKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPVteO10rJywgJ2knKSxcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChyZSk7XG5cbiAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbMF0uc3BsaXQoJz0nKVsxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29va2llOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgpIHtcbiAgICAgICAgICAgIHZhciBleHBpcmVWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgaWYgKGV4cGlyZXMpIHtcbiAgICAgICAgICAgICAgICBleHBpcmVWYWx1ZSA9ICc7IGV4cGlyZXM9JyArIGV4cGlyZXMudG9HTVRTdHJpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9jdW1lbnQuY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSArIGV4cGlyZVZhbHVlICsgJzsgcGF0aD0nICsgKHBhdGggfHwgbGFyb3V4X3ZhcnMuY29va2llUGF0aCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlQ29va2llOiBmdW5jdGlvbiAobmFtZSwgcGF0aCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz07IGV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVQ7IHBhdGg9JyArIChwYXRoIHx8IGxhcm91eF92YXJzLmNvb2tpZVBhdGgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExvY2FsOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIGxvY2FsU3RvcmFnZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZVtuYW1lXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TG9jYWw6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlW25hbWVdID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUxvY2FsOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIGxvY2FsU3RvcmFnZVtuYW1lXTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIHNlc3Npb25TdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2VbbmFtZV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFNlc3Npb246IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlU2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzZXNzaW9uU3RvcmFnZVtuYW1lXTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3ZhcnM7XG5cbn0oKSk7XG4iLCIvKmdsb2JhbCBOb2RlTGlzdCwgTm9kZSAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB3cmFwcGVyXG4gICAgdmFyIGxhcm91eF93cmFwcGVyID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbjtcblxuICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0b3I7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBOb2RlTGlzdCkge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gbGFyb3V4X2hlbHBlcnMudG9BcnJheShzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBbc2VsZWN0b3JdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gbGFyb3V4X2RvbS5zZWxlY3Qoc2VsZWN0b3IsIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZShzZWxlY3Rpb25bMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlKHNlbGVjdGlvbik7XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmlzQXJyYXkgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwIHx8IGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X3dyYXBwZXIoc2VsZWN0b3IsIHRoaXMuc291cmNlKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50cykge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IGVsZW1lbnRzO1xuICAgICAgICB0aGlzLmlzQXJyYXkgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VbaW5kZXhdO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGggPSAwO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlID0gMTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5ID0gMjtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsIGZuYywgc2NvcGUpIHtcbiAgICAgICAgdmFyIG5ld0ZuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMuYXBwbHkoXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBbdGhpcy5zb3VyY2VdLmNvbmNhdChsYXJvdXhfaGVscGVycy50b0FycmF5KGFyZ3VtZW50cykpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoIChzY29wZSkge1xuICAgICAgICBjYXNlIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlOlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJBcnJheTpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhdHRyJywgbGFyb3V4X2RvbS5hdHRyLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2RhdGEnLCBsYXJvdXhfZG9tLmRhdGEsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb24nLCBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ29uJywgbGFyb3V4X2RvbS5zZXRFdmVudCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJBcnJheSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ29mZicsIGxhcm91eF9kb20udW5zZXRFdmVudCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignY2xlYXInLCBsYXJvdXhfZG9tLmNsZWFyLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2luc2VydCcsIGxhcm91eF9kb20uaW5zZXJ0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3ByZXBlbmQnLCBsYXJvdXhfZG9tLnByZXBlbmQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYXBwZW5kJywgbGFyb3V4X2RvbS5hcHBlbmQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVwbGFjZScsIGxhcm91eF9kb20ucmVwbGFjZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZXBsYWNlVGV4dCcsIGxhcm91eF9kb20ucmVwbGFjZVRleHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVtb3ZlJywgbGFyb3V4X2RvbS5yZW1vdmUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoYXNDbGFzcycsIGxhcm91eF9jc3MuaGFzQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYWRkQ2xhc3MnLCBsYXJvdXhfY3NzLmFkZENsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZW1vdmVDbGFzcycsIGxhcm91eF9jc3MucmVtb3ZlQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3RvZ2dsZUNsYXNzJywgbGFyb3V4X2Nzcy50b2dnbGVDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignZ2V0UHJvcGVydHknLCBsYXJvdXhfY3NzLmdldFByb3BlcnR5LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3NldFByb3BlcnR5JywgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2V0VHJhbnNpdGlvbicsIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2hvdycsIGxhcm91eF9jc3Muc2hvdywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaGlkZScsIGxhcm91eF9jc3MuaGlkZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaGVpZ2h0JywgbGFyb3V4X2Nzcy5oZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5uZXJIZWlnaHQnLCBsYXJvdXhfY3NzLmlubmVySGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ291dGVySGVpZ2h0JywgbGFyb3V4X2Nzcy5vdXRlckhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCd3aWR0aCcsIGxhcm91eF9jc3Mud2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5uZXJXaWR0aCcsIGxhcm91eF9jc3MuaW5uZXJXaWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvdXRlcldpZHRoJywgbGFyb3V4X2Nzcy5vdXRlcldpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3RvcCcsIGxhcm91eF9jc3MudG9wLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2xlZnQnLCBsYXJvdXhfY3NzLmxlZnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYWJvdmVUaGVUb3AnLCBsYXJvdXhfY3NzLmFib3ZlVGhlVG9wLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2JlbG93VGhlRm9sZCcsIGxhcm91eF9jc3MuYmVsb3dUaGVGb2xkLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2xlZnRPZlNjcmVlbicsIGxhcm91eF9jc3MubGVmdE9mU2NyZWVuLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JpZ2h0T2ZTY3JlZW4nLCBsYXJvdXhfY3NzLnJpZ2h0T2ZTY3JlZW4sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5WaWV3cG9ydCcsIGxhcm91eF9jc3MuaW5WaWV3cG9ydCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuXG4gICAgcmV0dXJuIGxhcm91eF93cmFwcGVyO1xuXG59KCkpO1xuIl19
