/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

let timers = {
    data: [],

    set: function (timer) {
        timer.next = Date.now() + timer.timeout;
        timers.data.push(timer);
    },

    remove: function (id) {
        let targetKey = null;

        for (let item in timers.data) {
            if (!timers.data.hasOwnProperty(item)) {
                continue;
            }

            let currentItem = timers.data[item];

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
        let now = Date.now(),
            removeKeys = [];

        for (let item in timers.data) {
            if (!timers.data.hasOwnProperty(item)) {
                continue;
            }

            let currentItem = timers.data[item];

            if (currentItem.next <= now) {
                let result = currentItem.ontick(currentItem.state);

                if (result !== false && currentItem.reset) {
                    currentItem.next = now + currentItem.timeout;
                } else {
                    removeKeys = helpers.prependArray(removeKeys, item);
                }
            }
        }

        for (let item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            timers.data.splice(removeKeys[item2], 1);
        }
    }
};

export default timers;
