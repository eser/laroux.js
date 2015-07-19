/*jslint node: true */
/*global $l, localStorage */
'use strict';

let web_ui_dynamicDates = {
    updateDatesElements: null,

    updateDates: function () {
        if (web_ui_dynamicDates.updateDatesElements === null) {
            web_ui_dynamicDates.updateDatesElements = $l.dom.select('*[data-epoch]');
        }

        for (let item in web_ui_dynamicDates.updateDatesElements) {
            if (!web_ui_dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                continue;
            }

            let obj = web_ui_dynamicDates.updateDatesElements[item];
            // bitshifting (str >> 0) used instead of parseInt(str, 10)
            let date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

            $l.dom.replace(
                obj,
                $l.intl.shortDate(date)
            );

            obj.setAttribute('title', $l.intl.longDate(date));
        }
    },

    init: function () {
        $l.timers.set({
            timeout: 500,
            reset: true,
            ontick: web_ui_dynamicDates.updateDates
        });
    }
};

$l.ready(web_ui_dynamicDates.init);

export default web_ui_dynamicDates;
