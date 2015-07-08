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
var events = {
    delegates: [],

    add: function add(event, callback) {
        events.delegates.push({ event: event, callback: callback });
    },

    invoke: function invoke(event) {
        for (var i = 0, _length = events.delegates.length; i < _length; i++) {
            var _events$delegates$i;

            if (events.delegates[i].event != event) {
                continue;
            }

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            (_events$delegates$i = events.delegates[i]).callback.apply(_events$delegates$i, args);
        }
    }
};

exports['default'] = events;
module.exports = exports['default'];