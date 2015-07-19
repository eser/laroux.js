/*jslint node: true */
/*global $l, localStorage */
'use strict';

import ui from './laroux.ui.js';

let laroux = $l,
    css = laroux.css,
    dom = laroux.dom,
    intl = laroux.intl,
    timers = laroux.timers;

let dynamicDates = {
    updateDatesElements: null,

    updateDates: function () {
        if (dynamicDates.updateDatesElements === null) {
            dynamicDates.updateDatesElements = dom.select('*[data-epoch]');
        }

        for (var item in dynamicDates.updateDatesElements) {
            if (!dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                continue;
            }

            var obj = dynamicDates.updateDatesElements[item];
            // bitshifting (str >> 0) used instead of parseInt(str, 10)
            var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

            dom.replace(
                obj,
                intl.shortDate(date)
            );

            obj.setAttribute('title', intl.longDate(date));
        }
    },

    init: function () {
        timers.set({
            timeout: 500,
            reset: true,
            ontick: dynamicDates.updateDates
        });
    }
};

laroux.ready(dynamicDates.init);

export default dynamicDates;
