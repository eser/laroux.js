/*jslint node: true */
/*global $l, document */
'use strict';

import web_anim from './laroux.web.anim.js';
import web_css from './laroux.web.css.js';
import web_dom from './laroux.web.dom.js';
import web_forms from './laroux.web.forms.js';
import web_keys from './laroux.web.keys.js';
import web_routes from './laroux.web.routes.js';
import web_touch from './laroux.web.touch.js';

let web = {
    anim: web_anim,
    css: web_css,
    dom: web_dom,
    forms: web_forms,
    keys: web_keys,
    routes: web_routes,
    touch: web_touch,

    cached: {
        single: {},
        array: {},
        id: {}
    },

    c: function (selector) {
        if (selector.constructor === Array) {
            return web.cached.array[selector] || (
                web.cached.array[selector] = $l.toArray(
                    document.querySelectorAll(selector)
                )
            );
        }

        return web.cached.single[selector] || (
            web.cached.single[selector] = document.querySelector(selector)
        );
    },

    id: function (selector, parent) {
        return (parent || document).getElementById(selector);
    },

    idc: function (selector) {
        return web.cached.id[selector] ||
            (web.cached.id[selector] = document.getElementById(selector));
    }
};

if ('document' in global) {
    document.addEventListener(
        'DOMContentLoaded',
        $l.setReady
    );
}

$l.extendNs('web', web);
// $l.extend(web);

export default web;
