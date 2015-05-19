export default (function () {
    'use strict';

    var events = {
        delegates: [],

        add: function (event, fnc) {
            events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function (event, args) {
            for (var item in events.delegates) {
                if (!events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (events.delegates[item].event != event) {
                    continue;
                }

                events.delegates[item].fnc(args);
            }
        }
    };

    return events;

})();
