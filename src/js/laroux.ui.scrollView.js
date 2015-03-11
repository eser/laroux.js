(function () {
    'use strict';

    // ui.scrollView
    laroux.ns('laroux.ui.scrollView', {
        selectedElements: [],

        onhidden: function (elements) {
            laroux.css.setProperty(elements, { opacity: 0 });
            laroux.css.setTransition(elements, ['opacity']);
        },

        onreveal: function (elements) {
            laroux.css.setProperty(elements, { opacity: 1 });
        },

        set: function (element) {
            var elements = laroux.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                if (!laroux.css.inViewport(elements[i])) {
                    laroux.ui.scrollView.selectedElements.push(elements[i]);
                }
            }

            laroux.ui.scrollView.onhidden(laroux.ui.scrollView.selectedElements);
            laroux.dom.setEvent(window, 'scroll', laroux.ui.scrollView.reveal);
        },

        reveal: function () {
            var removeKeys = [],
                elements = [];

            laroux.each(
                laroux.ui.scrollView.selectedElements,
                function (i, element) {
                    if (laroux.css.inViewport(element)) {
                        removeKeys.unshift(i);
                        elements.push(element);
                    }
                }
            );

            for (var item in removeKeys) {
                if (!removeKeys.hasOwnProperty(item)) {
                    continue;
                }

                laroux.ui.scrollView.selectedElements.splice(removeKeys[item], 1);
            }

            if (laroux.ui.scrollView.selectedElements.length === 0) {
                laroux.dom.unsetEvent(window, 'scroll', laroux.ui.scrollView.reveal);
            }

            if (elements.length > 0) {
                laroux.ui.scrollView.onreveal(elements);
            }
        }
    });

}).call(this);
