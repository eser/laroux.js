/**
 * laroux.js - A jquery substitute for modern browsers (web bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

(function (scope) {
    'use strict';

    var emptyFunction = function emptyFunction() {};

    if (scope.document === undefined) {
        scope.document = {
            attachEvent: emptyFunction,
            createEventObject: emptyFunction,
            readyState: null
        };
    }

    if (!('requestAnimationFrame' in scope)) {
        scope.requestAnimationFrame = function (callback) {
            setTimeout(function () {
                callback(Date.now());
            }, 50);
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
            addListener = function addListener(eventname, callback) {
            var self = this,
                wrapper = function wrapper(event) {
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
            removeListener = function removeListener(eventname, callback) {
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
            dispatchEvent = function dispatchEvent(event) {
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
            get: function get() {
                return innerText.get.call(this);
            },
            set: function set(value) {
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
            get: function get() {
                return this.children[0];
            }
        });
    }

    if (!('classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function get() {
                var self = this;

                return {
                    add: function add(className) {
                        self.className = self.className.trim() + ' ' + className;
                    },

                    remove: function remove(className) {
                        self.className = self.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                    },

                    contains: function contains(className) {
                        return new RegExp('(^| )' + className + '( |$)', 'gi').test(self.className);
                    }
                };
            }
        });
    }

    if (!('textContent' in Text.prototype)) {
        var nodeValue = Object.getOwnPropertyDescriptor(Text.prototype, 'nodeValue');

        Object.defineProperty(Text.prototype, 'textContent', {
            get: function get() {
                return nodeValue.get.call(this);
            },
            set: function set(value) {
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
})(typeof window !== 'undefined' ? window : global);

(function () {
    'use strict';

    var top = typeof global !== 'undefined' ? global : window;

    // core
    top.laroux = function (selector, parent) {
        if (selector instanceof Array) {
            return laroux.toArray((parent || document).querySelectorAll(selector));
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
    if (top.$l === undefined) {
        top.$l = laroux;
    }

    laroux.extendObject = function () {
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
                    laroux.extendObject(target[name], arguments[item][name]);
                    continue;
                }

                target[name] = arguments[item][name];
            }
        }
    };

    laroux.toArray = function (obj) {
        var length = obj.length,
            items = new Array(length);

        for (var i = 0; i < length; i++) {
            items[i] = obj[i];
        }
        return items;
    };

    laroux.ns = function (path, obj) {
        var pathSlices = path.split('.'),
            parent = top;

        for (var i = 0, length1 = pathSlices.length; i < length1; i++) {
            var current = pathSlices[i];

            if (parent[current] === undefined) {
                parent[current] = {};
            }

            parent = parent[current];
        }

        if (obj !== undefined) {
            laroux.extendObject(parent, obj);
        }

        return parent;
    };
}).call(undefined);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
