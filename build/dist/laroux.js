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

    if (!('$l' in scope)) {
        scope.$l = laroux;
    }

    // core modules
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

    // optional modules
    laroux.wrapper = require('./laroux.wrapper.js');
    laroux.ajax = require('./laroux.ajax.js');
    laroux.css = require('./laroux.css.js');
    laroux.dom = require('./laroux.dom.js');
    // laroux.events = require('./laroux.events.js');
    laroux.forms = require('./laroux.forms.js');
    // laroux.helpers = require('./laroux.helpers.js');
    // laroux.timers = require('./laroux.timers.js');
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

    if (typeof document !== 'undefined') {
        document.addEventListener(
            'DOMContentLoaded',
            function () {
                if (!laroux.readyPassed) {
                    laroux.events.invoke('ContentLoaded');
                    setInterval(laroux.timers.ontick, 100);
                    laroux.touch.init();
                    laroux.readyPassed = true;
                }
            }
        );
    }

    return laroux;

}(typeof window !== 'undefined' ? window : global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./laroux.ajax.js":2,"./laroux.anim.js":3,"./laroux.css.js":4,"./laroux.date.js":5,"./laroux.dom.js":6,"./laroux.events.js":7,"./laroux.forms.js":8,"./laroux.helpers.js":9,"./laroux.keys.js":10,"./laroux.mvc.js":11,"./laroux.stack.js":12,"./laroux.templates.js":13,"./laroux.timers.js":14,"./laroux.touch.js":15,"./laroux.triggers.js":16,"./laroux.ui.js":17,"./laroux.vars.js":18,"./laroux.wrapper.js":19}],2:[function(require,module,exports){
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

},{"./laroux.events.js":7,"./laroux.helpers.js":9}],3:[function(require,module,exports){
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
                if (newanim.object === document.body && newanim.property === 'scrollTop') {
                    newanim.from = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
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
                requestAnimationFrame(laroux_anim.onframe);
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
                        if (newanim.object === document.body && newanim.property == 'scrollTop') {
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

            if (newanim.object === document.body && newanim.property == 'scrollTop') {
                scrollTo(0, value);
                // setTimeout(function () { scrollTo(0, value); }, 1);
            } else {
                newanim.object[newanim.property] = value;
            }
        }
    };

    return laroux_anim;

}());

},{"./laroux.css.js":4,"./laroux.helpers.js":9}],4:[function(require,module,exports){
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

},{"./laroux.helpers.js":9}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./laroux.helpers.js":9}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./laroux.ajax.js":2,"./laroux.dom.js":6}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
            var wrapper = function (ev) {
                if (!ev) {
                    ev = event;
                }

                var element = ev.target || ev.srcElement;
                if (element.nodeType === 3 || element.nodeType === 11) { // element.nodeType === 1 ||
                    element = element.parentNode;
                }

                if (options.disableInputs && laroux_forms.isFormField(element)) {
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

                var key = laroux_keys.keyName(options.key);
                if (key !== (ev.keyCode || ev.which)) {
                    return;
                }

                options.fnc(ev);

                return false;
            };

            laroux_dom.setEvent(options.target || document, 'keydown', wrapper);
        }
    };

    return laroux_keys;

}());

},{"./laroux.dom.js":6,"./laroux.forms.js":8}],11:[function(require,module,exports){
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

},{"./laroux.dom.js":6,"./laroux.helpers.js":9,"./laroux.stack.js":12}],12:[function(require,module,exports){
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

},{"./laroux.dom.js":6,"./laroux.helpers.js":9}],14:[function(require,module,exports){
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

    // laroux.ready(laroux_touch.init);

    return laroux_touch;

}());

},{"./laroux.dom.js":6}],16:[function(require,module,exports){
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

},{"./laroux.helpers.js":9}],17:[function(require,module,exports){
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
                document.body.insertBefore(laroux_ui.floatContainer, document.body.firstChild);
            }
        },

        init: function () {
            laroux_ui.createFloatContainer();
            laroux_ui.loading.init();
            laroux_ui.dynamicDates.init();
        }
    };

    // laroux.ready(laroux_ui.init);

    return laroux_ui;

}());

},{"./laroux.css.js":4,"./laroux.date.js":5,"./laroux.dom.js":6,"./laroux.helpers.js":9,"./laroux.timers.js":14}],18:[function(require,module,exports){
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

},{"./laroux.css.js":4,"./laroux.dom.js":6,"./laroux.helpers.js":9}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGFyb3V4LmpzIiwic3JjL2pzL2xhcm91eC5hamF4LmpzIiwic3JjL2pzL2xhcm91eC5hbmltLmpzIiwic3JjL2pzL2xhcm91eC5jc3MuanMiLCJzcmMvanMvbGFyb3V4LmRhdGUuanMiLCJzcmMvanMvbGFyb3V4LmRvbS5qcyIsInNyYy9qcy9sYXJvdXguZXZlbnRzLmpzIiwic3JjL2pzL2xhcm91eC5mb3Jtcy5qcyIsInNyYy9qcy9sYXJvdXguaGVscGVycy5qcyIsInNyYy9qcy9sYXJvdXgua2V5cy5qcyIsInNyYy9qcy9sYXJvdXgubXZjLmpzIiwic3JjL2pzL2xhcm91eC5zdGFjay5qcyIsInNyYy9qcy9sYXJvdXgudGVtcGxhdGVzLmpzIiwic3JjL2pzL2xhcm91eC50aW1lcnMuanMiLCJzcmMvanMvbGFyb3V4LnRvdWNoLmpzIiwic3JjL2pzL2xhcm91eC50cmlnZ2Vycy5qcyIsInNyYy9qcy9sYXJvdXgudWkuanMiLCJzcmMvanMvbGFyb3V4LnZhcnMuanMiLCJzcmMvanMvbGFyb3V4LndyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBjb3JlXG4gICAgdmFyIGxhcm91eCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4LmhlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgIC8vIEZJWE1FOiBub24tY2hyb21lIG9wdGltaXphdGlvblxuICAgICAgICB2YXIgcmUgPSAvXiMoW15cXCtcXD5cXFtcXF1cXC4jIF0qKSQvLmV4ZWMoc2VsZWN0b3IpO1xuICAgICAgICBpZiAocmUpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyZVsxXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuZ2V0RWxlbWVudEJ5SWQocmVbMV0pO1xuICAgICAgICB9XG4gICAgICAgICovXG5cbiAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH07XG5cbiAgICBpZiAoISgnJGwnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS4kbCA9IGxhcm91eDtcbiAgICB9XG5cbiAgICAvLyBjb3JlIG1vZHVsZXNcbiAgICBsYXJvdXguZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyk7XG4gICAgbGFyb3V4LmhlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpO1xuXG4gICAgbGFyb3V4LmNhY2hlZCA9IHtcbiAgICAgICAgc2luZ2xlOiB7fSxcbiAgICAgICAgYXJyYXk6IHt9LFxuICAgICAgICBpZDoge31cbiAgICB9O1xuXG4gICAgbGFyb3V4LmMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXguY2FjaGVkLmFycmF5W3NlbGVjdG9yXSB8fCAoXG4gICAgICAgICAgICAgICAgbGFyb3V4LmNhY2hlZC5hcnJheVtzZWxlY3Rvcl0gPSBsYXJvdXguaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGFyb3V4LmNhY2hlZC5zaW5nbGVbc2VsZWN0b3JdIHx8IChcbiAgICAgICAgICAgIGxhcm91eC5jYWNoZWQuc2luZ2xlW3NlbGVjdG9yXSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZGMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuaWRbc2VsZWN0b3JdIHx8XG4gICAgICAgICAgICAobGFyb3V4LmNhY2hlZC5pZFtzZWxlY3Rvcl0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikpO1xuICAgIH07XG5cbiAgICBsYXJvdXgucmVhZHlQYXNzZWQgPSBmYWxzZTtcblxuICAgIGxhcm91eC5leHRlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmNhbGwoYXJndW1lbnRzLCBsYXJvdXgpO1xuICAgICAgICBsYXJvdXguaGVscGVycy5leHRlbmRPYmplY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LmV4dGVuZE9iamVjdCA9IGxhcm91eC5oZWxwZXJzLmV4dGVuZE9iamVjdDtcbiAgICBsYXJvdXguZWFjaCA9IGxhcm91eC5oZWxwZXJzLmVhY2g7XG4gICAgbGFyb3V4Lm1hcCA9IGxhcm91eC5oZWxwZXJzLm1hcDtcbiAgICBsYXJvdXguaW5kZXggPSBsYXJvdXguaGVscGVycy5pbmRleDtcbiAgICBsYXJvdXguYWVhY2ggPSBsYXJvdXguaGVscGVycy5hZWFjaDtcbiAgICBsYXJvdXguYW1hcCA9IGxhcm91eC5oZWxwZXJzLmFtYXA7XG4gICAgbGFyb3V4LmFpbmRleCA9IGxhcm91eC5oZWxwZXJzLmFpbmRleDtcblxuICAgIGxhcm91eC5yZWFkeSA9IGZ1bmN0aW9uIChmbmMpIHtcbiAgICAgICAgaWYgKCFsYXJvdXgucmVhZHlQYXNzZWQpIHtcbiAgICAgICAgICAgIGxhcm91eC5ldmVudHMuYWRkKCdDb250ZW50TG9hZGVkJywgZm5jKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZuYygpO1xuICAgIH07XG5cbiAgICAvLyBvcHRpb25hbCBtb2R1bGVzXG4gICAgbGFyb3V4LndyYXBwZXIgPSByZXF1aXJlKCcuL2xhcm91eC53cmFwcGVyLmpzJyk7XG4gICAgbGFyb3V4LmFqYXggPSByZXF1aXJlKCcuL2xhcm91eC5hamF4LmpzJyk7XG4gICAgbGFyb3V4LmNzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpO1xuICAgIGxhcm91eC5kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKTtcbiAgICAvLyBsYXJvdXguZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyk7XG4gICAgbGFyb3V4LmZvcm1zID0gcmVxdWlyZSgnLi9sYXJvdXguZm9ybXMuanMnKTtcbiAgICAvLyBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICAvLyBsYXJvdXgudGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRyaWdnZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudHJpZ2dlcnMuanMnKTtcbiAgICBsYXJvdXgudmFycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnZhcnMuanMnKTtcblxuICAgIGxhcm91eC5hbmltID0gcmVxdWlyZSgnLi9sYXJvdXguYW5pbS5qcycpO1xuICAgIGxhcm91eC5kYXRlID0gcmVxdWlyZSgnLi9sYXJvdXguZGF0ZS5qcycpO1xuICAgIGxhcm91eC5rZXlzID0gcmVxdWlyZSgnLi9sYXJvdXgua2V5cy5qcycpO1xuICAgIGxhcm91eC5tdmMgPSByZXF1aXJlKCcuL2xhcm91eC5tdmMuanMnKTtcbiAgICBsYXJvdXguc3RhY2sgPSByZXF1aXJlKCcuL2xhcm91eC5zdGFjay5qcycpO1xuICAgIGxhcm91eC50ZW1wbGF0ZXMgPSByZXF1aXJlKCcuL2xhcm91eC50ZW1wbGF0ZXMuanMnKTtcbiAgICBsYXJvdXgudG91Y2ggPSByZXF1aXJlKCcuL2xhcm91eC50b3VjaC5qcycpO1xuICAgIGxhcm91eC51aSA9IHJlcXVpcmUoJy4vbGFyb3V4LnVpLmpzJyk7XG5cbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ0RPTUNvbnRlbnRMb2FkZWQnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4LnJlYWR5UGFzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eC5ldmVudHMuaW52b2tlKCdDb250ZW50TG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHNldEludGVydmFsKGxhcm91eC50aW1lcnMub250aWNrLCAxMDApO1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXgudG91Y2guaW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXgucmVhZHlQYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFyb3V4O1xuXG59KHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyBhamF4IC0gcGFydGlhbGx5IHRha2VuIGZyb20gJ2pxdWVyeSBpbiBwYXJ0cycgcHJvamVjdFxuICAgIC8vICAgICAgICBjYW4gYmUgZm91bmQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9teXRoei9qcXVpcC9cbiAgICB2YXIgbGFyb3V4X2FqYXggPSB7XG4gICAgICAgIGNvcnNEZWZhdWx0OiBmYWxzZSxcblxuICAgICAgICB3cmFwcGVyczoge1xuICAgICAgICAgICAgcmVnaXN0cnk6IHtcbiAgICAgICAgICAgICAgICAnbGFyb3V4LmpzJzogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhLmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiAnICsgZGF0YS5lcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iajtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5mb3JtYXQgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gSlNPTi5wYXJzZShkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5mb3JtYXQgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZXZhbChkYXRhLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGlmIChkYXRhLmZvcm1hdCA9PSAneG1sJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gZGF0YS5vYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5hbWUsIGZuYykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W25hbWVdID0gZm5jO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHhEb21haW5PYmplY3Q6IGZhbHNlLFxuICAgICAgICB4bWxIdHRwUmVxdWVzdE9iamVjdDogbnVsbCxcbiAgICAgICAgeERvbWFpblJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhocjogZnVuY3Rpb24gKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICBpZiAobGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3Jvc3NEb21haW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoISgnd2l0aENyZWRlbnRpYWxzJyBpbiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCkgJiYgdHlwZW9mIFhEb21haW5SZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0ID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdDtcbiAgICAgICAgfSxcblxuICAgICAgICB4aHJSZXNwOiBmdW5jdGlvbiAoeGhyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlckZ1bmN0aW9uID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlc3BvbnNlLVdyYXBwZXItRnVuY3Rpb24nKSxcbiAgICAgICAgICAgICAgICByZXNwb25zZTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgIC8qanNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZXZhbCh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ3htbCcpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVhNTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod3JhcHBlckZ1bmN0aW9uICYmICh3cmFwcGVyRnVuY3Rpb24gaW4gbGFyb3V4X2FqYXgud3JhcHBlcnMucmVnaXN0cnkpKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeVt3cmFwcGVyRnVuY3Rpb25dKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgd3JhcHBlckZ1bmM6IHdyYXBwZXJGdW5jdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBtYWtlUmVxdWVzdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBjb3JzID0gb3B0aW9ucy5jb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHhociA9IGxhcm91eF9hamF4Lnhocihjb3JzKSxcbiAgICAgICAgICAgICAgICB1cmwgPSBvcHRpb25zLnVybCxcbiAgICAgICAgICAgICAgICB0aW1lciA9IG51bGwsXG4gICAgICAgICAgICAgICAgbiA9IDA7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50aW1lb3V0Rm4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGltZW91dEZuKG9wdGlvbnMudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aW1lb3V0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbGFyb3V4X2FqYXgueGhyUmVzcCh4aHIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheEVycm9yJywgW3hociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Y2Nlc3MgIT09IHVuZGVmaW5lZCAmJiByZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zdWNjZXNzKHJlcy5yZXNwb25zZSwgcmVzLndyYXBwZXJGdW5jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheFN1Y2Nlc3MnLCBbeGhyLCByZXMucmVzcG9uc2UsIHJlcy53cmFwcGVyRnVuYywgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3IoeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4RXJyb3InLCBbeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29tcGxldGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5jb21wbGV0ZSh4aHIsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4Q29tcGxldGUnLCBbeGhyLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wcm9ncmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucHJvZ3Jlc3MoKytuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5nZXRkYXRhICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5nZXRkYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZ2V0ZGF0YS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeVN0cmluZyA9IGxhcm91eF9oZWxwZXJzLmJ1aWxkUXVlcnlTdHJpbmcob3B0aW9ucy5nZXRkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyBxdWVyeVN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyBvcHRpb25zLmdldGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5qc29ucCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArICdqc29ucD0nICsgb3B0aW9ucy5qc29ucDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgeGhyLm9wZW4ob3B0aW9ucy50eXBlLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihvcHRpb25zLnR5cGUsIHVybCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMueGhyRmllbGRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zLnhockZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnhockZpZWxkcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHJbaV0gPSBvcHRpb25zLnhockZpZWxkc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMud3JhcHBlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snWC1XcmFwcGVyLUZ1bmN0aW9uJ10gPSAnbGFyb3V4LmpzJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogaW4gaGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWhlYWRlcnMuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaiwgaGVhZGVyc1tqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wb3N0ZGF0YSA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucG9zdGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2VuZChudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAob3B0aW9ucy5wb3N0ZGF0YXR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5wb3N0ZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdmb3JtJzpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQobGFyb3V4X2hlbHBlcnMuYnVpbGRGb3JtRGF0YShvcHRpb25zLnBvc3RkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKG9wdGlvbnMucG9zdGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnaHRtbCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SnNvbjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRKc29uUDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgbWV0aG9kLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGpzb25wOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2NyaXB0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGF0eXBlOiAnZm9ybScsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0SnNvbjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9hamF4O1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpO1xuXG4gICAgLy8gYW5pbVxuICAgIHZhciBsYXJvdXhfYW5pbSA9IHtcbiAgICAgICAgZGF0YTogW10sXG5cbiAgICAgICAgZng6IHtcbiAgICAgICAgICAgIGludGVycG9sYXRlOiBmdW5jdGlvbiAoc291cmNlLCB0YXJnZXQsIHNoaWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChzb3VyY2UgKyAodGFyZ2V0IC0gc291cmNlKSAqIHNoaWZ0KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGVhc2luZzogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgICAgIHJldHVybiAoLU1hdGguY29zKHBvcyAqIE1hdGguUEkpIC8gMikgKyAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8ge29iamVjdCwgcHJvcGVydHksIGZyb20sIHRvLCB0aW1lLCB1bml0LCByZXNldH1cbiAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3YW5pbSkge1xuICAgICAgICAgICAgbmV3YW5pbS5zdGFydFRpbWUgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS51bml0ID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS51bml0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS51bml0ID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLmZyb20gPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLmZyb20gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3YW5pbS5vYmplY3QgPT09IGRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PT0gJ3Njcm9sbFRvcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSBuZXdhbmltLm9iamVjdFtuZXdhbmltLnByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmV3YW5pbS5mcm9tID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IE51bWJlcihuZXdhbmltLmZyb20pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS5yZXNldCA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0ucmVzZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChuZXdhbmltLmlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vICAgICBuZXdhbmltLmlkID0gbGFyb3V4X2hlbHBlcnMuZ2V0VW5pcXVlSWQoKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgbGFyb3V4X2FuaW0uZGF0YS5wdXNoKG5ld2FuaW0pO1xuICAgICAgICAgICAgaWYgKGxhcm91eF9hbmltLmRhdGEubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxhcm91eF9hbmltLm9uZnJhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldENzczogZnVuY3Rpb24gKG5ld2FuaW0pIHtcbiAgICAgICAgICAgIGlmIChuZXdhbmltLmZyb20gPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLmZyb20gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSBsYXJvdXhfY3NzLmdldFByb3BlcnR5KG5ld2FuaW0ub2JqZWN0LCBuZXdhbmltLnByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbmV3YW5pbS5vYmplY3QgPSBuZXdhbmltLm9iamVjdC5zdHlsZTtcbiAgICAgICAgICAgIG5ld2FuaW0ucHJvcGVydHkgPSBsYXJvdXhfaGVscGVycy5jYW1lbENhc2UobmV3YW5pbS5wcm9wZXJ0eSk7XG5cbiAgICAgICAgICAgIGxhcm91eF9hbmltLnNldChuZXdhbmltKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEtleSA9IG51bGw7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X2FuaW0uZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2FuaW0uZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfYW5pbS5kYXRhW2l0ZW1dO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLmlkICE9PSB1bmRlZmluZWQgJiYgY3VycmVudEl0ZW0uaWQgPT0gaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0S2V5ID0gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGFyZ2V0S2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FuaW0uZGF0YS5zcGxpY2UodGFyZ2V0S2V5LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uZnJhbWU6IGZ1bmN0aW9uICh0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF9hbmltLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9hbmltLmRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X2FuaW0uZGF0YVtpdGVtXTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0uc3RhcnRUaW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gbGFyb3V4X2FuaW0uc3RlcChjdXJyZW50SXRlbSwgdGltZXN0YW1wKTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRpbWVzdGFtcCA+IGN1cnJlbnRJdGVtLnN0YXJ0VGltZSArIGN1cnJlbnRJdGVtLnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLnJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5zdGFydFRpbWUgPSB0aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3YW5pbS5vYmplY3QgPT09IGRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PSAnc2Nyb2xsVG9wJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvKDAsIGN1cnJlbnRJdGVtLmZyb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzY3JvbGxUbygwLCBjdXJyZW50SXRlbS5mcm9tKTsgfSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLm9iamVjdFtjdXJyZW50SXRlbS5wcm9wZXJ0eV0gPSBjdXJyZW50SXRlbS5mcm9tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfYW5pbS5kYXRhLnNwbGljZShyZW1vdmVLZXlzW2l0ZW0yXSwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYXJvdXhfYW5pbS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobGFyb3V4X2FuaW0ub25mcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RlcDogZnVuY3Rpb24gKG5ld2FuaW0sIHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgdmFyIGZpbmlzaFQgPSBuZXdhbmltLnN0YXJ0VGltZSArIG5ld2FuaW0udGltZSxcbiAgICAgICAgICAgICAgICBzaGlmdCA9ICh0aW1lc3RhbXAgPiBmaW5pc2hUKSA/IDEgOiAodGltZXN0YW1wIC0gbmV3YW5pbS5zdGFydFRpbWUpIC8gbmV3YW5pbS50aW1lO1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfYW5pbS5meC5pbnRlcnBvbGF0ZShcbiAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20sXG4gICAgICAgICAgICAgICAgbmV3YW5pbS50byxcbiAgICAgICAgICAgICAgICBsYXJvdXhfYW5pbS5meC5lYXNpbmcoc2hpZnQpXG4gICAgICAgICAgICApICsgbmV3YW5pbS51bml0O1xuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS5vYmplY3QgPT09IGRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PSAnc2Nyb2xsVG9wJykge1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvKDAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2Nyb2xsVG8oMCwgdmFsdWUpOyB9LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5vYmplY3RbbmV3YW5pbS5wcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2FuaW07XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gY3NzXG4gICAgdmFyIGxhcm91eF9jc3MgPSB7XG4gICAgICAgIC8vIGNsYXNzIGZlYXR1cmVzXG4gICAgICAgIGhhc0NsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjeWNsZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudHMsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbKGkgKyAxKSAlIGxlbmd0aF0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHN0eWxlIGZlYXR1cmVzXG4gICAgICAgIGdldFByb3BlcnR5OiBmdW5jdGlvbiAoZWxlbWVudCwgc3R5bGVOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBzdHlsZU5hbWUgPSBsYXJvdXhfaGVscGVycy5hbnRpQ2FtZWxDYXNlKHN0eWxlTmFtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0UHJvcGVydHk6IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0aWVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW29sZFByb3BlcnRpZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHN0eWxlTmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHN0eWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1N0eWxlTmFtZSA9IGxhcm91eF9oZWxwZXJzLmNhbWVsQ2FzZShzdHlsZU5hbWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLnN0eWxlW25ld1N0eWxlTmFtZV0gPSBwcm9wZXJ0aWVzW3N0eWxlTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHRyYW5zaXRpb24gZmVhdHVyZXNcbiAgICAgICAgZGVmYXVsdFRyYW5zaXRpb246ICcycyBlYXNlJyxcblxuICAgICAgICBzZXRUcmFuc2l0aW9uU2luZ2xlOiBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNpdGlvbikge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheSh0cmFuc2l0aW9uKSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgndHJhbnNpdGlvbicpIHx8IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy13ZWJraXQtdHJhbnNpdGlvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJy1tcy10cmFuc2l0aW9uJykgfHwgJycsXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5ID0gY3VycmVudFRyYW5zaXRpb25zLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5ID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRyYW5zaXRpb25zLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzdHlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICBwb3MgPSB0cmFuc2l0aW9uc1tpdGVtXS5pbmRleE9mKCcgJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZU5hbWUgPSB0cmFuc2l0aW9uc1tpdGVtXS5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvblByb3BlcnRpZXMgPSB0cmFuc2l0aW9uc1tpdGVtXS5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVOYW1lID0gdHJhbnNpdGlvbnNbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzID0gbGFyb3V4X2Nzcy5kZWZhdWx0VHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbnNBcnJheVtqXS50cmltKCkubG9jYWxlQ29tcGFyZShzdHlsZU5hbWUpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheVtqXSA9IHN0eWxlTmFtZSArICcgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5LnB1c2goc3R5bGVOYW1lICsgJyAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3VycmVudFRyYW5zaXRpb25zQXJyYXkuam9pbignLCAnKTtcblxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUubXNUcmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvblNpbmdsZShlbGVtZW50c1tpXSwgdHJhbnNpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eSAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB7IG9wYWNpdHk6IDEgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eSAnICsgdHJhbnNpdGlvblByb3BlcnRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gbWVhc3VyZW1lbnQgZmVhdHVyZXNcbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aG91dCBwYWRkaW5nLCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBoZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ2hlaWdodCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0LmdldEZsb2F0VmFsdWUoaGVpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBidXQgd2l0aG91dCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBpbm5lckhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYW5kIGJvcmRlciBidXQgbWFyZ2luIG9wdGlvbmFsXG4gICAgICAgIG91dGVySGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCwgaW5jbHVkZU1hcmdpbikge1xuICAgICAgICAgICAgaWYgKGluY2x1ZGVNYXJnaW4gfHwgZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgbWFyZ2luVG9wID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLXRvcCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbSA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1ib3R0b20nKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5zID0gbWFyZ2luVG9wLmdldEZsb2F0VmFsdWUobWFyZ2luVG9wLnByaW1pdGl2ZVR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tLmdldEZsb2F0VmFsdWUobWFyZ2luQm90dG9tLnByaW1pdGl2ZVR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgbWFyZ2lucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRob3V0IHBhZGRpbmcsIG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIHdpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCd3aWR0aCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0LmdldEZsb2F0VmFsdWUoaGVpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGJ1dCB3aXRob3V0IG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIGlubmVyV2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBhbmQgYm9yZGVyIGJ1dCBtYXJnaW4gb3B0aW9uYWxcbiAgICAgICAgb3V0ZXJXaWR0aDogZnVuY3Rpb24gKGVsZW1lbnQsIGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIGlmIChpbmNsdWRlTWFyZ2luIHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgbWFyZ2luTGVmdCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1sZWZ0JyksXG4gICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tcmlnaHQnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5zID0gbWFyZ2luTGVmdC5nZXRGbG9hdFZhbHVlKG1hcmdpbkxlZnQucHJpbWl0aXZlVHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodC5nZXRGbG9hdFZhbHVlKG1hcmdpblJpZ2h0LnByaW1pdGl2ZVR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGVsZW1lbnQub2Zmc2V0V2lkdGggKyBtYXJnaW5zKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b3A6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgK1xuICAgICAgICAgICAgICAgICgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsZWZ0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArXG4gICAgICAgICAgICAgICAgKChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQpIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWJvdmVUaGVUb3A6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICBiZWxvd1RoZUZvbGQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPiBpbm5lckhlaWdodDtcbiAgICAgICAgfSxcblxuICAgICAgICBsZWZ0T2ZTY3JlZW46IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodCA8PSAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJpZ2h0T2ZTY3JlZW46IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0ID4gaW5uZXJXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBpblZpZXdwb3J0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gIShyZWN0LmJvdHRvbSA8PSAwIHx8IHJlY3QudG9wID4gaW5uZXJIZWlnaHQgfHxcbiAgICAgICAgICAgICAgICByZWN0LnJpZ2h0IDw9IDAgfHwgcmVjdC5sZWZ0ID4gaW5uZXJXaWR0aCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9jc3M7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gZGF0ZVxuICAgIHZhciBsYXJvdXhfZGF0ZSA9IHtcbiAgICAgICAgc2hvcnREYXRlRm9ybWF0OiAnZGQuTU0ueXl5eScsXG4gICAgICAgIGxvbmdEYXRlRm9ybWF0OiAnZGQgTU1NTSB5eXl5JyxcbiAgICAgICAgdGltZUZvcm1hdDogJ0hIOm1tJyxcblxuICAgICAgICBtb250aHNTaG9ydDogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddLFxuICAgICAgICBtb250aHNMb25nOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSxcblxuICAgICAgICBzdHJpbmdzOiB7XG4gICAgICAgICAgICBub3c6ICAgICAnbm93JyxcbiAgICAgICAgICAgIGxhdGVyOiAgICdsYXRlcicsXG4gICAgICAgICAgICBhZ286ICAgICAnYWdvJyxcbiAgICAgICAgICAgIHNlY29uZHM6ICdzZWNvbmRzJyxcbiAgICAgICAgICAgIGFtaW51dGU6ICdhIG1pbnV0ZScsXG4gICAgICAgICAgICBtaW51dGVzOiAnbWludXRlcycsXG4gICAgICAgICAgICBhaG91cjogICAnYSBob3VyJyxcbiAgICAgICAgICAgIGhvdXJzOiAgICdob3VycycsXG4gICAgICAgICAgICBhZGF5OiAgICAnYSBkYXknLFxuICAgICAgICAgICAgZGF5czogICAgJ2RheXMnLFxuICAgICAgICAgICAgYXdlZWs6ICAgJ2Egd2VlaycsXG4gICAgICAgICAgICB3ZWVrczogICAnd2Vla3MnLFxuICAgICAgICAgICAgYW1vbnRoOiAgJ2EgbW9udGgnLFxuICAgICAgICAgICAgbW9udGhzOiAgJ21vbnRocycsXG4gICAgICAgICAgICBheWVhcjogICAnYSB5ZWFyJyxcbiAgICAgICAgICAgIHllYXJzOiAgICd5ZWFycydcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZUVwb2NoOiBmdW5jdGlvbiAodGltZXNwYW4sIGxpbWl0V2l0aFdlZWtzKSB7XG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvIDEwMDApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5zZWNvbmRzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFtaW51dGU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5taW51dGVzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5haG91cjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmhvdXJzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hZGF5O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MuZGF5cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNCAqIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hd2VlaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLndlZWtzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGltaXRXaXRoV2Vla3MgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgMzAgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDMwICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFtb250aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLm1vbnRocztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMzY1ICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5heWVhcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy55ZWFycztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDdXN0b21EYXRlU3RyaW5nOiBmdW5jdGlvbiAoZm9ybWF0LCBkYXRlKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gZGF0ZSB8fCBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgL3l5eXl8eXl8TU1NTXxNTU18TU18TXxkZHxkfGhofGh8SEh8SHxtbXxtfHNzfHN8dHR8dC9nLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3l5eXknOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRGdWxsWWVhcigpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3l5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0WWVhcigpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ01NTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLm1vbnRoc0xvbmdbbm93LmdldE1vbnRoKCldO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ01NTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUubW9udGhzU2hvcnRbbm93LmdldE1vbnRoKCldO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ01NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgKG5vdy5nZXRNb250aCgpICsgMSkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldE1vbnRoKCkgKyAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgbm93LmdldERhdGUoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0RGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2hoJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VyMSA9IG5vdy5nZXRIb3VycygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyAoKChob3VyMSAlIDEyKSA+IDApID8gaG91cjEgJSAxMiA6IDEyKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VyMiA9IG5vdy5nZXRIb3VycygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgoaG91cjIgJSAxMikgPiAwKSA/IGhvdXIyICUgMTIgOiAxMjtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdISCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRIb3VycygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRIb3VycygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21tJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgbm93LmdldE1pbnV0ZXMoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0TWludXRlcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgbm93LmdldFNlY29uZHMoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0U2Vjb25kcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3R0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub3cuZ2V0SG91cnMoKSA+PSAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAncG0nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2FtJztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub3cuZ2V0SG91cnMoKSA+PSAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAncCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnYSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXREYXRlRGlmZlN0cmluZzogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gbm93IC0gZGF0ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgYWJzVGltZXNwYW4gPSBNYXRoLmFicyh0aW1lc3BhbiksXG4gICAgICAgICAgICAgICAgcGFzdCA9ICh0aW1lc3BhbiA+IDApO1xuXG4gICAgICAgICAgICBpZiAoYWJzVGltZXNwYW4gPD0gMzAwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLm5vdztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRpbWVzcGFuc3RyaW5nID0gbGFyb3V4X2RhdGUucGFyc2VFcG9jaChhYnNUaW1lc3BhbiwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAodGltZXNwYW5zdHJpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW5zdHJpbmcgK1xuICAgICAgICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgICAgICAocGFzdCA/IGxhcm91eF9kYXRlLnN0cmluZ3MuYWdvIDogbGFyb3V4X2RhdGUuc3RyaW5ncy5sYXRlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5nZXRTaG9ydERhdGVTdHJpbmcoZGF0ZSwgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2hvcnREYXRlU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSwgaW5jbHVkZVRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5nZXRDdXN0b21EYXRlU3RyaW5nKFxuICAgICAgICAgICAgICAgIGluY2x1ZGVUaW1lID8gbGFyb3V4X2RhdGUuc2hvcnREYXRlRm9ybWF0ICsgJyAnICsgbGFyb3V4X2RhdGUudGltZUZvcm1hdCA6IGxhcm91eF9kYXRlLnNob3J0RGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICBkYXRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExvbmdEYXRlU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSwgaW5jbHVkZVRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5nZXRDdXN0b21EYXRlU3RyaW5nKFxuICAgICAgICAgICAgICAgIGluY2x1ZGVUaW1lID8gbGFyb3V4X2RhdGUubG9uZ0RhdGVGb3JtYXQgKyAnICcgKyBsYXJvdXhfZGF0ZS50aW1lRm9ybWF0IDogbGFyb3V4X2RhdGUubG9uZ0RhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgZGF0ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2RhdGU7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuICAgICAgICAvLyBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyksXG4gICAgICAgIC8vIGxhcm91eF90cmlnZ2VycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRyaWdnZXJzLmpzJyk7XG5cbiAgICAvLyBkb21cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHtcbiAgICAgICAgZG9jcHJvcDogZnVuY3Rpb24gKHByb3BOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhwcm9wTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlDbGFzczogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5VGFnOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5SWQ6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdFNpbmdsZTogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhdHRyOiBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlcywgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbb2xkQXR0cmlidXRlc10gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbiAoZWxlbWVudCwgZGF0YW5hbWVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgZGF0YW5hbWVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFuYW1lcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFuYW1lcyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGREYXRhbmFtZXMgPSBkYXRhbmFtZXM7XG4gICAgICAgICAgICAgICAgZGF0YW5hbWVzID0ge307XG4gICAgICAgICAgICAgICAgZGF0YW5hbWVzW29sZERhdGFuYW1lc10gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgZGF0YU5hbWUgaW4gZGF0YW5hbWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhbmFtZXMuaGFzT3duUHJvcGVydHkoZGF0YU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YW5hbWVzW2RhdGFOYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLScgKyBkYXRhTmFtZSwgZGF0YW5hbWVzW2RhdGFOYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZlbnRIaXN0b3J5OiBbXSxcbiAgICAgICAgc2V0RXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShlbGVtZW50c1tpXSwgZXZlbnRuYW1lLCBmbmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldEV2ZW50U2luZ2xlOiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgIHZhciBmbmNXcmFwcGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm5jKGUsIGVsZW1lbnQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uZXZlbnRIaXN0b3J5LnB1c2goeyBlbGVtZW50OiBlbGVtZW50LCBldmVudG5hbWU6IGV2ZW50bmFtZSwgZm5jOiBmbmMsIGZuY1dyYXBwZXI6IGZuY1dyYXBwZXIgfSk7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRuYW1lLCBmbmNXcmFwcGVyLCBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5zZXRFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpMSA9IDAsIGxlbmd0aDEgPSBlbGVtZW50cy5sZW5ndGg7IGkxIDwgbGVuZ3RoMTsgaTErKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuZ3RoMiA9IGxhcm91eF9kb20uZXZlbnRIaXN0b3J5Lmxlbmd0aDsgaTIgPCBsZW5ndGgyOyBpMisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gbGFyb3V4X2RvbS5ldmVudEhpc3RvcnlbaTJdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudHNbaTFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudG5hbWUgIT09IHVuZGVmaW5lZCAmJiBpdGVtLmV2ZW50bmFtZSAhPT0gZXZlbnRuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChmbmMgIT09IHVuZGVmaW5lZCAmJiBpdGVtLmZuYyAhPT0gZm5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGl0ZW0uZXZlbnRuYW1lLCBpdGVtLmZuY1dyYXBwZXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGxhcm91eF9kb20uZXZlbnRIaXN0b3J5W2kyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcGF0Y2hFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY3VzdG9tRXZlbnRbaXRlbV0gPSBkYXRhW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXN0b21FdmVudC5pbml0RXZlbnQoZXZlbnRuYW1lLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgICAgICAgICAgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuXG4gICAgICAgICAgICB0ZW1wLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgaHRtbCk7XG4gICAgICAgICAgICB3aGlsZSAodGVtcC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBudWxsaW5nIG91dCB0aGUgcmVmZXJlbmNlLCB0aGVyZSBpcyBubyBvYnZpb3VzIGRpc3Bvc2UgbWV0aG9kXG4gICAgICAgICAgICB0ZW1wID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIGZyYWc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzICE9PSB1bmRlZmluZWQgJiYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShpdGVtLCBhdHRyaWJ1dGVzW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbTIgaW4gY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2hpbGRyZW4uaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKGl0ZW0yLCBjaGlsZHJlbltpdGVtMl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgvKiB0eXBlb2YgY2hpbGRyZW4gPT0gJ3N0cmluZycgJiYgKi9jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKGVsZW0sIGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBlbGVtO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZU9wdGlvbjogZnVuY3Rpb24gKGVsZW1lbnQsIGtleSwgdmFsdWUsIGlzRGVmYXVsdCkge1xuICAgICAgICAgICAgLyogb2xkIGJlaGF2aW91ciwgZG9lcyBub3Qgc3VwcG9ydCBvcHRncm91cHMgYXMgcGFyZW50cy5cbiAgICAgICAgICAgIHZhciBjb3VudCA9IGVsZW1lbnQub3B0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBlbGVtZW50Lm9wdGlvbnNbY291bnRdID0gbmV3IE9wdGlvbih2YWx1ZSwga2V5KTtcblxuICAgICAgICAgICAgaWYgKGlzRGVmYXVsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQub3B0aW9ucy5zZWxlY3RlZEluZGV4ID0gY291bnQgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ09QVElPTicpO1xuICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBrZXkpO1xuICAgICAgICAgICAgaWYgKGlzRGVmYXVsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChvcHRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeVZhbHVlOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5vcHRpb25zW2ldLmdldEF0dHJpYnV0ZSgndmFsdWUnKSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sLyosXG5cbiAgICAgICAgLy8gVE9ETzogaXQncyByZWR1bmRhbnQgZm9yIG5vd1xuICAgICAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lNRycpO1xuICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgYXJndW1lbnRzW2ldKTtcblxuICAgICAgICAgICAgICAgIGltYWdlcy5wdXNoKGltYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGltYWdlcztcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQXN5bmNTY3JpcHQ6IGZ1bmN0aW9uIChwYXRoLCB0cmlnZ2VyTmFtZSwgYXN5bmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgICAgICAgICAgIGVsZW0udHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgZWxlbS5hc3luYyA9IChhc3luYyAhPT0gdW5kZWZpbmVkKSA/IGFzeW5jIDogdHJ1ZTtcbiAgICAgICAgICAgIGVsZW0uc3JjID0gcGF0aDtcblxuICAgICAgICAgICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGVsZW0ucmVhZHlTdGF0ZSAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnbG9hZGVkJykgfHwgbG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRyaWdnZXJOYW1lID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJOYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMub250cmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZEFzeW5jU3R5bGU6IGZ1bmN0aW9uIChwYXRoLCB0cmlnZ2VyTmFtZSwgYXN5bmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTElOSycpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICAgICAgZWxlbS5hc3luYyA9IChhc3luYyAhPT0gdW5kZWZpbmVkKSA/IGFzeW5jIDogdHJ1ZTtcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IHBhdGg7XG4gICAgICAgICAgICBlbGVtLnJlbCA9ICdzdHlsZXNoZWV0JztcblxuICAgICAgICAgICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGVsZW0ucmVhZHlTdGF0ZSAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnbG9hZGVkJykgfHwgbG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRyaWdnZXJOYW1lID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJOYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMub250cmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgICAgIH0sKi9cblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHdoaWxlIChlbGVtZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbnNlcnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBwb3NpdGlvbiwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwocG9zaXRpb24sIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXBlbmQ6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZDogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZVRleHQ6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICAvLyBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbG9uZVJldHVybjogMCxcbiAgICAgICAgY2xvbmVBcHBlbmQ6IDEsXG4gICAgICAgIGNsb25lSW5zZXJ0QWZ0ZXI6IDIsXG4gICAgICAgIGNsb25lSW5zZXJ0QmVmb3JlOiAzLFxuXG4gICAgICAgIGNsb25lOiBmdW5jdGlvbiAoZWxlbWVudCwgdHlwZSwgY29udGFpbmVyLCB0YXJnZXQpIHtcbiAgICAgICAgICAgIHZhciBuZXdFbGVtZW50ID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChjb250YWluZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlICE9PSB1bmRlZmluZWQgJiYgdHlwZSAhPSBsYXJvdXhfZG9tLmNsb25lUmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUFwcGVuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobmV3RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IGxhcm91eF9kb20uY2xvbmVJbnNlcnRBZnRlcikge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gdHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lSW5zZXJ0QmVmb3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXdFbGVtZW50O1xuICAgICAgICB9LyosXG5cbiAgICAgICAgLy8gVE9ETzogaXQncyByZWR1bmRhbnQgZm9yIG5vd1xuICAgICAgICBhcHBseU9wZXJhdGlvbnM6IGZ1bmN0aW9uIChlbGVtZW50LCBvcGVyYXRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBvcGVyYXRpb24gaW4gb3BlcmF0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghb3BlcmF0aW9ucy5oYXNPd25Qcm9wZXJ0eShvcGVyYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGJpbmRpbmcgaW4gb3BlcmF0aW9uc1tvcGVyYXRpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb3BlcmF0aW9uc1tvcGVyYXRpb25dLmhhc093blByb3BlcnR5KGJpbmRpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG9wZXJhdGlvbnNbb3BlcmF0aW9uXVtiaW5kaW5nXTtcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2V0cHJvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcuc3Vic3RyaW5nKDAsIDEpID09ICdfJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShiaW5kaW5nLnN1YnN0cmluZygxKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZyA9PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5yZXBsYWNlKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWRkcHJvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcuc3Vic3RyaW5nKDAsIDEpID09ICdfJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShiaW5kaW5nLnN1YnN0cmluZygxKSwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSkpICsgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZyA9PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5hcHBlbmQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVwcm9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuc3Vic3RyaW5nKDAsIDEpID09ICdfJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh2YWx1ZS5zdWJzdHJpbmcoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZGNsYXNzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLmFkZENsYXNzKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZWNsYXNzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnJlbW92ZUNsYXNzKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZHN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnQsIGJpbmRpbmcsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZXN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnQsIHZhbHVlLCAnaW5oZXJpdCAhaW1wb3J0YW50Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZXBlYXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhvcGVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9Ki9cbiAgICB9O1xuXG4gICAgLy8gYSBmaXggZm9yIEludGVybmV0IEV4cGxvcmVyXG4gICAgaWYgKHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnRFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhcm91eF9kb207XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gZXZlbnRzXG4gICAgdmFyIGxhcm91eF9ldmVudHMgPSB7XG4gICAgICAgIGRlbGVnYXRlczogW10sXG5cbiAgICAgICAgYWRkOiBmdW5jdGlvbiAoZXZlbnQsIGZuYykge1xuICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMucHVzaCh7IGV2ZW50OiBldmVudCwgZm5jOiBmbmMgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW52b2tlOiBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9ldmVudHMuZGVsZWdhdGVzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfZXZlbnRzLmRlbGVnYXRlc1tpdGVtXS5ldmVudCAhPSBldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlc1tpdGVtXS5mbmMoYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9ldmVudHM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2FqYXggPSByZXF1aXJlKCcuL2xhcm91eC5hamF4LmpzJyk7XG5cbiAgICAvLyBmb3Jtc1xuICAgIHZhciBsYXJvdXhfZm9ybXMgPSB7XG4gICAgICAgIGFqYXhGb3JtOiBmdW5jdGlvbiAoZm9ybW9iaiwgZm5jLCBmbmNCZWdpbikge1xuICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudChmb3Jtb2JqLCAnc3VibWl0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChmbmNCZWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuY0JlZ2luKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgucG9zdChcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5nZXRBdHRyaWJ1dGUoJ2FjdGlvbicpLFxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZm9ybXMuc2VyaWFsaXplRm9ybURhdGEoZm9ybW9iaiksXG4gICAgICAgICAgICAgICAgICAgIGZuY1xuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0Zvcm1GaWVsZDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnRklMRScgfHwgdHlwZSA9PT0gJ0NIRUNLQk9YJyB8fCB0eXBlID09PSAnUkFESU8nIHx8IHR5cGUgPT09ICdURVhUJyB8fCB0eXBlID09PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT09ICdISURERU4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Rm9ybUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5kaXNhYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdGSUxFJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5maWxlc1swXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ0NIRUNLQk9YJyB8fCB0eXBlID09PSAnUkFESU8nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdURVhUJyB8fCB0eXBlID09PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT09ICdISURERU4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEZvcm1GaWVsZFZhbHVlOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG9wdGlvbiBpbiBlbGVtZW50Lm9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Lm9wdGlvbnMuaGFzT3duUHJvcGVydHkob3B0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5vcHRpb25zW29wdGlvbl0udmFsdWUgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IG9wdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnRklMRScpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5maWxlc1swXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ0NIRUNLQk9YJyB8fCB0eXBlID09ICdSQURJTycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09IGVsZW1lbnQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ1RFWFQnIHx8IHR5cGUgPT0gJ1BBU1NXT1JEJyB8fCB0eXBlID09ICdISURERU4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0b2dnbGVGb3JtRWRpdGluZzogZnVuY3Rpb24gKGZvcm1vYmosIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZvcm1vYmouZ2V0QXR0cmlidXRlKCdkYXRhLWxhc3QtZW5hYmxlZCcpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1vYmouc2V0QXR0cmlidXRlKCdkYXRhLWxhc3QtZW5hYmxlZCcsICdlbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9mb3Jtcy5pc0Zvcm1GaWVsZChzZWxlY3Rpb25bc2VsZWN0ZWRdKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbGFzdERpc2FibGVkID0gc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3REaXNhYmxlZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1kaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXN0RGlzYWJsZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbltzZWxlY3RlZF0ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpYWxpemVGb3JtRGF0YTogZnVuY3Rpb24gKGZvcm1vYmopIHtcbiAgICAgICAgICAgIHZhciBmb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbGFyb3V4X2Zvcm1zLmdldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1kYXRhLmFwcGVuZChzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnbmFtZScpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZm9ybWRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoZm9ybW9iaikge1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbGFyb3V4X2Zvcm1zLmdldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlc1tzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfSxcblxuICAgICAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKGZvcm1vYmosIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9mb3Jtcy5zZXRGb3JtRmllbGRWYWx1ZShzZWxlY3Rpb25bc2VsZWN0ZWRdLCBkYXRhW3NlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2Zvcm1zO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGhlbHBlcnNcbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSB7XG4gICAgICAgIHVuaXF1ZUlkOiAwLFxuXG4gICAgICAgIGdldFVuaXF1ZUlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCBwbHVzcGx1czogdHJ1ZSAqL1xuICAgICAgICAgICAgcmV0dXJuICd1aWQtJyArICgrK2xhcm91eF9oZWxwZXJzLnVuaXF1ZUlkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiAodmFsdWVzLCByZmMzOTg2KSB7XG4gICAgICAgICAgICB2YXIgdXJpID0gJycsXG4gICAgICAgICAgICAgICAgcmVnRXggPSAvJTIwL2c7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmZjMzk4NiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpICs9ICcmJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKS5yZXBsYWNlKHJlZ0V4LCAnKycpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tuYW1lXS50b1N0cmluZygpKS5yZXBsYWNlKHJlZ0V4LCAnKycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpICs9ICcmJyArIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbbmFtZV0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1cmkuc3Vic3RyKDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkRm9ybURhdGE6IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNbbmFtZV0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmFwcGVuZChuYW1lLCB2YWx1ZXNbbmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9ybWF0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmdzKS5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbiAoKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmdzKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZUFsbDogZnVuY3Rpb24gKHRleHQsIGRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoT2JqZWN0LmtleXMoZGljdGlvbmFyeSkuam9pbignfCcpLCAnZycpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIHJlLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGljdGlvbmFyeVttYXRjaF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYW1lbENhc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyQ2hhciA9IHZhbHVlLmNoYXJBdChqKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckNoYXIgPT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gKCFmbGFnKSA/IGN1cnJDaGFyIDogY3VyckNoYXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW50aUNhbWVsQ2FzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyckNoYXIgPSB2YWx1ZS5jaGFyQXQoaik7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJDaGFyICE9ICctJyAmJiBjdXJyQ2hhciA9PSBjdXJyQ2hhci50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSAnLScgKyBjdXJyQ2hhci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gY3VyckNoYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcXVvdGVBdHRyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnJmFwb3M7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG4vZywgJyYjMTM7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFxyXFxuXS9nLCAnJiMxMzsnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzcGxpY2VTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNvdW50LCBhZGQpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgwLCBpbmRleCkgKyAoYWRkIHx8ICcnKSArIHZhbHVlLnNsaWNlKGluZGV4ICsgY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmRvbTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgICAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kOiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgb2JqLnNvbWUoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV4dGVuZE9iamVjdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IHRhcmdldCBpbnN0YW5jZW9mIEFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gYXJndW1lbnRzW2l0ZW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0YXJnZXQucHVzaChhcmd1bWVudHNbaXRlbV1bbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgICAgICAvKiB0YXJnZXRbbmFtZV0uY29uc3RydWN0b3IgPT09IE9iamVjdCAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc093blByb3BlcnR5KG5hbWUpICYmIHRhcmdldFtuYW1lXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZXh0ZW5kT2JqZWN0KHRhcmdldFtuYW1lXSwgYXJndW1lbnRzW2l0ZW1dW25hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gYXJndW1lbnRzW2l0ZW1dW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlYWNoOiBmdW5jdGlvbiAoYXJyLCBmbmMsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmbmMoaXRlbSwgYXJyW2l0ZW1dKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1hcDogZnVuY3Rpb24gKGFyciwgZm5jLCBkb250U2tpcFJldHVybnMsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMoYXJyW2l0ZW1dLCBpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZG9udFNraXBSZXR1cm5zIHx8IHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5kZXg6IGZ1bmN0aW9uIChhcnIsIHZhbHVlLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJyW2l0ZW1dID09PSBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBhZWFjaDogZnVuY3Rpb24gKGFyciwgZm5jKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuYyhpLCBhcnJbaV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW1hcDogZnVuY3Rpb24gKGFyciwgZm5jLCBkb250U2tpcFJldHVybnMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jKGFycltpXSwgaSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRvbnRTa2lwUmV0dXJucyB8fCByZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnVuc2hpZnQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFpbmRleDogZnVuY3Rpb24gKGFyciwgdmFsdWUsIHN0YXJ0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gKHN0YXJ0IHx8IDApLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb2x1bW46IGZ1bmN0aW9uIChvYmosIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLm1hcChvYmosIGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfSwgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2h1ZmZsZTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgICAgICBzaHVmZmxlZCA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByYW5kID0gbGFyb3V4X2hlbHBlcnMucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgICAgICAgICAgICBzaHVmZmxlZFtpbmRleCsrXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgICAgICAgICAgIHNodWZmbGVkW3JhbmRdID0gb2JqW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWVyZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIHRtcCA9IHRhcmdldCxcbiAgICAgICAgICAgICAgICBpc0FycmF5ID0gdG1wIGluc3RhbmNlb2YgQXJyYXk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gdG1wLmNvbmNhdChhcmd1bWVudHNbaXRlbV0pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGFyZ3VtZW50c1tpdGVtXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpdGVtXS5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0bXBbYXR0cl0gPSBhcmd1bWVudHNbaXRlbV1bYXR0cl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdG1wO1xuICAgICAgICB9LFxuXG4gICAgICAgIGR1cGxpY2F0ZTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9BcnJheTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGl0ZW1zW2ldID0gb2JqW2ldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0QXNBcnJheTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgdmFyIGl0ZW1zO1xuXG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IG9iajtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgTm9kZUxpc3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGl0ZW1zID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtc1tpXSA9IG9ialtpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gW29ial07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMZW5ndGg6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0S2V5c1JlY3Vyc2l2ZTogZnVuY3Rpb24gKG9iaiwgZGVsaW1pdGVyLCBwcmVmaXgsIGtleXMpIHtcbiAgICAgICAgICAgIGlmIChkZWxpbWl0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9ICcuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcHJlZml4ID0gJyc7XG4gICAgICAgICAgICAgICAga2V5cyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGtleXMucHVzaChwcmVmaXggKyBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChvYmpbaXRlbV0gIT09IHVuZGVmaW5lZCAmJiBvYmpbaXRlbV0gIT09IG51bGwgJiYgb2JqW2l0ZW1dLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZ2V0S2V5c1JlY3Vyc2l2ZShvYmpbaXRlbV0sIGRlbGltaXRlciwgcHJlZml4ICsgaXRlbSArIGRlbGltaXRlciwga2V5cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RWxlbWVudDogZnVuY3Rpb24gKG9iaiwgcGF0aCwgZGVmYXVsdFZhbHVlLCBkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWxpbWl0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9ICcuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBvcyA9IHBhdGguaW5kZXhPZihkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgdmFyIGtleTtcbiAgICAgICAgICAgIHZhciByZXN0O1xuICAgICAgICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBwYXRoO1xuICAgICAgICAgICAgICAgIHJlc3QgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBwYXRoLnN1YnN0cmluZygwLCBwb3MpO1xuICAgICAgICAgICAgICAgIHJlc3QgPSBwYXRoLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCEoa2V5IGluIG9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzdCA9PT0gbnVsbCB8fCByZXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQob2JqW2tleV0sIHJlc3QsIGRlZmF1bHRWYWx1ZSwgZGVsaW1pdGVyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2Zvcm1zID0gcmVxdWlyZSgnLi9sYXJvdXguZm9ybXMuanMnKTtcblxuICAgIC8vIGtleXNcbiAgICB2YXIgbGFyb3V4X2tleXMgPSB7XG4gICAgICAgIGtleU5hbWU6IGZ1bmN0aW9uIChrZXljb2RlKSB7XG4gICAgICAgICAgICBrZXljb2RlID0ga2V5Y29kZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGtleWNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2JhY2tzcGFjZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDg7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDk7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcbiAgICAgICAgICAgIGNhc2UgJ3JldHVybic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEzO1xuXG4gICAgICAgICAgICBjYXNlICdlc2MnOlxuICAgICAgICAgICAgY2FzZSAnZXNjYXBlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMjc7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzI7XG5cbiAgICAgICAgICAgIGNhc2UgJ3BndXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzMztcblxuICAgICAgICAgICAgY2FzZSAncGdkbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM0O1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNTtcblxuICAgICAgICAgICAgY2FzZSAnaG9tZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM2O1xuXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzc7XG5cbiAgICAgICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzg7XG5cbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzk7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgICAgICAgIHJldHVybiA0MDtcblxuICAgICAgICAgICAgY2FzZSAnaW5zZXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gNDU7XG5cbiAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ2O1xuXG4gICAgICAgICAgICBjYXNlICdmMSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExMjtcblxuICAgICAgICAgICAgY2FzZSAnZjInOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTM7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE0O1xuXG4gICAgICAgICAgICBjYXNlICdmNCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNTtcblxuICAgICAgICAgICAgY2FzZSAnZjUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y2JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE3O1xuXG4gICAgICAgICAgICBjYXNlICdmNyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExODtcblxuICAgICAgICAgICAgY2FzZSAnZjgnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTk7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y5JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIwO1xuXG4gICAgICAgICAgICBjYXNlICdmMTAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjE7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxMSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMjtcblxuICAgICAgICAgICAgY2FzZSAnZjEyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIzO1xuXG4gICAgICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTg4O1xuXG4gICAgICAgICAgICBjYXNlICcuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTkwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShrZXljb2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB7dGFyZ2V0LCBrZXksIHNoaWZ0LCBjdHJsLCBhbHQsIGRpc2FibGVJbnB1dHMsIGZuY31cbiAgICAgICAgYXNzaWduOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBldi50YXJnZXQgfHwgZXYuc3JjRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkgeyAvLyBlbGVtZW50Lm5vZGVUeXBlID09PSAxIHx8XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzYWJsZUlucHV0cyAmJiBsYXJvdXhfZm9ybXMuaXNGb3JtRmllbGQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNoaWZ0ICYmICFldi5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY3RybCAmJiAhZXYuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWx0ICYmICFldi5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBsYXJvdXhfa2V5cy5rZXlOYW1lKG9wdGlvbnMua2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAoZXYua2V5Q29kZSB8fCBldi53aGljaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm5jKGV2KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQob3B0aW9ucy50YXJnZXQgfHwgZG9jdW1lbnQsICdrZXlkb3duJywgd3JhcHBlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9rZXlzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfc3RhY2sgPSByZXF1aXJlKCcuL2xhcm91eC5zdGFjay5qcycpO1xuXG4gICAgLy8gbXZjXG4gICAgdmFyIGxhcm91eF9tdmMgPSB7XG4gICAgICAgIGFwcHM6IHt9LFxuICAgICAgICBwYXVzZVVwZGF0ZTogZmFsc2UsXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGxhcm91eF9kb20uc2VsZWN0QnlJZChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgKG1vZGVsLmNvbnN0cnVjdG9yICE9PSBsYXJvdXhfc3RhY2spIHtcbiAgICAgICAgICAgIC8vICAgICBtb2RlbCA9IG5ldyBsYXJvdXhfc3RhY2sobW9kZWwpO1xuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICB2YXIgYXBwS2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG5cbiAgICAgICAgICAgIG1vZGVsLm9udXBkYXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfbXZjLnBhdXNlVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9tdmMudXBkYXRlKGFwcEtleSk7IC8vICwgW2V2ZW50LmtleV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfbXZjLmFwcHNbYXBwS2V5XSA9IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCAvLyAsXG4gICAgICAgICAgICAgICAgLy8gbW9kZWxLZXlzOiBudWxsLFxuICAgICAgICAgICAgICAgIC8vIGJvdW5kRWxlbWVudHM6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gZXZlbnRFbGVtZW50czogbnVsbFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5yZWJpbmQoYXBwS2V5KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWJpbmQ6IGZ1bmN0aW9uIChhcHBLZXkpIHtcbiAgICAgICAgICAgIHZhciBhcHAgPSBsYXJvdXhfbXZjLmFwcHNbYXBwS2V5XTtcbiAgICAgICAgICAgIC8qanNsaW50IG5vbWVuOiB0cnVlICovXG4gICAgICAgICAgICBhcHAubW9kZWxLZXlzID0gbGFyb3V4X2hlbHBlcnMuZ2V0S2V5c1JlY3Vyc2l2ZShhcHAubW9kZWwuX2RhdGEpOyAvLyBGSVhNRTogd29ya3Mgb25seSBmb3IgJGwuc3RhY2tcbiAgICAgICAgICAgIGFwcC5ib3VuZEVsZW1lbnRzID0ge307XG4gICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50cyA9IFtdO1xuXG4gICAgICAgICAgICBsYXJvdXhfbXZjLnNjYW5FbGVtZW50cyhhcHAsIGFwcC5lbGVtZW50KTtcbiAgICAgICAgICAgIGxhcm91eF9tdmMudXBkYXRlKGFwcEtleSk7XG5cbiAgICAgICAgICAgIHZhciBmbmMgPSBmdW5jdGlvbiAoZXYsIGVsZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZyA9IGxhcm91eF9tdmMuYmluZFN0cmluZ1BhcnNlcihlbGVtLmdldEF0dHJpYnV0ZSgnbHItZXZlbnQnKSk7XG4gICAgICAgICAgICAgICAgLy8gbGFyb3V4X212Yy5wYXVzZVVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBiaW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtID09PSBudWxsIHx8ICFiaW5kaW5nLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nW2l0ZW1dLmNoYXJBdCgwKSA9PSAnXFwnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLm1vZGVsW2l0ZW1dID0gYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoMSwgYmluZGluZ1tpdGVtXS5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZygwLCA1KSA9PSAnYXR0ci4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAubW9kZWxbaXRlbV0gPSBlbGVtLmdldEF0dHJpYnV0ZShiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZyg1KSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoMCwgNSkgPT0gJ3Byb3AuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLm1vZGVsW2l0ZW1dID0gZWxlbVtiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZyg1KV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbGFyb3V4X212Yy5wYXVzZVVwZGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFwcC5ldmVudEVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudChcbiAgICAgICAgICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHNbaV0uZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHNbaV0uYmluZGluZ1tudWxsXSxcbiAgICAgICAgICAgICAgICAgICAgZm5jXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzY2FuRWxlbWVudHM6IGZ1bmN0aW9uIChhcHAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBhdHRzID0gZWxlbWVudC5hdHRyaWJ1dGVzLCBtID0gYXR0cy5sZW5ndGg7IGkgPCBtOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0c1tpXS5uYW1lID09ICdsci1iaW5kJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmluZGluZzEgPSBsYXJvdXhfbXZjLmJpbmRTdHJpbmdQYXJzZXIoYXR0c1tpXS52YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBiaW5kaW5nMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiaW5kaW5nMS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwLmJvdW5kRWxlbWVudHNbYmluZGluZzFbaXRlbV1dID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHAuYm91bmRFbGVtZW50c1tiaW5kaW5nMVtpdGVtXV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLmJvdW5kRWxlbWVudHNbYmluZGluZzFbaXRlbV1dLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0c1tpXS5uYW1lID09ICdsci1ldmVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcyID0gbGFyb3V4X212Yy5iaW5kU3RyaW5nUGFyc2VyKGF0dHNbaV0udmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IGJpbmRpbmcyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGNobGRybiA9IGVsZW1lbnQuY2hpbGROb2RlcywgbiA9IGNobGRybi5sZW5ndGg7IGogPCBuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hsZHJuW2pdLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9tdmMuc2NhbkVsZW1lbnRzKGFwcCwgY2hsZHJuW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAoYXBwS2V5LCBrZXlzKSB7XG4gICAgICAgICAgICB2YXIgYXBwID0gbGFyb3V4X212Yy5hcHBzW2FwcEtleV07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5cyA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGtleXMgPSBhcHAubW9kZWxLZXlzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoMSA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoa2V5c1tpXSBpbiBhcHAuYm91bmRFbGVtZW50cykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kRWxlbWVudCA9IGFwcC5ib3VuZEVsZW1lbnRzW2tleXNbaV1dO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGxlbmd0aDIgPSBib3VuZEVsZW1lbnQubGVuZ3RoOyBqIDwgbGVuZ3RoMjsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA2KSA9PSAnc3R5bGUuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRFbGVtZW50W2pdLmVsZW1lbnQuc3R5bGVbYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoNildID0gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChhcHAubW9kZWwsIGtleXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDAsIDUpID09ICdhdHRyLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FIHJlbW92ZUF0dHJpYnV0ZSBvbiBudWxsIHZhbHVlP1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRFbGVtZW50W2pdLmVsZW1lbnQuc2V0QXR0cmlidXRlKGJvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDUpLCBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KGFwcC5tb2RlbCwga2V5c1tpXSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDAsIDUpID09ICdwcm9wLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FIHJlbW92ZUF0dHJpYnV0ZSBvbiBudWxsIHZhbHVlP1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRFbGVtZW50W2pdLmVsZW1lbnRbYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoNSldID0gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChhcHAubW9kZWwsIGtleXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGJpbmRTdHJpbmdQYXJzZXI6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgICAgICB2YXIgbGFzdEJ1ZmZlciA9IG51bGwsXG4gICAgICAgICAgICAgICAgYnVmZmVyID0gJycsXG4gICAgICAgICAgICAgICAgc3RhdGUgPSAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gdGV4dC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyID0gdGV4dC5jaGFyQXQoaSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIgPT0gJzonKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0QnVmZmVyID0gYnVmZmVyLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VyciA9PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbbGFzdEJ1ZmZlcl0gPSBidWZmZXIudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnVmZmVyICs9IGN1cnI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChidWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtsYXN0QnVmZmVyXSA9IGJ1ZmZlci50cmltKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9tdmM7XG5cbn0oKSk7XG4iLCIvKmpzbGludCBub21lbjogdHJ1ZSAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHN0YWNrXG4gICAgdmFyIGxhcm91eF9zdGFjayA9IGZ1bmN0aW9uIChkYXRhLCBkZXB0aCwgdG9wKSB7XG4gICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5fZGVwdGggPSBkZXB0aDtcbiAgICAgICAgdGhpcy5fdG9wID0gdG9wIHx8IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcblxuICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtrZXldKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gbmV3IGxhcm91eF9zdGFjayhcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVwdGggP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcHRoICsgJy4nICsga2V5IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3BcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kYXRhW2tleV0gPT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNldCh0aGlzLCBrZXksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3Aub251cGRhdGUoeyBzY29wZTogdGhpcywga2V5OiBrZXksIG9sZFZhbHVlOiBvbGRWYWx1ZSwgbmV3VmFsdWU6IG5ld1ZhbHVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldFJhbmdlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICAgICAgZm9yICh2YXIgdmFsdWVLZXkgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzT3duUHJvcGVydHkodmFsdWVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KHZhbHVlS2V5LCB2YWx1ZXNbdmFsdWVLZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNba2V5XSB8fCBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFJhbmdlID0gZnVuY3Rpb24gKGtleXMpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBrZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFrZXlzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhbHVlc1trZXlzW2l0ZW1dXSA9IHRoaXNba2V5c1tpdGVtXV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2RhdGEpLmxlbmd0aDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmV4aXN0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiAoa2V5IGluIHRoaXMuX2RhdGEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleSBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNba2V5XTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHRoaXMuX2RhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbaXRlbV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9udXBkYXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmFuZ2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9zdGFjaztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHRlbXBsYXRlc1xuICAgIHZhciBsYXJvdXhfdGVtcGxhdGVzID0ge1xuICAgICAgICBlbmdpbmVzOiB7XG4gICAgICAgICAgICBwbGFpbjoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3RlbXBsYXRlLCBvcHRpb25zXTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBjb21waWxlZFswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpY3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXg7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChuZXh0SW5kZXggPSByZXN1bHQuaW5kZXhPZigne3snLCBsYXN0SW5kZXgpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbmRleCArPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsb3NlSW5kZXggPSByZXN1bHQuaW5kZXhPZignfX0nLCBuZXh0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3NlSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSByZXN1bHQuc3Vic3RyaW5nKG5leHRJbmRleCwgY2xvc2VJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWN0Wyd7eycgKyBrZXkgKyAnfX0nXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQobW9kZWwsIGtleSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gY2xvc2VJbmRleCArIDI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMucmVwbGFjZUFsbChyZXN1bHQsIGRpY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhvZ2FuOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIb2dhbi5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZC5yZW5kZXIobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG11c3RhY2hlOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNdXN0YWNoZS5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaGFuZGxlYmFyczoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSGFuZGxlYmFycy5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbG9kYXNoOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IG5vbWVuOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB1bmRlcnNjb3JlOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IG5vbWVuOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZ2luZTogJ3BsYWluJyxcblxuICAgICAgICBhcHBseTogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCwgZW5naW5lID0gbGFyb3V4X3RlbXBsYXRlcy5lbmdpbmVzW2xhcm91eF90ZW1wbGF0ZXMuZW5naW5lXTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBlbGVtZW50LnRleHRDb250ZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gZWxlbWVudC5ub2RlVmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21waWxlZCA9IGVuZ2luZS5jb21waWxlKGNvbnRlbnQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGVuZ2luZS5yZW5kZXIoY29tcGlsZWQsIG1vZGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnNlcnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGxhcm91eF90ZW1wbGF0ZXMuYXBwbHkoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmluc2VydCh0YXJnZXQsIHBvc2l0aW9uIHx8ICdiZWZvcmVlbmQnLCBvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbGFyb3V4X3RlbXBsYXRlcy5hcHBseShlbGVtZW50LCBtb2RlbCwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZSh0YXJnZXQsIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90ZW1wbGF0ZXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdGltZXJzXG4gICAgdmFyIGxhcm91eF90aW1lcnMgPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgICAgICB0aW1lci5uZXh0ID0gRGF0ZS5ub3coKSArIHRpbWVyLnRpbWVvdXQ7XG4gICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEucHVzaCh0aW1lcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UodGFyZ2V0S2V5LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5uZXh0IDw9IG5vdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY3VycmVudEl0ZW0ub250aWNrKGN1cnJlbnRJdGVtLnN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSAmJiBjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ubmV4dCA9IG5vdyArIGN1cnJlbnRJdGVtLnRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGltZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyk7XG5cbiAgICAvLyB0b3VjaCAtIHBhcnRpYWxseSB0YWtlbiBmcm9tICd0b2NjYS5qcycgcHJvamVjdFxuICAgIC8vICAgICAgICAgY2FuIGJlIGZvdW5kIGF0OiBodHRwczovL2dpdGh1Yi5jb20vR2lhbmx1Y2FHdWFyaW5pL1RvY2NhLmpzXG4gICAgdmFyIGxhcm91eF90b3VjaCA9IHtcbiAgICAgICAgdG91Y2hTdGFydGVkOiBudWxsLFxuICAgICAgICBzd2lwZVRyZXNob2xkOiA4MCxcbiAgICAgICAgcHJlY2lzaW9uOiAzMCxcbiAgICAgICAgdGFwQ291bnQ6IDAsXG4gICAgICAgIHRhcFRyZXNob2xkOiAyMDAsXG4gICAgICAgIGxvbmdUYXBUcmVzaG9sZDogODAwLFxuICAgICAgICB0YXBUaW1lcjogbnVsbCxcbiAgICAgICAgcG9zOiBudWxsLFxuICAgICAgICBjYWNoZWQ6IG51bGwsXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICBzdGFydDogWyd0b3VjaHN0YXJ0JywgJ3BvaW50ZXJkb3duJywgJ01TUG9pbnRlckRvd24nLCAnbW91c2Vkb3duJ10sXG4gICAgICAgICAgICBlbmQ6IFsndG91Y2hlbmQnLCAncG9pbnRlcnVwJywgJ01TUG9pbnRlclVwJywgJ21vdXNldXAnXSxcbiAgICAgICAgICAgIG1vdmU6IFsndG91Y2htb3ZlJywgJ3BvaW50ZXJtb3ZlJywgJ01TUG9pbnRlck1vdmUnLCAnbW91c2Vtb3ZlJ11cbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhdGVQb2ludGVyOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gucG9zID0gW2V2ZW50LnBhZ2VYLCBldmVudC5wYWdlWV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIChuYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkgPyAyIDogMSxcbiAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShkb2N1bWVudCwgbGFyb3V4X3RvdWNoLmV2ZW50cy5zdGFydFtldmVudHNbaV1dLCBsYXJvdXhfdG91Y2gub25zdGFydCk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShkb2N1bWVudCwgbGFyb3V4X3RvdWNoLmV2ZW50cy5lbmRbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLm9uZW5kKTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGRvY3VtZW50LCBsYXJvdXhfdG91Y2guZXZlbnRzLm1vdmVbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLmxvY2F0ZVBvaW50ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uc3RhcnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmxvY2F0ZVBvaW50ZXIoZXZlbnQpO1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZCA9IFtsYXJvdXhfdG91Y2gucG9zWzBdLCBsYXJvdXhfdG91Y2gucG9zWzFdXTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCsrO1xuXG4gICAgICAgICAgICB2YXIgZm5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdG91Y2guY2FjaGVkWzBdID49IGxhcm91eF90b3VjaC5wb3NbMF0gLSBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzBdIDw9IGxhcm91eF90b3VjaC5wb3NbMF0gKyBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzFdID49IGxhcm91eF90b3VjaC5wb3NbMV0gLSBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzFdIDw9IGxhcm91eF90b3VjaC5wb3NbMV0gKyBsYXJvdXhfdG91Y2gucHJlY2lzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsYXJvdXhfdG91Y2gudGFwQ291bnQgPT09IDIpID8gJ2RibHRhcCcgOiAndGFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXJvdXhfdG91Y2gucG9zWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXJvdXhfdG91Y2gucG9zWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA+IGxhcm91eF90b3VjaC5sb25nVGFwVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvbmd0YXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGxhcm91eF90b3VjaC5wb3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxhcm91eF90b3VjaC5wb3NbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwVGltZXIgPSBzZXRUaW1lb3V0KGZuYywgbGFyb3V4X3RvdWNoLnRhcFRyZXNob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQobGFyb3V4X3RvdWNoLnRhcFRpbWVyKTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBUaW1lciA9IHNldFRpbWVvdXQoZm5jLCBsYXJvdXhfdG91Y2gudGFwVHJlc2hvbGQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uZW5kOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IFtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnBvc1swXSAtIGxhcm91eF90b3VjaC5jYWNoZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5wb3NbMV0gLSBsYXJvdXhfdG91Y2guY2FjaGVkWzFdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBpbm5lckV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgeDogbGFyb3V4X3RvdWNoLnBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgeTogbGFyb3V4X3RvdWNoLnBvc1sxXSxcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IE1hdGguYWJzKGRlbHRhWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IE1hdGguYWJzKGRlbHRhWzFdKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVswXSA8PSAtbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVyaWdodCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMF0gPj0gbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVsZWZ0JywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVsxXSA8PSAtbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVkb3duJywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVsxXSA+PSBsYXJvdXhfdG91Y2guc3dpcGVUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChldmVudC50YXJnZXQsICdzd2lwZXVwJywgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gbGFyb3V4LnJlYWR5KGxhcm91eF90b3VjaC5pbml0KTtcblxuICAgIHJldHVybiBsYXJvdXhfdG91Y2g7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gdHJpZ2dlcnNcbiAgICB2YXIgbGFyb3V4X3RyaWdnZXJzID0ge1xuICAgICAgICBkZWxlZ2F0ZXM6IFtdLFxuICAgICAgICBsaXN0OiBbXSxcblxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChjb25kaXRpb24sIGZuYywgc3RhdGUpIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb25zID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShjb25kaXRpb24pO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgY29uZGl0aW9uc1tpdGVtXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5saXN0LnB1c2goY29uZGl0aW9uc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbmRpdGlvbnM6IGNvbmRpdGlvbnMsXG4gICAgICAgICAgICAgICAgZm5jOiBmbmMsXG4gICAgICAgICAgICAgICAgc3RhdGU6IHN0YXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbnRyaWdnZXI6IGZ1bmN0aW9uICh0cmlnZ2VyTmFtZSwgYXJncykge1xuICAgICAgICAgICAgdmFyIGV2ZW50SWR4ID0gbGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCB0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICBpZiAoZXZlbnRJZHggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmxpc3Quc3BsaWNlKGV2ZW50SWR4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXNbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjb25kaXRpb25LZXkgaW4gY3VycmVudEl0ZW0uY29uZGl0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRJdGVtLmNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoY29uZGl0aW9uS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZGl0aW9uT2JqID0gY3VycmVudEl0ZW0uY29uZGl0aW9uc1tjb25kaXRpb25LZXldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIGNvbmRpdGlvbk9iaikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZm5jKFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiBjdXJyZW50SXRlbS5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RyaWdnZXIgbmFtZTogJyArIHRyaWdnZXJOYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3RyaWdnZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyksXG4gICAgICAgIGxhcm91eF90aW1lcnMgPSByZXF1aXJlKCcuL2xhcm91eC50aW1lcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X2RhdGUgPSByZXF1aXJlKCcuL2xhcm91eC5kYXRlLmpzJyk7XG5cbiAgICAvLyB1aVxuICAgIHZhciBsYXJvdXhfdWkgPSB7XG4gICAgICAgIGZsb2F0Q29udGFpbmVyOiBudWxsLFxuXG4gICAgICAgIHBvcHVwOiB7XG4gICAgICAgICAgICBkZWZhdWx0VGltZW91dDogNTAwLFxuXG4gICAgICAgICAgICBjcmVhdGVCb3g6IGZ1bmN0aW9uIChpZCwgeGNsYXNzLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kb20uY3JlYXRlRWxlbWVudCgnRElWJywgeyBpZDogaWQsICdjbGFzcyc6IHhjbGFzcyB9LCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1zZ2JveDogZnVuY3Rpb24gKHRpbWVvdXQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBsYXJvdXhfaGVscGVycy5nZXRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgICAgICAgICBvYmogPSBsYXJvdXhfdWkucG9wdXAuY3JlYXRlQm94KGlkLCAnbGFyb3V4TXNnQm94JywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyLmFwcGVuZENoaWxkKG9iaik7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KG9iaiwgeyBvcGFjaXR5OiAxIH0pO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5zZXQoe1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICByZXNldDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG9udGljazogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoeCwgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5yZW1vdmUoeCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBvYmpcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkaW5nOiB7XG4gICAgICAgICAgICBlbGVtZW50U2VsZWN0b3I6IG51bGwsXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgZGVmYXVsdERlbGF5OiAxNTAwLFxuICAgICAgICAgICAgdGltZXI6IG51bGwsXG5cbiAgICAgICAgICAgIGtpbGxUaW1lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChsYXJvdXhfdWkubG9hZGluZy50aW1lcik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcua2lsbFRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQsIHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID0gJ2ZhbHNlJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChkZWxheSkge1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmtpbGxUaW1lcigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsYXkgPSBsYXJvdXhfdWkubG9hZGluZy5kZWZhdWx0RGVsYXk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdygwKTsgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCwgeyBkaXNwbGF5OiAnYmxvY2snIH0pO1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciA9ICd0cnVlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgPT09IG51bGwgJiYgbGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudFNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgPSBsYXJvdXhfZG9tLnNlbGVjdFNpbmdsZShsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50U2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQod2luZG93LCAnbG9hZCcsIGxhcm91eF91aS5sb2FkaW5nLmhpZGUpO1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KHdpbmRvdywgJ2JlZm9yZXVubG9hZCcsIGxhcm91eF91aS5sb2FkaW5nLnNob3cpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciAhPT0gdW5kZWZpbmVkICYmIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLnNob3coMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHluYW1pY0RhdGVzOiB7XG4gICAgICAgICAgICB1cGRhdGVEYXRlc0VsZW1lbnRzOiBudWxsLFxuXG4gICAgICAgICAgICB1cGRhdGVEYXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzID0gbGFyb3V4X2RvbS5zZWxlY3QoJypbZGF0YS1lcG9jaF0nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAvLyBiaXRzaGlmdGluZyAoc3RyID4+IDApIHVzZWQgaW5zdGVhZCBvZiBwYXJzZUludChzdHIsIDEwKVxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKChvYmouZ2V0QXR0cmlidXRlKCdkYXRhLWVwb2NoJykgPj4gMCkgKiAxMDAwKTtcblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmosXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZGF0ZS5nZXREYXRlU3RyaW5nKGRhdGUpXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBsYXJvdXhfZGF0ZS5nZXRMb25nRGF0ZVN0cmluZyhkYXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwLFxuICAgICAgICAgICAgICAgICAgICByZXNldDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb250aWNrOiBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2Nyb2xsVmlldzoge1xuICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50czogW10sXG5cbiAgICAgICAgICAgIG9uaGlkZGVuOiBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnRzLCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnRzLCBbJ29wYWNpdHknXSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbnJldmVhbDogZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50cywgeyBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfY3NzLmluVmlld3BvcnQoZWxlbWVudHNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLnB1c2goZWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcub25oaWRkZW4obGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudCh3aW5kb3csICdzY3JvbGwnLCBsYXJvdXhfdWkuc2Nyb2xsVmlldy5yZXZlYWwpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmV2ZWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmVhY2goXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2Nzcy5pblZpZXdwb3J0KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLnNwbGljZShyZW1vdmVLZXlzW2l0ZW1dLCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS51bnNldEV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIGxhcm91eF91aS5zY3JvbGxWaWV3LnJldmVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcub25yZXZlYWwoZWxlbWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVGbG9hdENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFsYXJvdXhfdWkuZmxvYXRDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZmxvYXRDb250YWluZXIgPSBsYXJvdXhfZG9tLmNyZWF0ZUVsZW1lbnQoJ0RJVicsIHsgJ2NsYXNzJzogJ2xhcm91eEZsb2F0RGl2JyB9KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShsYXJvdXhfdWkuZmxvYXRDb250YWluZXIsIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGFyb3V4X3VpLmNyZWF0ZUZsb2F0Q29udGFpbmVyKCk7XG4gICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5pbml0KCk7XG4gICAgICAgICAgICBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLmluaXQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBsYXJvdXgucmVhZHkobGFyb3V4X3VpLmluaXQpO1xuXG4gICAgcmV0dXJuIGxhcm91eF91aTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyB2YXJzXG4gICAgdmFyIGxhcm91eF92YXJzID0ge1xuICAgICAgICBjb29raWVQYXRoOiAnLycsXG5cbiAgICAgICAgZ2V0Q29va2llOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9W147XSsnLCAnaScpLFxuICAgICAgICAgICAgICAgIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKHJlKTtcblxuICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXS5zcGxpdCgnPScpWzFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDb29raWU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCkge1xuICAgICAgICAgICAgdmFyIGV4cGlyZVZhbHVlID0gJyc7XG4gICAgICAgICAgICBpZiAoZXhwaXJlcykge1xuICAgICAgICAgICAgICAgIGV4cGlyZVZhbHVlID0gJzsgZXhwaXJlcz0nICsgZXhwaXJlcy50b0dNVFN0cmluZygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpICsgZXhwaXJlVmFsdWUgKyAnOyBwYXRoPScgKyAocGF0aCB8fCBsYXJvdXhfdmFycy5jb29raWVQYXRoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDb29raWU6IGZ1bmN0aW9uIChuYW1lLCBwYXRoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVDsgcGF0aD0nICsgKHBhdGggfHwgbGFyb3V4X3ZhcnMuY29va2llUGF0aCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9jYWw6IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gbG9jYWxTdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW25hbWVdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRMb2NhbDogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTG9jYWw6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgbG9jYWxTdG9yYWdlW25hbWVdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNlc3Npb246IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghKG5hbWUgaW4gc2Vzc2lvblN0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZVtuYW1lXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZVtuYW1lXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHNlc3Npb25TdG9yYWdlW25hbWVdO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdmFycztcblxufSgpKTtcbiIsIi8qZ2xvYmFsIE5vZGVMaXN0LCBOb2RlICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHdyYXBwZXJcbiAgICB2YXIgbGFyb3V4X3dyYXBwZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uO1xuXG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3RvcjtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBsYXJvdXhfaGVscGVycy50b0FycmF5KHNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IFtzZWxlY3Rvcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBsYXJvdXhfZG9tLnNlbGVjdChzZWxlY3RvciwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlKHNlbGVjdGlvblswXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUoc2VsZWN0aW9uKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuaXNBcnJheSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfd3JhcHBlcihzZWxlY3RvciwgdGhpcy5zb3VyY2UpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlID0gZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gZWxlbWVudHM7XG4gICAgICAgIHRoaXMuaXNBcnJheSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZVtpbmRleF07XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCA9IDA7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUgPSAxO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXkgPSAyO1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIgPSBmdW5jdGlvbiAobmFtZSwgZm5jLCBzY29wZSkge1xuICAgICAgICB2YXIgbmV3Rm5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYy5hcHBseShcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIFt0aGlzLnNvdXJjZV0uY29uY2F0KGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiAocmVzdWx0ID09PSB1bmRlZmluZWQpID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICAgIGNhc2UgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGU6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5OlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2F0dHInLCBsYXJvdXhfZG9tLmF0dHIsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignZGF0YScsIGxhcm91eF9kb20uZGF0YSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvbicsIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb24nLCBsYXJvdXhfZG9tLnNldEV2ZW50LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5KTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb2ZmJywgbGFyb3V4X2RvbS51bnNldEV2ZW50LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdjbGVhcicsIGxhcm91eF9kb20uY2xlYXIsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5zZXJ0JywgbGFyb3V4X2RvbS5pbnNlcnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncHJlcGVuZCcsIGxhcm91eF9kb20ucHJlcGVuZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhcHBlbmQnLCBsYXJvdXhfZG9tLmFwcGVuZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZXBsYWNlJywgbGFyb3V4X2RvbS5yZXBsYWNlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlcGxhY2VUZXh0JywgbGFyb3V4X2RvbS5yZXBsYWNlVGV4dCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZW1vdmUnLCBsYXJvdXhfZG9tLnJlbW92ZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hhc0NsYXNzJywgbGFyb3V4X2Nzcy5oYXNDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhZGRDbGFzcycsIGxhcm91eF9jc3MuYWRkQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlbW92ZUNsYXNzJywgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigndG9nZ2xlQ2xhc3MnLCBsYXJvdXhfY3NzLnRvZ2dsZUNsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdnZXRQcm9wZXJ0eScsIGxhcm91eF9jc3MuZ2V0UHJvcGVydHksIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2V0UHJvcGVydHknLCBsYXJvdXhfY3NzLnNldFByb3BlcnR5LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzZXRUcmFuc2l0aW9uJywgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzaG93JywgbGFyb3V4X2Nzcy5zaG93LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoaWRlJywgbGFyb3V4X2Nzcy5oaWRlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoZWlnaHQnLCBsYXJvdXhfY3NzLmhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbm5lckhlaWdodCcsIGxhcm91eF9jc3MuaW5uZXJIZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb3V0ZXJIZWlnaHQnLCBsYXJvdXhfY3NzLm91dGVySGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3dpZHRoJywgbGFyb3V4X2Nzcy53aWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbm5lcldpZHRoJywgbGFyb3V4X2Nzcy5pbm5lcldpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ291dGVyV2lkdGgnLCBsYXJvdXhfY3NzLm91dGVyV2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigndG9wJywgbGFyb3V4X2Nzcy50b3AsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignbGVmdCcsIGxhcm91eF9jc3MubGVmdCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhYm92ZVRoZVRvcCcsIGxhcm91eF9jc3MuYWJvdmVUaGVUb3AsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYmVsb3dUaGVGb2xkJywgbGFyb3V4X2Nzcy5iZWxvd1RoZUZvbGQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignbGVmdE9mU2NyZWVuJywgbGFyb3V4X2Nzcy5sZWZ0T2ZTY3JlZW4sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmlnaHRPZlNjcmVlbicsIGxhcm91eF9jc3MucmlnaHRPZlNjcmVlbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpblZpZXdwb3J0JywgbGFyb3V4X2Nzcy5pblZpZXdwb3J0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG5cbiAgICByZXR1cm4gbGFyb3V4X3dyYXBwZXI7XG5cbn0oKSk7XG4iXX0=
