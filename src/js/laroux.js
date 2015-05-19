import helpers from './laroux.helpers.js';
import Stack from './laroux.stack.js';

export default (function () {
    'use strict';

    var laroux = function (selector, parent) {
        if (selector instanceof Array) {
            return helpers.toArray(
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

    helpers.extend(laroux, helpers);
    helpers.extend(laroux, {
        stack: Stack
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;

})();
