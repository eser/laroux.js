export function toArray(obj) {
    'use strict';

    var length = obj.length,
        items = new Array(length);

    for (var i = 0; i < length; i++) {
        items[i] = obj[i];
    }

    return items;
}
