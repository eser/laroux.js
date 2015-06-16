/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var events = {
        delegates: [],

        add: function add(event, callback) {
            events.delegates.push({ event: event, callback: callback });
        },

        invoke: function invoke(event, args) {
            for (var item in events.delegates) {
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

module.exports = exports['default'];