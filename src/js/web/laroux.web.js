/*jslint node: true */
/*global document */
'use strict';

import laroux from './laroux.js';

import anim from './laroux.anim.js';
import css from './laroux.css.js';
import dom from './laroux.dom.js';
import forms from './laroux.forms.js';
import helpers from './laroux.helpers.js';
import keys from './laroux.keys.js';
import routes from './laroux.routes.js';
import touch from './laroux.touch.js';

laroux.extend({
    anim,
    css,
    dom,
    forms,
    keys,
    routes,
    touch,

    cached: {
        single: {},
        array: {},
        id: {}
    },

    c: function (selector) {
        if (selector.constructor === Array) {
            return laroux.cached.array[selector] || (
                laroux.cached.array[selector] = helpers.toArray(
                    document.querySelectorAll(selector)
                )
            );
        }

        return laroux.cached.single[selector] || (
            laroux.cached.single[selector] = document.querySelector(selector)
        );
    },

    id: function (selector, parent) {
        return (parent || document).getElementById(selector);
    },

    idc: function (selector) {
        return laroux.cached.id[selector] ||
            (laroux.cached.id[selector] = document.getElementById(selector));
    }
});

if ('document' in global) {
    document.addEventListener(
        'DOMContentLoaded',
        laroux.setReady
    );
}

export default laroux;
