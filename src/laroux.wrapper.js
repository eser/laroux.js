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
