export default (function () {
    'use strict';

    let events = {
        delegates: [],

        add: function (event, callback) {
            events.delegates.push({ event: event, callback: callback });
        },

        invoke: function (event, ...args) {
            for (let i = 0, length = events.delegates.length; i < length; i++) {
                if (events.delegates[i].event != event) {
                    continue;
                }

                events.delegates[i].callback(...args);
            }
        }
    };

    return events;

})();
