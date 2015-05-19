/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
// FIXME: Laroux: not used version in favor of speed, redundant loop extracted in case of
//                if there are multiple source objects to merge with target
//
// export function extend() {
//     'use strict';
//
//     var target = Array.prototype.shift.call(arguments);
//
//     for (var i = 0, length1 = arguments.length; i < length1; i++) {
//         var argument = arguments[i],
//             keys = Object.keys(argument);
//
//         for (var j = 0, length2 = keys.length; j < length2; j++) {
//             var key = keys[j];
//
//             if (target[key] instanceof Array) {
//                 target[key] = target[key].concat(argument[key]);
//                 continue;
//             }
//
//             if (target[key] instanceof Object) {
//                 extend(target[key], argument[key]);
//                 continue;
//             }
//
//             target[key] = argument[key];
//         }
//     }
//
//     return target;
// }
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = extend;

function extend(target, source) {
    'use strict';

    var keys = Object.keys(source);

    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];

        if (target[key] instanceof Array) {
            target[key] = target[key].concat(source[key]);
            continue;
        }

        if (target[key] instanceof Object) {
            extend(target[key], source[key]);
            continue;
        }

        target[key] = source[key];
    }

    return target;
}

module.exports = exports['default'];