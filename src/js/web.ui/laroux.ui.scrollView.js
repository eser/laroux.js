/*jslint node: true */
/*global $l, localStorage */
'use strict';

import ui from './laroux.ui.js';

let laroux = $l,
    css = laroux.css,
    dom = laroux.dom,
    helpers = laroux,
    intl = laroux.intl,
    timers = laroux.timers;

let scrollView = {
    selectedElements: [],

    onhidden: function (elements) {
        css.setProperty(elements, { opacity: 0 });
        css.setTransition(elements, ['opacity']);
    },

    onreveal: function (elements) {
        css.setProperty(elements, { opacity: 1 });
    },

    set: function (element) {
        var elements = helpers.getAsArray(element);

        for (var i = 0, length = elements.length; i < length; i++) {
            if (!css.inViewport(elements[i])) {
                scrollView.selectedElements.push(elements[i]);
            }
        }

        scrollView.onhidden(scrollView.selectedElements);
        dom.setEvent(global, 'scroll', scrollView.reveal);
    },

    reveal: function () {
        var removeKeys = [],
            elements = [];

        helpers.each(
            scrollView.selectedElements,
            function (i, element) {
                if (css.inViewport(element)) {
                    removeKeys.unshift(i);
                    elements.push(element);
                }
            }
        );

        for (var item in removeKeys) {
            if (!removeKeys.hasOwnProperty(item)) {
                continue;
            }

            scrollView.selectedElements.splice(removeKeys[item], 1);
        }

        if (scrollView.selectedElements.length === 0) {
            dom.unsetEvent(global, 'scroll', scrollView.reveal);
        }

        if (elements.length > 0) {
            scrollView.onreveal(elements);
        }
    }
};

// laroux.ready(scrollView.init);

export default scrollView;
