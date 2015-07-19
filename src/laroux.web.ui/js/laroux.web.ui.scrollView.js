/*jslint node: true */
/*global $l, localStorage */
'use strict';

let web_ui_scrollView = {
    selectedElements: [],

    onhidden: function (elements) {
        $l.web.css.setProperty(elements, { opacity: 0 });
        $l.web.css.setTransition(elements, ['opacity']);
    },

    onreveal: function (elements) {
        $l.web.css.setProperty(elements, { opacity: 1 });
    },

    set: function (element) {
        let elements = $l.getAsArray(element);

        for (let i = 0, length = elements.length; i < length; i++) {
            if (!$l.web.css.inViewport(elements[i])) {
                web_ui_scrollView.selectedElements.push(elements[i]);
            }
        }

        web_ui_scrollView.onhidden(web_ui_scrollView.selectedElements);
        $l.web.dom.setEvent(global, 'scroll', web_ui_scrollView.reveal);
    },

    reveal: function () {
        let removeKeys = [],
            elements = [];

        $l.each(
            web_ui_scrollView.selectedElements,
            function (i, element) {
                if ($l.web.css.inViewport(element)) {
                    removeKeys.unshift(i);
                    elements.push(element);
                }
            }
        );

        for (let item in removeKeys) {
            if (!removeKeys.hasOwnProperty(item)) {
                continue;
            }

            web_ui_scrollView.selectedElements.splice(removeKeys[item], 1);
        }

        if (web_ui_scrollView.selectedElements.length === 0) {
            $l.web.dom.unsetEvent(global, 'scroll', web_ui_scrollView.reveal);
        }

        if (elements.length > 0) {
            web_ui_scrollView.onreveal(elements);
        }
    }
};

// $l.ready(web_ui_scrollView.init);

export default web_ui_scrollView;
