/**
 * laroux.js - A jquery substitute for modern browsers
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
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

},{"./laroux.ajax.js":3,"./laroux.anim.js":4,"./laroux.css.js":5,"./laroux.date.js":6,"./laroux.dom.js":7,"./laroux.events.js":8,"./laroux.forms.js":9,"./laroux.helpers.js":10,"./laroux.keys.js":11,"./laroux.mvc.js":12,"./laroux.stack.js":13,"./laroux.templates.js":14,"./laroux.timers.js":15,"./laroux.touch.js":16,"./laroux.triggers.js":17,"./laroux.ui.js":18,"./laroux.vars.js":19,"./laroux.wrapper.js":20}],3:[function(require,module,exports){
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

},{"./laroux.events.js":8,"./laroux.helpers.js":10}],4:[function(require,module,exports){
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

},{"./laroux.css.js":5,"./laroux.helpers.js":10}],5:[function(require,module,exports){
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

},{"./laroux.helpers.js":10}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./laroux.helpers.js":10}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./laroux.ajax.js":3,"./laroux.dom.js":7}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./laroux.dom.js":7,"./laroux.forms.js":9}],12:[function(require,module,exports){
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

},{"./laroux.dom.js":7,"./laroux.helpers.js":10,"./laroux.stack.js":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./laroux.dom.js":7,"./laroux.helpers.js":10}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./laroux.dom.js":7}],17:[function(require,module,exports){
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

},{"./laroux.helpers.js":10}],18:[function(require,module,exports){
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

},{"./laroux.css.js":5,"./laroux.date.js":6,"./laroux.dom.js":7,"./laroux.helpers.js":10,"./laroux.timers.js":15}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{"./laroux.css.js":5,"./laroux.dom.js":7,"./laroux.helpers.js":10}]},{},[1,2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGFyb3V4LmJhY2t3YXJkLmpzIiwic3JjL2pzL2xhcm91eC5qcyIsInNyYy9qcy9sYXJvdXguYWpheC5qcyIsInNyYy9qcy9sYXJvdXguYW5pbS5qcyIsInNyYy9qcy9sYXJvdXguY3NzLmpzIiwic3JjL2pzL2xhcm91eC5kYXRlLmpzIiwic3JjL2pzL2xhcm91eC5kb20uanMiLCJzcmMvanMvbGFyb3V4LmV2ZW50cy5qcyIsInNyYy9qcy9sYXJvdXguZm9ybXMuanMiLCJzcmMvanMvbGFyb3V4LmhlbHBlcnMuanMiLCJzcmMvanMvbGFyb3V4LmtleXMuanMiLCJzcmMvanMvbGFyb3V4Lm12Yy5qcyIsInNyYy9qcy9sYXJvdXguc3RhY2suanMiLCJzcmMvanMvbGFyb3V4LnRlbXBsYXRlcy5qcyIsInNyYy9qcy9sYXJvdXgudGltZXJzLmpzIiwic3JjL2pzL2xhcm91eC50b3VjaC5qcyIsInNyYy9qcy9sYXJvdXgudHJpZ2dlcnMuanMiLCJzcmMvanMvbGFyb3V4LnVpLmpzIiwic3JjL2pzL2xhcm91eC52YXJzLmpzIiwic3JjL2pzL2xhcm91eC53cmFwcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChzY29wZSkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBlbXB0eUZ1bmN0aW9uID0gZnVuY3Rpb24gKCkge307XG5cbiAgICBpZiAoc2NvcGUuZG9jdW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzY29wZS5kb2N1bWVudCA9IHtcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50OiBlbXB0eUZ1bmN0aW9uLFxuICAgICAgICAgICAgY3JlYXRlRXZlbnRPYmplY3Q6IGVtcHR5RnVuY3Rpb24sXG4gICAgICAgICAgICByZWFkeVN0YXRlOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gc2NvcGUpKSB7XG4gICAgICAgIHNjb3BlLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKERhdGUubm93KCkpOyB9LCA1MCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ2dldENvbXB1dGVkU3R5bGUnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS5nZXRDb21wdXRlZFN0eWxlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UHJvcGVydHlWYWx1ZSA9IGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gLyhcXC0oW2Etel0pezF9KS9nO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSAnZmxvYXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3AgPSAnc3R5bGVGbG9hdCc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9IHByb3AucmVwbGFjZShyZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1syXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmN1cnJlbnRTdHlsZVtwcm9wXSB8fCBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRQcm9wZXJ0eUNTU1ZhbHVlID0gZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENTU1ByaW1pdGl2ZVZhbHVlKHRoaXMuZWxlbWVudCwgcHJvcCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnQ1NTUHJpbWl0aXZlVmFsdWUnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS5DU1NQcmltaXRpdmVWYWx1ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5wcm9wID0gcHJvcDtcbiAgICAgICAgICAgIHRoaXMucHJpbWl0aXZlVHlwZSA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RmxvYXRWYWx1ZSA9IGZ1bmN0aW9uIChwcmltaXRpdmVUeXBlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gLyhcXC0oW2Etel0pezF9KS9nLFxuICAgICAgICAgICAgICAgICAgICBwcm9wID0gdGhpcy5wcm9wO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByb3AgPT09ICdmbG9hdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9ICdzdHlsZUZsb2F0JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocmUudGVzdChwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gcHJvcC5yZXBsYWNlKHJlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJndW1lbnRzWzJdLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY3VycmVudFN0eWxlW3Byb3BdIHx8IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChzY29wZS5FdmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNjb3BlLkV2ZW50ID0gZW1wdHlGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISgncHJldmVudERlZmF1bHQnIGluIEV2ZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRXZlbnQucHJvdG90eXBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdzdG9wUHJvcGFnYXRpb24nIGluIEV2ZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRXZlbnQucHJvdG90eXBlLnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuRWxlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNjb3BlLkVsZW1lbnQgPSBlbXB0eUZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGlmICghKCdhZGRFdmVudExpc3RlbmVyJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gW10sXG4gICAgICAgICAgICBhZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQgPSBldmVudC5zcmNFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldCA9IHNlbGY7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICgnaGFuZGxlRXZlbnQnIGluIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNlbGYsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChldmVudG5hbWUgIT09ICdET01Db250ZW50TG9hZGVkJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudG5hbWUsIHdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVycy5wdXNoKHsgb2JqZWN0OiB0aGlzLCB0eXBlOiBldmVudG5hbWUsIGxpc3RlbmVyOiBjYWxsYmFjaywgd3JhcHBlcjogd3JhcHBlciB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RlbmVyID0gZXZlbnRMaXN0ZW5lcnNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXIub2JqZWN0ID09PSB0aGlzICYmIGV2ZW50TGlzdGVuZXIudHlwZSA9PT0gZXZlbnRuYW1lICYmIGV2ZW50TGlzdGVuZXIubGlzdGVuZXIgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRuYW1lICE9ICdET01Db250ZW50TG9hZGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50bmFtZSwgZXZlbnRMaXN0ZW5lci53cmFwcGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudE9iamVjdCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlRXZlbnQoJ29uJyArIGV2ZW50LnR5cGUsIGV2ZW50T2JqZWN0KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZExpc3RlbmVyO1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlTGlzdGVuZXI7XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuXG4gICAgICAgIGlmIChzY29wZS5IVE1MRG9jdW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgSFRNTERvY3VtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gYWRkTGlzdGVuZXI7XG4gICAgICAgICAgICBIVE1MRG9jdW1lbnQucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVMaXN0ZW5lcjtcbiAgICAgICAgICAgIEhUTUxEb2N1bWVudC5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NvcGUuV2luZG93ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIFdpbmRvdy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZExpc3RlbmVyO1xuICAgICAgICAgICAgV2luZG93LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlTGlzdGVuZXI7XG4gICAgICAgICAgICBXaW5kb3cucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRPYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgICAgIC8vIGV2ZW50T2JqZWN0LnNyY0VsZW1lbnQgPSB3aW5kb3c7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXJzW2ldLm9iamVjdCA9PT0gZG9jdW1lbnQgJiYgZXZlbnRMaXN0ZW5lcnNbaV0udHlwZSA9PT0gJ0RPTUNvbnRlbnRMb2FkZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyc1tpXS53cmFwcGVyKGV2ZW50T2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLlRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzY29wZS5UZXh0ID0gZW1wdHlGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISgndGV4dENvbnRlbnQnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICB2YXIgaW5uZXJUZXh0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2lubmVyVGV4dCcpO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ3RleHRDb250ZW50Jywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlubmVyVGV4dC5nZXQuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbm5lclRleHQuc2V0LmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoISgnZ2V0QXR0cmlidXRlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuZ2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVdLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdzZXRBdHRyaWJ1dGUnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgncmVtb3ZlQXR0cmlidXRlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQXR0cmlidXRlID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLnJlbW92ZU5hbWVkSXRlbShhdHRyaWJ1dGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdmaXJzdEVsZW1lbnRDaGlsZCcgaW4gRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ2ZpcnN0RWxlbWVudENoaWxkJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW5bMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghKCdjbGFzc0xpc3QnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdjbGFzc0xpc3QnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhZGQ6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xhc3NOYW1lID0gc2VsZi5jbGFzc05hbWUudHJpbSgpICsgJyAnICsgY2xhc3NOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jbGFzc05hbWUgPSBzZWxmLmNsYXNzTmFtZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCd8JykgKyAnKFxcXFxifCQpJywgJ2dpJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKG5ldyBSZWdFeHAoJyhefCApJyArIGNsYXNzTmFtZSArICcoIHwkKScsICdnaScpLnRlc3Qoc2VsZi5jbGFzc05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghKCd0ZXh0Q29udGVudCcgaW4gVGV4dC5wcm90b3R5cGUpKSB7XG4gICAgICAgIHZhciBub2RlVmFsdWUgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFRleHQucHJvdG90eXBlLCAnbm9kZVZhbHVlJyk7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRleHQucHJvdG90eXBlLCAndGV4dENvbnRlbnQnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVZhbHVlLmdldC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVWYWx1ZS5zZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghKCd0cmltJyBpbiBTdHJpbmcucHJvdG90eXBlKSkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ29ic2VydmUnIGluIE9iamVjdCkpIHtcbiAgICAgICAgT2JqZWN0Lm9ic2VydmUgPSBlbXB0eUZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGlmICghKCdrZXlzJyBpbiBPYmplY3QpKSB7XG4gICAgICAgIE9iamVjdC5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iamVjdC5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qXG4gICAgaWYgKCEoJ2ZvckVhY2gnIGluIE9iamVjdC5wcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIFt0aGlzW2l0ZW1dLCBpdGVtLCB0aGlzXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ21hcCcgaW4gT2JqZWN0LnByb3RvdHlwZSkpIHtcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2FsbGJhY2suYXBwbHkodGhpcywgW3RoaXNbaXRlbV0sIGl0ZW0sIHRoaXNdKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdmb3JFYWNoJyBpbiBBcnJheS5wcm90b3R5cGUpKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBbdGhpc1tpXSwgaSwgdGhpc10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdtYXAnIGluIEFycmF5LnByb3RvdHlwZSkpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNhbGxiYWNrLmFwcGx5KHRoaXMsIFt0aGlzW2ldLCBpLCB0aGlzXSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnaW5kZXhPZicgaW4gQXJyYXkucHJvdG90eXBlKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChvYmplY3QsIHN0YXJ0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gKHN0YXJ0IHx8IDApLCBsZW5ndGggPSB0aGlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IG9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgKi9cblxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gY29yZVxuICAgIHZhciBsYXJvdXggPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhcm91eC5oZWxwZXJzLnRvQXJyYXkoXG4gICAgICAgICAgICAgICAgKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAvLyBGSVhNRTogbm9uLWNocm9tZSBvcHRpbWl6YXRpb25cbiAgICAgICAgdmFyIHJlID0gL14jKFteXFwrXFw+XFxbXFxdXFwuIyBdKikkLy5leGVjKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKHJlKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocmVbMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LmdldEVsZW1lbnRCeUlkKHJlWzFdKTtcbiAgICAgICAgfVxuICAgICAgICAqL1xuXG4gICAgICAgIHJldHVybiAocGFyZW50IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9O1xuXG4gICAgaWYgKCEoJyRsJyBpbiBzY29wZSkpIHtcbiAgICAgICAgc2NvcGUuJGwgPSBsYXJvdXg7XG4gICAgfVxuXG4gICAgLy8gY29yZSBtb2R1bGVzXG4gICAgbGFyb3V4LmV2ZW50cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmV2ZW50cy5qcycpO1xuICAgIGxhcm91eC5oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuICAgIGxhcm91eC50aW1lcnMgPSByZXF1aXJlKCcuL2xhcm91eC50aW1lcnMuanMnKTtcblxuICAgIGxhcm91eC5jYWNoZWQgPSB7XG4gICAgICAgIHNpbmdsZToge30sXG4gICAgICAgIGFycmF5OiB7fSxcbiAgICAgICAgaWQ6IHt9XG4gICAgfTtcblxuICAgIGxhcm91eC5jID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4LmNhY2hlZC5hcnJheVtzZWxlY3Rvcl0gfHwgKFxuICAgICAgICAgICAgICAgIGxhcm91eC5jYWNoZWQuYXJyYXlbc2VsZWN0b3JdID0gbGFyb3V4LmhlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhcm91eC5jYWNoZWQuc2luZ2xlW3NlbGVjdG9yXSB8fCAoXG4gICAgICAgICAgICBsYXJvdXguY2FjaGVkLnNpbmdsZVtzZWxlY3Rvcl0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBsYXJvdXguaWQgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICByZXR1cm4gKHBhcmVudCB8fCBkb2N1bWVudCkuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgIH07XG5cbiAgICBsYXJvdXguaWRjID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBsYXJvdXguY2FjaGVkLmlkW3NlbGVjdG9yXSB8fFxuICAgICAgICAgICAgKGxhcm91eC5jYWNoZWQuaWRbc2VsZWN0b3JdID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpKTtcbiAgICB9O1xuXG4gICAgbGFyb3V4LnJlYWR5UGFzc2VkID0gZmFsc2U7XG5cbiAgICBsYXJvdXguZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbGFyb3V4KTtcbiAgICAgICAgbGFyb3V4LmhlbHBlcnMuZXh0ZW5kT2JqZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxhcm91eC5leHRlbmRPYmplY3QgPSBsYXJvdXguaGVscGVycy5leHRlbmRPYmplY3Q7XG4gICAgbGFyb3V4LmVhY2ggPSBsYXJvdXguaGVscGVycy5lYWNoO1xuICAgIGxhcm91eC5tYXAgPSBsYXJvdXguaGVscGVycy5tYXA7XG4gICAgbGFyb3V4LmluZGV4ID0gbGFyb3V4LmhlbHBlcnMuaW5kZXg7XG4gICAgbGFyb3V4LmFlYWNoID0gbGFyb3V4LmhlbHBlcnMuYWVhY2g7XG4gICAgbGFyb3V4LmFtYXAgPSBsYXJvdXguaGVscGVycy5hbWFwO1xuICAgIGxhcm91eC5haW5kZXggPSBsYXJvdXguaGVscGVycy5haW5kZXg7XG5cbiAgICBsYXJvdXgucmVhZHkgPSBmdW5jdGlvbiAoZm5jKSB7XG4gICAgICAgIGlmICghbGFyb3V4LnJlYWR5UGFzc2VkKSB7XG4gICAgICAgICAgICBsYXJvdXguZXZlbnRzLmFkZCgnQ29udGVudExvYWRlZCcsIGZuYyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmbmMoKTtcbiAgICB9O1xuXG4gICAgLy8gb3B0aW9uYWwgbW9kdWxlc1xuICAgIGxhcm91eC53cmFwcGVyID0gcmVxdWlyZSgnLi9sYXJvdXgud3JhcHBlci5qcycpO1xuICAgIGxhcm91eC5hamF4ID0gcmVxdWlyZSgnLi9sYXJvdXguYWpheC5qcycpO1xuICAgIGxhcm91eC5jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKTtcbiAgICBsYXJvdXguZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyk7XG4gICAgLy8gbGFyb3V4LmV2ZW50cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmV2ZW50cy5qcycpO1xuICAgIGxhcm91eC5mb3JtcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmZvcm1zLmpzJyk7XG4gICAgLy8gbGFyb3V4LmhlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG4gICAgLy8gbGFyb3V4LnRpbWVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRpbWVycy5qcycpO1xuICAgIGxhcm91eC50cmlnZ2VycyA9IHJlcXVpcmUoJy4vbGFyb3V4LnRyaWdnZXJzLmpzJyk7XG4gICAgbGFyb3V4LnZhcnMgPSByZXF1aXJlKCcuL2xhcm91eC52YXJzLmpzJyk7XG5cbiAgICBsYXJvdXguYW5pbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmFuaW0uanMnKTtcbiAgICBsYXJvdXguZGF0ZSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRhdGUuanMnKTtcbiAgICBsYXJvdXgua2V5cyA9IHJlcXVpcmUoJy4vbGFyb3V4LmtleXMuanMnKTtcbiAgICBsYXJvdXgubXZjID0gcmVxdWlyZSgnLi9sYXJvdXgubXZjLmpzJyk7XG4gICAgbGFyb3V4LnN0YWNrID0gcmVxdWlyZSgnLi9sYXJvdXguc3RhY2suanMnKTtcbiAgICBsYXJvdXgudGVtcGxhdGVzID0gcmVxdWlyZSgnLi9sYXJvdXgudGVtcGxhdGVzLmpzJyk7XG4gICAgbGFyb3V4LnRvdWNoID0gcmVxdWlyZSgnLi9sYXJvdXgudG91Y2guanMnKTtcbiAgICBsYXJvdXgudWkgPSByZXF1aXJlKCcuL2xhcm91eC51aS5qcycpO1xuXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdET01Db250ZW50TG9hZGVkJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eC5yZWFkeVBhc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXguZXZlbnRzLmludm9rZSgnQ29udGVudExvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbChsYXJvdXgudGltZXJzLm9udGljaywgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4LnRvdWNoLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4LnJlYWR5UGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhcm91eDtcblxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZXZlbnRzID0gcmVxdWlyZSgnLi9sYXJvdXguZXZlbnRzLmpzJyksXG4gICAgICAgIGxhcm91eF9oZWxwZXJzID0gcmVxdWlyZSgnLi9sYXJvdXguaGVscGVycy5qcycpO1xuXG4gICAgLy8gYWpheCAtIHBhcnRpYWxseSB0YWtlbiBmcm9tICdqcXVlcnkgaW4gcGFydHMnIHByb2plY3RcbiAgICAvLyAgICAgICAgY2FuIGJlIGZvdW5kIGF0OiBodHRwczovL2dpdGh1Yi5jb20vbXl0aHovanF1aXAvXG4gICAgdmFyIGxhcm91eF9hamF4ID0ge1xuICAgICAgICBjb3JzRGVmYXVsdDogZmFsc2UsXG5cbiAgICAgICAgd3JhcHBlcnM6IHtcbiAgICAgICAgICAgIHJlZ2lzdHJ5OiB7XG4gICAgICAgICAgICAgICAgJ2xhcm91eC5qcyc6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YS5pc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjogJyArIGRhdGEuZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmo7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuZm9ybWF0ID09PSAnanNvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IEpTT04ucGFyc2UoZGF0YS5vYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuZm9ybWF0ID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypqc2hpbnQgZXZpbDp0cnVlICovXG4gICAgICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IGV2YWwoZGF0YS5vYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBpZiAoZGF0YS5mb3JtYXQgPT0gJ3htbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IGRhdGEub2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC53cmFwcGVycy5yZWdpc3RyeVtuYW1lXSA9IGZuYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4RG9tYWluT2JqZWN0OiBmYWxzZSxcbiAgICAgICAgeG1sSHR0cFJlcXVlc3RPYmplY3Q6IG51bGwsXG4gICAgICAgIHhEb21haW5SZXF1ZXN0T2JqZWN0OiBudWxsLFxuICAgICAgICB4aHI6IGZ1bmN0aW9uIChjcm9zc0RvbWFpbikge1xuICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhtbEh0dHBSZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNyb3NzRG9tYWluKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoJ3dpdGhDcmVkZW50aWFscycgaW4gbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3QpICYmIHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfYWpheC54RG9tYWluUmVxdWVzdE9iamVjdCA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9hamF4LnhEb21haW5SZXF1ZXN0T2JqZWN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2FqYXgueG1sSHR0cFJlcXVlc3RPYmplY3Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgeGhyUmVzcDogZnVuY3Rpb24gKHhociwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHdyYXBwZXJGdW5jdGlvbiA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXNwb25zZS1XcmFwcGVyLUZ1bmN0aW9uJyksXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRhdGF0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhdHlwZSA9PT0gJ3NjcmlwdCcpIHtcbiAgICAgICAgICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICAvKmpzbGludCBldmlsOnRydWUgKi9cbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGV2YWwoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YXR5cGUgPT09ICd4bWwnKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VYTUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdyYXBwZXJGdW5jdGlvbiAmJiAod3JhcHBlckZ1bmN0aW9uIGluIGxhcm91eF9hamF4LndyYXBwZXJzLnJlZ2lzdHJ5KSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gbGFyb3V4X2FqYXgud3JhcHBlcnMucmVnaXN0cnlbd3JhcHBlckZ1bmN0aW9uXShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHdyYXBwZXJGdW5jOiB3cmFwcGVyRnVuY3Rpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFrZVJlcXVlc3Q6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29ycyA9IG9wdGlvbnMuY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICB4aHIgPSBsYXJvdXhfYWpheC54aHIoY29ycyksXG4gICAgICAgICAgICAgICAgdXJsID0gb3B0aW9ucy51cmwsXG4gICAgICAgICAgICAgICAgdGltZXIgPSBudWxsLFxuICAgICAgICAgICAgICAgIG4gPSAwO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50aW1lb3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZW91dEZuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRpbWVvdXRGbihvcHRpb25zLnVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGltZW91dFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IGxhcm91eF9hamF4LnhoclJlc3AoeGhyLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZXJyb3IoeGhyLCB4aHIuc3RhdHVzLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhFcnJvcicsIFt4aHIsIHhoci5zdGF0dXMsIHhoci5zdGF0dXNUZXh0LCBvcHRpb25zXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zdWNjZXNzICE9PSB1bmRlZmluZWQgJiYgcmVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyhyZXMucmVzcG9uc2UsIHJlcy53cmFwcGVyRnVuYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5pbnZva2UoJ2FqYXhTdWNjZXNzJywgW3hociwgcmVzLnJlc3BvbnNlLCByZXMud3JhcHBlckZ1bmMsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVycm9yKHhociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheEVycm9yJywgW3hociwgeGhyLnN0YXR1cywgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbXBsZXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuY29tcGxldGUoeGhyLCB4aHIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZXZlbnRzLmludm9rZSgnYWpheENvbXBsZXRlJywgW3hociwgeGhyLnN0YXR1c1RleHQsIG9wdGlvbnNdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucHJvZ3Jlc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBwbHVzcGx1czogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnByb2dyZXNzKCsrbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZ2V0ZGF0YSAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuZ2V0ZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmdldGRhdGEuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnlTdHJpbmcgPSBsYXJvdXhfaGVscGVycy5idWlsZFF1ZXJ5U3RyaW5nKG9wdGlvbnMuZ2V0ZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeVN0cmluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgcXVlcnlTdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gKCh1cmwuaW5kZXhPZignPycpIDwgMCkgPyAnPycgOiAnJicpICsgb3B0aW9ucy5nZXRkYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuanNvbnAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHVybCArPSAoKHVybC5pbmRleE9mKCc/JykgPCAwKSA/ICc/JyA6ICcmJykgKyAnanNvbnA9JyArIG9wdGlvbnMuanNvbnA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghbGFyb3V4X2FqYXgueERvbWFpbk9iamVjdCkge1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKG9wdGlvbnMudHlwZSwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeGhyLm9wZW4ob3B0aW9ucy50eXBlLCB1cmwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnhockZpZWxkcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucy54aHJGaWVsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy54aHJGaWVsZHMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyW2ldID0gb3B0aW9ucy54aHJGaWVsZHNbaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fTtcblxuICAgICAgICAgICAgICAgIGlmICghY29ycykge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydYLVJlcXVlc3RlZC1XaXRoJ10gPSAnWE1MSHR0cFJlcXVlc3QnO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLndyYXBwZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ1gtV3JhcHBlci1GdW5jdGlvbiddID0gJ2xhcm91eC5qcyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqIGluIGhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoZWFkZXJzLmhhc093blByb3BlcnR5KGopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGosIGhlYWRlcnNbal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucG9zdGRhdGEgPT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnBvc3RkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKG9wdGlvbnMucG9zdGRhdGF0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMucG9zdGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZm9ybSc6XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKGxhcm91eF9oZWxwZXJzLmJ1aWxkRm9ybURhdGEob3B0aW9ucy5wb3N0ZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZChvcHRpb25zLnBvc3RkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEpzb246IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICAgICAgICAgIGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgZ2V0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SnNvblA6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIG1ldGhvZCwgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBqc29ucDogbWV0aG9kLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNjcmlwdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlcywgc3VjY2Vzc2ZuYywgZXJyb3JmbmMsIGNvcnMpIHtcbiAgICAgICAgICAgIGxhcm91eF9hamF4Lm1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIGdldGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb3JzOiBjb3JzIHx8IGxhcm91eF9hamF4LmNvcnNEZWZhdWx0LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NmbmMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yZm5jXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWVzLCBzdWNjZXNzZm5jLCBlcnJvcmZuYywgY29ycykge1xuICAgICAgICAgICAgbGFyb3V4X2FqYXgubWFrZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgICAgICAgICAgZGF0YXR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBwb3N0ZGF0YTogdmFsdWVzLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhdHlwZTogJ2Zvcm0nLFxuICAgICAgICAgICAgICAgIHdyYXBwZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY29yczogY29ycyB8fCBsYXJvdXhfYWpheC5jb3JzRGVmYXVsdCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBzdWNjZXNzZm5jLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcmZuY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdEpzb246IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZXMsIHN1Y2Nlc3NmbmMsIGVycm9yZm5jLCBjb3JzKSB7XG4gICAgICAgICAgICBsYXJvdXhfYWpheC5tYWtlUmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogcGF0aCxcbiAgICAgICAgICAgICAgICBkYXRhdHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHBvc3RkYXRhOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgcG9zdGRhdGF0eXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLTgnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvcnM6IGNvcnMgfHwgbGFyb3V4X2FqYXguY29yc0RlZmF1bHQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc2ZuYyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JmbmNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfYWpheDtcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyksXG4gICAgICAgIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKTtcblxuICAgIC8vIGFuaW1cbiAgICB2YXIgbGFyb3V4X2FuaW0gPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuXG4gICAgICAgIGZ4OiB7XG4gICAgICAgICAgICBpbnRlcnBvbGF0ZTogZnVuY3Rpb24gKHNvdXJjZSwgdGFyZ2V0LCBzaGlmdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoc291cmNlICsgKHRhcmdldCAtIHNvdXJjZSkgKiBzaGlmdCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBlYXNpbmc6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKC1NYXRoLmNvcyhwb3MgKiBNYXRoLlBJKSAvIDIpICsgMC41O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHtvYmplY3QsIHByb3BlcnR5LCBmcm9tLCB0bywgdGltZSwgdW5pdCwgcmVzZXR9XG4gICAgICAgIHNldDogZnVuY3Rpb24gKG5ld2FuaW0pIHtcbiAgICAgICAgICAgIG5ld2FuaW0uc3RhcnRUaW1lID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0udW5pdCA9PT0gdW5kZWZpbmVkIHx8IG5ld2FuaW0udW5pdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0udW5pdCA9ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3YW5pbS5mcm9tID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS5mcm9tID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld2FuaW0ub2JqZWN0ID09PSBkb2N1bWVudC5ib2R5ICYmIG5ld2FuaW0ucHJvcGVydHkgPT09ICdzY3JvbGxUb3AnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2FuaW0uZnJvbSA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gbmV3YW5pbS5vYmplY3RbbmV3YW5pbS5wcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG5ld2FuaW0uZnJvbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBuZXdhbmltLmZyb20gPSBOdW1iZXIobmV3YW5pbS5mcm9tKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0ucmVzZXQgPT09IHVuZGVmaW5lZCB8fCBuZXdhbmltLnJlc2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5yZXNldCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiAobmV3YW5pbS5pZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyAgICAgbmV3YW5pbS5pZCA9IGxhcm91eF9oZWxwZXJzLmdldFVuaXF1ZUlkKCk7XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEucHVzaChuZXdhbmltKTtcbiAgICAgICAgICAgIGlmIChsYXJvdXhfYW5pbS5kYXRhLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsYXJvdXhfYW5pbS5vbmZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRDc3M6IGZ1bmN0aW9uIChuZXdhbmltKSB7XG4gICAgICAgICAgICBpZiAobmV3YW5pbS5mcm9tID09PSB1bmRlZmluZWQgfHwgbmV3YW5pbS5mcm9tID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tID0gbGFyb3V4X2Nzcy5nZXRQcm9wZXJ0eShuZXdhbmltLm9iamVjdCwgbmV3YW5pbS5wcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5ld2FuaW0ub2JqZWN0ID0gbmV3YW5pbS5vYmplY3Quc3R5bGU7XG4gICAgICAgICAgICBuZXdhbmltLnByb3BlcnR5ID0gbGFyb3V4X2hlbHBlcnMuY2FtZWxDYXNlKG5ld2FuaW0ucHJvcGVydHkpO1xuXG4gICAgICAgICAgICBsYXJvdXhfYW5pbS5zZXQobmV3YW5pbSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRLZXkgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF9hbmltLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF9hbmltLmRhdGEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbGFyb3V4X2FuaW0uZGF0YVtpdGVtXTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5pZCAhPT0gdW5kZWZpbmVkICYmIGN1cnJlbnRJdGVtLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEtleSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRhcmdldEtleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF9hbmltLmRhdGEuc3BsaWNlKHRhcmdldEtleSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbmZyYW1lOiBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfYW5pbS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfYW5pbS5kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SXRlbSA9IGxhcm91eF9hbmltLmRhdGFbaXRlbV07XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLnN0YXJ0VGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5zdGFydFRpbWUgPSB0aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxhcm91eF9hbmltLnN0ZXAoY3VycmVudEl0ZW0sIHRpbWVzdGFtcCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aW1lc3RhbXAgPiBjdXJyZW50SXRlbS5zdGFydFRpbWUgKyBjdXJyZW50SXRlbS50aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uc3RhcnRUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld2FuaW0ub2JqZWN0ID09PSBkb2N1bWVudC5ib2R5ICYmIG5ld2FuaW0ucHJvcGVydHkgPT0gJ3Njcm9sbFRvcCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxUbygwLCBjdXJyZW50SXRlbS5mcm9tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgc2Nyb2xsVG8oMCwgY3VycmVudEl0ZW0uZnJvbSk7IH0sIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5vYmplY3RbY3VycmVudEl0ZW0ucHJvcGVydHldID0gY3VycmVudEl0ZW0uZnJvbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbTIgaW4gcmVtb3ZlS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghcmVtb3ZlS2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtMikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2FuaW0uZGF0YS5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtMl0sIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFyb3V4X2FuaW0uZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxhcm91eF9hbmltLm9uZnJhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0ZXA6IGZ1bmN0aW9uIChuZXdhbmltLCB0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHZhciBmaW5pc2hUID0gbmV3YW5pbS5zdGFydFRpbWUgKyBuZXdhbmltLnRpbWUsXG4gICAgICAgICAgICAgICAgc2hpZnQgPSAodGltZXN0YW1wID4gZmluaXNoVCkgPyAxIDogKHRpbWVzdGFtcCAtIG5ld2FuaW0uc3RhcnRUaW1lKSAvIG5ld2FuaW0udGltZTtcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gbGFyb3V4X2FuaW0uZnguaW50ZXJwb2xhdGUoXG4gICAgICAgICAgICAgICAgbmV3YW5pbS5mcm9tLFxuICAgICAgICAgICAgICAgIG5ld2FuaW0udG8sXG4gICAgICAgICAgICAgICAgbGFyb3V4X2FuaW0uZnguZWFzaW5nKHNoaWZ0KVxuICAgICAgICAgICAgKSArIG5ld2FuaW0udW5pdDtcblxuICAgICAgICAgICAgaWYgKG5ld2FuaW0ub2JqZWN0ID09PSBkb2N1bWVudC5ib2R5ICYmIG5ld2FuaW0ucHJvcGVydHkgPT0gJ3Njcm9sbFRvcCcpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUbygwLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNjcm9sbFRvKDAsIHZhbHVlKTsgfSwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld2FuaW0ub2JqZWN0W25ld2FuaW0ucHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9hbmltO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIGNzc1xuICAgIHZhciBsYXJvdXhfY3NzID0ge1xuICAgICAgICAvLyBjbGFzcyBmZWF0dXJlc1xuICAgICAgICBoYXNDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3ljbGVDbGFzczogZnVuY3Rpb24gKGVsZW1lbnRzLCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c1tpXS5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzWyhpICsgMSkgJSBsZW5ndGhdLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBzdHlsZSBmZWF0dXJlc1xuICAgICAgICBnZXRQcm9wZXJ0eTogZnVuY3Rpb24gKGVsZW1lbnQsIHN0eWxlTmFtZSkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcblxuICAgICAgICAgICAgc3R5bGVOYW1lID0gbGFyb3V4X2hlbHBlcnMuYW50aUNhbWVsQ2FzZShzdHlsZU5hbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFByb3BlcnR5OiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydGllcywgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhciBvbGRQcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1tvbGRQcm9wZXJ0aWVzXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBzdHlsZU5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgIGlmICghcHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShzdHlsZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXdTdHlsZU5hbWUgPSBsYXJvdXhfaGVscGVycy5jYW1lbENhc2Uoc3R5bGVOYW1lKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1tpXS5zdHlsZVtuZXdTdHlsZU5hbWVdID0gcHJvcGVydGllc1tzdHlsZU5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyB0cmFuc2l0aW9uIGZlYXR1cmVzXG4gICAgICAgIGRlZmF1bHRUcmFuc2l0aW9uOiAnMnMgZWFzZScsXG5cbiAgICAgICAgc2V0VHJhbnNpdGlvblNpbmdsZTogZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkodHJhbnNpdGlvbiksXG4gICAgICAgICAgICAgICAgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9ucyA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3RyYW5zaXRpb24nKSB8fCBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctd2Via2l0LXRyYW5zaXRpb24nKSB8fFxuICAgICAgICAgICAgICAgICAgICBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCctbXMtdHJhbnNpdGlvbicpIHx8ICcnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5O1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudFRyYW5zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheSA9IGN1cnJlbnRUcmFuc2l0aW9ucy5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIHRyYW5zaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0cmFuc2l0aW9ucy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gdHJhbnNpdGlvbnNbaXRlbV0uaW5kZXhPZignICcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVOYW1lID0gdHJhbnNpdGlvbnNbaXRlbV0uc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0aWVzID0gdHJhbnNpdGlvbnNbaXRlbV0uc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlTmFtZSA9IHRyYW5zaXRpb25zW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uUHJvcGVydGllcyA9IGxhcm91eF9jc3MuZGVmYXVsdFRyYW5zaXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFRyYW5zaXRpb25zQXJyYXlbal0udHJpbSgpLmxvY2FsZUNvbXBhcmUoc3R5bGVOYW1lKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRyYW5zaXRpb25zQXJyYXlbal0gPSBzdHlsZU5hbWUgKyAnICcgKyB0cmFuc2l0aW9uUHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNpdGlvbnNBcnJheS5wdXNoKHN0eWxlTmFtZSArICcgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN1cnJlbnRUcmFuc2l0aW9uc0FycmF5LmpvaW4oJywgJyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLm1zVHJhbnNpdGlvbiA9IHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb25TaW5nbGUoZWxlbWVudHNbaV0sIHRyYW5zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHkgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgeyBvcGFjaXR5OiAxIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2l0aW9uUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFRyYW5zaXRpb24oZWxlbWVudCwgJ29wYWNpdHkgJyArIHRyYW5zaXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRUcmFuc2l0aW9uKGVsZW1lbnQsICdvcGFjaXR5Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudCwgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIG1lYXN1cmVtZW50IGZlYXR1cmVzXG4gICAgICAgIC8vIGhlaWdodCBvZiBlbGVtZW50IHdpdGhvdXQgcGFkZGluZywgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaGVpZ2h0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdoZWlnaHQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodC5nZXRGbG9hdFZhbHVlKGhlaWdodC5wcmltaXRpdmVUeXBlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBoZWlnaHQgb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYnV0IHdpdGhvdXQgbWFyZ2luIGFuZCBib3JkZXJcbiAgICAgICAgaW5uZXJIZWlnaHQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gaGVpZ2h0IG9mIGVsZW1lbnQgd2l0aCBwYWRkaW5nIGFuZCBib3JkZXIgYnV0IG1hcmdpbiBvcHRpb25hbFxuICAgICAgICBvdXRlckhlaWdodDogZnVuY3Rpb24gKGVsZW1lbnQsIGluY2x1ZGVNYXJnaW4pIHtcbiAgICAgICAgICAgIGlmIChpbmNsdWRlTWFyZ2luIHx8IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIG1hcmdpblRvcCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoJ21hcmdpbi10b3AnKSxcbiAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b20gPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tYm90dG9tJyksXG4gICAgICAgICAgICAgICAgbWFyZ2lucyA9IG1hcmdpblRvcC5nZXRGbG9hdFZhbHVlKG1hcmdpblRvcC5wcmltaXRpdmVUeXBlKSArXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbS5nZXRGbG9hdFZhbHVlKG1hcmdpbkJvdHRvbS5wcmltaXRpdmVUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50Lm9mZnNldEhlaWdodCArIG1hcmdpbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHdpZHRoIG9mIGVsZW1lbnQgd2l0aG91dCBwYWRkaW5nLCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICB3aWR0aDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnd2lkdGgnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodC5nZXRGbG9hdFZhbHVlKGhlaWdodC5wcmltaXRpdmVUeXBlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB3aWR0aCBvZiBlbGVtZW50IHdpdGggcGFkZGluZyBidXQgd2l0aG91dCBtYXJnaW4gYW5kIGJvcmRlclxuICAgICAgICBpbm5lcldpZHRoOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gd2lkdGggb2YgZWxlbWVudCB3aXRoIHBhZGRpbmcgYW5kIGJvcmRlciBidXQgbWFyZ2luIG9wdGlvbmFsXG4gICAgICAgIG91dGVyV2lkdGg6IGZ1bmN0aW9uIChlbGVtZW50LCBpbmNsdWRlTWFyZ2luKSB7XG4gICAgICAgICAgICBpZiAoaW5jbHVkZU1hcmdpbiB8fCBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKCdtYXJnaW4tbGVmdCcpLFxuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZSgnbWFyZ2luLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgbWFyZ2lucyA9IG1hcmdpbkxlZnQuZ2V0RmxvYXRWYWx1ZShtYXJnaW5MZWZ0LnByaW1pdGl2ZVR5cGUpICtcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQuZ2V0RmxvYXRWYWx1ZShtYXJnaW5SaWdodC5wcmltaXRpdmVUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChlbGVtZW50Lm9mZnNldFdpZHRoICsgbWFyZ2lucyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9wOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICtcbiAgICAgICAgICAgICAgICAoKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgK1xuICAgICAgICAgICAgICAgICgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0KSB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFib3ZlVGhlVG9wOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tIDw9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmVsb3dUaGVGb2xkOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wID4gaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVmdE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPD0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICByaWdodE9mU2NyZWVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCA+IGlubmVyV2lkdGg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5WaWV3cG9ydDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgcmV0dXJuICEocmVjdC5ib3R0b20gPD0gMCB8fCByZWN0LnRvcCA+IGlubmVySGVpZ2h0IHx8XG4gICAgICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAwIHx8IHJlY3QubGVmdCA+IGlubmVyV2lkdGgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfY3NzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGRhdGVcbiAgICB2YXIgbGFyb3V4X2RhdGUgPSB7XG4gICAgICAgIHNob3J0RGF0ZUZvcm1hdDogJ2RkLk1NLnl5eXknLFxuICAgICAgICBsb25nRGF0ZUZvcm1hdDogJ2RkIE1NTU0geXl5eScsXG4gICAgICAgIHRpbWVGb3JtYXQ6ICdISDptbScsXG5cbiAgICAgICAgbW9udGhzU2hvcnQ6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcbiAgICAgICAgbW9udGhzTG9uZzogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10sXG5cbiAgICAgICAgc3RyaW5nczoge1xuICAgICAgICAgICAgbm93OiAgICAgJ25vdycsXG4gICAgICAgICAgICBsYXRlcjogICAnbGF0ZXInLFxuICAgICAgICAgICAgYWdvOiAgICAgJ2FnbycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2Vjb25kcycsXG4gICAgICAgICAgICBhbWludXRlOiAnYSBtaW51dGUnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0ZXMnLFxuICAgICAgICAgICAgYWhvdXI6ICAgJ2EgaG91cicsXG4gICAgICAgICAgICBob3VyczogICAnaG91cnMnLFxuICAgICAgICAgICAgYWRheTogICAgJ2EgZGF5JyxcbiAgICAgICAgICAgIGRheXM6ICAgICdkYXlzJyxcbiAgICAgICAgICAgIGF3ZWVrOiAgICdhIHdlZWsnLFxuICAgICAgICAgICAgd2Vla3M6ICAgJ3dlZWtzJyxcbiAgICAgICAgICAgIGFtb250aDogICdhIG1vbnRoJyxcbiAgICAgICAgICAgIG1vbnRoczogICdtb250aHMnLFxuICAgICAgICAgICAgYXllYXI6ICAgJ2EgeWVhcicsXG4gICAgICAgICAgICB5ZWFyczogICAneWVhcnMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VFcG9jaDogZnVuY3Rpb24gKHRpbWVzcGFuLCBsaW1pdFdpdGhXZWVrcykge1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgdGltZXNwYW4gPSBNYXRoLmNlaWwodGltZXNwYW4gLyAxMDAwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3Muc2Vjb25kcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICg2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbWludXRlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MubWludXRlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWhvdXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5ob3VycztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuIDwgNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYWRheTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXNwYW4gKyAnICcgKyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmRheXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDQgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGltZXNwYW4gPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXdlZWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy53ZWVrcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpbWl0V2l0aFdlZWtzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3BhbiA8IDMwICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IE1hdGguY2VpbCh0aW1lc3BhbiAvICgzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lc3BhbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5hbW9udGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuICsgJyAnICsgbGFyb3V4X2RhdGUuc3RyaW5ncy5tb250aHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRpbWVzcGFuID0gTWF0aC5jZWlsKHRpbWVzcGFuIC8gKDM2NSAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblxuICAgICAgICAgICAgaWYgKHRpbWVzcGFuID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLnN0cmluZ3MuYXllYXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aW1lc3BhbiArICcgJyArIGxhcm91eF9kYXRlLnN0cmluZ3MueWVhcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q3VzdG9tRGF0ZVN0cmluZzogZnVuY3Rpb24gKGZvcm1hdCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IGRhdGUgfHwgbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIC95eXl5fHl5fE1NTU18TU1NfE1NfE18ZGR8ZHxoaHxofEhIfEh8bW18bXxzc3xzfHR0fHQvZyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eXl5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0RnVsbFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd5eSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFllYXIoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU1NJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZGF0ZS5tb250aHNMb25nW25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9kYXRlLm1vbnRoc1Nob3J0W25vdy5nZXRNb250aCgpXTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdNTSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIChub3cuZ2V0TW9udGgoKSArIDEpKS5zdWJzdHIoLTIsIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdy5nZXRNb250aCgpICsgMTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXREYXRlKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldERhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjEgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoJzAnICsgKCgoaG91cjEgJSAxMikgPiAwKSA/IGhvdXIxICUgMTIgOiAxMikpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cjIgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoKGhvdXIyICUgMTIpID4gMCkgPyBob3VyMiAlIDEyIDogMTI7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgnMCcgKyBub3cuZ2V0SG91cnMoKSkuc3Vic3RyKC0yLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3cuZ2V0SG91cnMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRNaW51dGVzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldE1pbnV0ZXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCcwJyArIG5vdy5nZXRTZWNvbmRzKCkpLnN1YnN0cigtMiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm93LmdldFNlY29uZHMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BtJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhbSc7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm93LmdldEhvdXJzKCkgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3AnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2EnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGF0ZURpZmZTdHJpbmc6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB0aW1lc3BhbiA9IG5vdyAtIGRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGFic1RpbWVzcGFuID0gTWF0aC5hYnModGltZXNwYW4pLFxuICAgICAgICAgICAgICAgIHBhc3QgPSAodGltZXNwYW4gPiAwKTtcblxuICAgICAgICAgICAgaWYgKGFic1RpbWVzcGFuIDw9IDMwMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuc3RyaW5ncy5ub3c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aW1lc3BhbnN0cmluZyA9IGxhcm91eF9kYXRlLnBhcnNlRXBvY2goYWJzVGltZXNwYW4sIHRydWUpO1xuICAgICAgICAgICAgaWYgKHRpbWVzcGFuc3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzcGFuc3RyaW5nICtcbiAgICAgICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgKHBhc3QgPyBsYXJvdXhfZGF0ZS5zdHJpbmdzLmFnbyA6IGxhcm91eF9kYXRlLnN0cmluZ3MubGF0ZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0U2hvcnREYXRlU3RyaW5nKGRhdGUsIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNob3J0RGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLnNob3J0RGF0ZUZvcm1hdCArICcgJyArIGxhcm91eF9kYXRlLnRpbWVGb3JtYXQgOiBsYXJvdXhfZGF0ZS5zaG9ydERhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgZGF0ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMb25nRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUsIGluY2x1ZGVUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2RhdGUuZ2V0Q3VzdG9tRGF0ZVN0cmluZyhcbiAgICAgICAgICAgICAgICBpbmNsdWRlVGltZSA/IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0ICsgJyAnICsgbGFyb3V4X2RhdGUudGltZUZvcm1hdCA6IGxhcm91eF9kYXRlLmxvbmdEYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgIGRhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9kYXRlO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcbiAgICAgICAgLy8gbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICAvLyBsYXJvdXhfdHJpZ2dlcnMgPSByZXF1aXJlKCcuL2xhcm91eC50cmlnZ2Vycy5qcycpO1xuXG4gICAgLy8gZG9tXG4gICAgdmFyIGxhcm91eF9kb20gPSB7XG4gICAgICAgIGRvY3Byb3A6IGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMocHJvcE5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEJ5Q2xhc3M6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X2hlbHBlcnMudG9BcnJheShcbiAgICAgICAgICAgICAgICAocGFyZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeVRhZzogZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy50b0FycmF5KFxuICAgICAgICAgICAgICAgIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRzQnlUYWdOYW1lKHNlbGVjdG9yKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RCeUlkOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIChwYXJlbnQgfHwgZG9jdW1lbnQpLmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RTaW5nbGU6IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHBhcmVudCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXR0cjogZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBhdHRyaWJ1dGVzLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzW29sZEF0dHJpYnV0ZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24gKGVsZW1lbnQsIGRhdGFuYW1lcywgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIGRhdGFuYW1lcy5jb25zdHJ1Y3RvciAhPT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBkYXRhbmFtZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhbmFtZXMgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkRGF0YW5hbWVzID0gZGF0YW5hbWVzO1xuICAgICAgICAgICAgICAgIGRhdGFuYW1lcyA9IHt9O1xuICAgICAgICAgICAgICAgIGRhdGFuYW1lc1tvbGREYXRhbmFtZXNdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGRhdGFOYW1lIGluIGRhdGFuYW1lcykge1xuICAgICAgICAgICAgICAgIGlmICghZGF0YW5hbWVzLmhhc093blByb3BlcnR5KGRhdGFOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFuYW1lc1tkYXRhTmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLScgKyBkYXRhTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS0nICsgZGF0YU5hbWUsIGRhdGFuYW1lc1tkYXRhTmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50SGlzdG9yeTogW10sXG4gICAgICAgIHNldEV2ZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRuYW1lLCBmbmMpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZWxlbWVudHNbaV0sIGV2ZW50bmFtZSwgZm5jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRFdmVudFNpbmdsZTogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50bmFtZSwgZm5jKSB7XG4gICAgICAgICAgICB2YXIgZm5jV3JhcHBlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZuYyhlLCBlbGVtZW50KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeS5wdXNoKHsgZWxlbWVudDogZWxlbWVudCwgZXZlbnRuYW1lOiBldmVudG5hbWUsIGZuYzogZm5jLCBmbmNXcmFwcGVyOiBmbmNXcmFwcGVyIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50bmFtZSwgZm5jV3JhcHBlciwgZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuc2V0RXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGZuYykge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShlbGVtZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaTEgPSAwLCBsZW5ndGgxID0gZWxlbWVudHMubGVuZ3RoOyBpMSA8IGxlbmd0aDE7IGkxKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpMiA9IDAsIGxlbmd0aDIgPSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeS5sZW5ndGg7IGkyIDwgbGVuZ3RoMjsgaTIrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGxhcm91eF9kb20uZXZlbnRIaXN0b3J5W2kyXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnRzW2kxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRuYW1lICE9PSB1bmRlZmluZWQgJiYgaXRlbS5ldmVudG5hbWUgIT09IGV2ZW50bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZm5jICE9PSB1bmRlZmluZWQgJiYgaXRlbS5mbmMgIT09IGZuYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtLmV2ZW50bmFtZSwgaXRlbS5mbmNXcmFwcGVyLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBsYXJvdXhfZG9tLmV2ZW50SGlzdG9yeVtpMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudG5hbWUsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN1c3RvbUV2ZW50W2l0ZW1dID0gZGF0YVtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VzdG9tRXZlbnQuaW5pdEV2ZW50KGV2ZW50bmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxuICAgICAgICAgICAgICAgIHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcblxuICAgICAgICAgICAgdGVtcC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGh0bWwpO1xuICAgICAgICAgICAgd2hpbGUgKHRlbXAuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGVtcC5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbnVsbGluZyBvdXQgdGhlIHJlZmVyZW5jZSwgdGhlcmUgaXMgbm8gb2J2aW91cyBkaXNwb3NlIG1ldGhvZFxuICAgICAgICAgICAgdGVtcCA9IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiBmcmFnO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgICAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcyAhPT0gdW5kZWZpbmVkICYmIGF0dHJpYnV0ZXMuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoaXRlbSwgYXR0cmlidXRlc1tpdGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0yIGluIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShpdGVtMiwgY2hpbGRyZW5baXRlbTJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoLyogdHlwZW9mIGNoaWxkcmVuID09ICdzdHJpbmcnICYmICovY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmFwcGVuZChlbGVtLCBjaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVPcHRpb246IGZ1bmN0aW9uIChlbGVtZW50LCBrZXksIHZhbHVlLCBpc0RlZmF1bHQpIHtcbiAgICAgICAgICAgIC8qIG9sZCBiZWhhdmlvdXIsIGRvZXMgbm90IHN1cHBvcnQgb3B0Z3JvdXBzIGFzIHBhcmVudHMuXG4gICAgICAgICAgICB2YXIgY291bnQgPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zW2NvdW50XSA9IG5ldyBPcHRpb24odmFsdWUsIGtleSk7XG5cbiAgICAgICAgICAgIGlmIChpc0RlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9wdGlvbnMuc2VsZWN0ZWRJbmRleCA9IGNvdW50IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdPUFRJT04nKTtcbiAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywga2V5KTtcbiAgICAgICAgICAgIGlmIChpc0RlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5hcHBlbmQob3B0aW9uLCB2YWx1ZSk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0QnlWYWx1ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZWxlbWVudC5vcHRpb25zLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQub3B0aW9uc1tpXS5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJykgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LC8qLFxuXG4gICAgICAgIC8vIFRPRE86IGl0J3MgcmVkdW5kYW50IGZvciBub3dcbiAgICAgICAgbG9hZEltYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2VzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdJTUcnKTtcbiAgICAgICAgICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIGFyZ3VtZW50c1tpXSk7XG5cbiAgICAgICAgICAgICAgICBpbWFnZXMucHVzaChpbWFnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbWFnZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZEFzeW5jU2NyaXB0OiBmdW5jdGlvbiAocGF0aCwgdHJpZ2dlck5hbWUsIGFzeW5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICAgICAgICBlbGVtLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLnNyYyA9IHBhdGg7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRBc3luY1N0eWxlOiBmdW5jdGlvbiAocGF0aCwgdHJpZ2dlck5hbWUsIGFzeW5jKSB7XG4gICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJTksnKTtcblxuICAgICAgICAgICAgZWxlbS50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgICAgIGVsZW0uYXN5bmMgPSAoYXN5bmMgIT09IHVuZGVmaW5lZCkgPyBhc3luYyA6IHRydWU7XG4gICAgICAgICAgICBlbGVtLmhyZWYgPSBwYXRoO1xuICAgICAgICAgICAgZWxlbS5yZWwgPSAnc3R5bGVzaGVldCc7XG5cbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGVsZW0ub25sb2FkID0gZWxlbS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKChlbGVtLnJlYWR5U3RhdGUgJiYgZWxlbS5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmIGVsZW0ucmVhZHlTdGF0ZSAhPT0gJ2xvYWRlZCcpIHx8IGxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZWxlbS5vbmxvYWQgPSBlbGVtLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmlnZ2VyTmFtZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLm9udHJpZ2dlcih0cmlnZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICB9LCovXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0OiBmdW5jdGlvbiAoZWxlbWVudCwgcG9zaXRpb24sIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKHBvc2l0aW9uLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwcmVwZW5kOiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBjb250ZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgY29udGVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVwbGFjZTogZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIGxhcm91eF9kb20uY2xlYXIoZWxlbWVudCk7XG4gICAgICAgICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGNvbnRlbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VUZXh0OiBmdW5jdGlvbiAoZWxlbWVudCwgY29udGVudCkge1xuICAgICAgICAgICAgLy8gbGFyb3V4X2RvbS5jbGVhcihlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmVSZXR1cm46IDAsXG4gICAgICAgIGNsb25lQXBwZW5kOiAxLFxuICAgICAgICBjbG9uZUluc2VydEFmdGVyOiAyLFxuICAgICAgICBjbG9uZUluc2VydEJlZm9yZTogMyxcblxuICAgICAgICBjbG9uZTogZnVuY3Rpb24gKGVsZW1lbnQsIHR5cGUsIGNvbnRhaW5lciwgdGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gdW5kZWZpbmVkICYmIHR5cGUgIT0gbGFyb3V4X2RvbS5jbG9uZVJldHVybikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IGxhcm91eF9kb20uY2xvbmVBcHBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBsYXJvdXhfZG9tLmNsb25lSW5zZXJ0QWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHR5cGUgPT0gbGFyb3V4X2RvbS5jbG9uZUluc2VydEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3RWxlbWVudDtcbiAgICAgICAgfS8qLFxuXG4gICAgICAgIC8vIFRPRE86IGl0J3MgcmVkdW5kYW50IGZvciBub3dcbiAgICAgICAgYXBwbHlPcGVyYXRpb25zOiBmdW5jdGlvbiAoZWxlbWVudCwgb3BlcmF0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgb3BlcmF0aW9uIGluIG9wZXJhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnMuaGFzT3duUHJvcGVydHkob3BlcmF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBiaW5kaW5nIGluIG9wZXJhdGlvbnNbb3BlcmF0aW9uXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wZXJhdGlvbnNbb3BlcmF0aW9uXS5oYXNPd25Qcm9wZXJ0eShiaW5kaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcGVyYXRpb25zW29wZXJhdGlvbl1bYmluZGluZ107XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVwbGFjZShlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZHByb3AnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYmluZGluZy5zdWJzdHJpbmcoMSksIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGJpbmRpbmcuc3Vic3RyaW5nKDEpKSArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcgPT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20uYXBwZW5kKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVtb3ZlcHJvcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnN1YnN0cmluZygwLCAxKSA9PSAnXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodmFsdWUuc3Vic3RyaW5nKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09ICdjb250ZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmNsZWFyKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5hZGRDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVjbGFzcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5yZW1vdmVDbGFzcyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGRzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCBiaW5kaW5nLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmVzdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50LCB2YWx1ZSwgJ2luaGVyaXQgIWltcG9ydGFudCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVwZWF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob3BlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgfTtcblxuICAgIC8vIGEgZml4IGZvciBJbnRlcm5ldCBFeHBsb3JlclxuICAgIGlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50RWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsYXJvdXhfZG9tO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIGV2ZW50c1xuICAgIHZhciBsYXJvdXhfZXZlbnRzID0ge1xuICAgICAgICBkZWxlZ2F0ZXM6IFtdLFxuXG4gICAgICAgIGFkZDogZnVuY3Rpb24gKGV2ZW50LCBmbmMpIHtcbiAgICAgICAgICAgIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzLnB1c2goeyBldmVudDogZXZlbnQsIGZuYzogZm5jIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGludm9rZTogZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF9ldmVudHMuZGVsZWdhdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfZXZlbnRzLmRlbGVnYXRlcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXNbaXRlbV0uZXZlbnQgIT0gZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2V2ZW50cy5kZWxlZ2F0ZXNbaXRlbV0uZm5jKGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfZXZlbnRzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9hamF4ID0gcmVxdWlyZSgnLi9sYXJvdXguYWpheC5qcycpO1xuXG4gICAgLy8gZm9ybXNcbiAgICB2YXIgbGFyb3V4X2Zvcm1zID0ge1xuICAgICAgICBhamF4Rm9ybTogZnVuY3Rpb24gKGZvcm1vYmosIGZuYywgZm5jQmVnaW4pIHtcbiAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQoZm9ybW9iaiwgJ3N1Ym1pdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm5jQmVnaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmbmNCZWdpbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF9hamF4LnBvc3QoXG4gICAgICAgICAgICAgICAgICAgIGZvcm1vYmouZ2V0QXR0cmlidXRlKCdhY3Rpb24nKSxcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2Zvcm1zLnNlcmlhbGl6ZUZvcm1EYXRhKGZvcm1vYmopLFxuICAgICAgICAgICAgICAgICAgICBmbmNcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNGb3JtRmllbGQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ0ZJTEUnIHx8IHR5cGUgPT09ICdDSEVDS0JPWCcgfHwgdHlwZSA9PT0gJ1JBRElPJyB8fCB0eXBlID09PSAnVEVYVCcgfHwgdHlwZSA9PT0gJ1BBU1NXT1JEJyB8fCB0eXBlID09PSAnSElEREVOJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEZvcm1GaWVsZFZhbHVlOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vcHRpb25zW2VsZW1lbnQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnRklMRScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZmlsZXNbMF07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdDSEVDS0JPWCcgfHwgdHlwZSA9PT0gJ1JBRElPJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnVEVYVCcgfHwgdHlwZSA9PT0gJ1BBU1NXT1JEJyB8fCB0eXBlID09PSAnSElEREVOJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRGb3JtRmllbGRWYWx1ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5kaXNhYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBvcHRpb24gaW4gZWxlbWVudC5vcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5vcHRpb25zLmhhc093blByb3BlcnR5KG9wdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQub3B0aW9uc1tvcHRpb25dLnZhbHVlID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNlbGVjdGVkSW5kZXggPSBvcHRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ0ZJTEUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZmlsZXNbMF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdDSEVDS0JPWCcgfHwgdHlwZSA9PSAnUkFESU8nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PSBlbGVtZW50LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdURVhUJyB8fCB0eXBlID09ICdQQVNTV09SRCcgfHwgdHlwZSA9PSAnSElEREVOJykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT0gJ1RFWFRBUkVBJykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlRm9ybUVkaXRpbmc6IGZ1bmN0aW9uIChmb3Jtb2JqLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IGZvcm1vYmoucXVlcnlTZWxlY3RvckFsbCgnKltuYW1lXScpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChmb3Jtb2JqLmdldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWVuYWJsZWQnKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3Jtb2JqLnNldEF0dHJpYnV0ZSgnZGF0YS1sYXN0LWVuYWJsZWQnLCAnZW5hYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1vYmoucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWxhc3QtZW5hYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBzZWxlY3RlZCA9IDAsIGxlbmd0aCA9IHNlbGVjdGlvbi5sZW5ndGg7IHNlbGVjdGVkIDwgbGVuZ3RoOyBzZWxlY3RlZCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfZm9ybXMuaXNGb3JtRmllbGQoc2VsZWN0aW9uW3NlbGVjdGVkXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGxhc3REaXNhYmxlZCA9IHNlbGVjdGlvbltzZWxlY3RlZF0uZ2V0QXR0cmlidXRlKCdkYXRhLWxhc3QtZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0RGlzYWJsZWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbltzZWxlY3RlZF0uc2V0QXR0cmlidXRlKCdkYXRhLWxhc3QtZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbltzZWxlY3RlZF0uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdERpc2FibGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbltzZWxlY3RlZF0ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWxhc3QtZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25bc2VsZWN0ZWRdLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWFsaXplRm9ybURhdGE6IGZ1bmN0aW9uIChmb3Jtb2JqKSB7XG4gICAgICAgICAgICB2YXIgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxhcm91eF9mb3Jtcy5nZXRGb3JtRmllbGRWYWx1ZShzZWxlY3Rpb25bc2VsZWN0ZWRdKTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3JtZGF0YS5hcHBlbmQoc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZvcm1kYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmlhbGl6ZTogZnVuY3Rpb24gKGZvcm1vYmopIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB7fTtcbiAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSBmb3Jtb2JqLnF1ZXJ5U2VsZWN0b3JBbGwoJypbbmFtZV0nKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgc2VsZWN0ZWQgPSAwLCBsZW5ndGggPSBzZWxlY3Rpb24ubGVuZ3RoOyBzZWxlY3RlZCA8IGxlbmd0aDsgc2VsZWN0ZWQrKykge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxhcm91eF9mb3Jtcy5nZXRGb3JtRmllbGRWYWx1ZShzZWxlY3Rpb25bc2VsZWN0ZWRdKTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbc2VsZWN0aW9uW3NlbGVjdGVkXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzZXJpYWxpemU6IGZ1bmN0aW9uIChmb3Jtb2JqLCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZm9ybW9iai5xdWVyeVNlbGVjdG9yQWxsKCcqW25hbWVdJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIHNlbGVjdGVkID0gMCwgbGVuZ3RoID0gc2VsZWN0aW9uLmxlbmd0aDsgc2VsZWN0ZWQgPCBsZW5ndGg7IHNlbGVjdGVkKyspIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZm9ybXMuc2V0Rm9ybUZpZWxkVmFsdWUoc2VsZWN0aW9uW3NlbGVjdGVkXSwgZGF0YVtzZWxlY3Rpb25bc2VsZWN0ZWRdLmdldEF0dHJpYnV0ZSgnbmFtZScpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9mb3JtcztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBoZWxwZXJzXG4gICAgdmFyIGxhcm91eF9oZWxwZXJzID0ge1xuICAgICAgICB1bmlxdWVJZDogMCxcblxuICAgICAgICBnZXRVbmlxdWVJZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLypqc2xpbnQgcGx1c3BsdXM6IHRydWUgKi9cbiAgICAgICAgICAgIHJldHVybiAndWlkLScgKyAoKytsYXJvdXhfaGVscGVycy51bmlxdWVJZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRRdWVyeVN0cmluZzogZnVuY3Rpb24gKHZhbHVlcywgcmZjMzk4Nikge1xuICAgICAgICAgICAgdmFyIHVyaSA9ICcnLFxuICAgICAgICAgICAgICAgIHJlZ0V4ID0gLyUyMC9nO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzW25hbWVdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJmYzM5ODYgfHwgZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVyaSArPSAnJicgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkucmVwbGFjZShyZWdFeCwgJysnKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbbmFtZV0udG9TdHJpbmcoKSkucmVwbGFjZShyZWdFeCwgJysnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVyaSArPSAnJicgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVzW25hbWVdLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXJpLnN1YnN0cigxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZEZvcm1EYXRhOiBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzW25hbWVdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5hcHBlbmQobmFtZSwgdmFsdWVzW25hbWVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJncykucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJncyk7IH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VBbGw6IGZ1bmN0aW9uICh0ZXh0LCBkaWN0aW9uYXJ5KSB7XG4gICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKE9iamVjdC5rZXlzKGRpY3Rpb25hcnkpLmpvaW4oJ3wnKSwgJ2cnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZShcbiAgICAgICAgICAgICAgICByZSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpY3Rpb25hcnlbbWF0Y2hdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FtZWxDYXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyckNoYXIgPSB2YWx1ZS5jaGFyQXQoaik7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJDaGFyID09ICctJykge1xuICAgICAgICAgICAgICAgICAgICBmbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9ICghZmxhZykgPyBjdXJyQ2hhciA6IGN1cnJDaGFyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGFudGlDYW1lbENhc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9ICcnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJDaGFyID0gdmFsdWUuY2hhckF0KGopO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyQ2hhciAhPSAnLScgJiYgY3VyckNoYXIgPT0gY3VyckNoYXIudG9VcHBlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJy0nICsgY3VyckNoYXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGN1cnJDaGFyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9LFxuXG4gICAgICAgIHF1b3RlQXR0cjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgJyZhcG9zOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxyXFxuL2csICcmIzEzOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvW1xcclxcbl0vZywgJyYjMTM7Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3BsaWNlU3RyaW5nOiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjb3VudCwgYWRkKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UoMCwgaW5kZXgpICsgKGFkZCB8fCAnJykgKyB2YWx1ZS5zbGljZShpbmRleCArIGNvdW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICByYW5kb206IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgICAgICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZDogZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgICAgIG9iai5zb21lKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBleHRlbmRPYmplY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIGlzQXJyYXkgPSB0YXJnZXQgaW5zdGFuY2VvZiBBcnJheTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIGFyZ3VtZW50c1tpdGVtXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGFyZ2V0LnB1c2goYXJndW1lbnRzW2l0ZW1dW25hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICAgICAgLyogdGFyZ2V0W25hbWVdLmNvbnN0cnVjdG9yID09PSBPYmplY3QgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldC5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiB0YXJnZXRbbmFtZV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmV4dGVuZE9iamVjdCh0YXJnZXRbbmFtZV0sIGFyZ3VtZW50c1tpdGVtXVtuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSA9IGFyZ3VtZW50c1tpdGVtXVtuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZWFjaDogZnVuY3Rpb24gKGFyciwgZm5jLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZm5jKGl0ZW0sIGFycltpdGVtXSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfSxcblxuICAgICAgICBtYXA6IGZ1bmN0aW9uIChhcnIsIGZuYywgZG9udFNraXBSZXR1cm5zLCB0ZXN0T3duUHJvcGVydGllcykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGVzdE93blByb3BlcnRpZXMgJiYgIWFyci5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZm5jKGFycltpdGVtXSwgaXRlbSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRvbnRTa2lwUmV0dXJucyB8fCByZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluZGV4OiBmdW5jdGlvbiAoYXJyLCB2YWx1ZSwgdGVzdE93blByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3RPd25Qcm9wZXJ0aWVzICYmICFhcnIuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGFycltpdGVtXSA9PT0gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWVhY2g6IGZ1bmN0aW9uIChhcnIsIGZuYykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChmbmMoaSwgYXJyW2ldKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFtYXA6IGZ1bmN0aW9uIChhcnIsIGZuYywgZG9udFNraXBSZXR1cm5zKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZuYyhhcnJbaV0sIGkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb250U2tpcFJldHVybnMgfHwgcmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy51bnNoaWZ0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSxcblxuICAgICAgICBhaW5kZXg6IGZ1bmN0aW9uIChhcnIsIHZhbHVlLCBzdGFydCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IChzdGFydCB8fCAwKSwgbGVuZ3RoID0gYXJyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29sdW1uOiBmdW5jdGlvbiAob2JqLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5tYXAob2JqLCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0sIHRydWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNodWZmbGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgc2h1ZmZsZWQgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcmFuZCA9IGxhcm91eF9oZWxwZXJzLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgc2h1ZmZsZWRbaW5kZXgrK10gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgICAgICAgICAgICBzaHVmZmxlZFtyYW5kXSA9IG9ialtpdGVtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNodWZmbGVkO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1lcmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICB0bXAgPSB0YXJnZXQsXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IHRtcCBpbnN0YW5jZW9mIEFycmF5O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IHRtcC5jb25jYXQoYXJndW1lbnRzW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBhcmd1bWVudHNbaXRlbV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmd1bWVudHNbaXRlbV0uaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdG1wW2F0dHJdID0gYXJndW1lbnRzW2l0ZW1dW2F0dHJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRtcDtcbiAgICAgICAgfSxcblxuICAgICAgICBkdXBsaWNhdGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGl0ZW1zID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpdGVtc1tpXSA9IG9ialtpXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEFzQXJyYXk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHZhciBpdGVtcztcblxuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBvYmo7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBpdGVtcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBvYmpbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IFtvYmpdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGVuZ3RoOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEtleXNSZWN1cnNpdmU6IGZ1bmN0aW9uIChvYmosIGRlbGltaXRlciwgcHJlZml4LCBrZXlzKSB7XG4gICAgICAgICAgICBpZiAoZGVsaW1pdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwcmVmaXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHByZWZpeCA9ICcnO1xuICAgICAgICAgICAgICAgIGtleXMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBrZXlzLnB1c2gocHJlZml4ICsgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqW2l0ZW1dICE9PSB1bmRlZmluZWQgJiYgb2JqW2l0ZW1dICE9PSBudWxsICYmIG9ialtpdGVtXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9oZWxwZXJzLmdldEtleXNSZWN1cnNpdmUob2JqW2l0ZW1dLCBkZWxpbWl0ZXIsIHByZWZpeCArIGl0ZW0gKyBkZWxpbWl0ZXIsIGtleXMpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEVsZW1lbnQ6IGZ1bmN0aW9uIChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSwgZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsaW1pdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSAnLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwb3MgPSBwYXRoLmluZGV4T2YoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHZhciBrZXk7XG4gICAgICAgICAgICB2YXIgcmVzdDtcbiAgICAgICAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGF0aDtcbiAgICAgICAgICAgICAgICByZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gcGF0aC5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICByZXN0ID0gcGF0aC5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghKGtleSBpbiBvYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3QgPT09IG51bGwgfHwgcmVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KG9ialtrZXldLCByZXN0LCBkZWZhdWx0VmFsdWUsIGRlbGltaXRlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9mb3JtcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmZvcm1zLmpzJyk7XG5cbiAgICAvLyBrZXlzXG4gICAgdmFyIGxhcm91eF9rZXlzID0ge1xuICAgICAgICBrZXlOYW1lOiBmdW5jdGlvbiAoa2V5Y29kZSkge1xuICAgICAgICAgICAga2V5Y29kZSA9IGtleWNvZGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgc3dpdGNoIChrZXljb2RlKSB7XG4gICAgICAgICAgICBjYXNlICdiYWNrc3BhY2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiA4O1xuXG4gICAgICAgICAgICBjYXNlICd0YWInOlxuICAgICAgICAgICAgICAgIHJldHVybiA5O1xuXG4gICAgICAgICAgICBjYXNlICdlbnRlcic6XG4gICAgICAgICAgICBjYXNlICdyZXR1cm4nOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMztcblxuICAgICAgICAgICAgY2FzZSAnZXNjJzpcbiAgICAgICAgICAgIGNhc2UgJ2VzY2FwZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDI3O1xuXG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDMyO1xuXG4gICAgICAgICAgICBjYXNlICdwZ3VwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzM7XG5cbiAgICAgICAgICAgIGNhc2UgJ3BnZG4nOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNDtcblxuICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMzU7XG5cbiAgICAgICAgICAgIGNhc2UgJ2hvbWUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAzNjtcblxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM3O1xuXG4gICAgICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM4O1xuXG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDM5O1xuXG4gICAgICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gNDA7XG5cbiAgICAgICAgICAgIGNhc2UgJ2luc2VydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ1O1xuXG4gICAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiA0NjtcblxuICAgICAgICAgICAgY2FzZSAnZjEnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTI7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTEzO1xuXG4gICAgICAgICAgICBjYXNlICdmMyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNDtcblxuICAgICAgICAgICAgY2FzZSAnZjQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTU7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y1JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE2O1xuXG4gICAgICAgICAgICBjYXNlICdmNic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDExNztcblxuICAgICAgICAgICAgY2FzZSAnZjcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMTg7XG5cbiAgICAgICAgICAgIGNhc2UgJ2Y4JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTE5O1xuXG4gICAgICAgICAgICBjYXNlICdmOSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMDtcblxuICAgICAgICAgICAgY2FzZSAnZjEwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMTIxO1xuXG4gICAgICAgICAgICBjYXNlICdmMTEnOlxuICAgICAgICAgICAgICAgIHJldHVybiAxMjI7XG5cbiAgICAgICAgICAgIGNhc2UgJ2YxMic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDEyMztcblxuICAgICAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE4ODtcblxuICAgICAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5MDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Y29kZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8ge3RhcmdldCwga2V5LCBzaGlmdCwgY3RybCwgYWx0LCBkaXNhYmxlSW5wdXRzLCBmbmN9XG4gICAgICAgIGFzc2lnbjogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyID0gZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFldikge1xuICAgICAgICAgICAgICAgICAgICBldiA9IGV2ZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZXYudGFyZ2V0IHx8IGV2LnNyY0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDMgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMTEpIHsgLy8gZWxlbWVudC5ub2RlVHlwZSA9PT0gMSB8fFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpc2FibGVJbnB1dHMgJiYgbGFyb3V4X2Zvcm1zLmlzRm9ybUZpZWxkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaGlmdCAmJiAhZXYuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmN0cmwgJiYgIWV2LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFsdCAmJiAhZXYuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gbGFyb3V4X2tleXMua2V5TmFtZShvcHRpb25zLmtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gKGV2LmtleUNvZGUgfHwgZXYud2hpY2gpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmZuYyhldik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KG9wdGlvbnMudGFyZ2V0IHx8IGRvY3VtZW50LCAna2V5ZG93bicsIHdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfa2V5cztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X3N0YWNrID0gcmVxdWlyZSgnLi9sYXJvdXguc3RhY2suanMnKTtcblxuICAgIC8vIG12Y1xuICAgIHZhciBsYXJvdXhfbXZjID0ge1xuICAgICAgICBhcHBzOiB7fSxcbiAgICAgICAgcGF1c2VVcGRhdGU6IGZhbHNlLFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBsYXJvdXhfZG9tLnNlbGVjdEJ5SWQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIChtb2RlbC5jb25zdHJ1Y3RvciAhPT0gbGFyb3V4X3N0YWNrKSB7XG4gICAgICAgICAgICAvLyAgICAgbW9kZWwgPSBuZXcgbGFyb3V4X3N0YWNrKG1vZGVsKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgdmFyIGFwcEtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpO1xuXG4gICAgICAgICAgICBtb2RlbC5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X212Yy5wYXVzZVVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfbXZjLnVwZGF0ZShhcHBLZXkpOyAvLyAsIFtldmVudC5rZXldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5hcHBzW2FwcEtleV0gPSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwgLy8gLFxuICAgICAgICAgICAgICAgIC8vIG1vZGVsS2V5czogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBib3VuZEVsZW1lbnRzOiBudWxsLFxuICAgICAgICAgICAgICAgIC8vIGV2ZW50RWxlbWVudHM6IG51bGxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF9tdmMucmViaW5kKGFwcEtleSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmViaW5kOiBmdW5jdGlvbiAoYXBwS2V5KSB7XG4gICAgICAgICAgICB2YXIgYXBwID0gbGFyb3V4X212Yy5hcHBzW2FwcEtleV07XG4gICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgYXBwLm1vZGVsS2V5cyA9IGxhcm91eF9oZWxwZXJzLmdldEtleXNSZWN1cnNpdmUoYXBwLm1vZGVsLl9kYXRhKTsgLy8gRklYTUU6IHdvcmtzIG9ubHkgZm9yICRsLnN0YWNrXG4gICAgICAgICAgICBhcHAuYm91bmRFbGVtZW50cyA9IHt9O1xuICAgICAgICAgICAgYXBwLmV2ZW50RWxlbWVudHMgPSBbXTtcblxuICAgICAgICAgICAgbGFyb3V4X212Yy5zY2FuRWxlbWVudHMoYXBwLCBhcHAuZWxlbWVudCk7XG4gICAgICAgICAgICBsYXJvdXhfbXZjLnVwZGF0ZShhcHBLZXkpO1xuXG4gICAgICAgICAgICB2YXIgZm5jID0gZnVuY3Rpb24gKGV2LCBlbGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSBsYXJvdXhfbXZjLmJpbmRTdHJpbmdQYXJzZXIoZWxlbS5nZXRBdHRyaWJ1dGUoJ2xyLWV2ZW50JykpO1xuICAgICAgICAgICAgICAgIC8vIGxhcm91eF9tdmMucGF1c2VVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYmluZGluZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PT0gbnVsbCB8fCAhYmluZGluZy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZ1tpdGVtXS5jaGFyQXQoMCkgPT0gJ1xcJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDEsIGJpbmRpbmdbaXRlbV0ubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoMCwgNSkgPT0gJ2F0dHIuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLm1vZGVsW2l0ZW1dID0gZWxlbS5nZXRBdHRyaWJ1dGUoYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoNSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbmRpbmdbaXRlbV0uc3Vic3RyaW5nKDAsIDUpID09ICdwcm9wLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5tb2RlbFtpdGVtXSA9IGVsZW1bYmluZGluZ1tpdGVtXS5zdWJzdHJpbmcoNSldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGxhcm91eF9tdmMucGF1c2VVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcHAuZXZlbnRFbGVtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzW2ldLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGFwcC5ldmVudEVsZW1lbnRzW2ldLmJpbmRpbmdbbnVsbF0sXG4gICAgICAgICAgICAgICAgICAgIGZuY1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2NhbkVsZW1lbnRzOiBmdW5jdGlvbiAoYXBwLCBlbGVtZW50KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYXR0cyA9IGVsZW1lbnQuYXR0cmlidXRlcywgbSA9IGF0dHMubGVuZ3RoOyBpIDwgbTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dHNbaV0ubmFtZSA9PSAnbHItYmluZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcxID0gbGFyb3V4X212Yy5iaW5kU3RyaW5nUGFyc2VyKGF0dHNbaV0udmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gYmluZGluZzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmluZGluZzEuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwLmJvdW5kRWxlbWVudHNbYmluZGluZzFbaXRlbV1dID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5ib3VuZEVsZW1lbnRzW2JpbmRpbmcxW2l0ZW1dXS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHNbaV0ubmFtZSA9PSAnbHItZXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nMiA9IGxhcm91eF9tdmMuYmluZFN0cmluZ1BhcnNlcihhdHRzW2ldLnZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnRFbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiBiaW5kaW5nMlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBjaGxkcm4gPSBlbGVtZW50LmNoaWxkTm9kZXMsIG4gPSBjaGxkcm4ubGVuZ3RoOyBqIDwgbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNobGRybltqXS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfbXZjLnNjYW5FbGVtZW50cyhhcHAsIGNobGRybltqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKGFwcEtleSwga2V5cykge1xuICAgICAgICAgICAgdmFyIGFwcCA9IGxhcm91eF9tdmMuYXBwc1thcHBLZXldO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleXMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBrZXlzID0gYXBwLm1vZGVsS2V5cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aDEgPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICghKGtleXNbaV0gaW4gYXBwLmJvdW5kRWxlbWVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBib3VuZEVsZW1lbnQgPSBhcHAuYm91bmRFbGVtZW50c1trZXlzW2ldXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBsZW5ndGgyID0gYm91bmRFbGVtZW50Lmxlbmd0aDsgaiA8IGxlbmd0aDI7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYm91bmRFbGVtZW50W2pdLnRhcmdldC5zdWJzdHJpbmcoMCwgNikgPT0gJ3N0eWxlLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50LnN0eWxlW2JvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDYpXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA1KSA9PSAnYXR0ci4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSByZW1vdmVBdHRyaWJ1dGUgb24gbnVsbCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50LnNldEF0dHJpYnV0ZShib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZyg1KSwgbGFyb3V4X2hlbHBlcnMuZ2V0RWxlbWVudChhcHAubW9kZWwsIGtleXNbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3VuZEVsZW1lbnRbal0udGFyZ2V0LnN1YnN0cmluZygwLCA1KSA9PSAncHJvcC4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSByZW1vdmVBdHRyaWJ1dGUgb24gbnVsbCB2YWx1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kRWxlbWVudFtqXS5lbGVtZW50W2JvdW5kRWxlbWVudFtqXS50YXJnZXQuc3Vic3RyaW5nKDUpXSA9IGxhcm91eF9oZWxwZXJzLmdldEVsZW1lbnQoYXBwLm1vZGVsLCBrZXlzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBiaW5kU3RyaW5nUGFyc2VyOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgdmFyIGxhc3RCdWZmZXIgPSBudWxsLFxuICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICcnLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gMCxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHRleHQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyciA9IHRleHQuY2hhckF0KGkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyID09ICc6Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEJ1ZmZlciA9IGJ1ZmZlci50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnIgPT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2xhc3RCdWZmZXJdID0gYnVmZmVyLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBjdXJyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbGFzdEJ1ZmZlcl0gPSBidWZmZXIudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfbXZjO1xuXG59KCkpO1xuIiwiLypqc2xpbnQgbm9tZW46IHRydWUgKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBzdGFja1xuICAgIHZhciBsYXJvdXhfc3RhY2sgPSBmdW5jdGlvbiAoZGF0YSwgZGVwdGgsIHRvcCkge1xuICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIHRoaXMuX2RlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuX3RvcCA9IHRvcCB8fCB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGlzLl9kYXRhW2tleV07XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IG5ldyBsYXJvdXhfc3RhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcHRoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZXB0aCArICcuJyArIGtleSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGF0YVtrZXldID09PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5zZXQodGhpcywga2V5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0YVtrZXldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9wLm9udXBkYXRlKHsgc2NvcGU6IHRoaXMsIGtleToga2V5LCBvbGRWYWx1ZTogb2xkVmFsdWUsIG5ld1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRSYW5nZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHZhbHVlS2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhc093blByb3BlcnR5KHZhbHVlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldCh2YWx1ZUtleSwgdmFsdWVzW3ZhbHVlS2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW2tleV0gfHwgZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRSYW5nZSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4ga2V5cykge1xuICAgICAgICAgICAgICAgIGlmICgha2V5cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YWx1ZXNba2V5c1tpdGVtXV0gPSB0aGlzW2tleXNbaXRlbV1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKS5sZW5ndGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leGlzdHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gKGtleSBpbiB0aGlzLl9kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkgaW4gdGhpcy5fZGF0YSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2l0ZW1dO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2l0ZW1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbnVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFJhbmdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfc3RhY2s7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGxhcm91eF9kb20gPSByZXF1aXJlKCcuL2xhcm91eC5kb20uanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB0ZW1wbGF0ZXNcbiAgICB2YXIgbGFyb3V4X3RlbXBsYXRlcyA9IHtcbiAgICAgICAgZW5naW5lczoge1xuICAgICAgICAgICAgcGxhaW46IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt0ZW1wbGF0ZSwgb3B0aW9uc107XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY29tcGlsZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4O1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgobmV4dEluZGV4ID0gcmVzdWx0LmluZGV4T2YoJ3t7JywgbGFzdEluZGV4KSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXggKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbG9zZUluZGV4ID0gcmVzdWx0LmluZGV4T2YoJ319JywgbmV4dEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZUluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gcmVzdWx0LnN1YnN0cmluZyhuZXh0SW5kZXgsIGNsb3NlSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGljdFsne3snICsga2V5ICsgJ319J10gPSBsYXJvdXhfaGVscGVycy5nZXRFbGVtZW50KG1vZGVsLCBrZXksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IGNsb3NlSW5kZXggKyAyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhcm91eF9oZWxwZXJzLnJlcGxhY2VBbGwocmVzdWx0LCBkaWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBob2dhbjoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSG9nYW4uY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQucmVuZGVyKG1vZGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtdXN0YWNoZToge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTXVzdGFjaGUuY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGhhbmRsZWJhcnM6IHtcbiAgICAgICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbiAodGVtcGxhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKGNvbXBpbGVkLCBtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZWQobW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGxvZGFzaDoge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5jb21waWxlKHRlbXBsYXRlLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdW5kZXJzY29yZToge1xuICAgICAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAvKmpzbGludCBub21lbjogdHJ1ZSAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5jb21waWxlKHRlbXBsYXRlLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoY29tcGlsZWQsIG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlZChtb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmdpbmU6ICdwbGFpbicsXG5cbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uIChlbGVtZW50LCBtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQsIGVuZ2luZSA9IGxhcm91eF90ZW1wbGF0ZXMuZW5naW5lc1tsYXJvdXhfdGVtcGxhdGVzLmVuZ2luZV07XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxIHx8IGVsZW1lbnQubm9kZVR5cGUgPT09IDMgfHwgZWxlbWVudC5ub2RlVHlwZSA9PT0gMTEpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gZWxlbWVudC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IGVsZW1lbnQubm9kZVZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29tcGlsZWQgPSBlbmdpbmUuY29tcGlsZShjb250ZW50LCBvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBlbmdpbmUucmVuZGVyKGNvbXBpbGVkLCBtb2RlbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0OiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwsIHRhcmdldCwgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBsYXJvdXhfdGVtcGxhdGVzLmFwcGx5KGVsZW1lbnQsIG1vZGVsLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgbGFyb3V4X2RvbS5pbnNlcnQodGFyZ2V0LCBwb3NpdGlvbiB8fCAnYmVmb3JlZW5kJywgb3V0cHV0KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlOiBmdW5jdGlvbiAoZWxlbWVudCwgbW9kZWwsIHRhcmdldCwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGxhcm91eF90ZW1wbGF0ZXMuYXBwbHkoZWxlbWVudCwgbW9kZWwsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBsYXJvdXhfZG9tLnJlcGxhY2UodGFyZ2V0LCBvdXRwdXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBsYXJvdXhfdGVtcGxhdGVzO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIHRpbWVyc1xuICAgIHZhciBsYXJvdXhfdGltZXJzID0ge1xuICAgICAgICBkYXRhOiBbXSxcblxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh0aW1lcikge1xuICAgICAgICAgICAgdGltZXIubmV4dCA9IERhdGUubm93KCkgKyB0aW1lci50aW1lb3V0O1xuICAgICAgICAgICAgbGFyb3V4X3RpbWVycy5kYXRhLnB1c2godGltZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0S2V5ID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdGltZXJzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90aW1lcnMuZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdGltZXJzLmRhdGFbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0uaWQgIT09IHVuZGVmaW5lZCAmJiBjdXJyZW50SXRlbS5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRLZXkgPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEuc3BsaWNlKHRhcmdldEtleSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbnRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlS2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdGltZXJzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90aW1lcnMuZGF0YS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdGltZXJzLmRhdGFbaXRlbV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0ubmV4dCA8PSBub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGN1cnJlbnRJdGVtLm9udGljayhjdXJyZW50SXRlbS5zdGF0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UgJiYgY3VycmVudEl0ZW0ucmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLm5leHQgPSBub3cgKyBjdXJyZW50SXRlbS50aW1lb3V0O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlS2V5cy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLmRhdGEuc3BsaWNlKHJlbW92ZUtleXNbaXRlbTJdLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3RpbWVycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpO1xuXG4gICAgLy8gdG91Y2ggLSBwYXJ0aWFsbHkgdGFrZW4gZnJvbSAndG9jY2EuanMnIHByb2plY3RcbiAgICAvLyAgICAgICAgIGNhbiBiZSBmb3VuZCBhdDogaHR0cHM6Ly9naXRodWIuY29tL0dpYW5sdWNhR3VhcmluaS9Ub2NjYS5qc1xuICAgIHZhciBsYXJvdXhfdG91Y2ggPSB7XG4gICAgICAgIHRvdWNoU3RhcnRlZDogbnVsbCxcbiAgICAgICAgc3dpcGVUcmVzaG9sZDogODAsXG4gICAgICAgIHByZWNpc2lvbjogMzAsXG4gICAgICAgIHRhcENvdW50OiAwLFxuICAgICAgICB0YXBUcmVzaG9sZDogMjAwLFxuICAgICAgICBsb25nVGFwVHJlc2hvbGQ6IDgwMCxcbiAgICAgICAgdGFwVGltZXI6IG51bGwsXG4gICAgICAgIHBvczogbnVsbCxcbiAgICAgICAgY2FjaGVkOiBudWxsLFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgc3RhcnQ6IFsndG91Y2hzdGFydCcsICdwb2ludGVyZG93bicsICdNU1BvaW50ZXJEb3duJywgJ21vdXNlZG93biddLFxuICAgICAgICAgICAgZW5kOiBbJ3RvdWNoZW5kJywgJ3BvaW50ZXJ1cCcsICdNU1BvaW50ZXJVcCcsICdtb3VzZXVwJ10sXG4gICAgICAgICAgICBtb3ZlOiBbJ3RvdWNobW92ZScsICdwb2ludGVybW92ZScsICdNU1BvaW50ZXJNb3ZlJywgJ21vdXNlbW92ZSddXG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYXRlUG9pbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcykge1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnBvcyA9IFtldmVudC5wYWdlWCwgZXZlbnQucGFnZVldO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAobmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpID8gMiA6IDEsXG4gICAgICAgICAgICAgICAgM1xuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGV2ZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZG9jdW1lbnQsIGxhcm91eF90b3VjaC5ldmVudHMuc3RhcnRbZXZlbnRzW2ldXSwgbGFyb3V4X3RvdWNoLm9uc3RhcnQpO1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnRTaW5nbGUoZG9jdW1lbnQsIGxhcm91eF90b3VjaC5ldmVudHMuZW5kW2V2ZW50c1tpXV0sIGxhcm91eF90b3VjaC5vbmVuZCk7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudFNpbmdsZShkb2N1bWVudCwgbGFyb3V4X3RvdWNoLmV2ZW50cy5tb3ZlW2V2ZW50c1tpXV0sIGxhcm91eF90b3VjaC5sb2NhdGVQb2ludGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbnN0YXJ0OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC5sb2NhdGVQb2ludGVyKGV2ZW50KTtcbiAgICAgICAgICAgIGxhcm91eF90b3VjaC5jYWNoZWQgPSBbbGFyb3V4X3RvdWNoLnBvc1swXSwgbGFyb3V4X3RvdWNoLnBvc1sxXV07XG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudG91Y2hTdGFydGVkID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIC8qanNsaW50IHBsdXNwbHVzOiB0cnVlICovXG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQrKztcblxuICAgICAgICAgICAgdmFyIGZuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3RvdWNoLmNhY2hlZFswXSA+PSBsYXJvdXhfdG91Y2gucG9zWzBdIC0gbGFyb3V4X3RvdWNoLnByZWNpc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZFswXSA8PSBsYXJvdXhfdG91Y2gucG9zWzBdICsgbGFyb3V4X3RvdWNoLnByZWNpc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZFsxXSA+PSBsYXJvdXhfdG91Y2gucG9zWzFdIC0gbGFyb3V4X3RvdWNoLnByZWNpc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLmNhY2hlZFsxXSA8PSBsYXJvdXhfdG91Y2gucG9zWzFdICsgbGFyb3V4X3RvdWNoLnByZWNpc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGFyb3V4X3RvdWNoLnRhcENvdW50ID09PSAyKSA/ICdkYmx0YXAnIDogJ3RhcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lckV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogbGFyb3V4X3RvdWNoLnBvc1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogbGFyb3V4X3RvdWNoLnBvc1sxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC50YXBDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPiBsYXJvdXhfdG91Y2gubG9uZ1RhcFRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsb25ndGFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBsYXJvdXhfdG91Y2gucG9zWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBsYXJvdXhfdG91Y2gucG9zWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRvdWNoU3RhcnRlZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3RvdWNoLnRhcFRpbWVyID0gc2V0VGltZW91dChmbmMsIGxhcm91eF90b3VjaC50YXBUcmVzaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwQ291bnQgPSAwO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGxhcm91eF90b3VjaC50YXBUaW1lcik7XG4gICAgICAgICAgICBsYXJvdXhfdG91Y2gudGFwVGltZXIgPSBzZXRUaW1lb3V0KGZuYywgbGFyb3V4X3RvdWNoLnRhcFRyZXNob2xkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbmVuZDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBbXG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF90b3VjaC5wb3NbMF0gLSBsYXJvdXhfdG91Y2guY2FjaGVkWzBdLFxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdG91Y2gucG9zWzFdIC0gbGFyb3V4X3RvdWNoLmNhY2hlZFsxXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHg6IGxhcm91eF90b3VjaC5wb3NbMF0sXG4gICAgICAgICAgICAgICAgICAgIHk6IGxhcm91eF90b3VjaC5wb3NbMV0sXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBNYXRoLmFicyhkZWx0YVswXSksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBNYXRoLmFicyhkZWx0YVsxXSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxhcm91eF90b3VjaC50b3VjaFN0YXJ0ZWQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMF0gPD0gLWxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBlcmlnaHQnLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlbHRhWzBdID49IGxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBlbGVmdCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMV0gPD0gLWxhcm91eF90b3VjaC5zd2lwZVRyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5kaXNwYXRjaEV2ZW50KGV2ZW50LnRhcmdldCwgJ3N3aXBlZG93bicsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVsdGFbMV0gPj0gbGFyb3V4X3RvdWNoLnN3aXBlVHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLmRpc3BhdGNoRXZlbnQoZXZlbnQudGFyZ2V0LCAnc3dpcGV1cCcsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGxhcm91eC5yZWFkeShsYXJvdXhfdG91Y2guaW5pdCk7XG5cbiAgICByZXR1cm4gbGFyb3V4X3RvdWNoO1xuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKTtcblxuICAgIC8vIHRyaWdnZXJzXG4gICAgdmFyIGxhcm91eF90cmlnZ2VycyA9IHtcbiAgICAgICAgZGVsZWdhdGVzOiBbXSxcbiAgICAgICAgbGlzdDogW10sXG5cbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoY29uZGl0aW9uLCBmbmMsIHN0YXRlKSB7XG4gICAgICAgICAgICB2YXIgY29uZGl0aW9ucyA9IGxhcm91eF9oZWxwZXJzLmdldEFzQXJyYXkoY29uZGl0aW9uKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBjb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25kaXRpb25zLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfaGVscGVycy5haW5kZXgobGFyb3V4X3RyaWdnZXJzLmxpc3QsIGNvbmRpdGlvbnNbaXRlbV0pID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMubGlzdC5wdXNoKGNvbmRpdGlvbnNbaXRlbV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFyb3V4X3RyaWdnZXJzLmRlbGVnYXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb25kaXRpb25zOiBjb25kaXRpb25zLFxuICAgICAgICAgICAgICAgIGZuYzogZm5jLFxuICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb250cmlnZ2VyOiBmdW5jdGlvbiAodHJpZ2dlck5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBldmVudElkeCA9IGxhcm91eF9oZWxwZXJzLmFpbmRleChsYXJvdXhfdHJpZ2dlcnMubGlzdCwgdHJpZ2dlck5hbWUpO1xuICAgICAgICAgICAgaWYgKGV2ZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxhcm91eF90cmlnZ2Vycy5saXN0LnNwbGljZShldmVudElkeCwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIGxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhcm91eF90cmlnZ2Vycy5kZWxlZ2F0ZXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzW2l0ZW1dO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29uZGl0aW9uS2V5IGluIGN1cnJlbnRJdGVtLmNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50SXRlbS5jb25kaXRpb25zLmhhc093blByb3BlcnR5KGNvbmRpdGlvbktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbmRpdGlvbk9iaiA9IGN1cnJlbnRJdGVtLmNvbmRpdGlvbnNbY29uZGl0aW9uS2V5XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobGFyb3V4X2hlbHBlcnMuYWluZGV4KGxhcm91eF90cmlnZ2Vycy5saXN0LCBjb25kaXRpb25PYmopICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZuYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogY3VycmVudEl0ZW0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogbGFyb3V4X2hlbHBlcnMuZ2V0QXNBcnJheShhcmdzKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVLZXlzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtMiBpbiByZW1vdmVLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVLZXlzLmhhc093blByb3BlcnR5KGl0ZW0yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfdHJpZ2dlcnMuZGVsZWdhdGVzLnNwbGljZShyZW1vdmVLZXlzW2l0ZW0yXSwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0cmlnZ2VyIG5hbWU6ICcgKyB0cmlnZ2VyTmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGxhcm91eF90cmlnZ2VycztcblxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgbGFyb3V4X2RvbSA9IHJlcXVpcmUoJy4vbGFyb3V4LmRvbS5qcycpLFxuICAgICAgICBsYXJvdXhfaGVscGVycyA9IHJlcXVpcmUoJy4vbGFyb3V4LmhlbHBlcnMuanMnKSxcbiAgICAgICAgbGFyb3V4X2NzcyA9IHJlcXVpcmUoJy4vbGFyb3V4LmNzcy5qcycpLFxuICAgICAgICBsYXJvdXhfdGltZXJzID0gcmVxdWlyZSgnLi9sYXJvdXgudGltZXJzLmpzJyksXG4gICAgICAgIGxhcm91eF9kYXRlID0gcmVxdWlyZSgnLi9sYXJvdXguZGF0ZS5qcycpO1xuXG4gICAgLy8gdWlcbiAgICB2YXIgbGFyb3V4X3VpID0ge1xuICAgICAgICBmbG9hdENvbnRhaW5lcjogbnVsbCxcblxuICAgICAgICBwb3B1cDoge1xuICAgICAgICAgICAgZGVmYXVsdFRpbWVvdXQ6IDUwMCxcblxuICAgICAgICAgICAgY3JlYXRlQm94OiBmdW5jdGlvbiAoaWQsIHhjbGFzcywgbWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXJvdXhfZG9tLmNyZWF0ZUVsZW1lbnQoJ0RJVicsIHsgaWQ6IGlkLCAnY2xhc3MnOiB4Y2xhc3MgfSwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtc2dib3g6IGZ1bmN0aW9uICh0aW1lb3V0LCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gbGFyb3V4X2hlbHBlcnMuZ2V0VW5pcXVlSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gbGFyb3V4X3VpLnBvcHVwLmNyZWF0ZUJveChpZCwgJ2xhcm91eE1zZ0JveCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5mbG9hdENvbnRhaW5lci5hcHBlbmRDaGlsZChvYmopO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShvYmosIHsgb3BhY2l0eTogMSB9KTtcblxuICAgICAgICAgICAgICAgIGxhcm91eF90aW1lcnMuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBvbnRpY2s6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsYXJvdXhfY3NzLnNldFByb3BlcnR5KHgsIHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20ucmVtb3ZlKHgpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogb2JqXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZGluZzoge1xuICAgICAgICAgICAgZWxlbWVudFNlbGVjdG9yOiBudWxsLFxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGRlZmF1bHREZWxheTogMTUwMCxcbiAgICAgICAgICAgIHRpbWVyOiBudWxsLFxuXG4gICAgICAgICAgICBraWxsVGltZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQobGFyb3V4X3VpLmxvYWRpbmcudGltZXIpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxhcm91eF91aS5sb2FkaW5nLmtpbGxUaW1lcigpO1xuXG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50LCB7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciA9ICdmYWxzZSc7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzaG93OiBmdW5jdGlvbiAoZGVsYXkpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5raWxsVGltZXIoKTtcblxuICAgICAgICAgICAgICAgIGlmIChkZWxheSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGF5ID0gbGFyb3V4X3VpLmxvYWRpbmcuZGVmYXVsdERlbGF5O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGxhcm91eF91aS5sb2FkaW5nLnNob3coMCk7IH0sIGRlbGF5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfY3NzLnNldFByb3BlcnR5KGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnQsIHsgZGlzcGxheTogJ2Jsb2NrJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmxvYWRpbmdJbmRpY2F0b3IgPSAndHJ1ZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50ID09PSBudWxsICYmIGxhcm91eF91aS5sb2FkaW5nLmVsZW1lbnRTZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5lbGVtZW50ID0gbGFyb3V4X2RvbS5zZWxlY3RTaW5nbGUobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudFNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLmxvYWRpbmcuZWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfZG9tLnNldEV2ZW50KHdpbmRvdywgJ2xvYWQnLCBsYXJvdXhfdWkubG9hZGluZy5oaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5zZXRFdmVudCh3aW5kb3csICdiZWZvcmV1bmxvYWQnLCBsYXJvdXhfdWkubG9hZGluZy5zaG93KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmxvYWRpbmdJbmRpY2F0b3IgIT09IHVuZGVmaW5lZCAmJiBsb2NhbFN0b3JhZ2UubG9hZGluZ0luZGljYXRvciA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkubG9hZGluZy5zaG93KDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGR5bmFtaWNEYXRlczoge1xuICAgICAgICAgICAgdXBkYXRlRGF0ZXNFbGVtZW50czogbnVsbCxcblxuICAgICAgICAgICAgdXBkYXRlRGF0ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc0VsZW1lbnRzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50cyA9IGxhcm91eF9kb20uc2VsZWN0KCcqW2RhdGEtZXBvY2hdJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsYXJvdXhfdWkuZHluYW1pY0RhdGVzLnVwZGF0ZURhdGVzRWxlbWVudHMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iaiA9IGxhcm91eF91aS5keW5hbWljRGF0ZXMudXBkYXRlRGF0ZXNFbGVtZW50c1tpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYml0c2hpZnRpbmcgKHN0ciA+PiAwKSB1c2VkIGluc3RlYWQgb2YgcGFyc2VJbnQoc3RyLCAxMClcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgob2JqLmdldEF0dHJpYnV0ZSgnZGF0YS1lcG9jaCcpID4+IDApICogMTAwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RvbS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X2RhdGUuZ2V0RGF0ZVN0cmluZyhkYXRlKVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbGFyb3V4X2RhdGUuZ2V0TG9uZ0RhdGVTdHJpbmcoZGF0ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsYXJvdXhfdGltZXJzLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9udGljazogbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy51cGRhdGVEYXRlc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNjcm9sbFZpZXc6IHtcbiAgICAgICAgICAgIHNlbGVjdGVkRWxlbWVudHM6IFtdLFxuXG4gICAgICAgICAgICBvbmhpZGRlbjogZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eShlbGVtZW50cywgeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbihlbGVtZW50cywgWydvcGFjaXR5J10pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25yZXZlYWw6IGZ1bmN0aW9uIChlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGxhcm91eF9jc3Muc2V0UHJvcGVydHkoZWxlbWVudHMsIHsgb3BhY2l0eTogMSB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBsYXJvdXhfaGVscGVycy5nZXRBc0FycmF5KGVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGFyb3V4X2Nzcy5pblZpZXdwb3J0KGVsZW1lbnRzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cy5wdXNoKGVsZW1lbnRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3Lm9uaGlkZGVuKGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMpO1xuICAgICAgICAgICAgICAgIGxhcm91eF9kb20uc2V0RXZlbnQod2luZG93LCAnc2Nyb2xsJywgbGFyb3V4X3VpLnNjcm9sbFZpZXcucmV2ZWFsKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJldmVhbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdmVLZXlzID0gW10sXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gW107XG5cbiAgICAgICAgICAgICAgICBsYXJvdXhfaGVscGVycy5lYWNoKFxuICAgICAgICAgICAgICAgICAgICBsYXJvdXhfdWkuc2Nyb2xsVmlldy5zZWxlY3RlZEVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhcm91eF9jc3MuaW5WaWV3cG9ydChlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUtleXMudW5zaGlmdChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gcmVtb3ZlS2V5cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlbW92ZUtleXMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFyb3V4X3VpLnNjcm9sbFZpZXcuc2VsZWN0ZWRFbGVtZW50cy5zcGxpY2UocmVtb3ZlS2V5c1tpdGVtXSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxhcm91eF91aS5zY3JvbGxWaWV3LnNlbGVjdGVkRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF9kb20udW5zZXRFdmVudCh3aW5kb3csICdzY3JvbGwnLCBsYXJvdXhfdWkuc2Nyb2xsVmlldy5yZXZlYWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhcm91eF91aS5zY3JvbGxWaWV3Lm9ucmV2ZWFsKGVsZW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRmxvYXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghbGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgbGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyID0gbGFyb3V4X2RvbS5jcmVhdGVFbGVtZW50KCdESVYnLCB7ICdjbGFzcyc6ICdsYXJvdXhGbG9hdERpdicgfSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUobGFyb3V4X3VpLmZsb2F0Q29udGFpbmVyLCBkb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxhcm91eF91aS5jcmVhdGVGbG9hdENvbnRhaW5lcigpO1xuICAgICAgICAgICAgbGFyb3V4X3VpLmxvYWRpbmcuaW5pdCgpO1xuICAgICAgICAgICAgbGFyb3V4X3VpLmR5bmFtaWNEYXRlcy5pbml0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gbGFyb3V4LnJlYWR5KGxhcm91eF91aS5pbml0KTtcblxuICAgIHJldHVybiBsYXJvdXhfdWk7XG5cbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gdmFyc1xuICAgIHZhciBsYXJvdXhfdmFycyA9IHtcbiAgICAgICAgY29va2llUGF0aDogJy8nLFxuXG4gICAgICAgIGdldENvb2tpZTogZnVuY3Rpb24gKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPVteO10rJywgJ2knKSxcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChyZSk7XG5cbiAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbMF0uc3BsaXQoJz0nKVsxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Q29va2llOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgpIHtcbiAgICAgICAgICAgIHZhciBleHBpcmVWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgaWYgKGV4cGlyZXMpIHtcbiAgICAgICAgICAgICAgICBleHBpcmVWYWx1ZSA9ICc7IGV4cGlyZXM9JyArIGV4cGlyZXMudG9HTVRTdHJpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG9jdW1lbnQuY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSArIGV4cGlyZVZhbHVlICsgJzsgcGF0aD0nICsgKHBhdGggfHwgbGFyb3V4X3ZhcnMuY29va2llUGF0aCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlQ29va2llOiBmdW5jdGlvbiAobmFtZSwgcGF0aCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz07IGV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBHTVQ7IHBhdGg9JyArIChwYXRoIHx8IGxhcm91eF92YXJzLmNvb2tpZVBhdGgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldExvY2FsOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIGxvY2FsU3RvcmFnZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZVtuYW1lXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TG9jYWw6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlW25hbWVdID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUxvY2FsOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIGxvY2FsU3RvcmFnZVtuYW1lXTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTZXNzaW9uOiBmdW5jdGlvbiAobmFtZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIHNlc3Npb25TdG9yYWdlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2VbbmFtZV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFNlc3Npb246IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlU2Vzc2lvbjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzZXNzaW9uU3RvcmFnZVtuYW1lXTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbGFyb3V4X3ZhcnM7XG5cbn0oKSk7XG4iLCIvKmdsb2JhbCBOb2RlTGlzdCwgTm9kZSAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBsYXJvdXhfZG9tID0gcmVxdWlyZSgnLi9sYXJvdXguZG9tLmpzJyksXG4gICAgICAgIGxhcm91eF9jc3MgPSByZXF1aXJlKCcuL2xhcm91eC5jc3MuanMnKSxcbiAgICAgICAgbGFyb3V4X2hlbHBlcnMgPSByZXF1aXJlKCcuL2xhcm91eC5oZWxwZXJzLmpzJyk7XG5cbiAgICAvLyB3cmFwcGVyXG4gICAgdmFyIGxhcm91eF93cmFwcGVyID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbjtcblxuICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0b3I7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBOb2RlTGlzdCkge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gbGFyb3V4X2hlbHBlcnMudG9BcnJheShzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBbc2VsZWN0b3JdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gbGFyb3V4X2RvbS5zZWxlY3Qoc2VsZWN0b3IsIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZShzZWxlY3Rpb25bMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlKHNlbGVjdGlvbik7XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnNpbmdsZVRlbXBsYXRlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmlzQXJyYXkgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwIHx8IGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFyb3V4X3dyYXBwZXIoc2VsZWN0b3IsIHRoaXMuc291cmNlKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgbGFyb3V4X3dyYXBwZXIuYXJyYXlUZW1wbGF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50cykge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IGVsZW1lbnRzO1xuICAgICAgICB0aGlzLmlzQXJyYXkgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VbaW5kZXhdO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGggPSAwO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlID0gMTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckFycmF5ID0gMjtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsIGZuYywgc2NvcGUpIHtcbiAgICAgICAgdmFyIG5ld0ZuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBmbmMuYXBwbHkoXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBbdGhpcy5zb3VyY2VdLmNvbmNhdChsYXJvdXhfaGVscGVycy50b0FycmF5KGFyZ3VtZW50cykpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoIChzY29wZSkge1xuICAgICAgICBjYXNlIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlOlxuICAgICAgICAgICAgbGFyb3V4X3dyYXBwZXIuc2luZ2xlVGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJBcnJheTpcbiAgICAgICAgICAgIGxhcm91eF93cmFwcGVyLmFycmF5VGVtcGxhdGUucHJvdG90eXBlW25hbWVdID0gbmV3Rm5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5zaW5nbGVUZW1wbGF0ZS5wcm90b3R5cGVbbmFtZV0gPSBuZXdGbmM7XG4gICAgICAgICAgICBsYXJvdXhfd3JhcHBlci5hcnJheVRlbXBsYXRlLnByb3RvdHlwZVtuYW1lXSA9IG5ld0ZuYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdhdHRyJywgbGFyb3V4X2RvbS5hdHRyLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2RhdGEnLCBsYXJvdXhfZG9tLmRhdGEsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignb24nLCBsYXJvdXhfZG9tLnNldEV2ZW50U2luZ2xlLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ29uJywgbGFyb3V4X2RvbS5zZXRFdmVudCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJBcnJheSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ29mZicsIGxhcm91eF9kb20udW5zZXRFdmVudCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignY2xlYXInLCBsYXJvdXhfZG9tLmNsZWFyLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2luc2VydCcsIGxhcm91eF9kb20uaW5zZXJ0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3ByZXBlbmQnLCBsYXJvdXhfZG9tLnByZXBlbmQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYXBwZW5kJywgbGFyb3V4X2RvbS5hcHBlbmQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVwbGFjZScsIGxhcm91eF9kb20ucmVwbGFjZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZXBsYWNlVGV4dCcsIGxhcm91eF9kb20ucmVwbGFjZVRleHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcigncmVtb3ZlJywgbGFyb3V4X2RvbS5yZW1vdmUsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcblxuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdoYXNDbGFzcycsIGxhcm91eF9jc3MuaGFzQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYWRkQ2xhc3MnLCBsYXJvdXhfY3NzLmFkZENsYXNzLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlckJvdGgpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdyZW1vdmVDbGFzcycsIGxhcm91eF9jc3MucmVtb3ZlQ2xhc3MsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyQm90aCk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3RvZ2dsZUNsYXNzJywgbGFyb3V4X2Nzcy50b2dnbGVDbGFzcywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignZ2V0UHJvcGVydHknLCBsYXJvdXhfY3NzLmdldFByb3BlcnR5LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3NldFByb3BlcnR5JywgbGFyb3V4X2Nzcy5zZXRQcm9wZXJ0eSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2V0VHJhbnNpdGlvbicsIGxhcm91eF9jc3Muc2V0VHJhbnNpdGlvbiwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3Rlcignc2hvdycsIGxhcm91eF9jc3Muc2hvdywgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaGlkZScsIGxhcm91eF9jc3MuaGlkZSwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJCb3RoKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaGVpZ2h0JywgbGFyb3V4X2Nzcy5oZWlnaHQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5uZXJIZWlnaHQnLCBsYXJvdXhfY3NzLmlubmVySGVpZ2h0LCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ291dGVySGVpZ2h0JywgbGFyb3V4X2Nzcy5vdXRlckhlaWdodCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCd3aWR0aCcsIGxhcm91eF9jc3Mud2lkdGgsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5uZXJXaWR0aCcsIGxhcm91eF9jc3MuaW5uZXJXaWR0aCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuICAgIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyKCdvdXRlcldpZHRoJywgbGFyb3V4X2Nzcy5vdXRlcldpZHRoLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3RvcCcsIGxhcm91eF9jc3MudG9wLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2xlZnQnLCBsYXJvdXhfY3NzLmxlZnQsIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignYWJvdmVUaGVUb3AnLCBsYXJvdXhfY3NzLmFib3ZlVGhlVG9wLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2JlbG93VGhlRm9sZCcsIGxhcm91eF9jc3MuYmVsb3dUaGVGb2xkLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ2xlZnRPZlNjcmVlbicsIGxhcm91eF9jc3MubGVmdE9mU2NyZWVuLCBsYXJvdXhfd3JhcHBlci5yZWdpc3RlclNpbmdsZSk7XG4gICAgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXIoJ3JpZ2h0T2ZTY3JlZW4nLCBsYXJvdXhfY3NzLnJpZ2h0T2ZTY3JlZW4sIGxhcm91eF93cmFwcGVyLnJlZ2lzdGVyU2luZ2xlKTtcbiAgICBsYXJvdXhfd3JhcHBlci5yZWdpc3RlcignaW5WaWV3cG9ydCcsIGxhcm91eF9jc3MuaW5WaWV3cG9ydCwgbGFyb3V4X3dyYXBwZXIucmVnaXN0ZXJTaW5nbGUpO1xuXG4gICAgcmV0dXJuIGxhcm91eF93cmFwcGVyO1xuXG59KCkpO1xuIl19
