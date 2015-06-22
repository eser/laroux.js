import laroux from '../laroux.js';

import anim from './laroux.anim.js';
import css from './laroux.css.js';
import dom from './laroux.dom.js';
import forms from './laroux.forms.js';
import keys from './laroux.keys.js';
import mvc from './laroux.mvc.js';
import routes from './laroux.routes.js';
import touch from './laroux.touch.js';

export default (function () {
    'use strict';

    laroux.extend({
        anim,
        css,
        dom,
        forms,
        keys,
        mvc,
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

    if (typeof document !== 'undefined') {
        document.addEventListener(
            'DOMContentLoaded',
            laroux.setReady
        );
    }

    return laroux;

})();
