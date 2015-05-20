import helpers from './laroux.helpers.js';

export default (function () {
    'use strict';

    var timers = {
        data: [],

        set: function (timer) {
            timer.next = Date.now() + timer.timeout;
            timers.data.push(timer);
        },

        remove: function (id) {
            var targetKey = null;

            for (var item in timers.data) {
                if (!timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = timers.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                timers.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        ontick: function () {
            var now = Date.now(),
                removeKeys = [];

            for (var item in timers.data) {
                if (!timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = timers.data[item];

                if (currentItem.next <= now) {
                    var result = currentItem.ontick(currentItem.state);

                    if (result !== false && currentItem.reset) {
                        currentItem.next = now + currentItem.timeout;
                    } else {
                        removeKeys = helpers.prependArray(removeKeys, item);
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                timers.data.splice(removeKeys[item2], 1);
            }
        }
    };

    return timers;

})();
