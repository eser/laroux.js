// FIXME: Laroux: not used version in favor of speed, redundant loop extracted in case of
//                if there are multiple source objects to merge with target
//
// export function extend() {
//     'use strict';
//
//     var target = Array.prototype.shift.call(arguments);
//
//     for (var i = 0, length1 = arguments.length; i < length1; i++) {
//         var keys = Object.keys(arguments[i]);
//
//         for (var j = 0, length2 = keys.length; j < length2; j++) {
//             var key = keys[j];
//
//             target[key] = arguments[i][key];
//         }
//     }
//
//     return target;
// }
export function extend(target, source) {
    'use strict';

    var keys = Object.keys(source);

    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];

        target[key] = source[key];
    }

    return target;
}
