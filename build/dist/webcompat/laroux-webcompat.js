/**
 * laroux.js webcompat - A jquery substitute for modern browsers
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function (scope) {
    'use strict';

    var emptyFunction = function () {};

    if (scope.document === undefined) {
        scope.document = {
            attachEvent: emptyFunction,
            createEventObject: emptyFunction,
            readyState: null
        };
    }

    if (!('requestAnimationFrame' in scope)) {
        scope.requestAnimationFrame = function (callback) {
            setTimeout(function () { callback(Date.now()); }, 50);
        };
    }

    if (!('getComputedStyle' in scope)) {
        scope.getComputedStyle = function (element) {
            this.element = element;

            this.getPropertyValue = function (prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop === 'float') {
                    prop = 'styleFloat';
                }

                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }

                return this.element.currentStyle[prop] || null;
            };

            this.getPropertyCSSValue = function (prop) {
                return new CSSPrimitiveValue(this.element, prop);
            };

            return this;
        };
    }

    if (!('CSSPrimitiveValue' in scope)) {
        scope.CSSPrimitiveValue = function (element, prop) {
            this.element = element;
            this.prop = prop;
            this.primitiveType = 0;

            this.getFloatValue = function (primitiveType) {
                var re = /(\-([a-z]){1})/g,
                    prop = this.prop;

                if (prop === 'float') {
                    prop = 'styleFloat';
                }

                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }

                return this.element.currentStyle[prop] || null;
            };
        };
    }

    if (scope.Event === undefined) {
        scope.Event = emptyFunction;
    }

    if (!('preventDefault' in Event.prototype)) {
        Event.prototype.preventDefault = function () {
            this.returnValue = false;
        };
    }

    if (!('stopPropagation' in Event.prototype)) {
        Event.prototype.stopPropagation = function () {
            this.cancelBubble = true;
        };
    }

    if (scope.Element === undefined) {
        scope.Element = emptyFunction;
    }

    if (!('addEventListener' in Element.prototype)) {
        var eventListeners = [],
            addListener = function (eventname, callback) {
                var self = this,
                    wrapper = function (event) {
                        event.target = event.srcElement;
                        event.currentTarget = self;

                        // if ('handleEvent' in callback) {
                        //     callback.handleEvent(event);
                        // } else {
                        //     callback.call(self, event);
                        // }
                        callback(self, event);
                    };

                if (eventname !== 'DOMContentLoaded') {
                    this.attachEvent('on' + eventname, wrapper);
                }
                eventListeners.push({ object: this, type: eventname, listener: callback, wrapper: wrapper });
            },
            removeListener = function (eventname, callback) {
                for (var i = 0, length = eventListeners.length; i < length; i++) {
                    var eventListener = eventListeners[i];

                    if (eventListener.object === this && eventListener.type === eventname && eventListener.listener === callback) {
                        if (eventname != 'DOMContentLoaded') {
                            this.detachEvent('on' + eventname, eventListener.wrapper);
                        }

                        eventListeners.splice(i, 1);
                        break;
                    }
                }
            },
            dispatchEvent = function (event) {
                var eventObject = document.createEventObject();
                this.fireEvent('on' + event.type, eventObject);
            };

        Element.prototype.addEventListener = addListener;
        Element.prototype.removeEventListener = removeListener;
        Element.prototype.dispatchEvent = dispatchEvent;

        if (scope.HTMLDocument !== undefined) {
            HTMLDocument.prototype.addEventListener = addListener;
            HTMLDocument.prototype.removeEventListener = removeListener;
            HTMLDocument.prototype.dispatchEvent = dispatchEvent;
        }

        if (scope.Window !== undefined) {
            Window.prototype.addEventListener = addListener;
            Window.prototype.removeEventListener = removeListener;
            Window.prototype.dispatchEvent = dispatchEvent;
        }

        document.attachEvent('onreadystatechange', function () {
            if (document.readyState == 'complete') {
                var eventObject = document.createEventObject();
                // eventObject.srcElement = window;

                for (var i = 0, length = eventListeners.length; i < length; i++) {
                    if (eventListeners[i].object === document && eventListeners[i].type === 'DOMContentLoaded') {
                        eventListeners[i].wrapper(eventObject);
                    }
                }
            }
        });
    }

    if (scope.Text === undefined) {
        scope.Text = emptyFunction;
    }

    if (!('textContent' in Element.prototype)) {
        var innerText = Object.getOwnPropertyDescriptor(Element.prototype, 'innerText');

        Object.defineProperty(Element.prototype, 'textContent', {
            get: function () {
                return innerText.get.call(this);
            },
            set: function (value) {
                return innerText.set.call(this, value);
            }
        });
    }

    if (!('getAttribute' in Element.prototype)) {
        Element.prototype.getAttribute = function (attribute) {
            return this.attributes[attribute].value;
        };
    }

    if (!('setAttribute' in Element.prototype)) {
        Element.prototype.setAttribute = function (attribute, value) {
            this.attributes[attribute].value = value;
        };
    }

    if (!('removeAttribute' in Element.prototype)) {
        Element.prototype.removeAttribute = function (attribute) {
            this.attributes.removeNamedItem(attribute);
        };
    }

    if (!('firstElementChild' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'firstElementChild', {
            get: function () {
                return this.children[0];
            }
        });
    }

    if (!('classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function () {
                var self = this;

                return {
                    add: function (className) {
                        self.className = self.className.trim() + ' ' + className;
                    },

                    remove: function (className) {
                        self.className = self.className.replace(
                            new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
                            ' '
                        );
                    },

                    contains: function (className) {
                        return (new RegExp('(^| )' + className + '( |$)', 'gi').test(self.className));
                    }
                };
            }
        });
    }

    if (!('textContent' in Text.prototype)) {
        var nodeValue = Object.getOwnPropertyDescriptor(Text.prototype, 'nodeValue');

        Object.defineProperty(Text.prototype, 'textContent', {
            get: function () {
                return nodeValue.get.call(this);
            },
            set: function (value) {
                return nodeValue.set.call(this, value);
            }
        });
    }

    if (!('trim' in String.prototype)) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    if (!('observe' in Object)) {
        Object.observe = emptyFunction;
    }

    if (!('keys' in Object)) {
        Object.keys = function (object) {
            var keys = [];

            for (var item in object) {
                if (!object.hasOwnProperty(item)) {
                    continue;
                }

                keys.push(item);
            }

            return keys;
        };
    }

    /*
    if (!('forEach' in Object.prototype)) {
        Object.prototype.forEach = function (callback) {
            for (var item in this) {
                if (!this.hasOwnProperty(item)) {
                    continue;
                }

                callback.apply(this, [this[item], item, this]);
            }
        };
    }

    if (!('map' in Object.prototype)) {
        Object.prototype.map = function (callback) {
            var results = [];

            for (var item in this) {
                if (!this.hasOwnProperty(item)) {
                    continue;
                }

                results.push(callback.apply(this, [this[item], item, this]));
            }

            return results;
        };
    }

    if (!('forEach' in Array.prototype)) {
        Array.prototype.forEach = function (callback) {
            for (var i = 0; i < this.length; i++) {
                callback.apply(this, [this[i], i, this]);
            }
        };
    }

    if (!('map' in Array.prototype)) {
        Array.prototype.map = function (callback) {
            var results = [];

            for (var i = 0; i < this.length; i++) {
                results.push(callback.apply(this, [this[i], i, this]));
            }

            return results;
        };
    }

    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf = function (object, start) {
            for (var i = (start || 0), length = this.length; i < length; i++) {
                if (this[i] === object) {
                    return i;
                }
            }

            return -1;
        };
    }
    */

}(typeof window !== 'undefined' ? window : global));

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

    laroux.readyPassed = false;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwidGVtcFxcd2ViY29tcGF0XFxsYXJvdXguanMiLCJ0ZW1wL3dlYmNvbXBhdC9sYXJvdXguYWpheC5qcyIsInRlbXAvd2ViY29tcGF0L2xhcm91eC5hbmltLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4LmNzcy5qcyIsInRlbXAvd2ViY29tcGF0L2xhcm91eC5kYXRlLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4LmRvbS5qcyIsInRlbXAvd2ViY29tcGF0L2xhcm91eC5ldmVudHMuanMiLCJ0ZW1wL3dlYmNvbXBhdC9sYXJvdXguZm9ybXMuanMiLCJ0ZW1wL3dlYmNvbXBhdC9sYXJvdXguaGVscGVycy5qcyIsInRlbXAvd2ViY29tcGF0L2xhcm91eC5rZXlzLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4Lm12Yy5qcyIsInRlbXAvd2ViY29tcGF0L2xhcm91eC5zdGFjay5qcyIsInRlbXAvd2ViY29tcGF0L2xhcm91eC50ZW1wbGF0ZXMuanMiLCJ0ZW1wL3dlYmNvbXBhdC9sYXJvdXgudGltZXJzLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4LnRvdWNoLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4LnRyaWdnZXJzLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4LnVpLmpzIiwidGVtcC93ZWJjb21wYXQvbGFyb3V4LnZhcnMuanMiLCJ0ZW1wL3dlYmNvbXBhdC9sYXJvdXgud3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgZW1wdHlGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgaWYgKHNjb3BlLmRvY3VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2NvcGUuZG9jdW1lbnQgPSB7XG4gICAgICAgICAgICBhdHRhY2hFdmVudDogZW1wdHlGdW5jdGlvbixcbiAgICAgICAgICAgIGNyZWF0ZUV2ZW50T2JqZWN0OiBlbXB0eUZ1bmN0aW9uLFxuICAgICAgICAgICAgcmVhZHlTdGF0ZTogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBjYWxsYmFjayhEYXRlLm5vdygpKTsgfSwgNTApO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdnZXRDb21wdXRlZFN0eWxlJyBpbiBzY29wZSkpIHtcbiAgICAgICAgc2NvcGUuZ2V0Q29tcHV0ZWRTdHlsZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgICAgICB0aGlzLmdldFByb3BlcnR5VmFsdWUgPSBmdW5jdGlvbiAocHJvcCkge1xuICAgICAgICAgICAgICAgIHZhciByZSA9IC8oXFwtKFthLXpdKXsxfSkvZztcbiAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2Zsb2F0Jykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gJ3N0eWxlRmxvYXQnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyZS50ZXN0KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3AgPSBwcm9wLnJlcGxhY2UocmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmd1bWVudHNbMl0udG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jdXJyZW50U3R5bGVbcHJvcF0gfHwgbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UHJvcGVydHlDU1NWYWx1ZSA9IGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDU1NQcmltaXRpdmVWYWx1ZSh0aGlzLmVsZW1lbnQsIHByb3ApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ0NTU1ByaW1pdGl2ZVZhbHVlJyBpbiBzY29wZSkpIHtcbiAgICAgICAgc2NvcGUuQ1NTUHJpbWl0aXZlVmFsdWUgPSBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMucHJvcCA9IHByb3A7XG4gICAgICAgICAgICB0aGlzLnByaW1pdGl2ZVR5cGUgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLmdldEZsb2F0VmFsdWUgPSBmdW5jdGlvbiAocHJpbWl0aXZlVHlwZSkge1xuICAgICAgICAgICAgICAgIHZhciByZSA9IC8oXFwtKFthLXpdKXsxfSkvZyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9IHRoaXMucHJvcDtcblxuICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSAnZmxvYXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3AgPSAnc3R5bGVGbG9hdCc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9IHByb3AucmVwbGFjZShyZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1syXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmN1cnJlbnRTdHlsZVtwcm9wXSB8fCBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuRXZlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzY29wZS5FdmVudCA9IGVtcHR5RnVuY3Rpb247XG4gICAgfVxuXG4gICAgaWYgKCEoJ3ByZXZlbnREZWZhdWx0JyBpbiBFdmVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIEV2ZW50LnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnc3RvcFByb3BhZ2F0aW9uJyBpbiBFdmVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIEV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLkVsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzY29wZS5FbGVtZW50ID0gZW1wdHlGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIHZhciBldmVudExpc3RlbmVycyA9IFtdLFxuICAgICAgICAgICAgYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnRuYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0ID0gZXZlbnQuc3JjRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBzZWxmO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoJ2hhbmRsZUV2ZW50JyBpbiBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGNhbGxiYWNrLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzZWxmLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRuYW1lICE9PSAnRE9NQ29udGVudExvYWRlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRuYW1lLCB3cmFwcGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMucHVzaCh7IG9iamVjdDogdGhpcywgdHlwZTogZXZlbnRuYW1lLCBsaXN0ZW5lcjogY2FsbGJhY2ssIHdyYXBwZXI6IHdyYXBwZXIgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnRuYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBldmVudExpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnRMaXN0ZW5lciA9IGV2ZW50TGlzdGVuZXJzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudExpc3RlbmVyLm9iamVjdCA9PT0gdGhpcyAmJiBldmVudExpc3RlbmVyLnR5cGUgPT09IGV2ZW50bmFtZSAmJiBldmVudExpc3RlbmVyLmxpc3RlbmVyID09PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50bmFtZSAhPSAnRE9NQ29udGVudExvYWRlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRldGFjaEV2ZW50KCdvbicgKyBldmVudG5hbWUsIGV2ZW50TGlzdGVuZXIud3JhcHBlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRPYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZUV2ZW50KCdvbicgKyBldmVudC50eXBlLCBldmVudE9iamVjdCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRMaXN0ZW5lcjtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUxpc3RlbmVyO1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcblxuICAgICAgICBpZiAoc2NvcGUuSFRNTERvY3VtZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIEhUTUxEb2N1bWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZExpc3RlbmVyO1xuICAgICAgICAgICAgSFRNTERvY3VtZW50LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlTGlzdGVuZXI7XG4gICAgICAgICAgICBIVE1MRG9jdW1lbnQucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjb3BlLldpbmRvdyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBXaW5kb3cucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRMaXN0ZW5lcjtcbiAgICAgICAgICAgIFdpbmRvdy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUxpc3RlbmVyO1xuICAgICAgICAgICAgV2luZG93LnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50T2JqZWN0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICAgICAgICAgICAgICAvLyBldmVudE9iamVjdC5zcmNFbGVtZW50ID0gd2luZG93O1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudExpc3RlbmVyc1tpXS5vYmplY3QgPT09IGRvY3VtZW50ICYmIGV2ZW50TGlzdGVuZXJzW2ldLnR5cGUgPT09ICdET01Db250ZW50TG9hZGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnNbaV0ud3JhcHBlcihldmVudE9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChzY29wZS5UZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2NvcGUuVGV4dCA9IGVtcHR5RnVuY3Rpb247XG4gICAgfVxuXG4gICAgaWYgKCEoJ3RleHRDb250ZW50JyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgdmFyIGlubmVyVGV4dCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdpbm5lclRleHQnKTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICd0ZXh0Q29udGVudCcsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbm5lclRleHQuZ2V0LmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5uZXJUZXh0LnNldC5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCEoJ2dldEF0dHJpYnV0ZScgaW4gRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbYXR0cmlidXRlXS52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnc2V0QXR0cmlidXRlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVdLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ3JlbW92ZUF0dHJpYnV0ZScgaW4gRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlcy5yZW1vdmVOYW1lZEl0ZW0oYXR0cmlidXRlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnZmlyc3RFbGVtZW50Q2hpbGQnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdmaXJzdEVsZW1lbnRDaGlsZCcsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoISgnY2xhc3NMaXN0JyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEVsZW1lbnQucHJvdG90eXBlLCAnY2xhc3NMaXN0Jywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkOiBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsYXNzTmFtZSA9IHNlbGYuY2xhc3NOYW1lLnRyaW0oKSArICcgJyArIGNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xhc3NOYW1lID0gc2VsZi5jbGFzc05hbWUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICBjb250YWluczogZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChuZXcgUmVnRXhwKCcoXnwgKScgKyBjbGFzc05hbWUgKyAnKCB8JCknLCAnZ2knKS50ZXN0KHNlbGYuY2xhc3NOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoISgndGV4dENvbnRlbnQnIGluIFRleHQucHJvdG90eXBlKSkge1xuICAgICAgICB2YXIgbm9kZVZhbHVlID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihUZXh0LnByb3RvdHlwZSwgJ25vZGVWYWx1ZScpO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUZXh0LnByb3RvdHlwZSwgJ3RleHRDb250ZW50Jywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVWYWx1ZS5nZXQuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlVmFsdWUuc2V0LmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoISgndHJpbScgaW4gU3RyaW5nLnByb3RvdHlwZSkpIHtcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS50cmltID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdvYnNlcnZlJyBpbiBPYmplY3QpKSB7XG4gICAgICAgIE9iamVjdC5vYnNlcnZlID0gZW1wdHlGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISgna2V5cycgaW4gT2JqZWN0KSkge1xuICAgICAgICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgIHZhciBrZXlzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmplY3QuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKlxuICAgIGlmICghKCdmb3JFYWNoJyBpbiBPYmplY3QucHJvdG90eXBlKSkge1xuICAgICAgICBPYmplY3QucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBbdGhpc1tpdGVtXSwgaXRlbSwgdGhpc10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdtYXAnIGluIE9iamVjdC5wcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNhbGxiYWNrLmFwcGx5KHRoaXMsIFt0aGlzW2l0ZW1dLCBpdGVtLCB0aGlzXSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnZm9yRWFjaCcgaW4gQXJyYXkucHJvdG90eXBlKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgW3RoaXNbaV0sIGksIHRoaXNdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnbWFwJyBpbiBBcnJheS5wcm90b3R5cGUpKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjYWxsYmFjay5hcHBseSh0aGlzLCBbdGhpc1tpXSwgaSwgdGhpc10pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ2luZGV4T2YnIGluIEFycmF5LnByb3RvdHlwZSkpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAob2JqZWN0LCBzdGFydCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IChzdGFydCB8fCAwKSwgbGVuZ3RoID0gdGhpcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH07XG4gICAgfVxuICAgICovXG5cbn0odHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gY29yZVxuICAgIHZhciBsYXJvdXggPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eC5oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAvLyBGSVhNRTogbm9uLWNocm9tZSBvcHRpbWl6YXRpb25cbiAgICAgICAgdmFyIHJlID0gL14jKFteXFwrXFw+XFxbXFxdXFwuIyBdKikkLy5leGVjKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKHJlKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocmVbMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LmdldEVsZW1lbnRCeUlkKHJlWzFdKTtcbiAgICAgICAgfVxuICAgICAgICAqL1xuXG4gICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9O1xuICAgIGlmICghKCckbCcgaW4gc2NvcGUpKSB7XG4gICAgICAgIHNjb3BlLiRsID0gbGFyb3V4O1xuICAgIH1cblxuICAgIC8vIGNvcmUgbW9kdWxlc1xuICAgIGxhcm91eC5ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKTtcbiAgICBsYXJvdXguaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICBsYXJvdXgudGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyk7XG4gICAgbGFyb3V4LmNhY2hlZCA9IHtcbiAgICAgICAgc2luZ2xlOiB7fSxcbiAgICAgICAgYXJyYXk6IHt9LFxuICAgICAgICBpZDoge31cbiAgICB9O1xuXG4gICAgbGFyb3V4LmMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXguY2FjaGVkLmFycmF5W3NlbGVjdG9yXSB8fCAoXG4gICAgICAgICAgICAgICAgbGFyb3V4LmNhY2hlZC5hcnJheVtzZWxlY3Rvcl0gPSBsYXJvdXguaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGFyb3V4LmNhY2hlZC5zaW5nbGVbc2VsZWN0b3JdIHx8IChcbiAgICAgICAgICAgIGxhcm91eC5jYWNoZWQuc2luZ2xlW3NlbGVjdG9yXSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgfTtcblxuICAgIGxhcm91eC5pZGMgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuaWRbc2VsZWN0b3JdIHx8XG4gICAgICAgICAgICAobGFyb3V4LmNhY2hlZC5pZFtzZWxlY3Rvcl0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikpO1xuICAgIH07XG4gICAgbGFyb3V4LmV4dGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIGxhcm91eCk7XG4gICAgICAgIGxhcm91eC5oZWxwZXJzLmV4dGVuZE9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBsYXJvdXguZXh0ZW5kT2JqZWN0ID0gbGFyb3V4LmhlbHBlcnMuZXh0ZW5kT2JqZWN0O1xuICAgIGxhcm91eC5lYWNoID0gbGFyb3V4LmhlbHBlcnMuZWFjaDtcbiAgICBsYXJvdXgubWFwID0gbGFyb3V4LmhlbHBlcnMubWFwO1xuICAgIGxhcm91eC5pbmRleCA9IGxhcm91eC5oZWxwZXJzLmluZGV4O1xuICAgIGxhcm91eC5hZWFjaCA9IGxhcm91eC5oZWxwZXJzLmFlYWNoO1xuICAgIGxhcm91eC5hbWFwID0gbGFyb3V4LmhlbHBlcnMuYW1hcDtcbiAgICBsYXJvdXguYWluZGV4ID0gbGFyb3V4LmhlbHBlcnMuYWluZGV4O1xuXG4gICAgbGFyb3V4LnJlYWR5UGFzc2VkID0gZmFsc2U7XG5cbiAgICBsYXJvdXgucmVhZHkgPSBmdW5jdGlvbiAoZm5jKSB7XG4gICAgICAgIGlmICghbGFyb3V4LnJlYWR5UGFzc2VkKSB7XG4gICAgICAgICAgICBsYXJvdXguZXZlbnRzLmFkZCgnQ29udGVudExvYWRlZCcsIGZuYyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmbmMoKTtcbiAgICB9O1xuICAgIC8vIG9wdGlvbmFsIG1vZHVsZXNcbiAgICBsYXJvdXgud3JhcHBlciA9IHJlcXVpcmUoJy4vbGFyb3V4LndyYXBwZXIuanMnKTtcbiAgICBsYXJvdXguYWpheCA9IHJlcXVpcmUoJy4vbGFyb3V4LmFqYXguanMnKTtcbiAgICBsYXJvdXguY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyk7XG4gICAgbGFyb3V4LmRvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpO1xuICAgIC8vIGxhcm91eC5ldmVudHMgPSByZXF1aXJlKCcuL2xhcm91eC5ldmVudHMuanMnKTtcbiAgICBsYXJvdXguZm9ybXMgPSByZXF1aXJlKCcuL2xhcm91eC5mb3Jtcy5qcycpO1xuICAgIC8vIGxhcm91eC5oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuICAgIC8vIGxhcm91eC50aW1lcnMgPSByZXF1aXJlKCcuL2xhcm91eC50aW1lcnMuanMnKTtcbiAgICBsYXJvdXgudHJpZ2dlcnMgPSByZXF1aXJlKCcuL2xhcm91eC50cmlnZ2Vycy5qcycpO1xuICAgIGxhcm91eC52YXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudmFycy5qcycpO1xuXG4gICAgbGFyb3V4LmFuaW0gPSByZXF1aXJlKCcuL2xhcm91eC5hbmltLmpzJyk7XG4gICAgbGFyb3V4LmRhdGUgPSByZXF1aXJlKCcuL2xhcm91eC5kYXRlLmpzJyk7XG4gICAgbGFyb3V4LmtleXMgPSByZXF1aXJlKCcuL2xhcm91eC5rZXlzLmpzJyk7XG4gICAgbGFyb3V4Lm12YyA9IHJlcXVpcmUoJy4vbGFyb3V4Lm12Yy5qcycpO1xuICAgIGxhcm91eC5zdGFjayA9IHJlcXVpcmUoJy4vbGFyb3V4LnN0YWNrLmpzJyk7XG4gICAgbGFyb3V4LnRlbXBsYXRlcyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRlbXBsYXRlcy5qcycpO1xuICAgIGxhcm91eC50b3VjaCA9IHJlcXVpcmUoJy4vbGFyb3V4LnRvdWNoLmpzJyk7XG4gICAgbGFyb3V4LnVpID0gcmVxdWlyZSgnLi9sYXJvdXgudWkuanMnKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnRE9NQ29udGVudExvYWRlZCcsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghbGFyb3V4LnJlYWR5UGFzc2VkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4LmV2ZW50cy5pbnZva2UoJ0NvbnRlbnRMb2FkZWQnKTtcbiAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbChsYXJvdXgudGltZXJzLm9udGljaywgMTAwKTtcbiAgICAgICAgICAgICAgICBsYXJvdXgudG91Y2guaW5pdCgpO1xuICAgICAgICAgICAgICAgIGxhcm91eC5yZWFkeVBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiBsYXJvdXg7XG5cbn0odHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2V2ZW50cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmV2ZW50cy5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIGFqYXggLSBwYXJ0aWFsbHkgdGFrZW4gZnJvbSAnanF1ZXJ5IGluIHBhcnRzJyBwcm9qZWN0XG4gICAgLy8gICAgICAgIGNhbiBiZSBmb3VuZCBhdDogaHR0cHM6Ly9naXRodWIuY29tL215dGh6L2pxdWlwL1xuICAgIHZhciBsYXJvdXhfYWpheCA9IHtcbiAgICAgICAgY29yc0RlZmF1bHQ6IGZhbHNlLFxuXG4gICAgICAgIHdyYXBwZXJzOiB7XG4gICAgICAgICAgICByZWdpc3RyeToge1xuICAgICAgICAgICAgICAgICdsYXJvdXguanMnOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6ICcgKyBkYXRhLmVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmZvcm1hdCA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmogPSBKU09OLnBhcnNlKGRhdGEub2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmZvcm1hdCA9PT0gJ3NjcmlwdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qanNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmogPSBldmFsKGRhdGEub2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gaWYgKGRhdGEuZm9ybWF0ID09ICd4bWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmogPSBkYXRhLm9iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAobmFtZSwgZm5jKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgud3JhcHBlcnMucmVnaXN0cnlbbmFtZV0gPSBmbmM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgeERvbWFpbk9iamVjdDogZmFsc2UsXG4gICAgICAgIHhtbEh0dHBSZXF1ZXN0T2JqZWN0OiBudWxsLFxuICAgICAgICB4RG9tYWluUmVxdWVzdE9iamVjdDogbnVsbCxcbiAgICAgICAgeGhyOiBmdW5jdGlvbiAoY3Jvc3NEb21haW4pIHtcbiAgICAgICAgICAgIGlmIChsYXJvdXhfYWpheC54bWxIdHRwUmVxdWVzdE9iamVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjcm9zc0RvbWFpbikge1xuICAgICAgICAgICAgICAgIGlmICghKCd3aXRoQ3JlZGVudGlhbHMnIGluIGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0KSAmJiB0eXBlb2YgWERvbWFpblJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5PYmplY3QgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpblJlcXVlc3RPYmplY3QgPSBuZXcgWERvbWFpblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnhEb21haW5PYmplY3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHhoclJlc3A6IGZ1bmN0aW9uICh4aHIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyRnVuY3Rpb24gPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVzcG9uc2UtV3JhcHBlci1GdW5jdGlvbicpLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAnanNvbicpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICAgICAgLypqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBldmFsKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSAneG1sJykge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlWE1MO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3cmFwcGVyRnVuY3Rpb24gJiYgKHdyYXBwZXJGdW5jdGlvbiBpbiBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeSkpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5W3dyYXBwZXJGdW5jdGlvbl0ocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB3cmFwcGVyRnVuYzogd3JhcHBlckZ1bmN0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ha2VSZXF1ZXN0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGNvcnMgPSBvcHRpb25zLmNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgeGhyID0gbGFyb3V4X2FqYXgueGhyKGNvcnMpLFxuICAgICAgICAgICAgICAgIHVybCA9IG9wdGlvbnMudXJsLFxuICAgICAgICAgICAgICAgIHRpbWVyID0gbnVsbCxcbiAgICAgICAgICAgICAgICBuID0gMDtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWVvdXRGbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aW1lb3V0Rm4ob3B0aW9ucy51cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRpbWVvdXRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBsYXJvdXhfYWpheC54aHJSZXNwKHhociwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHhociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4RXJyb3InLCBbeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCwgb3B0aW9uc10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VjY2VzcyAhPT0gdW5kZWZpbmVkICYmIHJlcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MocmVzLnJlc3BvbnNlLCByZXMud3JhcHBlckZ1bmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuaW52b2tlKCdhamF4U3VjY2VzcycsIFt4aHIsIHJlcy5yZXNwb25zZSwgcmVzLndyYXBwZXJGdW5jLCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lcnJvcih4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhFcnJvcicsIFt4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jb21wbGV0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbXBsZXRlKHhociwgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhDb21wbGV0ZScsIFt4aHIsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByb2dyZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wcm9ncmVzcygrK24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmdldGRhdGEgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmdldGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5nZXRkYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gbGFyb3V4X2hlbHBlcnMuYnVpbGRRdWVyeVN0cmluZyhvcHRpb25zLmdldGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnlTdHJpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArIHF1ZXJ5U3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICgodXJsLmluZGV4T2YoJz8nKSA8IDApID8gJz8nIDogJyYnKSArIG9wdGlvbnMuZ2V0ZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmpzb25wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgJ2pzb25wPScgKyBvcHRpb25zLmpzb25wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWxhcm91eF9hamF4LnhEb21haW5PYmplY3QpIHtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihvcHRpb25zLnR5cGUsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKG9wdGlvbnMudHlwZSwgdXJsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy54aHJGaWVsZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMueGhyRmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMueGhyRmllbGRzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhocltpXSA9IG9wdGlvbnMueGhyRmllbGRzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1snWC1SZXF1ZXN0ZWQtV2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0JztcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy53cmFwcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydYLVdyYXBwZXItRnVuY3Rpb24nXSA9ICdsYXJvdXguanMnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiBpbiBoZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihqLCBoZWFkZXJzW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnBvc3RkYXRhID09PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5wb3N0ZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChvcHRpb25zLnBvc3RkYXRhdHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLnBvc3RkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Zvcm0nOlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChsYXJvdXhfaGVscGVycy5idWlsZEZvcm1EYXRhKG9wdGlvbnMucG9zdGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNlbmQob3B0aW9ucy5wb3N0ZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRKc29uOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEpzb25QOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBtZXRob2QsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAganNvbnA6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTY3JpcHQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBnZXRkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YXR5cGU6ICdmb3JtJyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3RKc29uOiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2FqYXg7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyk7XG5cbiAgICAvLyBhbmltXG4gICAgdmFyIGxhcm91eF9hbmltID0ge1xuICAgICAgICBkYXRhOiBbXSxcblxuICAgICAgICBmeDoge1xuICAgICAgICAgICAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uIChzb3VyY2UsIHRhcmdldCwgc2hpZnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHNvdXJjZSArICh0YXJnZXQgLSBzb3VyY2UpICogc2hpZnQpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZWFzaW5nOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgtTWF0aC5jb3MocG9zICogTWF0aC5QSSkgLyAyKSArIDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyB7b2JqZWN0LCBwcm9wZXJ0eSwgZnJvbSwgdG8sIHRpbWUsIHVuaXQsIHJlc2V0fVxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdhbmltKSB7XG4gICAgICAgICAgICBuZXdhbmltLnN0YXJ0VGltZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLnVuaXQgPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLnVuaXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLnVuaXQgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0uZnJvbSA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0uZnJvbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gZG9jdW1lbnQuYm9keSAmJiBuZXdhbmltLnByb3BlcnR5ID09PSAnc2Nyb2xsVG9wJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IG5ld2FuaW0ub2JqZWN0W25ld2FuaW0ucHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBuZXdhbmltLmZyb20gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gTnVtYmVyKG5ld2FuaW0uZnJvbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLnJlc2V0ID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS5yZXNldCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0ucmVzZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgKG5ld2FuaW0uaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gICAgIG5ld2FuaW0uaWQgPSBsYXJvdXhfaGVscGVycy5nZXRVbmlxdWVJZCgpO1xuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICBsYXJvdXhfYW5pbS5kYXRhLnB1c2gobmV3YW5pbSk7XG4gICAgICAgICAgICBpZiAobGFyb3V4X2FuaW0uZGF0YS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobGFyb3V4X2FuaW0ub25mcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q3NzOiBmdW5jdGlvbiAobmV3YW5pbSkge1xuICAgICAgICAgICAgaWYgKG5ld2FuaW0uZnJvbSA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0uZnJvbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IGxhcm91eF9jc3MuZ2V0UHJvcGVydHkobmV3YW5pbS5vYmplY3QsIG5ld2FuaW0ucHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXdhbmltLm9iamVjdCA9IG5ld2FuaW0ub2JqZWN0LnN0eWxlO1xuICAgICAgICAgICAgbmV3YW5pbS5wcm9wZXJ0eSA9IGxhcm91eF9oZWxwZXJzLmNhbWVsQ2FzZShuZXdhbmltLnByb3BlcnR5KTtcblxuICAgICAgICAgICAgbGFyb3V4X2FuaW0uc2V0KG5ld2FuaW0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0S2V5ID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfYW5pbS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfYW5pbS5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF9hbmltLmRhdGFbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0uaWQgIT09IHVuZGVmaW5lZCAmJiBjdXJyZW50SXRlbS5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRLZXkgPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYW5pbS5kYXRhLnNwbGljZSh0YXJnZXRLZXksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25mcmFtZTogZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X2FuaW0uZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2FuaW0uZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfYW5pbS5kYXRhW2l0ZW1dO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5zdGFydFRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uc3RhcnRUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBsYXJvdXhfYW5pbS5zdGVwKGN1cnJlbnRJdGVtLCB0aW1lc3RhbXApO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGltZXN0YW1wID4gY3VycmVudEl0ZW0uc3RhcnRUaW1lICsgY3VycmVudEl0ZW0udGltZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0ucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gZG9jdW1lbnQuYm9keSAmJiBuZXdhbmltLnByb3BlcnR5ID09ICdzY3JvbGxUb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG8oMCwgY3VycmVudEl0ZW0uZnJvbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNjcm9sbFRvKDAsIGN1cnJlbnRJdGVtLmZyb20pOyB9LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ub2JqZWN0W2N1cnJlbnRJdGVtLnByb3BlcnR5XSA9IGN1cnJlbnRJdGVtLmZyb207XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbTIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhcm91eF9hbmltLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsYXJvdXhfYW5pbS5vbmZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdGVwOiBmdW5jdGlvbiAobmV3YW5pbSwgdGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgZmluaXNoVCA9IG5ld2FuaW0uc3RhcnRUaW1lICsgbmV3YW5pbS50aW1lLFxuICAgICAgICAgICAgICAgIHNoaWZ0ID0gKHRpbWVzdGFtcCA+IGZpbmlzaFQpID8gMSA6ICh0aW1lc3RhbXAgLSBuZXdhbmltLnN0YXJ0VGltZSkgLyBuZXdhbmltLnRpbWU7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxhcm91eF9hbmltLmZ4LmludGVycG9sYXRlKFxuICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSxcbiAgICAgICAgICAgICAgICBuZXdhbmltLnRvLFxuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmZ4LmVhc2luZyhzaGlmdClcbiAgICAgICAgICAgICkgKyBuZXdhbmltLnVuaXQ7XG5cbiAgICAgICAgICAgIGlmIChuZXdhbmltLm9iamVjdCA9PT0gZG9jdW1lbnQuYm9keSAmJiBuZXdhbmltLnByb3BlcnR5ID09ICdzY3JvbGxUb3AnKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG8oMCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzY3JvbGxUbygwLCB2YWx1ZSk7IH0sIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLm9iamVjdFtuZXdhbmltLnByb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfYW5pbTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyBjc3NcbiAgICB2YXIgbGFyb3V4X2NzcyA9IHtcbiAgICAgICAgLy8gY2xhc3MgZmVhdHVyZXNcbiAgICAgICAgaGFzQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGN5Y2xlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50cywgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1soaSArIDEpICUgbGVuZ3RoXS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gc3R5bGUgZmVhdHVyZXNcbiAgICAgICAgZ2V0UHJvcGVydHk6IGZ1bmN0aW9uIChlbGVtZW50LCBzdHlsZU5hbWUpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIHN0eWxlTmFtZSA9IGxhcm91eF9oZWxwZXJzLmFudGlDYW1lbENhc2Uoc3R5bGVOYW1lKTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0eWxlLmdldFByb3BlcnR5VmFsdWUoc3R5bGVOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRQcm9wZXJ0eTogZnVuY3Rpb24gKGVsZW1lbnQsIHByb3BlcnRpZXMsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkUHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbb2xkUHJvcGVydGllc10gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgc3R5bGVOYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoc3R5bGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3U3R5bGVOYW1lID0gbGFyb3V4X2hlbHBlcnMuY2FtZWxDYXNlKHN0eWxlTmFtZSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uc3R5bGVbbmV3U3R5bGVOYW1lXSA9IHByb3BlcnRpZXNbc3R5bGVOYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gdHJhbnNpdGlvbiBmZWF0dXJlc1xuICAgICAgICBkZWZhdWx0VHJhbnNpdGlvbjogJzJzIGVhc2UnLFxuXG4gICAgICAgIHNldFRyYW5zaXRpb25TaW5nbGU6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KHRyYW5zaXRpb24pLFxuICAgICAgICAgICAgICAgIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnMgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd0cmFuc2l0aW9uJykgfHwgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnLXdlYmtpdC10cmFuc2l0aW9uJykgfHxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnLW1zLXRyYW5zaXRpb24nKSB8fCAnJyxcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXkgPSBjdXJyZW50VHJhbnNpdGlvbnMuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0cmFuc2l0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghdHJhbnNpdGlvbnMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvblByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgIHBvcyA9IHRyYW5zaXRpb25zW2l0ZW1dLmluZGV4T2YoJyAnKTtcblxuICAgICAgICAgICAgICAgIGlmIChwb3MgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlTmFtZSA9IHRyYW5zaXRpb25zW2l0ZW1dLnN1YnN0cmluZygwLCBwb3MpO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyA9IHRyYW5zaXRpb25zW2l0ZW1dLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZU5hbWUgPSB0cmFuc2l0aW9uc1tpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvblByb3BlcnRpZXMgPSBsYXJvdXhfY3NzLmRlZmF1bHRUcmFuc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY3VycmVudFRyYW5zaXRpb25zQXJyYXkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5W2pdLnRyaW0oKS5sb2NhbGVDb21wYXJlKHN0eWxlTmFtZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5W2pdID0gc3R5bGVOYW1lICsgJyAnICsgdHJhbnNpdGlvblByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXkucHVzaChzdHlsZU5hbWUgKyAnICcgKyB0cmFuc2l0aW9uUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5qb2luKCcsICcpO1xuXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5tc1RyYW5zaXRpb24gPSB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNpdGlvbikge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uU2luZ2xlKGVsZW1lbnRzW2ldLCB0cmFuc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNpdGlvblByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5ICcgKyB0cmFuc2l0aW9uUHJvcGVydGllcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnQsIHsgb3BhY2l0eTogMSB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNpdGlvblByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5ICcgKyB0cmFuc2l0aW9uUHJvcGVydGllcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50LCAnb3BhY2l0eScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnQsIHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBtZWFzdXJlbWVudCBmZWF0dXJlc1xuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRob3V0IHBhZGRpbmcsIG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIGhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnaGVpZ2h0Jyk7XG5cbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQuZ2V0RmxvYXRWYWx1ZShoZWlnaHQucHJpbWl0aXZlVHlwZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGJ1dCB3aXRob3V0IG1hcmdpbiBhbmQgYm9yZGVyXG4gICAgICAgIGlubmVySGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBhbmQgYm9yZGVyIGJ1dCBtYXJnaW4gb3B0aW9uYWxcbiAgICAgICAgb3V0ZXJIZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50LCBpbmNsdWRlTWFyZ2luKSB7XG4gICAgICAgICAgICBpZiAoaW5jbHVkZU1hcmdpbiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBtYXJnaW5Ub3AgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tdG9wJyksXG4gICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLWJvdHRvbScpLFxuICAgICAgICAgICAgICAgIG1hcmdpbnMgPSBtYXJnaW5Ub3AuZ2V0RmxvYXRWYWx1ZShtYXJnaW5Ub3AucHJpbWl0aXZlVHlwZSkgK1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b20uZ2V0RmxvYXRWYWx1ZShtYXJnaW5Cb3R0b20ucHJpbWl0aXZlVHlwZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoZWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtYXJnaW5zKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGhvdXQgcGFkZGluZywgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgd2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ3dpZHRoJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQuZ2V0RmxvYXRWYWx1ZShoZWlnaHQucHJpbWl0aXZlVHlwZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYnV0IHdpdGhvdXQgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaW5uZXJXaWR0aDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGFuZCBib3JkZXIgYnV0IG1hcmdpbiBvcHRpb25hbFxuICAgICAgICBvdXRlcldpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCwgaW5jbHVkZU1hcmdpbikge1xuICAgICAgICAgICAgaWYgKGluY2x1ZGVNYXJnaW4gfHwgZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBtYXJnaW5MZWZ0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLWxlZnQnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5SaWdodCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi1yaWdodCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpbnMgPSBtYXJnaW5MZWZ0LmdldEZsb2F0VmFsdWUobWFyZ2luTGVmdC5wcmltaXRpdmVUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0LmdldEZsb2F0VmFsdWUobWFyZ2luUmlnaHQucHJpbWl0aXZlVHlwZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoZWxlbWVudC5vZmZzZXRXaWR0aCArIG1hcmdpbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvcDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArXG4gICAgICAgICAgICAgICAgKChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxlZnQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0ICtcbiAgICAgICAgICAgICAgICAoKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCkgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhYm92ZVRoZVRvcDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSA8PSAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJlbG93VGhlRm9sZDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCA+IGlubmVySGVpZ2h0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGxlZnRPZlNjcmVlbjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IDw9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmlnaHRPZlNjcmVlbjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgPiBpbm5lcldpZHRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluVmlld3BvcnQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIHJldHVybiAhKHJlY3QuYm90dG9tIDw9IDAgfHwgcmVjdC50b3AgPiBpbm5lckhlaWdodCB8fFxuICAgICAgICAgICAgICAgIHJlY3QucmlnaHQgPD0gMCB8fCByZWN0LmxlZnQgPiBpbm5lcldpZHRoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2NzcztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBkYXRlXG4gICAgdmFyIGxhcm91eF9kYXRlID0ge1xuICAgICAgICBzaG9ydERhdGVGb3JtYXQ6ICdkZC5NTS55eXl5JyxcbiAgICAgICAgbG9uZ0RhdGVGb3JtYXQ6ICdkZCBNTU1NIHl5eXknLFxuICAgICAgICB0aW1lRm9ybWF0OiAnSEg6bW0nLFxuXG4gICAgICAgIG1vbnRoc1Nob3J0OiBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ10sXG4gICAgICAgIG1vbnRoc0xvbmc6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLFxuXG4gICAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgICAgIG5vdzogICAgICdub3cnLFxuICAgICAgICAgICAgbGF0ZXI6ICAgJ2xhdGVyJyxcbiAgICAgICAgICAgIGFnbzogICAgICdhZ28nLFxuICAgICAgICAgICAgc2Vjb25kczogJ3NlY29uZHMnLFxuICAgICAgICAgICAgYW1pbnV0ZTogJ2EgbWludXRlJyxcbiAgICAgICAgICAgIG1pbnV0ZXM6ICdtaW51dGVzJyxcbiAgICAgICAgICAgIGFob3VyOiAgICdhIGhvdXInLFxuICAgICAgICAgICAgaG91cnM6ICAgJ2hvdXJzJyxcbiAgICAgICAgICAgIGFkYXk6ICAgICdhIGRheScsXG4gICAgICAgICAgICBkYXlzOiAgICAnZGF5cycsXG4gICAgICAgICAgICBhd2VlazogICAnYSB3ZWVrJyxcbiAgICAgICAgICAgIHdlZWtzOiAgICd3ZWVrcycsXG4gICAgICAgICAgICBhbW9udGg6ICAnYSBtb250aCcsXG4gICAgICAgICAgICBtb250aHM6ICAnbW9udGhzJyxcbiAgICAgICAgICAgIGF5ZWFyOiAgICdhIHllYXInLFxuICAgICAgICAgICAgeWVhcnM6ICAgJ3llYXJzJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlRXBvY2g6IGZ1bmN0aW9uICh0aW1lc3BhbiwgbGltaXRXaXRoV2Vla3MpIHtcbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gMTAwMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLnNlY29uZHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYW1pbnV0ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLm1pbnV0ZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFob3VyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MuaG91cnM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFkYXk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5kYXlzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCA0ICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg3ICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmF3ZWVrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Mud2Vla3M7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsaW1pdFdpdGhXZWVrcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZXNwYW4gPCAzMCAqIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAoMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYW1vbnRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubW9udGhzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzNjUgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmF5ZWFyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLnllYXJzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEN1c3RvbURhdGVTdHJpbmc6IGZ1bmN0aW9uIChmb3JtYXQsIGRhdGUpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAveXl5eXx5eXxNTU1NfE1NTXxNTXxNfGRkfGR8aGh8aHxISHxIfG1tfG18c3N8c3x0dHx0L2csXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneXl5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldEZ1bGxZZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAneXknOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRZZWFyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU1NTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUubW9udGhzTG9uZ1tub3cuZ2V0TW9udGgoKV07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNTaG9ydFtub3cuZ2V0TW9udGgoKV07XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyAobm93LmdldE1vbnRoKCkgKyAxKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0TW9udGgoKSArIDE7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0RGF0ZSgpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXREYXRlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaGgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIxID0gbm93LmdldEhvdXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArICgoKGhvdXIxICUgMTIpID4gMCkgPyBob3VyMSAlIDEyIDogMTIpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXIyID0gbm93LmdldEhvdXJzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKChob3VyMiAlIDEyKSA+IDApID8gaG91cjIgJSAxMiA6IDEyO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0hIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgbm93LmdldEhvdXJzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldEhvdXJzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0TWludXRlcygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0U2Vjb25kcygpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRTZWNvbmRzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdy5nZXRIb3VycygpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwbSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnYW0nO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdy5nZXRIb3VycygpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERhdGVEaWZmU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBub3cgLSBkYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBhYnNUaW1lc3BhbiA9IE1hdGguYWJzKHRpbWVzcGFuKSxcbiAgICAgICAgICAgICAgICBwYXN0ID0gKHRpbWVzcGFuID4gMCk7XG5cbiAgICAgICAgICAgIGlmIChhYnNUaW1lc3BhbiA8PSAzMDAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3Mubm93O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGltZXNwYW5zdHJpbmcgPSBsYXJvdXhfZGF0ZS5wYXJzZUVwb2NoKGFic1RpbWVzcGFuLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICh0aW1lc3BhbnN0cmluZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbnN0cmluZyArXG4gICAgICAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICAgICAgIChwYXN0ID8gbGFyb3V4X2RhdGUuc3RyaW5ncy5hZ28gOiBsYXJvdXhfZGF0ZS5zdHJpbmdzLmxhdGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldFNob3J0RGF0ZVN0cmluZyhkYXRlLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTaG9ydERhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlLCBpbmNsdWRlVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldEN1c3RvbURhdGVTdHJpbmcoXG4gICAgICAgICAgICAgICAgaW5jbHVkZVRpbWUgPyBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQgKyAnICcgKyBsYXJvdXhfZGF0ZS50aW1lRm9ybWF0IDogbGFyb3V4X2RhdGUuc2hvcnREYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TG9uZ0RhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlLCBpbmNsdWRlVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLmdldEN1c3RvbURhdGVTdHJpbmcoXG4gICAgICAgICAgICAgICAgaW5jbHVkZVRpbWUgPyBsYXJvdXhfZGF0ZS5sb25nRGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5sb25nRGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICBkYXRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZGF0ZTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgICAgIC8vIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgLy8gbGFyb3V4X3RyaWdnZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudHJpZ2dlcnMuanMnKTtcblxuICAgIC8vIGRvbVxuICAgIHZhciBsYXJvdXhfZG9tID0ge1xuICAgICAgICBkb2Nwcm9wOiBmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHByb3BOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeUNsYXNzOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlUYWc6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlJZDogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0U2luZ2xlOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF0dHI6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGRBdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0ge307XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlc1tvbGRBdHRyaWJ1dGVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uIChlbGVtZW50LCBkYXRhbmFtZXMsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBkYXRhbmFtZXMuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YW5hbWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YW5hbWVzID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZERhdGFuYW1lcyA9IGRhdGFuYW1lcztcbiAgICAgICAgICAgICAgICBkYXRhbmFtZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBkYXRhbmFtZXNbb2xkRGF0YW5hbWVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBkYXRhTmFtZSBpbiBkYXRhbmFtZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGFuYW1lcy5oYXNPd25Qcm9wZXJ0eShkYXRhTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhbmFtZXNbZGF0YU5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGRhdGFOYW1lLCBkYXRhbmFtZXNbZGF0YU5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudEhpc3Rvcnk6IFtdLFxuICAgICAgICBzZXRFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGVsZW1lbnRzW2ldLCBldmVudG5hbWUsIGZuYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RXZlbnRTaW5nbGU6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGZuY1dyYXBwZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChmbmMoZSwgZWxlbWVudCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5ldmVudEhpc3RvcnkucHVzaCh7IGVsZW1lbnQ6IGVsZW1lbnQsIGV2ZW50bmFtZTogZXZlbnRuYW1lLCBmbmM6IGZuYywgZm5jV3JhcHBlcjogZm5jV3JhcHBlciB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudG5hbWUsIGZuY1dyYXBwZXIsIGZhbHNlKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bnNldEV2ZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkxID0gMCwgbGVuZ3RoMSA9IGVsZW1lbnRzLmxlbmd0aDsgaTEgPCBsZW5ndGgxOyBpMSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaTIgPSAwLCBsZW5ndGgyID0gbGFyb3V4X2RvbS5ldmVudEhpc3RvcnkubGVuZ3RoOyBpMiA8IGxlbmd0aDI7IGkyKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeVtpMl07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50c1tpMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50bmFtZSAhPT0gdW5kZWZpbmVkICYmIGl0ZW0uZXZlbnRuYW1lICE9PSBldmVudG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZuYyAhPT0gdW5kZWZpbmVkICYmIGl0ZW0uZm5jICE9PSBmbmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbS5ldmVudG5hbWUsIGl0ZW0uZm5jV3JhcHBlciwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbGFyb3V4X2RvbS5ldmVudEhpc3RvcnlbaTJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXNwYXRjaEV2ZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRuYW1lLCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgY3VzdG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjdXN0b21FdmVudFtpdGVtXSA9IGRhdGFbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1c3RvbUV2ZW50LmluaXRFdmVudChldmVudG5hbWUsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbUV2ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgICAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcbiAgICAgICAgICAgICAgICB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG5cbiAgICAgICAgICAgIHRlbXAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBodG1sKTtcbiAgICAgICAgICAgIHdoaWxlICh0ZW1wLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRlbXAuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG51bGxpbmcgb3V0IHRoZSByZWZlcmVuY2UsIHRoZXJlIGlzIG5vIG9idmlvdXMgZGlzcG9zZSBtZXRob2RcbiAgICAgICAgICAgIHRlbXAgPSBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gZnJhZztcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMgIT09IHVuZGVmaW5lZCAmJiBhdHRyaWJ1dGVzLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKGl0ZW0sIGF0dHJpYnV0ZXNbaXRlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiBjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjaGlsZHJlbi5oYXNPd25Qcm9wZXJ0eShpdGVtMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoaXRlbTIsIGNoaWxkcmVuW2l0ZW0yXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC8qIHR5cGVvZiBjaGlsZHJlbiA9PSAnc3RyaW5nJyAmJiAqL2NoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5hcHBlbmQoZWxlbSwgY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlT3B0aW9uOiBmdW5jdGlvbiAoZWxlbWVudCwga2V5LCB2YWx1ZSwgaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICAvKiBvbGQgYmVoYXZpb3VyLCBkb2VzIG5vdCBzdXBwb3J0IG9wdGdyb3VwcyBhcyBwYXJlbnRzLlxuICAgICAgICAgICAgdmFyIGNvdW50ID0gZWxlbWVudC5vcHRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGVsZW1lbnQub3B0aW9uc1tjb3VudF0gPSBuZXcgT3B0aW9uKHZhbHVlLCBrZXkpO1xuXG4gICAgICAgICAgICBpZiAoaXNEZWZhdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zLnNlbGVjdGVkSW5kZXggPSBjb3VudCAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB2YXIgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnT1BUSU9OJyk7XG4gICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSk7XG4gICAgICAgICAgICBpZiAoaXNEZWZhdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKG9wdGlvbiwgdmFsdWUpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5VmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnQub3B0aW9ucy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbaV0uZ2V0QXR0cmlidXRlKCd2YWx1ZScpID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwvKixcblxuICAgICAgICAvLyBUT0RPOiBpdCdzIHJlZHVuZGFudCBmb3Igbm93XG4gICAgICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGltYWdlcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnSU1HJyk7XG4gICAgICAgICAgICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdzcmMnLCBhcmd1bWVudHNbaV0pO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VzLnB1c2goaW1hZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW1hZ2VzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRBc3luY1NjcmlwdDogZnVuY3Rpb24gKHBhdGgsIHRyaWdnZXJOYW1lLCBhc3luYykge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuICAgICAgICAgICAgZWxlbS50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgICBlbGVtLmFzeW5jID0gKGFzeW5jICE9PSB1bmRlZmluZWQpID8gYXN5bmMgOiB0cnVlO1xuICAgICAgICAgICAgZWxlbS5zcmMgPSBwYXRoO1xuXG4gICAgICAgICAgICB2YXIgbG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgoZWxlbS5yZWFkeVN0YXRlICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJyAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdsb2FkZWQnKSB8fCBsb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdHJpZ2dlck5hbWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlck5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5vbnRyaWdnZXIodHJpZ2dlck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQXN5bmNTdHlsZTogZnVuY3Rpb24gKHBhdGgsIHRyaWdnZXJOYW1lLCBhc3luYykge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSU5LJyk7XG5cbiAgICAgICAgICAgIGVsZW0udHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgICAgICBlbGVtLmFzeW5jID0gKGFzeW5jICE9PSB1bmRlZmluZWQpID8gYXN5bmMgOiB0cnVlO1xuICAgICAgICAgICAgZWxlbS5ocmVmID0gcGF0aDtcbiAgICAgICAgICAgIGVsZW0ucmVsID0gJ3N0eWxlc2hlZXQnO1xuXG4gICAgICAgICAgICB2YXIgbG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBlbGVtLm9ubG9hZCA9IGVsZW0ub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgoZWxlbS5yZWFkeVN0YXRlICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJyAmJiBlbGVtLnJlYWR5U3RhdGUgIT09ICdsb2FkZWQnKSB8fCBsb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdHJpZ2dlck5hbWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlck5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5vbnRyaWdnZXIodHJpZ2dlck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgfSwqL1xuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluc2VydDogZnVuY3Rpb24gKGVsZW1lbnQsIHBvc2l0aW9uLCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChwb3NpdGlvbiwgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJlcGVuZDogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlVGV4dDogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIC8vIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb25lUmV0dXJuOiAwLFxuICAgICAgICBjbG9uZUFwcGVuZDogMSxcbiAgICAgICAgY2xvbmVJbnNlcnRBZnRlcjogMixcbiAgICAgICAgY2xvbmVJbnNlcnRCZWZvcmU6IDMsXG5cbiAgICAgICAgY2xvbmU6IGZ1bmN0aW9uIChlbGVtZW50LCB0eXBlLCBjb250YWluZXIsIHRhcmdldCkge1xuICAgICAgICAgICAgdmFyIG5ld0VsZW1lbnQgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZWxlbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlICE9IGxhcm91eF9kb20uY2xvbmVSZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lQXBwZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUluc2VydEFmdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobmV3RWxlbWVudCwgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyB0eXBlID09IGxhcm91eF9kb20uY2xvbmVJbnNlcnRCZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ld0VsZW1lbnQ7XG4gICAgICAgIH0vKixcblxuICAgICAgICAvLyBUT0RPOiBpdCdzIHJlZHVuZGFudCBmb3Igbm93XG4gICAgICAgIGFwcGx5T3BlcmF0aW9uczogZnVuY3Rpb24gKGVsZW1lbnQsIG9wZXJhdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIG9wZXJhdGlvbiBpbiBvcGVyYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcGVyYXRpb25zLmhhc093blByb3BlcnR5KG9wZXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYmluZGluZyBpbiBvcGVyYXRpb25zW29wZXJhdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvcGVyYXRpb25zW29wZXJhdGlvbl0uaGFzT3duUHJvcGVydHkoYmluZGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3BlcmF0aW9uc1tvcGVyYXRpb25dW2JpbmRpbmddO1xuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzZXRwcm9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZy5zdWJzdHJpbmcoMCwgMSkgPT0gJ18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRwcm9wJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZy5zdWJzdHJpbmcoMCwgMSkgPT0gJ18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpLCBlbGVtZW50LmdldEF0dHJpYnV0ZShiaW5kaW5nLnN1YnN0cmluZygxKSkgKyB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZXByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5zdWJzdHJpbmcoMCwgMSkgPT0gJ18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHZhbHVlLnN1YnN0cmluZygxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWRkY2xhc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3MuYWRkQ2xhc3MoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3ZlY2xhc3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3MucmVtb3ZlQ2xhc3MoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWRkc3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgYmluZGluZywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3Zlc3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgdmFsdWUsICdpbmhlcml0ICFpbXBvcnRhbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlcGVhdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wZXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0qL1xuICAgIH07XG5cbiAgICAvLyBhIGZpeCBmb3IgSW50ZXJuZXQgRXhwbG9yZXJcbiAgICBpZiAodHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChFbGVtZW50LnByb3RvdHlwZS5yZW1vdmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGFyb3V4X2RvbTtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBldmVudHNcbiAgICB2YXIgbGFyb3V4X2V2ZW50cyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcblxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChldmVudCwgZm5jKSB7XG4gICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcy5wdXNoKHsgZXZlbnQ6IGV2ZW50LCBmbmM6IGZuYyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnZva2U6IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmV2ZW50ICE9IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzW2l0ZW1dLmZuYyhhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2V2ZW50cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfYWpheCA9IHJlcXVpcmUoJy4vbGFyb3V4LmFqYXguanMnKTtcblxuICAgIC8vIGZvcm1zXG4gICAgdmFyIGxhcm91eF9mb3JtcyA9IHtcbiAgICAgICAgYWpheEZvcm06IGZ1bmN0aW9uIChmb3Jtb2JqLCBmbmMsIGZuY0JlZ2luKSB7XG4gICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KGZvcm1vYmosICdzdWJtaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuY0JlZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm5jQmVnaW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC5wb3N0KFxuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLmdldEF0dHJpYnV0ZSgnYWN0aW9uJyksXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9mb3Jtcy5zZXJpYWxpemVGb3JtRGF0YShmb3Jtb2JqKSxcbiAgICAgICAgICAgICAgICAgICAgZm5jXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRm9ybUZpZWxkOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdGSUxFJyB8fCB0eXBlID09PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT09ICdSQURJTycgfHwgdHlwZSA9PT0gJ1RFWFQnIHx8IHR5cGUgPT09ICdQQVNTV09SRCcgfHwgdHlwZSA9PT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRGb3JtRmllbGRWYWx1ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub3B0aW9uc1tlbGVtZW50LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ0ZJTEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT09ICdSQURJTycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ1RFWFQnIHx8IHR5cGUgPT09ICdQQVNTV09SRCcgfHwgdHlwZSA9PT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Rm9ybUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgb3B0aW9uIGluIGVsZW1lbnQub3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShvcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnNbb3B0aW9uXS52YWx1ZSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gb3B0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdGSUxFJykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbGVzWzBdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnQ0hFQ0tCT1gnIHx8IHR5cGUgPT0gJ1JBRElPJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT0gZWxlbWVudC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnVEVYVCcgfHwgdHlwZSA9PSAnUEFTU1dPUkQnIHx8IHR5cGUgPT0gJ0hJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUZvcm1FZGl0aW5nOiBmdW5jdGlvbiAoZm9ybW9iaiwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm9ybW9iai5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJykgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybW9iai5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGFzdC1lbmFibGVkJywgJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1sYXN0LWVuYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2Zvcm1zLmlzRm9ybUZpZWxkKHNlbGVjdGlvbltzZWxlY3RlZF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBsYXN0RGlzYWJsZWQgPSBzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdERpc2FibGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnNldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3REaXNhYmxlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1sYXN0LWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uW3NlbGVjdGVkXS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmlhbGl6ZUZvcm1EYXRhOiBmdW5jdGlvbiAoZm9ybW9iaikge1xuICAgICAgICAgICAgdmFyIGZvcm1kYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfZm9ybXMuZ2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWRhdGEuYXBwZW5kKHNlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmb3JtZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChmb3Jtb2JqKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXJvdXhfZm9ybXMuZ2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzW3NlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoZm9ybW9iaiwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Zvcm1zLnNldEZvcm1GaWVsZFZhbHVlKHNlbGVjdGlvbltzZWxlY3RlZF0sIGRhdGFbc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZm9ybXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gaGVscGVyc1xuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHtcbiAgICAgICAgdW5pcXVlSWQ6IDAsXG5cbiAgICAgICAgZ2V0VW5pcXVlSWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICByZXR1cm4gJ3VpZC0nICsgKCsrbGFyb3V4X2hlbHBlcnMudW5pcXVlSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkUXVlcnlTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZXMsIHJmYzM5ODYpIHtcbiAgICAgICAgICAgIHZhciB1cmkgPSAnJyxcbiAgICAgICAgICAgICAgICByZWdFeCA9IC8lMjAvZztcblxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1tuYW1lXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZmMzOTg2IHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmkgKz0gJyYnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpLnJlcGxhY2UocmVnRXgsICcrJykgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVzW25hbWVdLnRvU3RyaW5nKCkpLnJlcGxhY2UocmVnRXgsICcrJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmkgKz0gJyYnICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tuYW1lXS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHVyaS5zdWJzdHIoMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRGb3JtRGF0YTogZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1tuYW1lXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuYXBwZW5kKG5hbWUsIHZhbHVlc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3MpLnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uICgpIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3MpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlQWxsOiBmdW5jdGlvbiAodGV4dCwgZGljdGlvbmFyeSkge1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChPYmplY3Qua2V5cyhkaWN0aW9uYXJ5KS5qb2luKCd8JyksICdnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgcmUsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaWN0aW9uYXJ5W21hdGNoXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbWVsQ2FzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJDaGFyID0gdmFsdWUuY2hhckF0KGopO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyQ2hhciA9PSAnLScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dCArPSAoIWZsYWcpID8gY3VyckNoYXIgOiBjdXJyQ2hhci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBhbnRpQ2FtZWxDYXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyQ2hhciA9IHZhbHVlLmNoYXJBdChqKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckNoYXIgIT0gJy0nICYmIGN1cnJDaGFyID09IGN1cnJDaGFyLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9ICctJyArIGN1cnJDaGFyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBjdXJyQ2hhcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBxdW90ZUF0dHI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csICcmYXBvczsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcclxcbi9nLCAnJiMxMzsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHJcXG5dL2csICcmIzEzOycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNwbGljZVN0cmluZzogZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY291bnQsIGFkZCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIGluZGV4KSArIChhZGQgfHwgJycpICsgdmFsdWUuc2xpY2UoaW5kZXggKyBjb3VudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgICAgICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmQ6IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICBvYmouc29tZShmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXh0ZW5kT2JqZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICBpc0FycmF5ID0gdGFyZ2V0IGluc3RhbmNlb2YgQXJyYXk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBhcmd1bWVudHNbaXRlbV0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRhcmdldC5wdXNoKGFyZ3VtZW50c1tpdGVtXVtuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qIHRhcmdldFtuYW1lXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgdGFyZ2V0W25hbWVdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5leHRlbmRPYmplY3QodGFyZ2V0W25hbWVdLCBhcmd1bWVudHNbaXRlbV1bbmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBhcmd1bWVudHNbaXRlbV1bbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVhY2g6IGZ1bmN0aW9uIChhcnIsIGZuYywgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZuYyhpdGVtLCBhcnJbaXRlbV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFwOiBmdW5jdGlvbiAoYXJyLCBmbmMsIGRvbnRTa2lwUmV0dXJucywgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYyhhcnJbaXRlbV0sIGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb250U2tpcFJldHVybnMgfHwgcmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSxcblxuICAgICAgICBpbmRleDogZnVuY3Rpb24gKGFyciwgdmFsdWUsIHRlc3RPd25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0T3duUHJvcGVydGllcyAmJiAhYXJyLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChhcnJbaXRlbV0gPT09IG9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFlYWNoOiBmdW5jdGlvbiAoYXJyLCBmbmMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZm5jKGksIGFycltpXSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfSxcblxuICAgICAgICBhbWFwOiBmdW5jdGlvbiAoYXJyLCBmbmMsIGRvbnRTa2lwUmV0dXJucykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMoYXJyW2ldLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZG9udFNraXBSZXR1cm5zIHx8IHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMudW5zaGlmdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWluZGV4OiBmdW5jdGlvbiAoYXJyLCB2YWx1ZSwgc3RhcnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAoc3RhcnQgfHwgMCksIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbHVtbjogZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMubWFwKG9iaiwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaHVmZmxlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgIHNodWZmbGVkID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJhbmQgPSBsYXJvdXhfaGVscGVycy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHNodWZmbGVkW2luZGV4KytdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICAgICAgICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBvYmpbaXRlbV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzaHVmZmxlZDtcbiAgICAgICAgfSxcblxuICAgICAgICBtZXJnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgdG1wID0gdGFyZ2V0LFxuICAgICAgICAgICAgICAgIGlzQXJyYXkgPSB0bXAgaW5zdGFuY2VvZiBBcnJheTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgPSB0bXAuY29uY2F0KGFyZ3VtZW50c1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gYXJndW1lbnRzW2l0ZW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXJndW1lbnRzW2l0ZW1dLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRtcFthdHRyXSA9IGFyZ3VtZW50c1tpdGVtXVthdHRyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0bXA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHVwbGljYXRlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0FycmF5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpdGVtcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBvYmpbaV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRBc0FycmF5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXM7XG5cbiAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gb2JqO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBOb2RlTGlzdCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zW2ldID0gb2JqW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBbb2JqXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExlbmd0aDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRLZXlzUmVjdXJzaXZlOiBmdW5jdGlvbiAob2JqLCBkZWxpbWl0ZXIsIHByZWZpeCwga2V5cykge1xuICAgICAgICAgICAgaWYgKGRlbGltaXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gJy4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwcmVmaXggPSAnJztcbiAgICAgICAgICAgICAgICBrZXlzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKHByZWZpeCArIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9ialtpdGVtXSAhPT0gdW5kZWZpbmVkICYmIG9ialtpdGVtXSAhPT0gbnVsbCAmJiBvYmpbaXRlbV0uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5nZXRLZXlzUmVjdXJzaXZlKG9ialtpdGVtXSwgZGVsaW1pdGVyLCBwcmVmaXggKyBpdGVtICsgZGVsaW1pdGVyLCBrZXlzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRFbGVtZW50OiBmdW5jdGlvbiAob2JqLCBwYXRoLCBkZWZhdWx0VmFsdWUsIGRlbGltaXRlcikge1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbGltaXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gJy4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcG9zID0gcGF0aC5pbmRleE9mKGRlbGltaXRlcik7XG4gICAgICAgICAgICB2YXIga2V5O1xuICAgICAgICAgICAgdmFyIHJlc3Q7XG4gICAgICAgICAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhdGg7XG4gICAgICAgICAgICAgICAgcmVzdCA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHBhdGguc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgcmVzdCA9IHBhdGguc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIShrZXkgaW4gb2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXN0ID09PSBudWxsIHx8IHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChvYmpba2V5XSwgcmVzdCwgZGVmYXVsdFZhbHVlLCBkZWxpbWl0ZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfaGVscGVycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfZm9ybXMgPSByZXF1aXJlKCcuL2xhcm91eC5mb3Jtcy5qcycpO1xuXG4gICAgLy8ga2V5c1xuICAgIHZhciBsYXJvdXhfa2V5cyA9IHtcbiAgICAgICAga2V5TmFtZTogZnVuY3Rpb24gKGtleWNvZGUpIHtcbiAgICAgICAgICAgIGtleWNvZGUgPSBrZXljb2RlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoa2V5Y29kZSkge1xuICAgICAgICAgICAgY2FzZSAnYmFja3NwYWNlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gODtcblxuICAgICAgICAgICAgY2FzZSAndGFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gOTtcblxuICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxuICAgICAgICAgICAgY2FzZSAncmV0dXJuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTM7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VzYyc6XG4gICAgICAgICAgICBjYXNlICdlc2NhcGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAyNztcblxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzMjtcblxuICAgICAgICAgICAgY2FzZSAncGd1cCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDMzO1xuXG4gICAgICAgICAgICBjYXNlICdwZ2RuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzQ7XG5cbiAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM1O1xuXG4gICAgICAgICAgICBjYXNlICdob21lJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNztcblxuICAgICAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzODtcblxuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzOTtcblxuICAgICAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDQwO1xuXG4gICAgICAgICAgICBjYXNlICdpbnNlcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiA0NTtcblxuICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gNDY7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTEyO1xuXG4gICAgICAgICAgICBjYXNlICdmMic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExMztcblxuICAgICAgICAgICAgY2FzZSAnZjMnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTQ7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE1O1xuXG4gICAgICAgICAgICBjYXNlICdmNSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNjtcblxuICAgICAgICAgICAgY2FzZSAnZjYnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTc7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y3JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE4O1xuXG4gICAgICAgICAgICBjYXNlICdmOCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExOTtcblxuICAgICAgICAgICAgY2FzZSAnZjknOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjA7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxMCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMTtcblxuICAgICAgICAgICAgY2FzZSAnZjExJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIyO1xuXG4gICAgICAgICAgICBjYXNlICdmMTInOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjM7XG5cbiAgICAgICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxODg7XG5cbiAgICAgICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgICAgIHJldHVybiAxOTA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleWNvZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHt0YXJnZXQsIGtleSwgc2hpZnQsIGN0cmwsIGFsdCwgZGlzYWJsZUlucHV0cywgZm5jfVxuICAgICAgICBhc3NpZ246IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgICAgIGlmICghZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgZXYgPSBldmVudDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IGV2LnRhcmdldCB8fCBldi5zcmNFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAzIHx8IGVsZW1lbnQubm9kZVR5cGUgPT09IDExKSB7IC8vIGVsZW1lbnQubm9kZVR5cGUgPT09IDEgfHxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kaXNhYmxlSW5wdXRzICYmIGxhcm91eF9mb3Jtcy5pc0Zvcm1GaWVsZChlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hpZnQgJiYgIWV2LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jdHJsICYmICFldi5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5hbHQgJiYgIWV2LmFsdEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGxhcm91eF9rZXlzLmtleU5hbWUob3B0aW9ucy5rZXkpO1xuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09IChldi5rZXlDb2RlIHx8IGV2LndoaWNoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5mbmMoZXYpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudChvcHRpb25zLnRhcmdldCB8fCBkb2N1bWVudCwgJ2tleWRvd24nLCB3cmFwcGVyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X2tleXM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyksXG4gICAgICAgIGxhcm91eF9zdGFjayA9IHJlcXVpcmUoJy4vbGFyb3V4LnN0YWNrLmpzJyk7XG5cbiAgICAvLyBtdmNcbiAgICB2YXIgbGFyb3V4X212YyA9IHtcbiAgICAgICAgYXBwczoge30sXG4gICAgICAgIHBhdXNlVXBkYXRlOiBmYWxzZSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gbGFyb3V4X2RvbS5zZWxlY3RCeUlkKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiAobW9kZWwuY29uc3RydWN0b3IgIT09IGxhcm91eF9zdGFjaykge1xuICAgICAgICAgICAgLy8gICAgIG1vZGVsID0gbmV3IGxhcm91eF9zdGFjayhtb2RlbCk7XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIHZhciBhcHBLZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaWQnKTtcblxuICAgICAgICAgICAgbW9kZWwub251cGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9tdmMucGF1c2VVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X212Yy51cGRhdGUoYXBwS2V5KTsgLy8gLCBbZXZlbnQua2V5XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMuYXBwc1thcHBLZXldID0ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsIC8vICxcbiAgICAgICAgICAgICAgICAvLyBtb2RlbEtleXM6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gYm91bmRFbGVtZW50czogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBldmVudEVsZW1lbnRzOiBudWxsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfbXZjLnJlYmluZChhcHBLZXkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYmluZDogZnVuY3Rpb24gKGFwcEtleSkge1xuICAgICAgICAgICAgdmFyIGFwcCA9IGxhcm91eF9tdmMuYXBwc1thcHBLZXldO1xuICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgIGFwcC5tb2RlbEtleXMgPSBsYXJvdXhfaGVscGVycy5nZXRLZXlzUmVjdXJzaXZlKGFwcC5tb2RlbC5fZGF0YSk7IC8vIEZJWE1FOiB3b3JrcyBvbmx5IGZvciAkbC5zdGFja1xuICAgICAgICAgICAgYXBwLmJvdW5kRWxlbWVudHMgPSB7fTtcbiAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzID0gW107XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMuc2NhbkVsZW1lbnRzKGFwcCwgYXBwLmVsZW1lbnQpO1xuICAgICAgICAgICAgbGFyb3V4X212Yy51cGRhdGUoYXBwS2V5KTtcblxuICAgICAgICAgICAgdmFyIGZuYyA9IGZ1bmN0aW9uIChldiwgZWxlbSkge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nID0gbGFyb3V4X212Yy5iaW5kU3RyaW5nUGFyc2VyKGVsZW0uZ2V0QXR0cmlidXRlKCdsci1ldmVudCcpKTtcbiAgICAgICAgICAgICAgICAvLyBsYXJvdXhfbXZjLnBhdXNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gPT09IG51bGwgfHwgIWJpbmRpbmcuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdbaXRlbV0uY2hhckF0KDApID09ICdcXCcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAubW9kZWxbaXRlbV0gPSBiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZygxLCBiaW5kaW5nW2l0ZW1dLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDAsIDUpID09ICdhdHRyLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGVsZW0uZ2V0QXR0cmlidXRlKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiaW5kaW5nW2l0ZW1dLnN1YnN0cmluZygwLCA1KSA9PSAncHJvcC4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAubW9kZWxbaXRlbV0gPSBlbGVtW2JpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDUpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBsYXJvdXhfbXZjLnBhdXNlVXBkYXRlID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXBwLmV2ZW50RWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50c1tpXS5lbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50c1tpXS5iaW5kaW5nW251bGxdLFxuICAgICAgICAgICAgICAgICAgICBmbmNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNjYW5FbGVtZW50czogZnVuY3Rpb24gKGFwcCwgZWxlbWVudCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGF0dHMgPSBlbGVtZW50LmF0dHJpYnV0ZXMsIG0gPSBhdHRzLmxlbmd0aDsgaSA8IG07IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRzW2ldLm5hbWUgPT0gJ2xyLWJpbmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nMSA9IGxhcm91eF9tdmMuYmluZFN0cmluZ1BhcnNlcihhdHRzW2ldLnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGJpbmRpbmcxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJpbmRpbmcxLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHAuYm91bmRFbGVtZW50c1tiaW5kaW5nMVtpdGVtXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAuYm91bmRFbGVtZW50c1tiaW5kaW5nMVtpdGVtXV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRzW2ldLm5hbWUgPT0gJ2xyLWV2ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmluZGluZzIgPSBsYXJvdXhfbXZjLmJpbmRTdHJpbmdQYXJzZXIoYXR0c1tpXS52YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzogYmluZGluZzJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgY2hsZHJuID0gZWxlbWVudC5jaGlsZE5vZGVzLCBuID0gY2hsZHJuLmxlbmd0aDsgaiA8IG47IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChjaGxkcm5bal0ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X212Yy5zY2FuRWxlbWVudHMoYXBwLCBjaGxkcm5bal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChhcHBLZXksIGtleXMpIHtcbiAgICAgICAgICAgIHZhciBhcHAgPSBsYXJvdXhfbXZjLmFwcHNbYXBwS2V5XTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXlzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAga2V5cyA9IGFwcC5tb2RlbEtleXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGgxID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGgxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXlzW2ldIGluIGFwcC5ib3VuZEVsZW1lbnRzKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgYm91bmRFbGVtZW50ID0gYXBwLmJvdW5kRWxlbWVudHNba2V5c1tpXV07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgbGVuZ3RoMiA9IGJvdW5kRWxlbWVudC5sZW5ndGg7IGogPCBsZW5ndGgyOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDAsIDYpID09ICdzdHlsZS4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZEVsZW1lbnRbal0uZWxlbWVudC5zdHlsZVtib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg2KV0gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KGFwcC5tb2RlbCwga2V5c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNSkgPT0gJ2F0dHIuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRklYTUUgcmVtb3ZlQXR0cmlidXRlIG9uIG51bGwgdmFsdWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZEVsZW1lbnRbal0uZWxlbWVudC5zZXRBdHRyaWJ1dGUoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoNSksIGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNSkgPT0gJ3Byb3AuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRklYTUUgcmVtb3ZlQXR0cmlidXRlIG9uIG51bGwgdmFsdWU/XG4gICAgICAgICAgICAgICAgICAgICAgICBib3VuZEVsZW1lbnRbal0uZWxlbWVudFtib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg1KV0gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KGFwcC5tb2RlbCwga2V5c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmluZFN0cmluZ1BhcnNlcjogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgICAgIHZhciBsYXN0QnVmZmVyID0gbnVsbCxcbiAgICAgICAgICAgICAgICBidWZmZXIgPSAnJyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IDAsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSB0ZXh0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnIgPSB0ZXh0LmNoYXJBdChpKTtcblxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyciA9PSAnOicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RCdWZmZXIgPSBidWZmZXIudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyID09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtsYXN0QnVmZmVyXSA9IGJ1ZmZlci50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gY3VycjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2xhc3RCdWZmZXJdID0gYnVmZmVyLnRyaW0oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X212YztcblxufSgpKTtcbiIsIi8qanNsaW50IG5vbWVuOiB0cnVlICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gc3RhY2tcbiAgICB2YXIgbGFyb3V4X3N0YWNrID0gZnVuY3Rpb24gKGRhdGEsIGRlcHRoLCB0b3ApIHtcbiAgICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgICAgICB0aGlzLl9kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLl90b3AgPSB0b3AgfHwgdGhpcztcblxuICAgICAgICB0aGlzLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBkZWxldGUgdGhpcy5fZGF0YVtrZXldO1xuXG4gICAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW2tleV0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSBuZXcgbGFyb3V4X3N0YWNrKFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZXB0aCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVwdGggKyAnLicgKyBrZXkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvcFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLl9kYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RhdGFba2V5XSA9PT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuc2V0KHRoaXMsIGtleSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvcC5vbnVwZGF0ZSh7IHNjb3BlOiB0aGlzLCBrZXk6IGtleSwgb2xkVmFsdWU6IG9sZFZhbHVlLCBuZXdWYWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0UmFuZ2UgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB2YWx1ZUtleSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eSh2YWx1ZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQodmFsdWVLZXksIHZhbHVlc1t2YWx1ZUtleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1trZXldIHx8IGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0UmFuZ2UgPSBmdW5jdGlvbiAoa2V5cykge1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWtleXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFsdWVzW2tleXNbaXRlbV1dID0gdGhpc1trZXlzW2l0ZW1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fZGF0YSkubGVuZ3RoO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZXhpc3RzID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIChrZXkgaW4gdGhpcy5fZGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5IGluIHRoaXMuX2RhdGEpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1trZXldO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdGhpcy5fZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1tpdGVtXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub251cGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZXRSYW5nZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3N0YWNrO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gdGVtcGxhdGVzXG4gICAgdmFyIGxhcm91eF90ZW1wbGF0ZXMgPSB7XG4gICAgICAgIGVuZ2luZXM6IHtcbiAgICAgICAgICAgIHBsYWluOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbdGVtcGxhdGUsIG9wdGlvbnNdO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbXBpbGVkWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGljdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbmRleDtcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKG5leHRJbmRleCA9IHJlc3VsdC5pbmRleE9mKCd7eycsIGxhc3RJbmRleCkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4ICs9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xvc2VJbmRleCA9IHJlc3VsdC5pbmRleE9mKCd9fScsIG5leHRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHJlc3VsdC5zdWJzdHJpbmcobmV4dEluZGV4LCBjbG9zZUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpY3RbJ3t7JyArIGtleSArICd9fSddID0gbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChtb2RlbCwga2V5LCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBjbG9zZUluZGV4ICsgMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5yZXBsYWNlQWxsKHJlc3VsdCwgZGljdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaG9nYW46IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhvZ2FuLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkLnJlbmRlcihtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbXVzdGFjaGU6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE11c3RhY2hlLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBoYW5kbGViYXJzOiB7XG4gICAgICAgICAgICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIYW5kbGViYXJzLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChjb21waWxlZCwgbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVkKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBsb2Rhc2g6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uY29tcGlsZSh0ZW1wbGF0ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHVuZGVyc2NvcmU6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uY29tcGlsZSh0ZW1wbGF0ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW5naW5lOiAncGxhaW4nLFxuXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBjb250ZW50LCBlbmdpbmUgPSBsYXJvdXhfdGVtcGxhdGVzLmVuZ2luZXNbbGFyb3V4X3RlbXBsYXRlcy5lbmdpbmVdO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSB8fCBlbGVtZW50Lm5vZGVUeXBlID09PSAzIHx8IGVsZW1lbnQubm9kZVR5cGUgPT09IDExKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBlbGVtZW50Lm5vZGVWYWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNvbXBpbGVkID0gZW5naW5lLmNvbXBpbGUoY29udGVudCwgb3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gZW5naW5lLnJlbmRlcihjb21waWxlZCwgbW9kZWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluc2VydDogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsLCB0YXJnZXQsIHBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbGFyb3V4X3RlbXBsYXRlcy5hcHBseShlbGVtZW50LCBtb2RlbCwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGxhcm91eF9kb20uaW5zZXJ0KHRhcmdldCwgcG9zaXRpb24gfHwgJ2JlZm9yZWVuZCcsIG91dHB1dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZTogZnVuY3Rpb24gKGVsZW1lbnQsIG1vZGVsLCB0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBsYXJvdXhfdGVtcGxhdGVzLmFwcGx5KGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5yZXBsYWNlKHRhcmdldCwgb3V0cHV0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3RlbXBsYXRlcztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyB0aW1lcnNcbiAgICB2YXIgbGFyb3V4X3RpbWVycyA9IHtcbiAgICAgICAgZGF0YTogW10sXG5cbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodGltZXIpIHtcbiAgICAgICAgICAgIHRpbWVyLm5leHQgPSBEYXRlLm5vdygpICsgdGltZXIudGltZW91dDtcbiAgICAgICAgICAgIGxhcm91eF90aW1lcnMuZGF0YS5wdXNoKHRpbWVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEtleSA9IG51bGw7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3RpbWVycy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfdGltZXJzLmRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X3RpbWVycy5kYXRhW2l0ZW1dO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLmlkICE9PSB1bmRlZmluZWQgJiYgY3VycmVudEl0ZW0uaWQgPT0gaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0S2V5ID0gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGFyZ2V0S2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5kYXRhLnNwbGljZSh0YXJnZXRLZXksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb250aWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZUtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3RpbWVycy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfdGltZXJzLmRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X3RpbWVycy5kYXRhW2l0ZW1dO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLm5leHQgPD0gbm93KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBjdXJyZW50SXRlbS5vbnRpY2soY3VycmVudEl0ZW0uc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlICYmIGN1cnJlbnRJdGVtLnJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5uZXh0ID0gbm93ICsgY3VycmVudEl0ZW0udGltZW91dDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbTIgaW4gcmVtb3ZlS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtMikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5kYXRhLnNwbGljZShyZW1vdmVLZXlzW2l0ZW0yXSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90aW1lcnM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKTtcblxuICAgIC8vIHRvdWNoIC0gcGFydGlhbGx5IHRha2VuIGZyb20gJ3RvY2NhLmpzJyBwcm9qZWN0XG4gICAgLy8gICAgICAgICBjYW4gYmUgZm91bmQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9HaWFubHVjYUd1YXJpbmkvVG9jY2EuanNcbiAgICB2YXIgbGFyb3V4X3RvdWNoID0ge1xuICAgICAgICB0b3VjaFN0YXJ0ZWQ6IG51bGwsXG4gICAgICAgIHN3aXBlVHJlc2hvbGQ6IDgwLFxuICAgICAgICBwcmVjaXNpb246IDMwLFxuICAgICAgICB0YXBDb3VudDogMCxcbiAgICAgICAgdGFwVHJlc2hvbGQ6IDIwMCxcbiAgICAgICAgbG9uZ1RhcFRyZXNob2xkOiA4MDAsXG4gICAgICAgIHRhcFRpbWVyOiBudWxsLFxuICAgICAgICBwb3M6IG51bGwsXG4gICAgICAgIGNhY2hlZDogbnVsbCxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgIHN0YXJ0OiBbJ3RvdWNoc3RhcnQnLCAncG9pbnRlcmRvd24nLCAnTVNQb2ludGVyRG93bicsICdtb3VzZWRvd24nXSxcbiAgICAgICAgICAgIGVuZDogWyd0b3VjaGVuZCcsICdwb2ludGVydXAnLCAnTVNQb2ludGVyVXAnLCAnbW91c2V1cCddLFxuICAgICAgICAgICAgbW92ZTogWyd0b3VjaG1vdmUnLCAncG9pbnRlcm1vdmUnLCAnTVNQb2ludGVyTW92ZScsICdtb3VzZW1vdmUnXVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2F0ZVBvaW50ZXI6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldFRvdWNoZXMpIHtcbiAgICAgICAgICAgICAgICBldmVudCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF90b3VjaC5wb3MgPSBbZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZXTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgKG5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSA/IDIgOiAxLFxuICAgICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBldmVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGRvY3VtZW50LCBsYXJvdXhfdG91Y2guZXZlbnRzLnN0YXJ0W2V2ZW50c1tpXV0sIGxhcm91eF90b3VjaC5vbnN0YXJ0KTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlKGRvY3VtZW50LCBsYXJvdXhfdG91Y2guZXZlbnRzLmVuZFtldmVudHNbaV1dLCBsYXJvdXhfdG91Y2gub25lbmQpO1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZG9jdW1lbnQsIGxhcm91eF90b3VjaC5ldmVudHMubW92ZVtldmVudHNbaV1dLCBsYXJvdXhfdG91Y2gubG9jYXRlUG9pbnRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25zdGFydDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gubG9jYXRlUG9pbnRlcihldmVudCk7XG4gICAgICAgICAgICBsYXJvdXhfdG91Y2guY2FjaGVkID0gW2xhcm91eF90b3VjaC5wb3NbMF0sIGxhcm91eF90b3VjaC5wb3NbMV1dO1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAvKmpzbGludCBwbHVzcGx1czogdHJ1ZSAqL1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcENvdW50Kys7XG5cbiAgICAgICAgICAgIHZhciBmbmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF90b3VjaC5jYWNoZWRbMF0gPj0gbGFyb3V4X3RvdWNoLnBvc1swXSAtIGxhcm91eF90b3VjaC5wcmVjaXNpb24gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5jYWNoZWRbMF0gPD0gbGFyb3V4X3RvdWNoLnBvc1swXSArIGxhcm91eF90b3VjaC5wcmVjaXNpb24gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5jYWNoZWRbMV0gPj0gbGFyb3V4X3RvdWNoLnBvc1sxXSAtIGxhcm91eF90b3VjaC5wcmVjaXNpb24gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5jYWNoZWRbMV0gPD0gbGFyb3V4X3RvdWNoLnBvc1sxXSArIGxhcm91eF90b3VjaC5wcmVjaXNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGxhcm91eF90b3VjaC50YXBDb3VudCA9PT0gMikgPyAnZGJsdGFwJyA6ICd0YXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGxhcm91eF90b3VjaC5wb3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGxhcm91eF90b3VjaC5wb3NbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID4gbGFyb3V4X3RvdWNoLmxvbmdUYXBUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbG9uZ3RhcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lckV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogbGFyb3V4X3RvdWNoLnBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogbGFyb3V4X3RvdWNoLnBvc1sxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBUaW1lciA9IHNldFRpbWVvdXQoZm5jLCBsYXJvdXhfdG91Y2gudGFwVHJlc2hvbGQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcENvdW50ID0gMDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNsZWFyVGltZW91dChsYXJvdXhfdG91Y2gudGFwVGltZXIpO1xuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcFRpbWVyID0gc2V0VGltZW91dChmbmMsIGxhcm91eF90b3VjaC50YXBUcmVzaG9sZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25lbmQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIGRlbHRhID0gW1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gucG9zWzBdIC0gbGFyb3V4X3RvdWNoLmNhY2hlZFswXSxcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnBvc1sxXSAtIGxhcm91eF90b3VjaC5jYWNoZWRbMV1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlubmVyRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICB4OiBsYXJvdXhfdG91Y2gucG9zWzBdLFxuICAgICAgICAgICAgICAgICAgICB5OiBsYXJvdXhfdG91Y2gucG9zWzFdLFxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogTWF0aC5hYnMoZGVsdGFbMF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogTWF0aC5hYnMoZGVsdGFbMV0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKGRlbHRhWzBdIDw9IC1sYXJvdXhfdG91Y2guc3dpcGVUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChldmVudC50YXJnZXQsICdzd2lwZXJpZ2h0JywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZWx0YVswXSA+PSBsYXJvdXhfdG91Y2guc3dpcGVUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChldmVudC50YXJnZXQsICdzd2lwZWxlZnQnLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbHRhWzFdIDw9IC1sYXJvdXhfdG91Y2guc3dpcGVUcmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uZGlzcGF0Y2hFdmVudChldmVudC50YXJnZXQsICdzd2lwZWRvd24nLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbHRhWzFdID49IGxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBldXAnLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBsYXJvdXgucmVhZHkobGFyb3V4X3RvdWNoLmluaXQpO1xuXG4gICAgcmV0dXJuIGxhcm91eF90b3VjaDtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB0cmlnZ2Vyc1xuICAgIHZhciBsYXJvdXhfdHJpZ2dlcnMgPSB7XG4gICAgICAgIGRlbGVnYXRlczogW10sXG4gICAgICAgIGxpc3Q6IFtdLFxuXG4gICAgICAgIHNldDogZnVuY3Rpb24gKGNvbmRpdGlvbiwgZm5jLCBzdGF0ZSkge1xuICAgICAgICAgICAgdmFyIGNvbmRpdGlvbnMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGNvbmRpdGlvbik7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gY29uZGl0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghY29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCBjb25kaXRpb25zW2l0ZW1dKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmxpc3QucHVzaChjb25kaXRpb25zW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29uZGl0aW9uczogY29uZGl0aW9ucyxcbiAgICAgICAgICAgICAgICBmbmM6IGZuYyxcbiAgICAgICAgICAgICAgICBzdGF0ZTogc3RhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9udHJpZ2dlcjogZnVuY3Rpb24gKHRyaWdnZXJOYW1lLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRJZHggPSBsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIHRyaWdnZXJOYW1lKTtcbiAgICAgICAgICAgIGlmIChldmVudElkeCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMubGlzdC5zcGxpY2UoZXZlbnRJZHgsIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlc1tpdGVtXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGNvbmRpdGlvbktleSBpbiBjdXJyZW50SXRlbS5jb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudEl0ZW0uY29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShjb25kaXRpb25LZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb25kaXRpb25PYmogPSBjdXJyZW50SXRlbS5jb25kaXRpb25zW2NvbmRpdGlvbktleV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgY29uZGl0aW9uT2JqKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5mbmMoXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IGN1cnJlbnRJdGVtLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoYXJncylcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbTIgaW4gcmVtb3ZlS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtMikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndHJpZ2dlciBuYW1lOiAnICsgdHJpZ2dlck5hbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdHJpZ2dlcnM7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyksXG4gICAgICAgIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgbGFyb3V4X3RpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpLFxuICAgICAgICBsYXJvdXhfZGF0ZSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRhdGUuanMnKTtcblxuICAgIC8vIHVpXG4gICAgdmFyIGxhcm91eF91aSA9IHtcbiAgICAgICAgZmxvYXRDb250YWluZXI6IG51bGwsXG5cbiAgICAgICAgcG9wdXA6IHtcbiAgICAgICAgICAgIGRlZmF1bHRUaW1lb3V0OiA1MDAsXG5cbiAgICAgICAgICAgIGNyZWF0ZUJveDogZnVuY3Rpb24gKGlkLCB4Y2xhc3MsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RvbS5jcmVhdGVFbGVtZW50KCdESVYnLCB7IGlkOiBpZCwgJ2NsYXNzJzogeGNsYXNzIH0sIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbXNnYm94OiBmdW5jdGlvbiAodGltZW91dCwgbWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IGxhcm91eF9oZWxwZXJzLmdldFVuaXF1ZUlkKCksXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IGxhcm91eF91aS5wb3B1cC5jcmVhdGVCb3goaWQsICdsYXJvdXhNc2dCb3gnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZmxvYXRDb250YWluZXIuYXBwZW5kQ2hpbGQob2JqKTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkob2JqLCB7IG9wYWNpdHk6IDEgfSk7XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgb250aWNrOiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eSh4LCB7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnJlbW92ZSh4KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IG9ialxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRpbmc6IHtcbiAgICAgICAgICAgIGVsZW1lbnRTZWxlY3RvcjogbnVsbCxcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBkZWZhdWx0RGVsYXk6IDE1MDAsXG4gICAgICAgICAgICB0aW1lcjogbnVsbCxcblxuICAgICAgICAgICAga2lsbFRpbWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGxhcm91eF91aS5sb2FkaW5nLnRpbWVyKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5raWxsVGltZXIoKTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCwgeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmxvYWRpbmdJbmRpY2F0b3IgPSAnZmFsc2UnO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcua2lsbFRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxheSA9IGxhcm91eF91aS5sb2FkaW5nLmRlZmF1bHREZWxheTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBsYXJvdXhfdWkubG9hZGluZy5zaG93KDApOyB9LCBkZWxheSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50LCB7IGRpc3BsYXk6ICdibG9jaycgfSk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yID0gJ3RydWUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCA9PT0gbnVsbCAmJiBsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50U2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCA9IGxhcm91eF9kb20uc2VsZWN0U2luZ2xlKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudCh3aW5kb3csICdsb2FkJywgbGFyb3V4X3VpLmxvYWRpbmcuaGlkZSk7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQod2luZG93LCAnYmVmb3JldW5sb2FkJywgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5sb2FkaW5nSW5kaWNhdG9yICE9PSB1bmRlZmluZWQgJiYgbG9jYWxTdG9yYWdlLmxvYWRpbmdJbmRpY2F0b3IgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdygwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkeW5hbWljRGF0ZXM6IHtcbiAgICAgICAgICAgIHVwZGF0ZURhdGVzRWxlbWVudHM6IG51bGwsXG5cbiAgICAgICAgICAgIHVwZGF0ZURhdGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMgPSBsYXJvdXhfZG9tLnNlbGVjdCgnKltkYXRhLWVwb2NoXScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmogPSBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHNbaXRlbV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHNoaWZ0aW5nIChzdHIgPj4gMCkgdXNlZCBpbnN0ZWFkIG9mIHBhcnNlSW50KHN0ciwgMTApXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKG9iai5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXBvY2gnKSA+PiAwKSAqIDEwMDApO1xuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kYXRlLmdldERhdGVTdHJpbmcoZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBvYmouc2V0QXR0cmlidXRlKCd0aXRsZScsIGxhcm91eF9kYXRlLmdldExvbmdEYXRlU3RyaW5nKGRhdGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5zZXQoe1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAsXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvbnRpY2s6IGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzY3JvbGxWaWV3OiB7XG4gICAgICAgICAgICBzZWxlY3RlZEVsZW1lbnRzOiBbXSxcblxuICAgICAgICAgICAgb25oaWRkZW46IGZ1bmN0aW9uIChlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudHMsIHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudHMsIFsnb3BhY2l0eSddKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9ucmV2ZWFsOiBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGVsZW1lbnRzLCB7IG9wYWNpdHk6IDEgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9jc3MuaW5WaWV3cG9ydChlbGVtZW50c1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMucHVzaChlbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5vbmhpZGRlbihsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzKTtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIGxhcm91eF91aS5zY3JvbGxWaWV3LnJldmVhbCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZXZlYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2hlbHBlcnMuZWFjaChcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfY3NzLmluVmlld3BvcnQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHJlbW92ZUtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMuc3BsaWNlKHJlbW92ZUtleXNbaXRlbV0sIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnVuc2V0RXZlbnQod2luZG93LCAnc2Nyb2xsJywgbGFyb3V4X3VpLnNjcm9sbFZpZXcucmV2ZWFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5vbnJldmVhbChlbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUZsb2F0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWxhcm91eF91aS5mbG9hdENvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5mbG9hdENvbnRhaW5lciA9IGxhcm91eF9kb20uY3JlYXRlRWxlbWVudCgnRElWJywgeyAnY2xhc3MnOiAnbGFyb3V4RmxvYXREaXYnIH0pO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKGxhcm91eF91aS5mbG9hdENvbnRhaW5lciwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYXJvdXhfdWkuY3JlYXRlRmxvYXRDb250YWluZXIoKTtcbiAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmluaXQoKTtcbiAgICAgICAgICAgIGxhcm91eF91aS5keW5hbWljRGF0ZXMuaW5pdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGxhcm91eC5yZWFkeShsYXJvdXhfdWkuaW5pdCk7XG5cbiAgICByZXR1cm4gbGFyb3V4X3VpO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHZhcnNcbiAgICB2YXIgbGFyb3V4X3ZhcnMgPSB7XG4gICAgICAgIGNvb2tpZVBhdGg6ICcvJyxcblxuICAgICAgICBnZXRDb29raWU6IGZ1bmN0aW9uIChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz1bXjtdKycsICdpJyksXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gocmUpO1xuXG4gICAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdLnNwbGl0KCc9JylbMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldENvb2tpZTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgZXhwaXJlVmFsdWUgPSAnJztcbiAgICAgICAgICAgIGlmIChleHBpcmVzKSB7XG4gICAgICAgICAgICAgICAgZXhwaXJlVmFsdWUgPSAnOyBleHBpcmVzPScgKyBleHBpcmVzLnRvR01UU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgKyBleHBpcmVWYWx1ZSArICc7IHBhdGg9JyArIChwYXRoIHx8IGxhcm91eF92YXJzLmNvb2tpZVBhdGgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUNvb2tpZTogZnVuY3Rpb24gKG5hbWUsIHBhdGgpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9OyBleHBpcmVzPVRodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDAgR01UOyBwYXRoPScgKyAocGF0aCB8fCBsYXJvdXhfdmFycy5jb29raWVQYXRoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMb2NhbDogZnVuY3Rpb24gKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBsb2NhbFN0b3JhZ2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2VbbmFtZV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldExvY2FsOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZVtuYW1lXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVMb2NhbDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBsb2NhbFN0b3JhZ2VbbmFtZV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBzZXNzaW9uU3RvcmFnZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlW25hbWVdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlW25hbWVdID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVNlc3Npb246IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgc2Vzc2lvblN0b3JhZ2VbbmFtZV07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF92YXJzO1xuXG59KCkpO1xuIiwiLypnbG9iYWwgTm9kZUxpc3QsIE5vZGUgKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfY3NzID0gcmVxdWlyZSgnLi9sYXJvdXguY3NzLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gd3JhcHBlclxuICAgIHZhciBsYXJvdXhfd3JhcHBlciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb247XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdG9yO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgTm9kZUxpc3QpIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IGxhcm91eF9oZWxwZXJzLnRvQXJyYXkoc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gW3NlbGVjdG9yXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IGxhcm91eF9kb20uc2VsZWN0KHNlbGVjdG9yLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUoc2VsZWN0aW9uWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZShzZWxlY3Rpb24pO1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5pc0FycmF5ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZmluZCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eF93cmFwcGVyKHNlbGVjdG9yLCB0aGlzLnNvdXJjZSk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUgPSBmdW5jdGlvbiAoZWxlbWVudHMpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBlbGVtZW50cztcbiAgICAgICAgdGhpcy5pc0FycmF5ID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlW2luZGV4XTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoID0gMDtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSA9IDE7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJBcnJheSA9IDI7XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlciA9IGZ1bmN0aW9uIChuYW1lLCBmbmMsIHNjb3BlKSB7XG4gICAgICAgIHZhciBuZXdGbmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jLmFwcGx5KFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgW3RoaXMuc291cmNlXS5jb25jYXQobGFyb3V4X2hlbHBlcnMudG9BcnJheShhcmd1bWVudHMpKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHQgPT09IHVuZGVmaW5lZCkgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgICAgY2FzZSBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZTpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXk6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYXR0cicsIGxhcm91eF9kb20uYXR0ciwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdkYXRhJywgbGFyb3V4X2RvbS5kYXRhLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ29uJywgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvbicsIGxhcm91eF9kb20uc2V0RXZlbnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQXJyYXkpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvZmYnLCBsYXJvdXhfZG9tLnVuc2V0RXZlbnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2NsZWFyJywgbGFyb3V4X2RvbS5jbGVhciwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdpbnNlcnQnLCBsYXJvdXhfZG9tLmluc2VydCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdwcmVwZW5kJywgbGFyb3V4X2RvbS5wcmVwZW5kLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2FwcGVuZCcsIGxhcm91eF9kb20uYXBwZW5kLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlcGxhY2UnLCBsYXJvdXhfZG9tLnJlcGxhY2UsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVwbGFjZVRleHQnLCBsYXJvdXhfZG9tLnJlcGxhY2VUZXh0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JlbW92ZScsIGxhcm91eF9kb20ucmVtb3ZlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaGFzQ2xhc3MnLCBsYXJvdXhfY3NzLmhhc0NsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2FkZENsYXNzJywgbGFyb3V4X2Nzcy5hZGRDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVtb3ZlQ2xhc3MnLCBsYXJvdXhfY3NzLnJlbW92ZUNsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCd0b2dnbGVDbGFzcycsIGxhcm91eF9jc3MudG9nZ2xlQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2dldFByb3BlcnR5JywgbGFyb3V4X2Nzcy5nZXRQcm9wZXJ0eSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdzZXRQcm9wZXJ0eScsIGxhcm91eF9jc3Muc2V0UHJvcGVydHksIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3NldFRyYW5zaXRpb24nLCBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3Nob3cnLCBsYXJvdXhfY3NzLnNob3csIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hpZGUnLCBsYXJvdXhfY3NzLmhpZGUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2hlaWdodCcsIGxhcm91eF9jc3MuaGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2lubmVySGVpZ2h0JywgbGFyb3V4X2Nzcy5pbm5lckhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvdXRlckhlaWdodCcsIGxhcm91eF9jc3Mub3V0ZXJIZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignd2lkdGgnLCBsYXJvdXhfY3NzLndpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2lubmVyV2lkdGgnLCBsYXJvdXhfY3NzLmlubmVyV2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb3V0ZXJXaWR0aCcsIGxhcm91eF9jc3Mub3V0ZXJXaWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCd0b3AnLCBsYXJvdXhfY3NzLnRvcCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdsZWZ0JywgbGFyb3V4X2Nzcy5sZWZ0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2Fib3ZlVGhlVG9wJywgbGFyb3V4X2Nzcy5hYm92ZVRoZVRvcCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdiZWxvd1RoZUZvbGQnLCBsYXJvdXhfY3NzLmJlbG93VGhlRm9sZCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdsZWZ0T2ZTY3JlZW4nLCBsYXJvdXhfY3NzLmxlZnRPZlNjcmVlbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyaWdodE9mU2NyZWVuJywgbGFyb3V4X2Nzcy5yaWdodE9mU2NyZWVuLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2luVmlld3BvcnQnLCBsYXJvdXhfY3NzLmluVmlld3BvcnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcblxuICAgIHJldHVybiBsYXJvdXhfd3JhcHBlcjtcblxufSgpKTtcbiJdfQ==
