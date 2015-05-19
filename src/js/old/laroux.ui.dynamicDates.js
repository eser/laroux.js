(function () {
    'use strict';

    // ui.dynamicDates
    laroux.ns('laroux.ui.dynamicDates', {
        updateDatesElements: null,

        updateDates: function () {
            if (laroux.ui.dynamicDates.updateDatesElements === null) {
                laroux.ui.dynamicDates.updateDatesElements = laroux.dom.select('*[data-epoch]');
            }

            for (var item in laroux.ui.dynamicDates.updateDatesElements) {
                if (!laroux.ui.dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                    continue;
                }

                var obj = laroux.ui.dynamicDates.updateDatesElements[item];
                // bitshifting (str >> 0) used instead of parseInt(str, 10)
                var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

                laroux.dom.replace(
                    obj,
                    laroux.date.getDateString(date)
                );

                obj.setAttribute('title', laroux.date.getLongDateString(date));
            }
        },

        init: function () {
            laroux.timers.set({
                timeout: 500,
                reset: true,
                ontick: laroux.ui.dynamicDates.updateDates
            });
        }
    });

    // laroux.ready(laroux.ui.dynamicDates.init);

}).call(this);
