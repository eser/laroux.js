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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGFyb3V4LmJhY2t3YXJkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChzY29wZSkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBlbXB0eUZ1bmN0aW9uID0gZnVuY3Rpb24gKCkge307XG5cbiAgICBpZiAoc2NvcGUuZG9jdW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzY29wZS5kb2N1bWVudCA9IHtcbiAgICAgICAgICAgIGF0dGFjaEV2ZW50OiBlbXB0eUZ1bmN0aW9uLFxuICAgICAgICAgICAgY3JlYXRlRXZlbnRPYmplY3Q6IGVtcHR5RnVuY3Rpb24sXG4gICAgICAgICAgICByZWFkeVN0YXRlOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gc2NvcGUpKSB7XG4gICAgICAgIHNjb3BlLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKERhdGUubm93KCkpOyB9LCA1MCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ2dldENvbXB1dGVkU3R5bGUnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS5nZXRDb21wdXRlZFN0eWxlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0UHJvcGVydHlWYWx1ZSA9IGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gLyhcXC0oW2Etel0pezF9KS9nO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSAnZmxvYXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3AgPSAnc3R5bGVGbG9hdCc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9IHByb3AucmVwbGFjZShyZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1syXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmN1cnJlbnRTdHlsZVtwcm9wXSB8fCBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5nZXRQcm9wZXJ0eUNTU1ZhbHVlID0gZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENTU1ByaW1pdGl2ZVZhbHVlKHRoaXMuZWxlbWVudCwgcHJvcCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnQ1NTUHJpbWl0aXZlVmFsdWUnIGluIHNjb3BlKSkge1xuICAgICAgICBzY29wZS5DU1NQcmltaXRpdmVWYWx1ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5wcm9wID0gcHJvcDtcbiAgICAgICAgICAgIHRoaXMucHJpbWl0aXZlVHlwZSA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0RmxvYXRWYWx1ZSA9IGZ1bmN0aW9uIChwcmltaXRpdmVUeXBlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gLyhcXC0oW2Etel0pezF9KS9nLFxuICAgICAgICAgICAgICAgICAgICBwcm9wID0gdGhpcy5wcm9wO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByb3AgPT09ICdmbG9hdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9ICdzdHlsZUZsb2F0JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocmUudGVzdChwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gcHJvcC5yZXBsYWNlKHJlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJndW1lbnRzWzJdLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY3VycmVudFN0eWxlW3Byb3BdIHx8IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChzY29wZS5FdmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNjb3BlLkV2ZW50ID0gZW1wdHlGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISgncHJldmVudERlZmF1bHQnIGluIEV2ZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRXZlbnQucHJvdG90eXBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdzdG9wUHJvcGFnYXRpb24nIGluIEV2ZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRXZlbnQucHJvdG90eXBlLnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuRWxlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNjb3BlLkVsZW1lbnQgPSBlbXB0eUZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGlmICghKCdhZGRFdmVudExpc3RlbmVyJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gW10sXG4gICAgICAgICAgICBhZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQgPSBldmVudC5zcmNFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldCA9IHNlbGY7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICgnaGFuZGxlRXZlbnQnIGluIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY2FsbGJhY2suaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNlbGYsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChldmVudG5hbWUgIT09ICdET01Db250ZW50TG9hZGVkJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudG5hbWUsIHdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVycy5wdXNoKHsgb2JqZWN0OiB0aGlzLCB0eXBlOiBldmVudG5hbWUsIGxpc3RlbmVyOiBjYWxsYmFjaywgd3JhcHBlcjogd3JhcHBlciB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RlbmVyID0gZXZlbnRMaXN0ZW5lcnNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXIub2JqZWN0ID09PSB0aGlzICYmIGV2ZW50TGlzdGVuZXIudHlwZSA9PT0gZXZlbnRuYW1lICYmIGV2ZW50TGlzdGVuZXIubGlzdGVuZXIgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRuYW1lICE9ICdET01Db250ZW50TG9hZGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50bmFtZSwgZXZlbnRMaXN0ZW5lci53cmFwcGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudE9iamVjdCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlRXZlbnQoJ29uJyArIGV2ZW50LnR5cGUsIGV2ZW50T2JqZWN0KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZExpc3RlbmVyO1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlTGlzdGVuZXI7XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuXG4gICAgICAgIGlmIChzY29wZS5IVE1MRG9jdW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgSFRNTERvY3VtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gYWRkTGlzdGVuZXI7XG4gICAgICAgICAgICBIVE1MRG9jdW1lbnQucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVMaXN0ZW5lcjtcbiAgICAgICAgICAgIEhUTUxEb2N1bWVudC5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NvcGUuV2luZG93ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIFdpbmRvdy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZExpc3RlbmVyO1xuICAgICAgICAgICAgV2luZG93LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlTGlzdGVuZXI7XG4gICAgICAgICAgICBXaW5kb3cucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRPYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgICAgIC8vIGV2ZW50T2JqZWN0LnNyY0VsZW1lbnQgPSB3aW5kb3c7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXJzW2ldLm9iamVjdCA9PT0gZG9jdW1lbnQgJiYgZXZlbnRMaXN0ZW5lcnNbaV0udHlwZSA9PT0gJ0RPTUNvbnRlbnRMb2FkZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyc1tpXS53cmFwcGVyKGV2ZW50T2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLlRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzY29wZS5UZXh0ID0gZW1wdHlGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoISgndGV4dENvbnRlbnQnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICB2YXIgaW5uZXJUZXh0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFbGVtZW50LnByb3RvdHlwZSwgJ2lubmVyVGV4dCcpO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ3RleHRDb250ZW50Jywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlubmVyVGV4dC5nZXQuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbm5lclRleHQuc2V0LmNhbGwodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoISgnZ2V0QXR0cmlidXRlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuZ2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGVdLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdzZXRBdHRyaWJ1dGUnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgncmVtb3ZlQXR0cmlidXRlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQXR0cmlidXRlID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLnJlbW92ZU5hbWVkSXRlbShhdHRyaWJ1dGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdmaXJzdEVsZW1lbnRDaGlsZCcgaW4gRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFbGVtZW50LnByb3RvdHlwZSwgJ2ZpcnN0RWxlbWVudENoaWxkJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW5bMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghKCdjbGFzc0xpc3QnIGluIEVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdjbGFzc0xpc3QnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhZGQ6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xhc3NOYW1lID0gc2VsZi5jbGFzc05hbWUudHJpbSgpICsgJyAnICsgY2xhc3NOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jbGFzc05hbWUgPSBzZWxmLmNsYXNzTmFtZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCd8JykgKyAnKFxcXFxifCQpJywgJ2dpJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKG5ldyBSZWdFeHAoJyhefCApJyArIGNsYXNzTmFtZSArICcoIHwkKScsICdnaScpLnRlc3Qoc2VsZi5jbGFzc05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghKCd0ZXh0Q29udGVudCcgaW4gVGV4dC5wcm90b3R5cGUpKSB7XG4gICAgICAgIHZhciBub2RlVmFsdWUgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFRleHQucHJvdG90eXBlLCAnbm9kZVZhbHVlJyk7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRleHQucHJvdG90eXBlLCAndGV4dENvbnRlbnQnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVZhbHVlLmdldC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVWYWx1ZS5zZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghKCd0cmltJyBpbiBTdHJpbmcucHJvdG90eXBlKSkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ29ic2VydmUnIGluIE9iamVjdCkpIHtcbiAgICAgICAgT2JqZWN0Lm9ic2VydmUgPSBlbXB0eUZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGlmICghKCdrZXlzJyBpbiBPYmplY3QpKSB7XG4gICAgICAgIE9iamVjdC5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9iamVjdC5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qXG4gICAgaWYgKCEoJ2ZvckVhY2gnIGluIE9iamVjdC5wcm90b3R5cGUpKSB7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIFt0aGlzW2l0ZW1dLCBpdGVtLCB0aGlzXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCEoJ21hcCcgaW4gT2JqZWN0LnByb3RvdHlwZSkpIHtcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2FsbGJhY2suYXBwbHkodGhpcywgW3RoaXNbaXRlbV0sIGl0ZW0sIHRoaXNdKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdmb3JFYWNoJyBpbiBBcnJheS5wcm90b3R5cGUpKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBbdGhpc1tpXSwgaSwgdGhpc10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICghKCdtYXAnIGluIEFycmF5LnByb3RvdHlwZSkpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNhbGxiYWNrLmFwcGx5KHRoaXMsIFt0aGlzW2ldLCBpLCB0aGlzXSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoISgnaW5kZXhPZicgaW4gQXJyYXkucHJvdG90eXBlKSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChvYmplY3QsIHN0YXJ0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gKHN0YXJ0IHx8IDApLCBsZW5ndGggPSB0aGlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IG9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgKi9cblxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCkpO1xuIl19
