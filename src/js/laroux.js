/* @if COMPAT==true */
// @include laroux.backward.js
/* @endif */

module.exports = (function (scope) {
    'use strict';

    // core
    var laroux;
    /* @if ENV!='web' */
    laroux = function () {
    };
    /* @endif */
    /* @if ENV=='web' */
    laroux = function (selector, parent) {
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
    /* @endif */

    // modules
    laroux.events = require('./laroux.events.js');
    laroux.helpers = require('./laroux.helpers.js');
    laroux.ajax = require('./laroux.ajax.js');
    laroux.timers = require('./laroux.timers.js');
    laroux.triggers = require('./laroux.triggers.js');
    laroux.vars = require('./laroux.vars.js');
    laroux.date = require('./laroux.date.js');
    laroux.stack = require('./laroux.stack.js');

    /* @if ENV=='web' */
    laroux.wrapper = require('./laroux.wrapper.js');
    laroux.css = require('./laroux.css.js');
    laroux.dom = require('./laroux.dom.js');
    laroux.forms = require('./laroux.forms.js');

    laroux.anim = require('./laroux.anim.js');
    laroux.keys = require('./laroux.keys.js');
    laroux.mvc = require('./laroux.mvc.js');
    laroux.templates = require('./laroux.templates.js');
    laroux.touch = require('./laroux.touch.js');
    laroux.ui = require('./laroux.ui.js');
    /* @endif */

    /* @if ENV=='web' */
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
    /* @endif */

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

    /* @if ENV=='web' */
    laroux.readyPassed = false;

    laroux.ready = function (fnc) {
        if (!laroux.readyPassed) {
            laroux.events.add('ContentLoaded', fnc);
            return;
        }

        fnc();
    };
    /* @endif */

    /* @if ENV=='web' */
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
    /* @endif */

    if (!('$l' in scope)) {
        scope.$l = laroux;
    }

    return laroux;

}(typeof window !== 'undefined' ? window : global));
