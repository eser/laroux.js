module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_helpers = require('./laroux.helpers.js'),
        laroux_css = require('./laroux.css.js'),
        laroux_timers = require('./laroux.timers.js'),
        laroux_date = require('./laroux.date.js');

    // ui
    var laroux_ui = {
        floatContainer: null,

        popup: {
            defaultTimeout: 500,

            createBox: function (id, xclass, message) {
                return laroux_dom.createElement('DIV', { id: id, 'class': xclass }, message);
            },

            msgbox: function (timeout, message) {
                var id = laroux_helpers.getUniqueId(),
                    obj = laroux_ui.popup.createBox(id, 'larouxMsgBox', message);
                laroux_ui.floatContainer.appendChild(obj);

                laroux_css.setProperty(obj, { opacity: 1 });

                laroux_timers.set({
                    timeout: timeout,
                    reset: false,
                    ontick: function (x) {
                        // laroux_css.setProperty(x, { opacity: 0 });
                        laroux_dom.remove(x);
                    },
                    state: obj
                });
            }
        },

        loading: {
            elementSelector: null,
            element: null,
            defaultDelay: 1500,
            timer: null,

            killTimer: function () {
                clearTimeout(laroux_ui.loading.timer);
            },

            hide: function () {
                laroux_ui.loading.killTimer();

                laroux_css.setProperty(laroux_ui.loading.element, { display: 'none' });
                localStorage.loadingIndicator = 'false';
            },

            show: function (delay) {
                laroux_ui.loading.killTimer();

                if (delay === undefined) {
                    delay = laroux_ui.loading.defaultDelay;
                }

                if (delay > 0) {
                    setTimeout(function () { laroux_ui.loading.show(0); }, delay);
                } else {
                    laroux_css.setProperty(laroux_ui.loading.element, { display: 'block' });
                    localStorage.loadingIndicator = 'true';
                }
            },

            init: function () {
                if (laroux_ui.loading.element === null && laroux_ui.loading.elementSelector !== null) {
                    laroux_ui.loading.element = laroux_dom.selectSingle(laroux_ui.loading.elementSelector);
                }

                if (laroux_ui.loading.element !== null) {
                    laroux_dom.setEvent(window, 'load', laroux_ui.loading.hide);
                    laroux_dom.setEvent(window, 'beforeunload', laroux_ui.loading.show);

                    if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator === 'true') {
                        laroux_ui.loading.show(0);
                    } else {
                        laroux_ui.loading.show();
                    }
                }
            }
        },

        dynamicDates: {
            updateDatesElements: null,

            updateDates: function () {
                if (laroux_ui.dynamicDates.updateDatesElements === null) {
                    laroux_ui.dynamicDates.updateDatesElements = laroux_dom.select('*[data-epoch]');
                }

                for (var item in laroux_ui.dynamicDates.updateDatesElements) {
                    if (!laroux_ui.dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                        continue;
                    }

                    var obj = laroux_ui.dynamicDates.updateDatesElements[item];
                    // bitshifting (str >> 0) used instead of parseInt(str, 10)
                    var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

                    laroux_dom.replace(
                        obj,
                        laroux_date.getDateString(date)
                    );

                    obj.setAttribute('title', laroux_date.getLongDateString(date));
                }
            },

            init: function () {
                laroux_timers.set({
                    timeout: 500,
                    reset: true,
                    ontick: laroux_ui.dynamicDates.updateDates
                });
            }
        },

        scrollView: {
            selectedElements: [],

            onhidden: function (elements) {
                laroux_css.setProperty(elements, { opacity: 0 });
                laroux_css.setTransition(elements, ['opacity']);
            },

            onreveal: function (elements) {
                laroux_css.setProperty(elements, { opacity: 1 });
            },

            set: function (element) {
                var elements = laroux_helpers.getAsArray(element);

                for (var i = 0, length = elements.length; i < length; i++) {
                    if (!laroux_css.inViewport(elements[i])) {
                        laroux_ui.scrollView.selectedElements.push(elements[i]);
                    }
                }

                laroux_ui.scrollView.onhidden(laroux_ui.scrollView.selectedElements);
                laroux_dom.setEvent(window, 'scroll', laroux_ui.scrollView.reveal);
            },

            reveal: function () {
                var removeKeys = [],
                    elements = [];

                laroux_helpers.each(
                    laroux_ui.scrollView.selectedElements,
                    function (i, element) {
                        if (laroux_css.inViewport(element)) {
                            removeKeys.unshift(i);
                            elements.push(element);
                        }
                    }
                );

                for (var item in removeKeys) {
                    if (!removeKeys.hasOwnProperty(item)) {
                        continue;
                    }

                    laroux_ui.scrollView.selectedElements.splice(removeKeys[item], 1);
                }

                if (laroux_ui.scrollView.selectedElements.length === 0) {
                    laroux_dom.unsetEvent(window, 'scroll', laroux_ui.scrollView.reveal);
                }

                if (elements.length > 0) {
                    laroux_ui.scrollView.onreveal(elements);
                }
            }
        },

        createFloatContainer: function () {
            if (!laroux_ui.floatContainer) {
                laroux_ui.floatContainer = laroux_dom.createElement('DIV', { 'class': 'larouxFloatDiv' });
                window.document.body.insertBefore(laroux_ui.floatContainer, window.document.body.firstChild);
            }
        },

        init: function () {
            laroux_ui.createFloatContainer();
            laroux_ui.loading.init();
            laroux_ui.dynamicDates.init();
        }
    };

    // laroux.ready(laroux_ui.init);

    return laroux_ui;

}());
