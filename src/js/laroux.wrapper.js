/*global NodeList, Node */
(function () {
    'use strict';

    // wrapper
    laroux.ns('laroux', {
        wrapper: function (selector, parent) {
            var selection;

            if (selector instanceof Array) {
                selection = selector;
            } else if (selector instanceof NodeList) {
                selection = laroux.helpers.toArray(selector);
            } else if (selector instanceof Node) {
                selection = [selector];
            } else {
                selection = laroux.dom.select(selector, parent);
            }

            if (selection.length === 1) {
                return new laroux.wrapper.singleTemplate(selection[0]);
            }

            return new laroux.wrapper.arrayTemplate(selection);
        }
    });

    laroux.wrapper.singleTemplate = function (element) {
        this.source = element;
        this.isArray = false;

        this.get = function (index) {
            if (index === 0 || index === undefined) {
                return this.source;
            }

            return undefined;
        };

        this.find = function (selector) {
            return laroux.wrapper(selector, this.source);
        };
    };

    laroux.wrapper.arrayTemplate = function (elements) {
        this.source = elements;
        this.isArray = true;

        this.get = function (index) {
            return this.source[index];
        };
    };

    laroux.wrapper.registerBoth = 0;
    laroux.wrapper.registerSingle = 1;
    laroux.wrapper.registerArray = 2;

    laroux.wrapper.register = function (name, fnc, scope) {
        var newFnc = function () {
            var result = fnc.apply(
                this,
                [this.source].concat(laroux.helpers.toArray(arguments))
            );

            return (result === undefined) ? this : result;
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

    laroux.wrapper.register('attr', laroux.dom.attr, laroux.wrapper.registerSingle);
    laroux.wrapper.register('data', laroux.dom.data, laroux.wrapper.registerSingle);
    laroux.wrapper.register('on', laroux.dom.setEventSingle, laroux.wrapper.registerSingle);
    laroux.wrapper.register('on', laroux.dom.setEvent, laroux.wrapper.registerArray);
    laroux.wrapper.register('off', laroux.dom.unsetEvent, laroux.wrapper.registerBoth);
    laroux.wrapper.register('clear', laroux.dom.clear, laroux.wrapper.registerSingle);
    laroux.wrapper.register('insert', laroux.dom.insert, laroux.wrapper.registerSingle);
    laroux.wrapper.register('prepend', laroux.dom.prepend, laroux.wrapper.registerSingle);
    laroux.wrapper.register('append', laroux.dom.append, laroux.wrapper.registerSingle);
    laroux.wrapper.register('replace', laroux.dom.replace, laroux.wrapper.registerSingle);
    laroux.wrapper.register('replaceText', laroux.dom.replaceText, laroux.wrapper.registerSingle);
    laroux.wrapper.register('remove', laroux.dom.remove, laroux.wrapper.registerSingle);

    laroux.wrapper.register('hasClass', laroux.css.hasClass, laroux.wrapper.registerSingle);
    laroux.wrapper.register('addClass', laroux.css.addClass, laroux.wrapper.registerBoth);
    laroux.wrapper.register('removeClass', laroux.css.removeClass, laroux.wrapper.registerBoth);
    laroux.wrapper.register('toggleClass', laroux.css.toggleClass, laroux.wrapper.registerBoth);
    laroux.wrapper.register('getProperty', laroux.css.getProperty, laroux.wrapper.registerSingle);
    laroux.wrapper.register('setProperty', laroux.css.setProperty, laroux.wrapper.registerBoth);
    laroux.wrapper.register('setTransition', laroux.css.setTransition, laroux.wrapper.registerBoth);
    laroux.wrapper.register('show', laroux.css.show, laroux.wrapper.registerBoth);
    laroux.wrapper.register('hide', laroux.css.hide, laroux.wrapper.registerBoth);
    laroux.wrapper.register('height', laroux.css.height, laroux.wrapper.registerSingle);
    laroux.wrapper.register('innerHeight', laroux.css.innerHeight, laroux.wrapper.registerSingle);
    laroux.wrapper.register('outerHeight', laroux.css.outerHeight, laroux.wrapper.registerSingle);
    laroux.wrapper.register('width', laroux.css.width, laroux.wrapper.registerSingle);
    laroux.wrapper.register('innerWidth', laroux.css.innerWidth, laroux.wrapper.registerSingle);
    laroux.wrapper.register('outerWidth', laroux.css.outerWidth, laroux.wrapper.registerSingle);
    laroux.wrapper.register('top', laroux.css.top, laroux.wrapper.registerSingle);
    laroux.wrapper.register('left', laroux.css.left, laroux.wrapper.registerSingle);
    laroux.wrapper.register('aboveTheTop', laroux.css.aboveTheTop, laroux.wrapper.registerSingle);
    laroux.wrapper.register('belowTheFold', laroux.css.belowTheFold, laroux.wrapper.registerSingle);
    laroux.wrapper.register('leftOfScreen', laroux.css.leftOfScreen, laroux.wrapper.registerSingle);
    laroux.wrapper.register('rightOfScreen', laroux.css.rightOfScreen, laroux.wrapper.registerSingle);
    laroux.wrapper.register('inViewport', laroux.css.inViewport, laroux.wrapper.registerSingle);

}).call(this);
