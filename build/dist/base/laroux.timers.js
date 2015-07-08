/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var timers = {
    data: [],

    set: function set(timer) {
        timer.next = Date.now() + timer.timeout;
        timers.data.push(timer);
    },

    remove: function remove(id) {
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

    ontick: function ontick() {
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
                    removeKeys = _larouxHelpersJs2['default'].prependArray(removeKeys, item);
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

exports['default'] = timers;
module.exports = exports['default'];