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
                (parent || window.document).querySelectorAll(selector)
            );
        }

        /*
        // FIXME: non-chrome optimization
        var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        if (re) {
            if (parent === undefined) {
                return window.document.getElementById(re[1]);
            }

            return parent.getElementById(re[1]);
        }
        */

        return (parent || window.document).querySelector(selector);
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
                    window.document.querySelectorAll(selector)
                )
            );
        }

        return laroux.cached.single[selector] || (
            laroux.cached.single[selector] = window.document.querySelector(selector)
        );
    };

    laroux.id = function (selector, parent) {
        return (parent || window.document).getElementById(selector);
    };

    laroux.idc = function (selector) {
        return laroux.cached.id[selector] ||
            (laroux.cached.id[selector] = window.document.getElementById(selector));
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

    if (typeof window !== 'undefined') {
        window.document.addEventListener(
            'DOMContentLoaded',
            function () {
                if (!laroux.readyPassed) {
                    laroux.events.invoke('ContentLoaded');
                    window.setInterval(laroux.timers.ontick, 100);
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
            return window.document.documentElement.classList.contains(propName);
        },

        select: function (selector, parent) {
            return laroux_helpers.toArray(
                (parent || window.document).querySelectorAll(selector)
            );
        },

        selectByClass: function (selector, parent) {
            return laroux_helpers.toArray(
                (parent || window.document).getElementsByClassName(selector)
            );
        },

        selectByTag: function (selector, parent) {
            return laroux_helpers.toArray(
                (parent || window.document).getElementsByTagName(selector)
            );
        },

        selectById: function (selector, parent) {
            return (parent || window.document).getElementById(selector);
        },

        selectSingle: function (selector, parent) {
            return (parent || window.document).querySelector(selector);
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
                laroux_dom.setEventSingle(window.document, laroux_touch.events.start[events[i]], laroux_touch.onstart);
                laroux_dom.setEventSingle(window.document, laroux_touch.events.end[events[i]], laroux_touch.onend);
                laroux_dom.setEventSingle(window.document, laroux_touch.events.move[events[i]], laroux_touch.locatePointer);
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
                window.document.body.insertBefore(laroux_ui.floatContainer, window.document.body.firstChild);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGFyb3V4LmpzIiwic3JjL2xhcm91eC5hamF4LmpzIiwic3JjL2xhcm91eC5hbmltLmpzIiwic3JjL2xhcm91eC5jc3MuanMiLCJzcmMvbGFyb3V4LmRhdGUuanMiLCJzcmMvbGFyb3V4LmRvbS5qcyIsInNyYy9sYXJvdXguZXZlbnRzLmpzIiwic3JjL2xhcm91eC5mb3Jtcy5qcyIsInNyYy9sYXJvdXguaGVscGVycy5qcyIsInNyYy9sYXJvdXgua2V5cy5qcyIsInNyYy9sYXJvdXgubXZjLmpzIiwic3JjL2xhcm91eC5zdGFjay5qcyIsInNyYy9sYXJvdXgudGVtcGxhdGVzLmpzIiwic3JjL2xhcm91eC50aW1lcnMuanMiLCJzcmMvbGFyb3V4LnRvdWNoLmpzIiwic3JjL2xhcm91eC50cmlnZ2Vycy5qcyIsInNyYy9sYXJvdXgudWkuanMiLCJzcmMvbGFyb3V4LnZhcnMuanMiLCJzcmMvbGFyb3V4LndyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBjb3JlXG4gICAgdmFyIGxhcm91eCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4LmhlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IHdpbmRvdy5kb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAvLyBGSVhNRTogbm9uLWNocm9tZSBvcHRpbWl6YXRpb25cbiAgICAgICAgdmFyIHJlID0gL14jKFteXFwrXFw+XFxbXFxdXFwuIyBdKikkLy5leGVjKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKHJlKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJlWzFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5nZXRFbGVtZW50QnlJZChyZVsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cblxuICAgICAgICByZXR1cm4gKHBhcmVudCB8fCB3aW5kb3cuZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH07XG5cbiAgICBpZiAoISgnJGwnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS4kbCA9IGxhcm91eDtcbiAgICB9XG5cbiAgICAvLyBjb3JlIG1vZHVsZXNcbiAgICBsYXJvdXguZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyk7XG4gICAgbGFyb3V4LmhlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgbGFyb3V4LnRpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpO1xuXG4gICAgbGFyb3V4LmNhY2hlZCA9IHtcbiAgICAgICAgc2luZ2xlOiB7fSxcbiAgICAgICAgYXJyYXk6IHt9LFxuICAgICAgICBpZDoge31cbiAgICB9O1xuXG4gICAgbGFyb3V4LmMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXguY2FjaGVkLmFycmF5W3NlbGVjdG9yXSB8fCAoXG4gICAgICAgICAgICAgICAgbGFyb3V4LmNhY2hlZC5hcnJheVtzZWxlY3Rvcl0gPSBsYXJvdXguaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuc2luZ2xlW3NlbGVjdG9yXSB8fCAoXG4gICAgICAgICAgICBsYXJvdXguY2FjaGVkLnNpbmdsZVtzZWxlY3Rvcl0gPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LmlkID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgd2luZG93LmRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZGMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuaWRbc2VsZWN0b3JdIHx8XG4gICAgICAgICAgICAobGFyb3V4LmNhY2hlZC5pZFtzZWxlY3Rvcl0gPSB3aW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LnJlYWR5UGFzc2VkID0gZmFsc2U7XG5cbiAgICBsYXJvdXguZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbGFyb3V4KTtcbiAgICAgICAgbGFyb3V4LmhlbHBlcnMuZXh0ZW5kT2JqZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxhcm91eC5leHRlbmRPYmplY3QgPSBsYXJvdXguaGVscGVycy5leHRlbmRPYmplY3Q7XG4gICAgbGFyb3V4LmVhY2ggPSBsYXJvdXguaGVscGVycy5lYWNoO1xuICAgIGxhcm91eC5tYXAgPSBsYXJvdXguaGVscGVycy5tYXA7XG4gICAgbGFyb3V4LmluZGV4ID0gbGFyb3V4LmhlbHBlcnMuaW5kZXg7XG4gICAgbGFyb3V4LmFlYWNoID0gbGFyb3V4LmhlbHBlcnMuYWVhY2g7XG4gICAgbGFyb3V4LmFtYXAgPSBsYXJvdXguaGVscGVycy5hbWFwO1xuICAgIGxhcm91eC5haW5kZXggPSBsYXJvdXguaGVscGVycy5haW5kZXg7XG5cbiAgICBsYXJvdXgucmVhZHkgPSBmdW5jdGlvbiAoZm5jKSB7XG4gICAgICAgIGlmICghbGFyb3V4LnJlYWR5UGFzc2VkKSB7XG4gICAgICAgICAgICBsYXJvdXguZXZlbnRzLmFkZCgnQ29udGVudExvYWRlZCcsIGZuYyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmbmMoKTtcbiAgICB9O1xuXG4gICAgLy8gb3B0aW9uYWwgbW9kdWxlc1xuICAgIGxhcm91eC53cmFwcGVyID0gcmVxdWlyZSgnLi9sYXJvdXgud3JhcHBlci5qcycpO1xuICAgIGxhcm91eC5hamF4ID0gcmVxdWlyZSgnLi9sYXJvdXguYWpheC5qcycpO1xuICAgIGxhcm91eC5jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKTtcbiAgICBsYXJvdXguZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyk7XG4gICAgLy8gbGFyb3V4LmV2ZW50cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmV2ZW50cy5qcycpO1xuICAgIGxhcm91eC5mb3JtcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmZvcm1zLmpzJyk7XG4gICAgLy8gbGFyb3V4LmhlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgLy8gbGFyb3V4LnRpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpO1xuICAgIGxhcm91eC50cmlnZ2VycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRyaWdnZXJzLmpzJyk7XG4gICAgbGFyb3V4LnZhcnMgPSByZXF1aXJlKCcuL2xhcm91eC52YXJzLmpzJyk7XG5cbiAgICBsYXJvdXguYW5pbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmFuaW0uanMnKTtcbiAgICBsYXJvdXguZGF0ZSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRhdGUuanMnKTtcbiAgICBsYXJvdXgua2V5cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmtleXMuanMnKTtcbiAgICBsYXJvdXgubXZjID0gcmVxdWlyZSgnLi9sYXJvdXgubXZjLmpzJyk7XG4gICAgbGFyb3V4LnN0YWNrID0gcmVxdWlyZSgnLi9sYXJvdXguc3RhY2suanMnKTtcbiAgICBsYXJvdXgudGVtcGxhdGVzID0gcmVxdWlyZSgnLi9sYXJvdXgudGVtcGxhdGVzLmpzJyk7XG4gICAgbGFyb3V4LnRvdWNoID0gcmVxdWlyZSgnLi9sYXJvdXgudG91Y2guanMnKTtcbiAgICBsYXJvdXgudWkgPSByZXF1aXJlKCcuL2xhcm91eC51aS5qcycpO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ0RPTUNvbnRlbnRMb2FkZWQnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4LnJlYWR5UGFzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eC5ldmVudHMuaW52b2tlKCdDb250ZW50TG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRJbnRlcnZhbChsYXJvdXgudGltZXJzLm9udGljaywgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4LnRvdWNoLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4LnJlYWR5UGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhcm91eDtcblxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gYWpheCAtIHBhcnRpYWxseSB0YWtlbiBmcm9tICdqcXVlcnkgaW4gcGFydHMnIHByb2plY3RcbiAgICAvLyAgICAgICAgY2FuIGJlIGZvdW5kIGF0OiBodHRwczovL2dpdGh1Yi5jb20vbXl0aHovanF1aXAvXG4gICAgdmFyIGxhcm91eF9hamF4ID0ge1xuICAgICAgICBjb3JzRGVmYXVsdDogZmFsc2UsXG5cbiAgICAgICAgd3JhcHBlcnM6IHtcbiAgICAgICAgICAgIHJlZ2lzdHJ5OiB7XG4gICAgICAgICAgICAgICAgJ2xhcm91eC5qcyc6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjogJyArIGRhdGEuZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmo7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuZm9ybWF0ID09PSAnanNvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoZGF0YS5vYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuZm9ybWF0ID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IGV2YWwoZGF0YS5vYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBpZiAoZGF0YS5mb3JtYXQgPT0gJ3htbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IGRhdGEub2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeVtuYW1lXSA9IGZuYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4RG9tYWluT2JqZWN0OiBmYWxzZSxcbiAgICAgICAgeG1sSHR0cFJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhEb21haW5SZXF1ZXN0T2JqZWN0OiBudWxsLFxuICAgICAgICB4aHI6IGZ1bmN0aW9uIChjcm9zc0RvbWFpbikge1xuICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoJ3dpdGhDcmVkZW50aWFscycgaW4gbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QpICYmIHdpbmRvdy5YRG9tYWluUmVxdWVzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5PYmplY3QgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3QgPSBuZXcgd2luZG93LlhEb21haW5SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdDtcbiAgICAgICAgfSxcblxuICAgICAgICB4aHJSZXNwOiBmdW5jdGlvbiAoeGhyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlckZ1bmN0aW9uID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlc3BvbnNlLVdyYXBwZXItRnVuY3Rpb24nKSxcbiAgICAgICAgICAgICAgICByZXNwb25zZTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgIC8qanNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgIC8qanNsaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZXZhbCh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ3htbCcpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVhNTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod3JhcHBlckZ1bmN0aW9uICYmICh3cmFwcGVyRnVuY3Rpb24gaW4gbGFyb3V4X2FqYXgud3JhcHBlcnMucmVnaXN0cnkpKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeVt3cmFwcGVyRnVuY3Rpb25dKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgd3JhcHBlckZ1bmM6IHdyYXBwZXJGdW5jdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBtYWtlUmVxdWVzdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBjb3JzID0gb3B0aW9ucy5jb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHhociA9IGxhcm91eF9hamF4Lnhocihjb3JzKSxcbiAgICAgICAgICAgICAgICB1cmwgPSBvcHRpb25zLnVybCxcbiAgICAgICAgICAgICAgICB0aW1lciA9IG51bGwsXG4gICAgICAgICAgICAgICAgbiA9IDA7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50aW1lb3V0Rm4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGltZW91dEZuKG9wdGlvbnMudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aW1lb3V0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbGFyb3V4X2FqYXgueGhyUmVzcCh4aHIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheEVycm9yJywgW3hociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Y2Nlc3MgIT09IHVuZGVmaW5lZCAmJiByZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zdWNjZXNzKHJlcy5yZXNwb25zZSwgcmVzLndyYXBwZXJGdW5jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheFN1Y2Nlc3MnLCBbeGhyLCByZXMucmVzcG9uc2UsIHJlcy53cmFwcGVyRnVuYywgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3IoeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4RXJyb3InLCBbeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29tcGxldGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5jb21wbGV0ZSh4aHIsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4Q29tcGxldGUnLCBbeGhyLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wcm9ncmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucHJvZ3Jlc3MoKytuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5nZXRkYXRhICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5nZXRkYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZ2V0ZGF0YS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeVN0cmluZyA9IGxhcm91eF9oZWxwZXJzLmJ1aWxkUXVlcnlTdHJpbmcob3B0aW9ucy5nZXRkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyBxdWVyeVN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyBvcHRpb25zLmdldGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5qc29ucCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArICdqc29ucD0nICsgb3B0aW9ucy5qc29ucDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFsYXJvdXhfYWpheC54RG9tYWluT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgeGhyLm9wZW4ob3B0aW9ucy50eXBlLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihvcHRpb25zLnR5cGUsIHVybCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMueGhyRmllbGRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvcHRpb25zLnhockZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnhockZpZWxkcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHJbaV0gPSBvcHRpb25zLnhockZpZWxkc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ1gtUmVxdWVzdGVkLVdpdGgnXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMud3JhcHBlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snWC1XcmFwcGVyLUZ1bmN0aW9uJ10gPSAnbGFyb3V4LmpzJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogaW4gaGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWhlYWRlcnMuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaiwgaGVhZGVyc1tqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wb3N0ZGF0YSA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucG9zdGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2VuZChudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAob3B0aW9ucy5wb3N0ZGF0YXR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5wb3N0ZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdmb3JtJzpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQobGFyb3V4X2hlbHBlcnMuYnVpbGRGb3JtRGF0YShvcHRpb25zLnBvc3RkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKG9wdGlvbnMucG9zdGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnaHRtbCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SnNvbjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRKc29uUDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgbWV0aG9kLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGpzb25wOiBtZXRob2QsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2NyaXB0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGF0eXBlOiAnZm9ybScsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0SnNvbjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9hamF4O1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpO1xuXG4gICAgLy8gYW5pbVxuICAgIHZhciBsYXJvdXhfYW5pbSA9IHtcbiAgICAgICAgZGF0YTogW10sXG5cbiAgICAgICAgZng6IHtcbiAgICAgICAgICAgIGludGVycG9sYXRlOiBmdW5jdGlvbiAoc291cmNlLCB0YXJnZXQsIHNoaWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChzb3VyY2UgKyAodGFyZ2V0IC0gc291cmNlKSAqIHNoaWZ0KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGVhc2luZzogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgICAgIHJldHVybiAoLU1hdGguY29zKHBvcyAqIE1hdGguUEkpIC8gMikgKyAwLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8ge29iamVjdCwgcHJvcGVydHksIGZyb20sIHRvLCB0aW1lLCB1bml0LCByZXNldH1cbiAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3YW5pbSkge1xuICAgICAgICAgICAgbmV3YW5pbS5zdGFydFRpbWUgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS51bml0ID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS51bml0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS51bml0ID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLmZyb20gPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLmZyb20gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3YW5pbS5vYmplY3QgPT09IHdpbmRvdy5kb2N1bWVudC5ib2R5ICYmIG5ld2FuaW0ucHJvcGVydHkgPT09ICdzY3JvbGxUb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9ICh3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fCB3aW5kb3cuZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gbmV3YW5pbS5vYmplY3RbbmV3YW5pbS5wcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG5ld2FuaW0uZnJvbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSBOdW1iZXIobmV3YW5pbS5mcm9tKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0ucmVzZXQgPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLnJlc2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5yZXNldCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiAobmV3YW5pbS5pZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyAgICAgbmV3YW5pbS5pZCA9IGxhcm91eF9oZWxwZXJzLmdldFVuaXF1ZUlkKCk7XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEucHVzaChuZXdhbmltKTtcbiAgICAgICAgICAgIGlmIChsYXJvdXhfYW5pbS5kYXRhLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobGFyb3V4X2FuaW0ub25mcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q3NzOiBmdW5jdGlvbiAobmV3YW5pbSkge1xuICAgICAgICAgICAgaWYgKG5ld2FuaW0uZnJvbSA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0uZnJvbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IGxhcm91eF9jc3MuZ2V0UHJvcGVydHkobmV3YW5pbS5vYmplY3QsIG5ld2FuaW0ucHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXdhbmltLm9iamVjdCA9IG5ld2FuaW0ub2JqZWN0LnN0eWxlO1xuICAgICAgICAgICAgbmV3YW5pbS5wcm9wZXJ0eSA9IGxhcm91eF9oZWxwZXJzLmNhbWVsQ2FzZShuZXdhbmltLnByb3BlcnR5KTtcblxuICAgICAgICAgICAgbGFyb3V4X2FuaW0uc2V0KG5ld2FuaW0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0S2V5ID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfYW5pbS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfYW5pbS5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF9hbmltLmRhdGFbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0uaWQgIT09IHVuZGVmaW5lZCAmJiBjdXJyZW50SXRlbS5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRLZXkgPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYW5pbS5kYXRhLnNwbGljZSh0YXJnZXRLZXksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25mcmFtZTogZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X2FuaW0uZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2FuaW0uZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfYW5pbS5kYXRhW2l0ZW1dO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5zdGFydFRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uc3RhcnRUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBsYXJvdXhfYW5pbS5zdGVwKGN1cnJlbnRJdGVtLCB0aW1lc3RhbXApO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGltZXN0YW1wID4gY3VycmVudEl0ZW0uc3RhcnRUaW1lICsgY3VycmVudEl0ZW0udGltZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0ucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gd2luZG93LmRvY3VtZW50LmJvZHkgJiYgbmV3YW5pbS5wcm9wZXJ0eSA9PSAnc2Nyb2xsVG9wJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvKDAsIGN1cnJlbnRJdGVtLmZyb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzY3JvbGxUbygwLCBjdXJyZW50SXRlbS5mcm9tKTsgfSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLm9iamVjdFtjdXJyZW50SXRlbS5wcm9wZXJ0eV0gPSBjdXJyZW50SXRlbS5mcm9tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfYW5pbS5kYXRhLnNwbGljZShyZW1vdmVLZXlzW2l0ZW0yXSwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYXJvdXhfYW5pbS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobGFyb3V4X2FuaW0ub25mcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RlcDogZnVuY3Rpb24gKG5ld2FuaW0sIHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgdmFyIGZpbmlzaFQgPSBuZXdhbmltLnN0YXJ0VGltZSArIG5ld2FuaW0udGltZSxcbiAgICAgICAgICAgICAgICBzaGlmdCA9ICh0aW1lc3RhbXAgPiBmaW5pc2hUKSA/IDEgOiAodGltZXN0YW1wIC0gbmV3YW5pbS5zdGFydFRpbWUpIC8gbmV3YW5pbS50aW1lO1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfYW5pbS5meC5pbnRlcnBvbGF0ZShcbiAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20sXG4gICAgICAgICAgICAgICAgbmV3YW5pbS50byxcbiAgICAgICAgICAgICAgICBsYXJvdXhfYW5pbS5meC5lYXNpbmcoc2hpZnQpXG4gICAgICAgICAgICApICsgbmV3YW5pbS51bml0O1xuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS5vYmplY3QgPT09IHdpbmRvdy5kb2N1bWVudC5ib2R5ICYmIG5ld2FuaW0ucHJvcGVydHkgPT0gJ3Njcm9sbFRvcCcpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUbygwLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNjcm9sbFRvKDAsIHZhbHVlKTsgfSwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0ub2JqZWN0W25ld2FuaW0ucHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9hbmltO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIGNzc1xuICAgIHZhciBsYXJvdXhfY3NzID0ge1xuICAgICAgICAvLyBjbGFzcyBmZWF0dXJlc1xuICAgICAgICBoYXNDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3ljbGVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnRzLCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzWyhpICsgMSkgJSBsZW5ndGhdLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBzdHlsZSBmZWF0dXJlc1xuICAgICAgICBnZXRQcm9wZXJ0eTogZnVuY3Rpb24gKGVsZW1lbnQsIHN0eWxlTmFtZSkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcblxuICAgICAgICAgICAgc3R5bGVOYW1lID0gbGFyb3V4X2hlbHBlcnMuYW50aUNhbWVsQ2FzZShzdHlsZU5hbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFByb3BlcnR5OiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydGllcywgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGRQcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1tvbGRQcm9wZXJ0aWVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBzdHlsZU5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgIGlmICghcHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShzdHlsZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdTdHlsZU5hbWUgPSBsYXJvdXhfaGVscGVycy5jYW1lbENhc2Uoc3R5bGVOYW1lKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5zdHlsZVtuZXdTdHlsZU5hbWVdID0gcHJvcGVydGllc1tzdHlsZU5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyB0cmFuc2l0aW9uIGZlYXR1cmVzXG4gICAgICAgIGRlZmF1bHRUcmFuc2l0aW9uOiAnMnMgZWFzZScsXG5cbiAgICAgICAgc2V0VHJhbnNpdGlvblNpbmdsZTogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkodHJhbnNpdGlvbiksXG4gICAgICAgICAgICAgICAgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9ucyA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3RyYW5zaXRpb24nKSB8fCBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctd2Via2l0LXRyYW5zaXRpb24nKSB8fFxuICAgICAgICAgICAgICAgICAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctbXMtdHJhbnNpdGlvbicpIHx8ICcnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5O1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudFRyYW5zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheSA9IGN1cnJlbnRUcmFuc2l0aW9ucy5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0cmFuc2l0aW9ucy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gdHJhbnNpdGlvbnNbaXRlbV0uaW5kZXhPZignICcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVOYW1lID0gdHJhbnNpdGlvbnNbaXRlbV0uc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzID0gdHJhbnNpdGlvbnNbaXRlbV0uc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlTmFtZSA9IHRyYW5zaXRpb25zW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyA9IGxhcm91eF9jc3MuZGVmYXVsdFRyYW5zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFRyYW5zaXRpb25zQXJyYXlbal0udHJpbSgpLmxvY2FsZUNvbXBhcmUoc3R5bGVOYW1lKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXlbal0gPSBzdHlsZU5hbWUgKyAnICcgKyB0cmFuc2l0aW9uUHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5wdXNoKHN0eWxlTmFtZSArICcgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5LmpvaW4oJywgJyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLm1zVHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb25TaW5nbGUoZWxlbWVudHNbaV0sIHRyYW5zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHkgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgeyBvcGFjaXR5OiAxIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHkgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG1lYXN1cmVtZW50IGZlYXR1cmVzXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGhvdXQgcGFkZGluZywgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdoZWlnaHQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodC5nZXRGbG9hdFZhbHVlKGhlaWdodC5wcmltaXRpdmVUeXBlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYnV0IHdpdGhvdXQgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaW5uZXJIZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGFuZCBib3JkZXIgYnV0IG1hcmdpbiBvcHRpb25hbFxuICAgICAgICBvdXRlckhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQsIGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIGlmIChpbmNsdWRlTWFyZ2luIHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi10b3AnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b20gPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tYm90dG9tJyksXG4gICAgICAgICAgICAgICAgbWFyZ2lucyA9IG1hcmdpblRvcC5nZXRGbG9hdFZhbHVlKG1hcmdpblRvcC5wcmltaXRpdmVUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbS5nZXRGbG9hdFZhbHVlKG1hcmdpbkJvdHRvbS5wcmltaXRpdmVUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50Lm9mZnNldEhlaWdodCArIG1hcmdpbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aG91dCBwYWRkaW5nLCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICB3aWR0aDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnd2lkdGgnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodC5nZXRGbG9hdFZhbHVlKGhlaWdodC5wcmltaXRpdmVUeXBlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBidXQgd2l0aG91dCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBpbm5lcldpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYW5kIGJvcmRlciBidXQgbWFyZ2luIG9wdGlvbmFsXG4gICAgICAgIG91dGVyV2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50LCBpbmNsdWRlTWFyZ2luKSB7XG4gICAgICAgICAgICBpZiAoaW5jbHVkZU1hcmdpbiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tbGVmdCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgbWFyZ2lucyA9IG1hcmdpbkxlZnQuZ2V0RmxvYXRWYWx1ZShtYXJnaW5MZWZ0LnByaW1pdGl2ZVR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQuZ2V0RmxvYXRWYWx1ZShtYXJnaW5SaWdodC5wcmltaXRpdmVUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50Lm9mZnNldFdpZHRoICsgbWFyZ2lucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9wOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgICAgICAgICAoKHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8IHdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbFRvcCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgK1xuICAgICAgICAgICAgICAgICgod2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQpIHx8IHdpbmRvdy5kb2N1bWVudC5ib2R5LnNjcm9sbExlZnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFib3ZlVGhlVG9wOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tIDw9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmVsb3dUaGVGb2xkOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wID4gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGxlZnRPZlNjcmVlbjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IDw9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmlnaHRPZlNjcmVlbjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgPiB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBpblZpZXdwb3J0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gIShyZWN0LmJvdHRvbSA8PSAwIHx8IHJlY3QudG9wID4gd2luZG93LmlubmVySGVpZ2h0IHx8XG4gICAgICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAwIHx8IHJlY3QubGVmdCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2NzcztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBkYXRlXG4gICAgdmFyIGxhcm91eF9kYXRlID0ge1xuICAgICAgICBzaG9ydERhdGVGb3JtYXQ6ICdkZC5NTS55eXl5JyxcbiAgICAgICAgbG9uZ0RhdGVGb3JtYXQ6ICdkZCBNTU1NIHl5eXknLFxuICAgICAgICB0aW1lRm9ybWF0OiAnSEg6bW0nLFxuXG4gICAgICAgIG1vbnRoc1Nob3J0OiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgICAgIG1vbnRoc0xvbmc6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLFxuXG4gICAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgICAgIG5vdzogICAgICdub3cnLFxuICAgICAgICAgICAgbGF0ZXI6ICAgJ2xhdGVyJyxcbiAgICAgICAgICAgIGFnbzogICAgICdhZ28nLFxuICAgICAgICAgICAgc2Vjb25kczogJ3NlY29uZHMnLFxuICAgICAgICAgICAgYW1pbnV0ZTogJ2EgbWludXRlJyxcbiAgICAgICAgICAgIG1pbnV0ZXM6ICdtaW51dGVzJyxcbiAgICAgICAgICAgIGFob3VyOiAgICdhIGhvdXInLFxuICAgICAgICAgICAgaG91cnM6ICAgJ2hvdXJzJyxcbiAgICAgICAgICAgIGFkYXk6ICAgICdhIGRheScsXG4gICAgICAgICAgICBkYXlzOiAgICAnZGF5cycsXG4gICAgICAgICAgICBhd2VlazogICAnYSB3ZWVrJyxcbiAgICAgICAgICAgIHdlZWtzOiAgICd3ZWVrcycsXG4gICAgICAgICAgICBhbW9udGg6ICAnYSBtb250aCcsXG4gICAgICAgICAgICBtb250aHM6ICAnbW9udGhzJyxcbiAgICAgICAgICAgIGF5ZWFyOiAgICdhIHllYXInLFxuICAgICAgICAgICAgeWVhcnM6ICAgJ3llYXJzJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlRXBvY2g6IGZ1bmN0aW9uICh0aW1lc3BhbiwgbGltaXRXaXRoV2Vla3MpIHtcbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gMTAwMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLnNlY29uZHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYW1pbnV0ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLm1pbnV0ZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFob3VyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MuaG91cnM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFkYXk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5kYXlzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCA0ICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg3ICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmF3ZWVrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Mud2Vla3M7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsaW1pdFdpdGhXZWVrcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCAzMCAqIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYW1vbnRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubW9udGhzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzNjUgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmF5ZWFyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLnllYXJzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEN1c3RvbURhdGVTdHJpbmc6IGZ1bmN0aW9uIChmb3JtYXQsIGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAveXl5eXx5eXxNTU1NfE1NTXxNTXxNfGRkfGR8aGh8aHxISHxIfG1tfG18c3N8c3x0dHx0L2csXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneXl5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldEZ1bGxZZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneXknOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRZZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU1NTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUubW9udGhzTG9uZ1tub3cuZ2V0TW9udGgoKV07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNTaG9ydFtub3cuZ2V0TW9udGgoKV07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyAobm93LmdldE1vbnRoKCkgKyAxKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0TW9udGgoKSArIDE7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0RGF0ZSgpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXREYXRlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaGgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIxID0gbm93LmdldEhvdXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArICgoKGhvdXIxICUgMTIpID4gMCkgPyBob3VyMSAlIDEyIDogMTIpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIyID0gbm93LmdldEhvdXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKChob3VyMiAlIDEyKSA+IDApID8gaG91cjIgJSAxMiA6IDEyO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0hIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgbm93LmdldEhvdXJzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldEhvdXJzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0TWludXRlcygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0U2Vjb25kcygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRTZWNvbmRzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdy5nZXRIb3VycygpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwbSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnYW0nO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdy5nZXRIb3VycygpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGVEaWZmU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBub3cgLSBkYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBhYnNUaW1lc3BhbiA9IE1hdGguYWJzKHRpbWVzcGFuKSxcbiAgICAgICAgICAgICAgICBwYXN0ID0gKHRpbWVzcGFuID4gMCk7XG5cbiAgICAgICAgICAgIGlmIChhYnNUaW1lc3BhbiA8PSAzMDAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3Mubm93O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGltZXNwYW5zdHJpbmcgPSBsYXJvdXhfZGF0ZS5wYXJzZUVwb2NoKGFic1RpbWVzcGFuLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICh0aW1lc3BhbnN0cmluZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbnN0cmluZyArXG4gICAgICAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICAgICAgIChwYXN0ID8gbGFyb3V4X2RhdGUuc3RyaW5ncy5hZ28gOiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmxhdGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldFNob3J0RGF0ZVN0cmluZyhkYXRlLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTaG9ydERhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlLCBpbmNsdWRlVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldEN1c3RvbURhdGVTdHJpbmcoXG4gICAgICAgICAgICAgICAgaW5jbHVkZVRpbWUgPyBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQgKyAnICcgKyBsYXJvdXhfZGF0ZS50aW1lRm9ybWF0IDogbGFyb3V4X2RhdGUuc2hvcnREYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9uZ0RhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlLCBpbmNsdWRlVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldEN1c3RvbURhdGVTdHJpbmcoXG4gICAgICAgICAgICAgICAgaW5jbHVkZVRpbWUgPyBsYXJvdXhfZGF0ZS5sb25nRGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5sb25nRGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICBkYXRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZGF0ZTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgICAgIC8vIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgLy8gbGFyb3V4X3RyaWdnZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudHJpZ2dlcnMuanMnKTtcblxuICAgIC8vIGRvbVxuICAgIHZhciBsYXJvdXhfZG9tID0ge1xuICAgICAgICBkb2Nwcm9wOiBmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhwcm9wTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCB3aW5kb3cuZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5Q2xhc3M6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IHdpbmRvdy5kb2N1bWVudCkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlUYWc6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IHdpbmRvdy5kb2N1bWVudCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5SWQ6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHBhcmVudCB8fCB3aW5kb3cuZG9jdW1lbnQpLmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RTaW5nbGU6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHBhcmVudCB8fCB3aW5kb3cuZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHI6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGRBdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlc1tvbGRBdHRyaWJ1dGVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uIChlbGVtZW50LCBkYXRhbmFtZXMsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBkYXRhbmFtZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YW5hbWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YW5hbWVzID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZERhdGFuYW1lcyA9IGRhdGFuYW1lcztcbiAgICAgICAgICAgICAgICBkYXRhbmFtZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBkYXRhbmFtZXNbb2xkRGF0YW5hbWVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBkYXRhTmFtZSBpbiBkYXRhbmFtZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGFuYW1lcy5oYXNPd25Qcm9wZXJ0eShkYXRhTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhbmFtZXNbZGF0YU5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFOYW1lLCBkYXRhbmFtZXNbZGF0YU5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudEhpc3Rvcnk6IFtdLFxuICAgICAgICBzZXRFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGVsZW1lbnRzW2ldLCBldmVudG5hbWUsIGZuYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RXZlbnRTaW5nbGU6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGZuY1dyYXBwZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChmbmMoZSwgZWxlbWVudCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uZXZlbnRIaXN0b3J5LnB1c2goeyBlbGVtZW50OiBlbGVtZW50LCBldmVudG5hbWU6IGV2ZW50bmFtZSwgZm5jOiBmbmMsIGZuY1dyYXBwZXI6IGZuY1dyYXBwZXIgfSk7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRuYW1lLCBmbmNXcmFwcGVyLCBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5zZXRFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpMSA9IDAsIGxlbmd0aDEgPSBlbGVtZW50cy5sZW5ndGg7IGkxIDwgbGVuZ3RoMTsgaTErKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuZ3RoMiA9IGxhcm91eF9kb20uZXZlbnRIaXN0b3J5Lmxlbmd0aDsgaTIgPCBsZW5ndGgyOyBpMisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gbGFyb3V4X2RvbS5ldmVudEhpc3RvcnlbaTJdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudHNbaTFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudG5hbWUgIT09IHVuZGVmaW5lZCAmJiBpdGVtLmV2ZW50bmFtZSAhPT0gZXZlbnRuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChmbmMgIT09IHVuZGVmaW5lZCAmJiBpdGVtLmZuYyAhPT0gZm5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGl0ZW0uZXZlbnRuYW1lLCBpdGVtLmZuY1dyYXBwZXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGxhcm91eF9kb20uZXZlbnRIaXN0b3J5W2kyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcGF0Y2hFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbUV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN1c3RvbUV2ZW50W2l0ZW1dID0gZGF0YVtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VzdG9tRXZlbnQuaW5pdEV2ZW50KGV2ZW50bmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgICAgIHZhciBmcmFnID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcbiAgICAgICAgICAgICAgICB0ZW1wID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuXG4gICAgICAgICAgICB0ZW1wLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgaHRtbCk7XG4gICAgICAgICAgICB3aGlsZSAodGVtcC5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBudWxsaW5nIG91dCB0aGUgcmVmZXJlbmNlLCB0aGVyZSBpcyBubyBvYnZpb3VzIGRpc3Bvc2UgbWV0aG9kXG4gICAgICAgICAgICB0ZW1wID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIGZyYWc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoaXRlbSwgYXR0cmlidXRlc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShpdGVtMiwgY2hpbGRyZW5baXRlbTJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoLyogdHlwZW9mIGNoaWxkcmVuID09ICdzdHJpbmcnICYmICovY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChlbGVtLCBjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVPcHRpb246IGZ1bmN0aW9uIChlbGVtZW50LCBrZXksIHZhbHVlLCBpc0RlZmF1bHQpIHtcbiAgICAgICAgICAgIC8qIG9sZCBiZWhhdmlvdXIsIGRvZXMgbm90IHN1cHBvcnQgb3B0Z3JvdXBzIGFzIHBhcmVudHMuXG4gICAgICAgICAgICB2YXIgY291bnQgPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zW2NvdW50XSA9IG5ldyBPcHRpb24odmFsdWUsIGtleSk7XG5cbiAgICAgICAgICAgIGlmIChpc0RlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9wdGlvbnMuc2VsZWN0ZWRJbmRleCA9IGNvdW50IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHZhciBvcHRpb24gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnT1BUSU9OJyk7XG4gICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSk7XG4gICAgICAgICAgICBpZiAoaXNEZWZhdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKG9wdGlvbiwgdmFsdWUpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5VmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnQub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbaV0uZ2V0QXR0cmlidXRlKCd2YWx1ZScpID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwvKixcblxuICAgICAgICAvLyBUT0RPOiBpdCdzIHJlZHVuZGFudCBmb3Igbm93XG4gICAgICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGltYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lNRycpO1xuICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgYXJndW1lbnRzW2ldKTtcblxuICAgICAgICAgICAgICAgIGltYWdlcy5wdXNoKGltYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGltYWdlcztcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQXN5bmNTY3JpcHQ6IGZ1bmN0aW9uIChwYXRoLCB0cmlnZ2VyTmFtZSwgYXN5bmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLnNyYyA9IHBhdGg7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IHdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQXN5bmNTdHlsZTogZnVuY3Rpb24gKHBhdGgsIHRyaWdnZXJOYW1lLCBhc3luYykge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTElOSycpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICAgICAgZWxlbS5hc3luYyA9IChhc3luYyAhPT0gdW5kZWZpbmVkKSA/IGFzeW5jIDogdHJ1ZTtcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IHBhdGg7XG4gICAgICAgICAgICBlbGVtLnJlbCA9ICdzdHlsZXNoZWV0JztcblxuICAgICAgICAgICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGVsZW0ucmVhZHlTdGF0ZSAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnbG9hZGVkJykgfHwgbG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRyaWdnZXJOYW1lID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJOYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMub250cmlnZ2VyKHRyaWdnZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBoZWFkID0gd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICB9LCovXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0OiBmdW5jdGlvbiAoZWxlbWVudCwgcG9zaXRpb24sIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKHBvc2l0aW9uLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmVwZW5kOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZTogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VUZXh0OiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgLy8gbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmVSZXR1cm46IDAsXG4gICAgICAgIGNsb25lQXBwZW5kOiAxLFxuICAgICAgICBjbG9uZUluc2VydEFmdGVyOiAyLFxuICAgICAgICBjbG9uZUluc2VydEJlZm9yZTogMyxcblxuICAgICAgICBjbG9uZTogZnVuY3Rpb24gKGVsZW1lbnQsIHR5cGUsIGNvbnRhaW5lciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkICYmIHR5cGUgIT0gbGFyb3V4X2RvbS5jbG9uZVJldHVybikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IGxhcm91eF9kb20uY2xvbmVBcHBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lSW5zZXJ0QWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUluc2VydEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3RWxlbWVudDtcbiAgICAgICAgfS8qLFxuXG4gICAgICAgIC8vIFRPRE86IGl0J3MgcmVkdW5kYW50IGZvciBub3dcbiAgICAgICAgYXBwbHlPcGVyYXRpb25zOiBmdW5jdGlvbiAoZWxlbWVudCwgb3BlcmF0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgb3BlcmF0aW9uIGluIG9wZXJhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnMuaGFzT3duUHJvcGVydHkob3BlcmF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBiaW5kaW5nIGluIG9wZXJhdGlvbnNbb3BlcmF0aW9uXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnNbb3BlcmF0aW9uXS5oYXNPd25Qcm9wZXJ0eShiaW5kaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcGVyYXRpb25zW29wZXJhdGlvbl1bYmluZGluZ107XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZShlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpKSArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3ZlcHJvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodmFsdWUuc3Vic3RyaW5nKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5hZGRDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCBiaW5kaW5nLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB2YWx1ZSwgJ2luaGVyaXQgIWltcG9ydGFudCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVwZWF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob3BlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgfTtcblxuICAgIC8vIGEgZml4IGZvciBJbnRlcm5ldCBFeHBsb3JlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAod2luZG93LkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGFyb3V4X2RvbTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBldmVudHNcbiAgICB2YXIgbGFyb3V4X2V2ZW50cyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcblxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChldmVudCwgZm5jKSB7XG4gICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcy5wdXNoKHsgZXZlbnQ6IGV2ZW50LCBmbmM6IGZuYyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnZva2U6IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmV2ZW50ICE9IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmZuYyhhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2V2ZW50cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfYWpheCA9IHJlcXVpcmUoJy4vbGFyb3V4LmFqYXguanMnKTtcblxuICAgIC8vIGZvcm1zXG4gICAgdmFyIGxhcm91eF9mb3JtcyA9IHtcbiAgICAgICAgYWpheEZvcm06IGZ1bmN0aW9uIChmb3Jtb2JqLCBmbmMsIGZuY0JlZ2luKSB7XG4gICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KGZvcm1vYmosICdzdWJtaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuY0JlZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm5jQmVnaW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC5wb3N0KFxuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyksXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9mb3Jtcy5zZXJpYWxpemVGb3JtRGF0YShmb3Jtb2JqKSxcbiAgICAgICAgICAgICAgICAgICAgZm5jXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRm9ybUZpZWxkOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdGSUxFJyB8fCB0eXBlID09PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT09ICdSQURJTycgfHwgdHlwZSA9PT0gJ1RFWFQnIHx8IHR5cGUgPT09ICdQQVNTV09SRCcgfHwgdHlwZSA9PT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGb3JtRmllbGRWYWx1ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub3B0aW9uc1tlbGVtZW50LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ0ZJTEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT09ICdSQURJTycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ1RFWFQnIHx8IHR5cGUgPT09ICdQQVNTV09SRCcgfHwgdHlwZSA9PT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Rm9ybUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgb3B0aW9uIGluIGVsZW1lbnQub3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShvcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbb3B0aW9uXS52YWx1ZSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gb3B0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdGSUxFJykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbGVzWzBdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT0gJ1JBRElPJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT0gZWxlbWVudC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnVEVYVCcgfHwgdHlwZSA9PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUZvcm1FZGl0aW5nOiBmdW5jdGlvbiAoZm9ybW9iaiwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm9ybW9iai5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJykgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJywgJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1sYXN0LWVuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2Zvcm1zLmlzRm9ybUZpZWxkKHNlbGVjdGlvbltzZWxlY3RlZF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBsYXN0RGlzYWJsZWQgPSBzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdERpc2FibGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnNldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REaXNhYmxlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmlhbGl6ZUZvcm1EYXRhOiBmdW5jdGlvbiAoZm9ybW9iaikge1xuICAgICAgICAgICAgdmFyIGZvcm1kYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfZm9ybXMuZ2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWRhdGEuYXBwZW5kKHNlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb3JtZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChmb3Jtb2JqKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfZm9ybXMuZ2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzW3NlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoZm9ybW9iaiwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Zvcm1zLnNldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0sIGRhdGFbc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZm9ybXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gaGVscGVyc1xuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHtcbiAgICAgICAgdW5pcXVlSWQ6IDAsXG5cbiAgICAgICAgZ2V0VW5pcXVlSWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICByZXR1cm4gJ3VpZC0nICsgKCsrbGFyb3V4X2hlbHBlcnMudW5pcXVlSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkUXVlcnlTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZXMsIHJmYzM5ODYpIHtcbiAgICAgICAgICAgIHZhciB1cmkgPSAnJyxcbiAgICAgICAgICAgICAgICByZWdFeCA9IC8lMjAvZztcblxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1tuYW1lXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZmMzOTg2IHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmkgKz0gJyYnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpLnJlcGxhY2UocmVnRXgsICcrJykgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVzW25hbWVdLnRvU3RyaW5nKCkpLnJlcGxhY2UocmVnRXgsICcrJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmkgKz0gJyYnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tuYW1lXS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVyaS5zdWJzdHIoMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRGb3JtRGF0YTogZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1tuYW1lXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuYXBwZW5kKG5hbWUsIHZhbHVlc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3MpLnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3MpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlQWxsOiBmdW5jdGlvbiAodGV4dCwgZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChPYmplY3Qua2V5cyhkaWN0aW9uYXJ5KS5qb2luKCd8JyksICdnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgcmUsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaWN0aW9uYXJ5W21hdGNoXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbWVsQ2FzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJDaGFyID0gdmFsdWUuY2hhckF0KGopO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyQ2hhciA9PSAnLScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dCArPSAoIWZsYWcpID8gY3VyckNoYXIgOiBjdXJyQ2hhci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBhbnRpQ2FtZWxDYXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyQ2hhciA9IHZhbHVlLmNoYXJBdChqKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckNoYXIgIT0gJy0nICYmIGN1cnJDaGFyID09IGN1cnJDaGFyLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICctJyArIGN1cnJDaGFyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBjdXJyQ2hhcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBxdW90ZUF0dHI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csICcmYXBvczsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcclxcbi9nLCAnJiMxMzsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHJcXG5dL2csICcmIzEzOycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNwbGljZVN0cmluZzogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY291bnQsIGFkZCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIGluZGV4KSArIChhZGQgfHwgJycpICsgdmFsdWUuc2xpY2UoaW5kZXggKyBjb3VudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgICAgICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmQ6IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICBvYmouc29tZShmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXh0ZW5kT2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICBpc0FycmF5ID0gdGFyZ2V0IGluc3RhbmNlb2YgQXJyYXk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBhcmd1bWVudHNbaXRlbV0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRhcmdldC5wdXNoKGFyZ3VtZW50c1tpdGVtXVtuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qIHRhcmdldFtuYW1lXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgdGFyZ2V0W25hbWVdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5leHRlbmRPYmplY3QodGFyZ2V0W25hbWVdLCBhcmd1bWVudHNbaXRlbV1bbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBhcmd1bWVudHNbaXRlbV1bbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVhY2g6IGZ1bmN0aW9uIChhcnIsIGZuYywgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZuYyhpdGVtLCBhcnJbaXRlbV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFwOiBmdW5jdGlvbiAoYXJyLCBmbmMsIGRvbnRTa2lwUmV0dXJucywgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYyhhcnJbaXRlbV0sIGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb250U2tpcFJldHVybnMgfHwgcmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSxcblxuICAgICAgICBpbmRleDogZnVuY3Rpb24gKGFyciwgdmFsdWUsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChhcnJbaXRlbV0gPT09IG9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFlYWNoOiBmdW5jdGlvbiAoYXJyLCBmbmMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZm5jKGksIGFycltpXSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfSxcblxuICAgICAgICBhbWFwOiBmdW5jdGlvbiAoYXJyLCBmbmMsIGRvbnRTa2lwUmV0dXJucykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMoYXJyW2ldLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZG9udFNraXBSZXR1cm5zIHx8IHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMudW5zaGlmdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWluZGV4OiBmdW5jdGlvbiAoYXJyLCB2YWx1ZSwgc3RhcnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAoc3RhcnQgfHwgMCksIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbHVtbjogZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMubWFwKG9iaiwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaHVmZmxlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgIHNodWZmbGVkID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJhbmQgPSBsYXJvdXhfaGVscGVycy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHNodWZmbGVkW2luZGV4KytdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICAgICAgICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBvYmpbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzaHVmZmxlZDtcbiAgICAgICAgfSxcblxuICAgICAgICBtZXJnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgdG1wID0gdGFyZ2V0LFxuICAgICAgICAgICAgICAgIGlzQXJyYXkgPSB0bXAgaW5zdGFuY2VvZiBBcnJheTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgPSB0bXAuY29uY2F0KGFyZ3VtZW50c1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gYXJndW1lbnRzW2l0ZW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXJndW1lbnRzW2l0ZW1dLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRtcFthdHRyXSA9IGFyZ3VtZW50c1tpdGVtXVthdHRyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0bXA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHVwbGljYXRlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0FycmF5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpdGVtcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBvYmpbaV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRBc0FycmF5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXM7XG5cbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gb2JqO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBOb2RlTGlzdCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zW2ldID0gb2JqW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBbb2JqXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExlbmd0aDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRLZXlzUmVjdXJzaXZlOiBmdW5jdGlvbiAob2JqLCBkZWxpbWl0ZXIsIHByZWZpeCwga2V5cykge1xuICAgICAgICAgICAgaWYgKGRlbGltaXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gJy4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwcmVmaXggPSAnJztcbiAgICAgICAgICAgICAgICBrZXlzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKHByZWZpeCArIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9ialtpdGVtXSAhPT0gdW5kZWZpbmVkICYmIG9ialtpdGVtXSAhPT0gbnVsbCAmJiBvYmpbaXRlbV0uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5nZXRLZXlzUmVjdXJzaXZlKG9ialtpdGVtXSwgZGVsaW1pdGVyLCBwcmVmaXggKyBpdGVtICsgZGVsaW1pdGVyLCBrZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFbGVtZW50OiBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUsIGRlbGltaXRlcikge1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbGltaXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gJy4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcG9zID0gcGF0aC5pbmRleE9mKGRlbGltaXRlcik7XG4gICAgICAgICAgICB2YXIga2V5O1xuICAgICAgICAgICAgdmFyIHJlc3Q7XG4gICAgICAgICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhdGg7XG4gICAgICAgICAgICAgICAgcmVzdCA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhdGguc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgcmVzdCA9IHBhdGguc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIShrZXkgaW4gb2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXN0ID09PSBudWxsIHx8IHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChvYmpba2V5XSwgcmVzdCwgZGVmYXVsdFZhbHVlLCBkZWxpbWl0ZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfaGVscGVycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfZm9ybXMgPSByZXF1aXJlKCcuL2xhcm91eC5mb3Jtcy5qcycpO1xuXG4gICAgLy8ga2V5c1xuICAgIHZhciBsYXJvdXhfa2V5cyA9IHtcbiAgICAgICAga2V5TmFtZTogZnVuY3Rpb24gKGtleWNvZGUpIHtcbiAgICAgICAgICAgIGtleWNvZGUgPSBrZXljb2RlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoa2V5Y29kZSkge1xuICAgICAgICAgICAgY2FzZSAnYmFja3NwYWNlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gODtcblxuICAgICAgICAgICAgY2FzZSAndGFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gOTtcblxuICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxuICAgICAgICAgICAgY2FzZSAncmV0dXJuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTM7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VzYyc6XG4gICAgICAgICAgICBjYXNlICdlc2NhcGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAyNztcblxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzMjtcblxuICAgICAgICAgICAgY2FzZSAncGd1cCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDMzO1xuXG4gICAgICAgICAgICBjYXNlICdwZ2RuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzQ7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM1O1xuXG4gICAgICAgICAgICBjYXNlICdob21lJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNztcblxuICAgICAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzODtcblxuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzOTtcblxuICAgICAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDQwO1xuXG4gICAgICAgICAgICBjYXNlICdpbnNlcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiA0NTtcblxuICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gNDY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTEyO1xuXG4gICAgICAgICAgICBjYXNlICdmMic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExMztcblxuICAgICAgICAgICAgY2FzZSAnZjMnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTQ7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE1O1xuXG4gICAgICAgICAgICBjYXNlICdmNSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNjtcblxuICAgICAgICAgICAgY2FzZSAnZjYnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTc7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y3JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE4O1xuXG4gICAgICAgICAgICBjYXNlICdmOCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExOTtcblxuICAgICAgICAgICAgY2FzZSAnZjknOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjA7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxMCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMTtcblxuICAgICAgICAgICAgY2FzZSAnZjExJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIyO1xuXG4gICAgICAgICAgICBjYXNlICdmMTInOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjM7XG5cbiAgICAgICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxODg7XG5cbiAgICAgICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgICAgIHJldHVybiAxOTA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleWNvZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHt0YXJnZXQsIGtleSwgc2hpZnQsIGN0cmwsIGFsdCwgZGlzYWJsZUlucHV0cywgZm5jfVxuICAgICAgICBhc3NpZ246IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSB3aW5kb3cuZXZlbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkgeyAvLyBlbGVtZW50Lm5vZGVUeXBlID09PSAxIHx8XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzYWJsZUlucHV0cyAmJiBsYXJvdXhfZm9ybXMuaXNGb3JtRmllbGQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNoaWZ0ICYmICFldmVudC5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY3RybCAmJiAhZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWx0ICYmICFldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBsYXJvdXhfa2V5cy5rZXlOYW1lKG9wdGlvbnMua2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAoZXZlbnQua2V5Q29kZSB8fCBldmVudC53aGljaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm5jKGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQob3B0aW9ucy50YXJnZXQgfHwgd2luZG93LmRvY3VtZW50LCAna2V5ZG93bicsIHdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfa2V5cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X3N0YWNrID0gcmVxdWlyZSgnLi9sYXJvdXguc3RhY2suanMnKTtcblxuICAgIC8vIG12Y1xuICAgIHZhciBsYXJvdXhfbXZjID0ge1xuICAgICAgICBhcHBzOiB7fSxcbiAgICAgICAgcGF1c2VVcGRhdGU6IGZhbHNlLFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBsYXJvdXhfZG9tLnNlbGVjdEJ5SWQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChtb2RlbC5jb25zdHJ1Y3RvciAhPT0gbGFyb3V4X3N0YWNrKSB7XG4gICAgICAgICAgICAvLyAgICAgbW9kZWwgPSBuZXcgbGFyb3V4X3N0YWNrKG1vZGVsKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgdmFyIGFwcEtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpO1xuXG4gICAgICAgICAgICBtb2RlbC5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X212Yy5wYXVzZVVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfbXZjLnVwZGF0ZShhcHBLZXkpOyAvLyAsIFtldmVudC5rZXldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5hcHBzW2FwcEtleV0gPSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwgLy8gLFxuICAgICAgICAgICAgICAgIC8vIG1vZGVsS2V5czogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBib3VuZEVsZW1lbnRzOiBudWxsLFxuICAgICAgICAgICAgICAgIC8vIGV2ZW50RWxlbWVudHM6IG51bGxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMucmViaW5kKGFwcEtleSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmViaW5kOiBmdW5jdGlvbiAoYXBwS2V5KSB7XG4gICAgICAgICAgICB2YXIgYXBwID0gbGFyb3V4X212Yy5hcHBzW2FwcEtleV07XG4gICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgYXBwLm1vZGVsS2V5cyA9IGxhcm91eF9oZWxwZXJzLmdldEtleXNSZWN1cnNpdmUoYXBwLm1vZGVsLl9kYXRhKTsgLy8gRklYTUU6IHdvcmtzIG9ubHkgZm9yICRsLnN0YWNrXG4gICAgICAgICAgICBhcHAuYm91bmRFbGVtZW50cyA9IHt9O1xuICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5zY2FuRWxlbWVudHMoYXBwLCBhcHAuZWxlbWVudCk7XG4gICAgICAgICAgICBsYXJvdXhfbXZjLnVwZGF0ZShhcHBLZXkpO1xuXG4gICAgICAgICAgICB2YXIgZm5jID0gZnVuY3Rpb24gKGV2LCBlbGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSBsYXJvdXhfbXZjLmJpbmRTdHJpbmdQYXJzZXIoZWxlbS5nZXRBdHRyaWJ1dGUoJ2xyLWV2ZW50JykpO1xuICAgICAgICAgICAgICAgIC8vIGxhcm91eF9tdmMucGF1c2VVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYmluZGluZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PT0gbnVsbCB8fCAhYmluZGluZy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZ1tpdGVtXS5jaGFyQXQoMCkgPT0gJ1xcJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDEsIGJpbmRpbmdbaXRlbV0ubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoMCwgNSkgPT0gJ2F0dHIuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLm1vZGVsW2l0ZW1dID0gZWxlbS5nZXRBdHRyaWJ1dGUoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoNSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDAsIDUpID09ICdwcm9wLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGVsZW1bYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoNSldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGxhcm91eF9tdmMucGF1c2VVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcHAuZXZlbnRFbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzW2ldLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzW2ldLmJpbmRpbmdbbnVsbF0sXG4gICAgICAgICAgICAgICAgICAgIGZuY1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2NhbkVsZW1lbnRzOiBmdW5jdGlvbiAoYXBwLCBlbGVtZW50KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYXR0cyA9IGVsZW1lbnQuYXR0cmlidXRlcywgbSA9IGF0dHMubGVuZ3RoOyBpIDwgbTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHNbaV0ubmFtZSA9PSAnbHItYmluZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcxID0gbGFyb3V4X212Yy5iaW5kU3RyaW5nUGFyc2VyKGF0dHNbaV0udmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYmluZGluZzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmluZGluZzEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwLmJvdW5kRWxlbWVudHNbYmluZGluZzFbaXRlbV1dID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHNbaV0ubmFtZSA9PSAnbHItZXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nMiA9IGxhcm91eF9tdmMuYmluZFN0cmluZ1BhcnNlcihhdHRzW2ldLnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiBiaW5kaW5nMlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBjaGxkcm4gPSBlbGVtZW50LmNoaWxkTm9kZXMsIG4gPSBjaGxkcm4ubGVuZ3RoOyBqIDwgbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNobGRybltqXS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfbXZjLnNjYW5FbGVtZW50cyhhcHAsIGNobGRybltqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGFwcEtleSwga2V5cykge1xuICAgICAgICAgICAgdmFyIGFwcCA9IGxhcm91eF9tdmMuYXBwc1thcHBLZXldO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleXMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBrZXlzID0gYXBwLm1vZGVsS2V5cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aDEgPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICghKGtleXNbaV0gaW4gYXBwLmJvdW5kRWxlbWVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBib3VuZEVsZW1lbnQgPSBhcHAuYm91bmRFbGVtZW50c1trZXlzW2ldXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBsZW5ndGgyID0gYm91bmRFbGVtZW50Lmxlbmd0aDsgaiA8IGxlbmd0aDI7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNikgPT0gJ3N0eWxlLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50LnN0eWxlW2JvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDYpXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA1KSA9PSAnYXR0ci4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSByZW1vdmVBdHRyaWJ1dGUgb24gbnVsbCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50LnNldEF0dHJpYnV0ZShib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg1KSwgbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChhcHAubW9kZWwsIGtleXNbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA1KSA9PSAncHJvcC4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSByZW1vdmVBdHRyaWJ1dGUgb24gbnVsbCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50W2JvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDUpXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBiaW5kU3RyaW5nUGFyc2VyOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgdmFyIGxhc3RCdWZmZXIgPSBudWxsLFxuICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICcnLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gMCxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHRleHQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyciA9IHRleHQuY2hhckF0KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyID09ICc6Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJ1ZmZlciA9IGJ1ZmZlci50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnIgPT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2xhc3RCdWZmZXJdID0gYnVmZmVyLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBjdXJyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbGFzdEJ1ZmZlcl0gPSBidWZmZXIudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfbXZjO1xuXG59KCkpO1xuIiwiLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBzdGFja1xuICAgIHZhciBsYXJvdXhfc3RhY2sgPSBmdW5jdGlvbiAoZGF0YSwgZGVwdGgsIHRvcCkge1xuICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIHRoaXMuX2RlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuX3RvcCA9IHRvcCB8fCB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IG5ldyBsYXJvdXhfc3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcHRoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZXB0aCArICcuJyArIGtleSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGF0YVtrZXldID09PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5zZXQodGhpcywga2V5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wLm9udXBkYXRlKHsgc2NvcGU6IHRoaXMsIGtleToga2V5LCBvbGRWYWx1ZTogb2xkVmFsdWUsIG5ld1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRSYW5nZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHZhbHVlS2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KHZhbHVlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldCh2YWx1ZUtleSwgdmFsdWVzW3ZhbHVlS2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW2tleV0gfHwgZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRSYW5nZSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4ga2V5cykge1xuICAgICAgICAgICAgICAgIGlmICgha2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YWx1ZXNba2V5c1tpdGVtXV0gPSB0aGlzW2tleXNbaXRlbV1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKS5sZW5ndGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGlzdHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gKGtleSBpbiB0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkgaW4gdGhpcy5fZGF0YSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2l0ZW1dO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFJhbmdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfc3RhY2s7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB0ZW1wbGF0ZXNcbiAgICB2YXIgbGFyb3V4X3RlbXBsYXRlcyA9IHtcbiAgICAgICAgZW5naW5lczoge1xuICAgICAgICAgICAgcGxhaW46IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt0ZW1wbGF0ZSwgb3B0aW9uc107XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY29tcGlsZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4O1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgobmV4dEluZGV4ID0gcmVzdWx0LmluZGV4T2YoJ3t7JywgbGFzdEluZGV4KSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXggKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbG9zZUluZGV4ID0gcmVzdWx0LmluZGV4T2YoJ319JywgbmV4dEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZUluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gcmVzdWx0LnN1YnN0cmluZyhuZXh0SW5kZXgsIGNsb3NlSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGljdFsne3snICsga2V5ICsgJ319J10gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KG1vZGVsLCBrZXksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IGNsb3NlSW5kZXggKyAyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnJlcGxhY2VBbGwocmVzdWx0LCBkaWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBob2dhbjoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LkhvZ2FuLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkLnJlbmRlcihtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbXVzdGFjaGU6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5NdXN0YWNoZS5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaGFuZGxlYmFyczoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LkhhbmRsZWJhcnMuY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGxvZGFzaDoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93Ll8uY29tcGlsZSh0ZW1wbGF0ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVuZGVyc2NvcmU6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5fLmNvbXBpbGUodGVtcGxhdGUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZ2luZTogJ3BsYWluJyxcblxuICAgICAgICBhcHBseTogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29udGVudCwgZW5naW5lID0gbGFyb3V4X3RlbXBsYXRlcy5lbmdpbmVzW2xhcm91eF90ZW1wbGF0ZXMuZW5naW5lXTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMyB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAxMSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBlbGVtZW50LnRleHRDb250ZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gZWxlbWVudC5ub2RlVmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb21waWxlZCA9IGVuZ2luZS5jb21waWxlKGNvbnRlbnQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGVuZ2luZS5yZW5kZXIoY29tcGlsZWQsIG1vZGVsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnNlcnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGxhcm91eF90ZW1wbGF0ZXMuYXBwbHkoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmluc2VydCh0YXJnZXQsIHBvc2l0aW9uIHx8ICdiZWZvcmVlbmQnLCBvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgdGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbGFyb3V4X3RlbXBsYXRlcy5hcHBseShlbGVtZW50LCBtb2RlbCwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZSh0YXJnZXQsIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90ZW1wbGF0ZXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdGltZXJzXG4gICAgdmFyIGxhcm91eF90aW1lcnMgPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgICAgICB0aW1lci5uZXh0ID0gRGF0ZS5ub3coKSArIHRpbWVyLnRpbWVvdXQ7XG4gICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEucHVzaCh0aW1lcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UodGFyZ2V0S2V5LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90aW1lcnMuZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RpbWVycy5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90aW1lcnMuZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5uZXh0IDw9IG5vdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY3VycmVudEl0ZW0ub250aWNrKGN1cnJlbnRJdGVtLnN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSAmJiBjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ubmV4dCA9IG5vdyArIGN1cnJlbnRJdGVtLnRpbWVvdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGltZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyk7XG5cbiAgICAvLyB0b3VjaCAtIHBhcnRpYWxseSB0YWtlbiBmcm9tICd0b2NjYS5qcycgcHJvamVjdFxuICAgIC8vICAgICAgICAgY2FuIGJlIGZvdW5kIGF0OiBodHRwczovL2dpdGh1Yi5jb20vR2lhbmx1Y2FHdWFyaW5pL1RvY2NhLmpzXG4gICAgdmFyIGxhcm91eF90b3VjaCA9IHtcbiAgICAgICAgdG91Y2hTdGFydGVkOiBudWxsLFxuICAgICAgICBzd2lwZVRyZXNob2xkOiA4MCxcbiAgICAgICAgcHJlY2lzaW9uOiAzMCxcbiAgICAgICAgdGFwQ291bnQ6IDAsXG4gICAgICAgIHRhcFRyZXNob2xkOiAyMDAsXG4gICAgICAgIGxvbmdUYXBUcmVzaG9sZDogODAwLFxuICAgICAgICB0YXBUaW1lcjogbnVsbCxcbiAgICAgICAgcG9zOiBudWxsLFxuICAgICAgICBjYWNoZWQ6IG51bGwsXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICBzdGFydDogWyd0b3VjaHN0YXJ0JywgJ3BvaW50ZXJkb3duJywgJ01TUG9pbnRlckRvd24nLCAnbW91c2Vkb3duJ10sXG4gICAgICAgICAgICBlbmQ6IFsndG91Y2hlbmQnLCAncG9pbnRlcnVwJywgJ01TUG9pbnRlclVwJywgJ21vdXNldXAnXSxcbiAgICAgICAgICAgIG1vdmU6IFsndG91Y2htb3ZlJywgJ3BvaW50ZXJtb3ZlJywgJ01TUG9pbnRlck1vdmUnLCAnbW91c2Vtb3ZlJ11cbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhdGVQb2ludGVyOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gucG9zID0gW2V2ZW50LnBhZ2VYLCBldmVudC5wYWdlWV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIChuYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkgPyAyIDogMSxcbiAgICAgICAgICAgICAgICAzXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZSh3aW5kb3cuZG9jdW1lbnQsIGxhcm91eF90b3VjaC5ldmVudHMuc3RhcnRbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLm9uc3RhcnQpO1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUod2luZG93LmRvY3VtZW50LCBsYXJvdXhfdG91Y2guZXZlbnRzLmVuZFtldmVudHNbaV1dLCBsYXJvdXhfdG91Y2gub25lbmQpO1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUod2luZG93LmRvY3VtZW50LCBsYXJvdXhfdG91Y2guZXZlbnRzLm1vdmVbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLmxvY2F0ZVBvaW50ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uc3RhcnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmxvY2F0ZVBvaW50ZXIoZXZlbnQpO1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZCA9IFtsYXJvdXhfdG91Y2gucG9zWzBdLCBsYXJvdXhfdG91Y2gucG9zWzFdXTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCsrO1xuXG4gICAgICAgICAgICB2YXIgZm5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdG91Y2guY2FjaGVkWzBdID49IGxhcm91eF90b3VjaC5wb3NbMF0gLSBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzBdIDw9IGxhcm91eF90b3VjaC5wb3NbMF0gKyBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzFdID49IGxhcm91eF90b3VjaC5wb3NbMV0gLSBsYXJvdXhfdG91Y2gucHJlY2lzaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkWzFdIDw9IGxhcm91eF90b3VjaC5wb3NbMV0gKyBsYXJvdXhfdG91Y2gucHJlY2lzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsYXJvdXhfdG91Y2gudGFwQ291bnQgPT09IDIpID8gJ2RibHRhcCcgOiAndGFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXJvdXhfdG91Y2gucG9zWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXJvdXhfdG91Y2gucG9zWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA+IGxhcm91eF90b3VjaC5sb25nVGFwVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvbmd0YXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGxhcm91eF90b3VjaC5wb3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxhcm91eF90b3VjaC5wb3NbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwVGltZXIgPSBzZXRUaW1lb3V0KGZuYywgbGFyb3V4X3RvdWNoLnRhcFRyZXNob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQobGFyb3V4X3RvdWNoLnRhcFRpbWVyKTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBUaW1lciA9IHNldFRpbWVvdXQoZm5jLCBsYXJvdXhfdG91Y2gudGFwVHJlc2hvbGQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uZW5kOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IFtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnBvc1swXSAtIGxhcm91eF90b3VjaC5jYWNoZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5wb3NbMV0gLSBsYXJvdXhfdG91Y2guY2FjaGVkWzFdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBpbm5lckV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgeDogbGFyb3V4X3RvdWNoLnBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgeTogbGFyb3V4X3RvdWNoLnBvc1sxXSxcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IE1hdGguYWJzKGRlbHRhWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IE1hdGguYWJzKGRlbHRhWzFdKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVswXSA8PSAtbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVyaWdodCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMF0gPj0gbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVsZWZ0JywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVsxXSA8PSAtbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGVkb3duJywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVsxXSA+PSBsYXJvdXhfdG91Y2guc3dpcGVUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChldmVudC50YXJnZXQsICdzd2lwZXVwJywgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gbGFyb3V4LnJlYWR5KGxhcm91eF90b3VjaC5pbml0KTtcblxuICAgIHJldHVybiBsYXJvdXhfdG91Y2g7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gdHJpZ2dlcnNcbiAgICB2YXIgbGFyb3V4X3RyaWdnZXJzID0ge1xuICAgICAgICBkZWxlZ2F0ZXM6IFtdLFxuICAgICAgICBsaXN0OiBbXSxcblxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChjb25kaXRpb24sIGZuYywgc3RhdGUpIHtcbiAgICAgICAgICAgIHZhciBjb25kaXRpb25zID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShjb25kaXRpb24pO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgY29uZGl0aW9uc1tpdGVtXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5saXN0LnB1c2goY29uZGl0aW9uc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbmRpdGlvbnM6IGNvbmRpdGlvbnMsXG4gICAgICAgICAgICAgICAgZm5jOiBmbmMsXG4gICAgICAgICAgICAgICAgc3RhdGU6IHN0YXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbnRyaWdnZXI6IGZ1bmN0aW9uICh0cmlnZ2VyTmFtZSwgYXJncykge1xuICAgICAgICAgICAgdmFyIGV2ZW50SWR4ID0gbGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCB0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICBpZiAoZXZlbnRJZHggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmxpc3Quc3BsaWNlKGV2ZW50SWR4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXNbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjb25kaXRpb25LZXkgaW4gY3VycmVudEl0ZW0uY29uZGl0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRJdGVtLmNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoY29uZGl0aW9uS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZGl0aW9uT2JqID0gY3VycmVudEl0ZW0uY29uZGl0aW9uc1tjb25kaXRpb25LZXldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIGNvbmRpdGlvbk9iaikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZm5jKFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiBjdXJyZW50SXRlbS5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RyaWdnZXIgbmFtZTogJyArIHRyaWdnZXJOYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3RyaWdnZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyksXG4gICAgICAgIGxhcm91eF90aW1lcnMgPSByZXF1aXJlKCcuL2xhcm91eC50aW1lcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X2RhdGUgPSByZXF1aXJlKCcuL2xhcm91eC5kYXRlLmpzJyk7XG5cbiAgICAvLyB1aVxuICAgIHZhciBsYXJvdXhfdWkgPSB7XG4gICAgICAgIGZsb2F0Q29udGFpbmVyOiBudWxsLFxuXG4gICAgICAgIHBvcHVwOiB7XG4gICAgICAgICAgICBkZWZhdWx0VGltZW91dDogNTAwLFxuXG4gICAgICAgICAgICBjcmVhdGVCb3g6IGZ1bmN0aW9uIChpZCwgeGNsYXNzLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kb20uY3JlYXRlRWxlbWVudCgnRElWJywgeyBpZDogaWQsICdjbGFzcyc6IHhjbGFzcyB9LCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1zZ2JveDogZnVuY3Rpb24gKHRpbWVvdXQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBsYXJvdXhfaGVscGVycy5nZXRVbmlxdWVJZCgpLFxuICAgICAgICAgICAgICAgICAgICBvYmogPSBsYXJvdXhfdWkucG9wdXAuY3JlYXRlQm94KGlkLCAnbGFyb3V4TXNnQm94JywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyLmFwcGVuZENoaWxkKG9iaik7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KG9iaiwgeyBvcGFjaXR5OiAxIH0pO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5zZXQoe1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICByZXNldDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG9udGljazogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoeCwgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5yZW1vdmUoeCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBvYmpcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkaW5nOiB7XG4gICAgICAgICAgICBlbGVtZW50U2VsZWN0b3I6IG51bGwsXG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgZGVmYXVsdERlbGF5OiAxNTAwLFxuICAgICAgICAgICAgdGltZXI6IG51bGwsXG5cbiAgICAgICAgICAgIGtpbGxUaW1lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChsYXJvdXhfdWkubG9hZGluZy50aW1lcik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcua2lsbFRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQsIHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID0gJ2ZhbHNlJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uIChkZWxheSkge1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmtpbGxUaW1lcigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsYXkgPSBsYXJvdXhfdWkubG9hZGluZy5kZWZhdWx0RGVsYXk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGF5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdygwKTsgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCwgeyBkaXNwbGF5OiAnYmxvY2snIH0pO1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciA9ICd0cnVlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgPT09IG51bGwgJiYgbGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudFNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgPSBsYXJvdXhfZG9tLnNlbGVjdFNpbmdsZShsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50U2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQod2luZG93LCAnbG9hZCcsIGxhcm91eF91aS5sb2FkaW5nLmhpZGUpO1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KHdpbmRvdywgJ2JlZm9yZXVubG9hZCcsIGxhcm91eF91aS5sb2FkaW5nLnNob3cpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciAhPT0gdW5kZWZpbmVkICYmIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLnNob3coMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHluYW1pY0RhdGVzOiB7XG4gICAgICAgICAgICB1cGRhdGVEYXRlc0VsZW1lbnRzOiBudWxsLFxuXG4gICAgICAgICAgICB1cGRhdGVEYXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzID0gbGFyb3V4X2RvbS5zZWxlY3QoJypbZGF0YS1lcG9jaF0nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAvLyBiaXRzaGlmdGluZyAoc3RyID4+IDApIHVzZWQgaW5zdGVhZCBvZiBwYXJzZUludChzdHIsIDEwKVxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKChvYmouZ2V0QXR0cmlidXRlKCdkYXRhLWVwb2NoJykgPj4gMCkgKiAxMDAwKTtcblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmosXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZGF0ZS5nZXREYXRlU3RyaW5nKGRhdGUpXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBsYXJvdXhfZGF0ZS5nZXRMb25nRGF0ZVN0cmluZyhkYXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwLFxuICAgICAgICAgICAgICAgICAgICByZXNldDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb250aWNrOiBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2Nyb2xsVmlldzoge1xuICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50czogW10sXG5cbiAgICAgICAgICAgIG9uaGlkZGVuOiBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnRzLCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnRzLCBbJ29wYWNpdHknXSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbnJldmVhbDogZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50cywgeyBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfY3NzLmluVmlld3BvcnQoZWxlbWVudHNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLnB1c2goZWxlbWVudHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcub25oaWRkZW4obGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudCh3aW5kb3csICdzY3JvbGwnLCBsYXJvdXhfdWkuc2Nyb2xsVmlldy5yZXZlYWwpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmV2ZWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmVhY2goXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2Nzcy5pblZpZXdwb3J0KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLnNwbGljZShyZW1vdmVLZXlzW2l0ZW1dLCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS51bnNldEV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIGxhcm91eF91aS5zY3JvbGxWaWV3LnJldmVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcub25yZXZlYWwoZWxlbWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVGbG9hdENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFsYXJvdXhfdWkuZmxvYXRDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZmxvYXRDb250YWluZXIgPSBsYXJvdXhfZG9tLmNyZWF0ZUVsZW1lbnQoJ0RJVicsIHsgJ2NsYXNzJzogJ2xhcm91eEZsb2F0RGl2JyB9KTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUobGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyLCB3aW5kb3cuZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYXJvdXhfdWkuY3JlYXRlRmxvYXRDb250YWluZXIoKTtcbiAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmluaXQoKTtcbiAgICAgICAgICAgIGxhcm91eF91aS5keW5hbWljRGF0ZXMuaW5pdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGxhcm91eC5yZWFkeShsYXJvdXhfdWkuaW5pdCk7XG5cbiAgICByZXR1cm4gbGFyb3V4X3VpO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHZhcnNcbiAgICB2YXIgbGFyb3V4X3ZhcnMgPSB7XG4gICAgICAgIGNvb2tpZVBhdGg6ICcvJyxcblxuICAgICAgICBnZXRDb29raWU6IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz1bXjtdKycsICdpJyksXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gocmUpO1xuXG4gICAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdLnNwbGl0KCc9JylbMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldENvb2tpZTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgZXhwaXJlVmFsdWUgPSAnJztcbiAgICAgICAgICAgIGlmIChleHBpcmVzKSB7XG4gICAgICAgICAgICAgICAgZXhwaXJlVmFsdWUgPSAnOyBleHBpcmVzPScgKyBleHBpcmVzLnRvR01UU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgKyBleHBpcmVWYWx1ZSArICc7IHBhdGg9JyArIChwYXRoIHx8IGxhcm91eF92YXJzLmNvb2tpZVBhdGgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUNvb2tpZTogZnVuY3Rpb24gKG5hbWUsIHBhdGgpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9OyBleHBpcmVzPVRodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDAgR01UOyBwYXRoPScgKyAocGF0aCB8fCBsYXJvdXhfdmFycy5jb29raWVQYXRoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMb2NhbDogZnVuY3Rpb24gKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBsb2NhbFN0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2VbbmFtZV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldExvY2FsOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZVtuYW1lXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVMb2NhbDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBsb2NhbFN0b3JhZ2VbbmFtZV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBzZXNzaW9uU3RvcmFnZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlW25hbWVdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlW25hbWVdID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVNlc3Npb246IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgc2Vzc2lvblN0b3JhZ2VbbmFtZV07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF92YXJzO1xuXG59KCkpO1xuIiwiLypnbG9iYWwgTm9kZUxpc3QsIE5vZGUgKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gd3JhcHBlclxuICAgIHZhciBsYXJvdXhfd3JhcHBlciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb247XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdG9yO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgTm9kZUxpc3QpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gW3NlbGVjdG9yXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IGxhcm91eF9kb20uc2VsZWN0KHNlbGVjdG9yLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUoc2VsZWN0aW9uWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZShzZWxlY3Rpb24pO1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5pc0FycmF5ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZmluZCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF93cmFwcGVyKHNlbGVjdG9yLCB0aGlzLnNvdXJjZSk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUgPSBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBlbGVtZW50cztcbiAgICAgICAgdGhpcy5pc0FycmF5ID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlW2luZGV4XTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoID0gMDtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSA9IDE7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJBcnJheSA9IDI7XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlciA9IGZ1bmN0aW9uIChuYW1lLCBmbmMsIHNjb3BlKSB7XG4gICAgICAgIHZhciBuZXdGbmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jLmFwcGx5KFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgW3RoaXMuc291cmNlXS5jb25jYXQobGFyb3V4X2hlbHBlcnMudG9BcnJheShhcmd1bWVudHMpKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHQgPT09IHVuZGVmaW5lZCkgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgICAgY2FzZSBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZTpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXk6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYXR0cicsIGxhcm91eF9kb20uYXR0ciwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdkYXRhJywgbGFyb3V4X2RvbS5kYXRhLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ29uJywgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvbicsIGxhcm91eF9kb20uc2V0RXZlbnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXkpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvZmYnLCBsYXJvdXhfZG9tLnVuc2V0RXZlbnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2NsZWFyJywgbGFyb3V4X2RvbS5jbGVhciwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbnNlcnQnLCBsYXJvdXhfZG9tLmluc2VydCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdwcmVwZW5kJywgbGFyb3V4X2RvbS5wcmVwZW5kLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2FwcGVuZCcsIGxhcm91eF9kb20uYXBwZW5kLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlcGxhY2UnLCBsYXJvdXhfZG9tLnJlcGxhY2UsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVwbGFjZVRleHQnLCBsYXJvdXhfZG9tLnJlcGxhY2VUZXh0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlbW92ZScsIGxhcm91eF9kb20ucmVtb3ZlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaGFzQ2xhc3MnLCBsYXJvdXhfY3NzLmhhc0NsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2FkZENsYXNzJywgbGFyb3V4X2Nzcy5hZGRDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVtb3ZlQ2xhc3MnLCBsYXJvdXhfY3NzLnJlbW92ZUNsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCd0b2dnbGVDbGFzcycsIGxhcm91eF9jc3MudG9nZ2xlQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2dldFByb3BlcnR5JywgbGFyb3V4X2Nzcy5nZXRQcm9wZXJ0eSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzZXRQcm9wZXJ0eScsIGxhcm91eF9jc3Muc2V0UHJvcGVydHksIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3NldFRyYW5zaXRpb24nLCBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3Nob3cnLCBsYXJvdXhfY3NzLnNob3csIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hpZGUnLCBsYXJvdXhfY3NzLmhpZGUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hlaWdodCcsIGxhcm91eF9jc3MuaGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2lubmVySGVpZ2h0JywgbGFyb3V4X2Nzcy5pbm5lckhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvdXRlckhlaWdodCcsIGxhcm91eF9jc3Mub3V0ZXJIZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignd2lkdGgnLCBsYXJvdXhfY3NzLndpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2lubmVyV2lkdGgnLCBsYXJvdXhfY3NzLmlubmVyV2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb3V0ZXJXaWR0aCcsIGxhcm91eF9jc3Mub3V0ZXJXaWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCd0b3AnLCBsYXJvdXhfY3NzLnRvcCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdsZWZ0JywgbGFyb3V4X2Nzcy5sZWZ0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2Fib3ZlVGhlVG9wJywgbGFyb3V4X2Nzcy5hYm92ZVRoZVRvcCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdiZWxvd1RoZUZvbGQnLCBsYXJvdXhfY3NzLmJlbG93VGhlRm9sZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdsZWZ0T2ZTY3JlZW4nLCBsYXJvdXhfY3NzLmxlZnRPZlNjcmVlbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyaWdodE9mU2NyZWVuJywgbGFyb3V4X2Nzcy5yaWdodE9mU2NyZWVuLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2luVmlld3BvcnQnLCBsYXJvdXhfY3NzLmluVmlld3BvcnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcblxuICAgIHJldHVybiBsYXJvdXhfd3JhcHBlcjtcblxufSgpKTtcbiJdfQ==
