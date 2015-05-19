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
exports.extendNs = extendNs;

var _larouxExtendJs = require('./laroux.extend.js');

function extendNs(target, path, source) {
    'use strict';

    var ptr = target,
        pathSlices = path.split('.'),
        keys = Object.keys(source);

    for (var i = 0, length = pathSlices.length; i < length; i++) {
        var current = pathSlices[i];

        if (ptr[current] === undefined) {
            ptr[current] = {};
        }

        ptr = ptr[current];
    }

    if (source !== undefined) {
        // might be replaced w/ $l.extend method
        ptr = (0, _larouxExtendJs.extend)(ptr, source);
    }

    return target;
}