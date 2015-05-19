import ajax from './laroux.ajax.js';
import date from './laroux.date.js';
import Deferred from './laroux.deferred.js';
import events from './laroux.events.js';
import helpers from './laroux.helpers.js';
import Stack from './laroux.stack.js';
import timers from './laroux.timers.js';
import vars from './laroux.vars.js';

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
        ajax,
        date,
        deferred: Deferred,
        events,
        stack: Stack,
        timers,
        vars
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;

})();
