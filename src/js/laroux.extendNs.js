import {extend} from './laroux.extend.js';

export function extendNs(target, path, source) {
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
        ptr = extend(ptr, source);
    }

    return target;
}
