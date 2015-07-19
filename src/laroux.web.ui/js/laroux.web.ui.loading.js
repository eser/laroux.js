/*jslint node: true */
/*global $l, localStorage */
'use strict';

let web_ui_loading = {
    elementSelector: null,
    element: null,
    defaultDelay: 1500,
    timer: null,

    killTimer: function () {
        clearTimeout(web_ui_loading.timer);
    },

    hide: function () {
        web_ui_loading.killTimer();

        $l.css.setProperty(web_ui_loading.element, { display: 'none' });
        localStorage.loadingIndicator = 'false';
    },

    show: function (delay) {
        web_ui_loading.killTimer();

        if (delay === undefined) {
            delay = web_ui_loading.defaultDelay;
        }

        if (delay > 0) {
            setTimeout(function () { web_ui_loading.show(0); }, delay);
        } else {
            $l.css.setProperty(web_ui_loading.element, { display: 'block' });
            localStorage.loadingIndicator = 'true';
        }
    },

    init: function () {
        if (web_ui_loading.element === null && web_ui_loading.elementSelector !== null) {
            web_ui_loading.element = $l.dom.selectSingle(web_ui_loading.elementSelector);
        }

        if (web_ui_loading.element !== null) {
            $l.dom.setEvent(global, 'load', web_ui_loading.hide);
            $l.dom.setEvent(global, 'beforeunload', web_ui_loading.show);

            if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator == 'true') {
                web_ui_loading.show(0);
            } else {
                web_ui_loading.show();
            }
        }
    }
};

$l.ready(web_ui_loading.init);

export default web_ui_loading;
