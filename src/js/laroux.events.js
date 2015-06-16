export default (function () {
    'use strict';

    let events = {
        delegates: [],

        add: function (event, callback) {
            events.delegates.push({ event: event, callback: callback });
        },

        invoke: function (event, args) {
            for (let item in events.delegates) {
                if (!events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (events.delegates[item].event != event) {
                    continue;
                }

                events.delegates[item].callback(args);
            }
        }
    };

    return events;

})();
