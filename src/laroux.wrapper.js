(function(laroux) {
    'use strict';

    // requires $l.dom

    // wrapper
    laroux.wrapper = function(selector, parent) {
        var selection;

        if (selector instanceof Array) {
            selection = selector;
        } else if (selector instanceof NodeList) {
            selection = Array.prototype.slice.call(selector);
        } else if (selector instanceof Node) {
            selection = [selector];
        } else {
            selection = laroux.dom.select(selector, parent);
        }

        if (selection.length === 1) {
            return new laroux.wrapper.singleTemplate(selection[0]);
        }

        return new laroux.wrapper.arrayTemplate(selection);
    };

    laroux.wrapper.singleTemplate = function(element) {
        this.source = element;
        this.isArray = false;

        this.get = function(index) {
            if (index === 0 || typeof(index) == 'undefined') {
                return this.source;
            }

            return undefined;
        };

        this.find = function(selector) {
            return laroux.wrapper(selector, this.source);
        };
    };

    laroux.wrapper.arrayTemplate = function(elements) {
        this.source = elements;
        this.isArray = true;

        this.get = function(index) {
            return this.source[index];
        };
    };

    laroux.wrapper.registerBoth = 0;
    laroux.wrapper.registerSingle = 1;
    laroux.wrapper.registerArray = 2;

    laroux.wrapper.register = function(name, fnc, scope) {
        var newFnc = function() {
            var result = fnc.apply(
                this,
                [this.source].concat(Array.prototype.slice.call(arguments))
            );

            return (typeof result == 'undefined') ? this : result;
        };

        switch (scope) {
            case laroux.wrapper.registerSingle:
                laroux.wrapper.singleTemplate.prototype[name] = newFnc;
                break;
            case laroux.wrapper.registerArray:
                laroux.wrapper.arrayTemplate.prototype[name] = newFnc;
                break;
            default:
                laroux.wrapper.singleTemplate.prototype[name] = newFnc;
                laroux.wrapper.arrayTemplate.prototype[name] = newFnc;
                break;
        }
    };

})(this.laroux);
