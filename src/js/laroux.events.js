(function () {
    'use strict';

    // events
    laroux.ns('laroux.events', {
        delegates: [],

        add: function (event, fnc) {
            laroux.events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function (event, args) {
            for (var item in laroux.events.delegates) {
                if (!laroux.events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (laroux.events.delegates[item].event != event) {
                    continue;
                }

                laroux.events.delegates[item].fnc(args);
            }
        }
    });

}).call(this);
