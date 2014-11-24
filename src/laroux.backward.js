(function(global) {
    'use strict';

    // a fix for Internet Explorer
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

    if (Element.prototype.addEventListener === undefined) {
        var eventListeners = [];

        var addListener = function(eventname, fnc) {
            var self = this;
            var wrapper = function(ev) {
                ev.target = ev.srcElement;
                ev.currentTarget = self;

                if (fnc.handleEvent !== undefined) {
                    fnc.handleEvent(ev);
                } else {
                    fnc.call(self, ev);
                }
            };

            if (eventname != 'DOMContentLoaded') {
                this.attachEvent('on' + eventname, wrapper);
            }
            eventListeners.push({object: this, type: eventname, listener: fnc, wrapper: wrapper});
        };

        var removeListener = function(eventname, fnc) {
            for (var i = 0, length = eventListeners.length; i < length; i++) {
                var eventListener = eventListeners[i];

                if (eventListener.object === this && eventListener.type === eventname && eventListener.listener === fnc) {
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
                var eventObj = new Event();
                eventObj.srcElement = window;

                for (var i = 0, length = eventListeners.length; i < length; i++) {
                    if (eventListener.object === this && eventListener.type === 'DOMContentLoaded') {
                        eventListener.wrapper(eventObj);
                    }
                }
            }
        });
    }

})(this);
