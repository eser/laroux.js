(function () {
    'use strict';

    // ui.loading
    laroux.ns('laroux.ui.loading', {
        elementSelector: null,
        element: null,
        defaultDelay: 1500,
        timer: null,

        killTimer: function () {
            clearTimeout(laroux.ui.loading.timer);
        },

        hide: function () {
            laroux.ui.loading.killTimer();

            laroux.css.setProperty(laroux.ui.loading.element, { display: 'none' });
            localStorage.loadingIndicator = 'false';
        },

        show: function (delay) {
            laroux.ui.loading.killTimer();

            if (delay === undefined) {
                delay = laroux.ui.loading.defaultDelay;
            }

            if (delay > 0) {
                setTimeout(function () { laroux.ui.loading.show(0); }, delay);
            } else {
                laroux.css.setProperty(laroux.ui.loading.element, { display: 'block' });
                localStorage.loadingIndicator = 'true';
            }
        },

        init: function () {
            if (laroux.ui.loading.element === null && laroux.ui.loading.elementSelector !== null) {
                laroux.ui.loading.element = laroux.dom.selectSingle(laroux.ui.loading.elementSelector);
            }

            if (laroux.ui.loading.element !== null) {
                laroux.dom.setEvent(window, 'load', laroux.ui.loading.hide);
                laroux.dom.setEvent(window, 'beforeunload', laroux.ui.loading.show);

                if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator === 'true') {
                    laroux.ui.loading.show(0);
                } else {
                    laroux.ui.loading.show();
                }
            }
        }
    });

    // laroux.ready(laroux.ui.loading.init);

}).call(this);
