(function(laroux) {
    'use strict';

    // events
    laroux.events = {
        delegates: [],

        add: function(event, fnc) {
            laroux.events.delegates.push({event: event, fnc: fnc});
        },

        invoke: function(event, args) {
            for (var key in laroux.events.delegates) {
                if (!laroux.events.delegates.hasOwnProperty(key)) {
                    continue;
                }

                if (laroux.events.delegates[key].event != event) {
                    continue;
                }

                laroux.events.delegates[key].fnc(args);
            }
        },
    };

})(this.laroux);
