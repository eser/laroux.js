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
exports['default'] = extendNs;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxExtendJs = require('./laroux.extend.js');

var _larouxExtendJs2 = _interopRequireDefault(_larouxExtendJs);

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
        (0, _larouxExtendJs2['default'])(ptr, source);
    }

    return target;
}

module.exports = exports['default'];