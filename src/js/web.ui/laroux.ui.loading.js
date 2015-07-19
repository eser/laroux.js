/*jslint node: true */
/*global $l, localStorage */
'use strict';

import ui from './laroux.ui.js';

let laroux = $l,
    css = laroux.css,
    dom = laroux.dom;

let loading = {
    elementSelector: null,
    element: null,
    defaultDelay: 1500,
    timer: null,

    killTimer: function () {
        clearTimeout(loading.timer);
    },

    hide: function () {
        loading.killTimer();

        css.setProperty(loading.element, { display: 'none' });
        localStorage.loadingIndicator = 'false';
    },

    show: function (delay) {
        loading.killTimer();

        if (delay === undefined) {
            delay = loading.defaultDelay;
        }

        if (delay > 0) {
            setTimeout(function () { loading.show(0); }, delay);
        } else {
            css.setProperty(loading.element, { display: 'block' });
            localStorage.loadingIndicator = 'true';
        }
    },

    init: function () {
        if (loading.element === null && loading.elementSelector !== null) {
            loading.element = dom.selectSingle(loading.elementSelector);
        }

        if (loading.element !== null) {
            dom.setEvent(global, 'load', loading.hide);
            dom.setEvent(global, 'beforeunload', loading.show);

            if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator == 'true') {
                loading.show(0);
            } else {
                loading.show();
            }
        }
    }
};

laroux.ready(loading.init);

export default loading;
