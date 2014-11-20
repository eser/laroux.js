(function(laroux) {
    "use strict";

    var WrapObject = function(element) {
        this.element = element;

        for (var item in laroux.wrapper.fn) {
            if (!laroux.wrapper.fn.hasOwnProperty(item)) {
                continue;
            }

            this[item] = laroux.wrapper.fn[item];
        }

        this.get = function(index) {
            if (index === 0) {
                return this.element;
            }

            return undefined;
        };

        /* jshint -W030 */
        this.hasClass = function(className) {
            return laroux.css.hasClass(this.element, className);
        },

        this.addClass = function(className) {
            laroux.css.addClass(this.element, className);
        };

        this.removeClass = function(className) {
            laroux.css.removeClass(this.element, className);
        };

        this.toggleClass = function(className) {
            laroux.css.toggleClass(this.element, className);
        };

        this.attr = function(attrname, value) {
            return laroux.dom.attr(this.element, attrname, value);
        };

        this.data = function(attrname, value) {
            return laroux.dom.data(this.element, attrname, value);
        };

        this.find = function(selector) {
            return laroux.dom.select(selector, this.element);
        };
    };

    var WrapObjects = function(elements) {
        this.elements = elements;

        for (var item in laroux.wrapper.fn) {
            if (!laroux.wrapper.fn.hasOwnProperty(item)) {
                continue;
            }

            this[item] = laroux.wrapper.fn[item];
        }

        this.get = function(index) {
            return this.elements[index];
        };

        /* jshint -W030 */
        this.hasClass = function(className) {
            return null;
        },

        this.addClass = function(className) {
            for (var item in this.elements) {
                if (!this.elements.hasOwnProperty(item)) {
                    continue;
                }

                laroux.css.addClass(this.elements[item], className);
            }
        };

        this.removeClass = function(className) {
            for (var item in this.elements) {
                if (!this.elements.hasOwnProperty(item)) {
                    continue;
                }

                laroux.css.removeClass(this.elements[item], className);
            }
        };

        this.toggleClass = function(className) {
            for (var item in this.elements) {
                if (!this.elements.hasOwnProperty(item)) {
                    continue;
                }

                laroux.css.toggleClass(this.elements[item], className);
            }
        };

        this.attr = function(attrname, value) {
            return null;
        };

        this.data = function(attrname, value) {
            return null;
        };

        this.find = function(selector) {
            return null;
        };
    };

    // wrapper
    laroux.wrapper = function(selector) {
        var selection;

        if (selector instanceof Array) {
            selection = selector;
        } else if (selector instanceof NodeList) {
            selection = Array.prototype.slice.call(selector);
        } else if (selector instanceof Node) {
            selection = [ selector ];
        } else {
            selection = laroux.dom.select(selector);
        }

        if (selection.length === 1) {
            return new WrapObject(selection[0]);
        }

        return new WrapObjects(selection);
    };

    laroux.wrapper.fn = {};

    laroux.wrapper.init = function() {
        window.$ = laroux.wrapper;
    };

})(this.laroux);
