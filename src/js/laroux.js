import {extend} from './laroux.extend.js';
import {extendNs} from './laroux.extendNs.js';
import {toArray} from './laroux.toArray.js';

export default (function () {
    'use strict';

    var laroux = function (selector, parent) {
        if (selector instanceof Array) {
            return toArray(
                (parent || document).querySelectorAll(selector)
            );
        }

        // FIXME: Laroux: non-chromium optimization, but it runs
        //                slowly in chromium
        //
        // var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        // if (re) {
        //     return (parent || document).getElementById(re[1]);
        // }

        return (parent || document).querySelector(selector);
    };

    extend(laroux, {
        extend,
        extendNs,
        toArray
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;

})();
