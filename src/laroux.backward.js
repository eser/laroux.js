(function(global) {
    'use strict';

    if (global.requestAnimationFrame === undefined) {
        global.requestAnimationFrame = function(callback) {
            setTimeout(function() { callback(Date.now()); }, 50);
        };
    }

    if (global.getComputedStyle === undefined) {
        global.getComputedStyle = function(element) {
            this.element = element;

            this.getPropertyValue = function(prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop == 'float') {
                    prop = 'styleFloat';
                }

                if (re.test(prop)) {
                    prop = prop.replace(re, function() {
                        return arguments[2].toUpperCase();
                    });
                }

                return this.element.currentStyle[prop] || null;
            };

            this.getPropertyCSSValue = function(prop) {
                return new CSSPrimitiveValue(this.element, prop);
            };

            return this;
        };
    }

    if (global.CSSPrimitiveValue === undefined) {
        global.CSSPrimitiveValue = function(element, prop) {
            this.element = element;
            this.prop = prop;
            this.primitiveType = 0;

            this.getFloatValue = function(primitiveType) {
                var re = /(\-([a-z]){1})/g;
                var prop = this.prop;
                if (prop == 'float') {
                    prop = 'styleFloat';
                }

                if (re.test(prop)) {
                    prop = prop.replace(re, function() {
                        return arguments[2].toUpperCase();
                    });
                }

                return this.element.currentStyle[prop] || null;
            };
        };
    }

    if (Event.prototype.preventDefault === undefined) {
        Event.prototype.preventDefault = function() {
            this.returnValue = false;
        };
    }

    if (Event.prototype.stopPropagation === undefined) {
        Event.prototype.stopPropagation = function() {
            this.cancelBubble = true;
        };
    }

    if (Element === undefined) {
        Element = function() {};
    }

    if (Element.prototype.addEventListener === undefined) {
        var eventListeners = [];

        var addListener = function(eventname, callback) {
            var self = this;
            var wrapper = function(event) {
                event.target = event.srcElement;
                event.currentTarget = self;

                // if (callback.handleEvent !== undefined) {
                //     callback.handleEvent(event);
                // } else {
                //     callback.call(self, event);
                // }
                callback(self, event);
            };

            if (eventname != 'DOMContentLoaded') {
                this.attachEvent('on' + eventname, wrapper);
            }
            eventListeners.push({object: this, type: eventname, listener: callback, wrapper: wrapper});
        };

        var removeListener = function(eventname, callback) {
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
        };

        var dispatchEvent = function(event) {
            var eventObject = document.createEventObject();
            this.fireEvent('on' + event.type, eventObject);
        };

        Element.prototype.addEventListener = addListener;
        Element.prototype.removeEventListener = removeListener;
        Element.prototype.dispatchEvent = dispatchEvent;

        if (HTMLDocument !== undefined) {
            HTMLDocument.prototype.addEventListener = addListener;
            HTMLDocument.prototype.removeEventListener = removeListener;
            HTMLDocument.prototype.dispatchEvent = dispatchEvent;
        }

        if (Window !== undefined) {
            Window.prototype.addEventListener = addListener;
            Window.prototype.removeEventListener = removeListener;
            Window.prototype.dispatchEvent = dispatchEvent;
        }

        document.attachEvent('onreadystatechange', function() {
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

    if (!('textContent' in Element.prototype)) {
        var innerText = Object.getOwnPropertyDescriptor(Element.prototype, 'innerText');

        Object.defineProperty(Element.prototype, 'textContent', {
            get: function() {
                return innerText.get.call(this);
            },
            set: function(value) {
                return innerText.set.call(this, value);
            }
        });
    }

    if (Element.prototype.getAttribute === undefined) {
        Element.prototype.getAttribute = function(attribute) {
            return this.attributes[attribute];
        };
    }

    if (Element.prototype.firstElementChild === undefined) {
        Object.defineProperty(Element.prototype, 'firstElementChild', {
            get: function() {
                return this.children[0];
            }
        });
    }

    if (Element.prototype.classList === undefined) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function() {
                var self = this;

                return {
                    add: function(className) {
                        self.className = self.className.trim() + ' ' + className;
                    },

                    remove: function(className) {
                        self.className = self.className.replace(
                            new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
                            ' '
                        );
                    },

                    contains: function(className) {
                        return (new RegExp('(^| )' + className + '( |$)', 'gi').test(self.className));
                    }
                };
            }
        });
    }

    if (!('textContent' in Text.prototype)) {
        var nodeValue = Object.getOwnPropertyDescriptor(Text.prototype, 'nodeValue');

        Object.defineProperty(Text.prototype, 'textContent', {
            get: function() {
                return nodeValue.get.call(this);
            },
            set: function(value) {
                return nodeValue.set.call(this, value);
            }
        });
    }

    if (String.prototype.trim === undefined) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    if (Object.observe === undefined) {
        Object.observe = function() {};
    }

    if (Object.keys === undefined) {
        Object.keys = function(object) {
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

    if (Object.prototype.forEach === undefined) {
        Object.prototype.forEach = function(callback) {
            for (var item in this) {
                if (!this.hasOwnProperty(item)) {
                    continue;
                }

                callback.apply(this, [this[item], item, this]);
            }
        };
    }

    if (Object.prototype.map === undefined) {
        Object.prototype.map = function(callback) {
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

    if (Array.prototype.forEach === undefined) {
        Array.prototype.forEach = function(callback) {
            for (var i = 0; i < this.length; i++) {
                callback.apply(this, [this[i], i, this]);
            }
        };
    }

    if (Array.prototype.map === undefined) {
        Array.prototype.map = function(callback) {
            var results = [];

            for (var i = 0; i < this.length; i++) {
                results.push(callback.apply(this, [this[i], i, this]));
            }

            return results;
        };
    }

    if (Array.prototype.indexOf === undefined) {
        Array.prototype.indexOf = function(object, start) {
            for (var i = (start || 0), length = this.length; i < length; i++) {
                if (this[i] === object) {
                    return i;
                }
            }

            return -1;
        };
    }

})(this);
