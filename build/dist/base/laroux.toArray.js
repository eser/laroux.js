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
exports['default'] = toArray;

function toArray(obj) {
    'use strict';

    var length = obj.length,
        items = new Array(length);

    for (var i = 0; i < length; i++) {
        items[i] = obj[i];
    }

    return items;
}

module.exports = exports['default'];