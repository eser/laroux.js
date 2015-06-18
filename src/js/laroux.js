import ajax from './laroux.ajax.js';
import date from './laroux.date.js';
import Deferred from './laroux.deferred.js';
import events from './laroux.events.js';
import helpers from './laroux.helpers.js';
import require_ from './laroux.require.js';
import Storyboard from './laroux.storyboard.js';
import types from './laroux.types.js';
import templates from './laroux.templates.js';
import timers from './laroux.timers.js';
import vars from './laroux.vars.js';
import When from './laroux.when.js';

export default (function () {
    'use strict';

    let laroux = function (selector, parent) {
        if (selector instanceof Array) {
            return helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        }

        // FIXME: Laroux: non-chromium optimization, but it runs
        //                slowly in chromium
        //
        // let re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        // if (re) {
        //     return (parent || document).getElementById(re[1]);
        // }

        return (parent || document).querySelector(selector);
    };

    helpers.merge(laroux, helpers);
    helpers.merge(laroux, {
        ajax,
        date,
        deferred: Deferred,
        events,
        require: require_,
        storyboard: Storyboard,
        types,
        templates,
        timers,
        vars,
        when: When,

        extend: function (source) {
            return helpers.merge(laroux, source);
        },

        extendNs: function (path, source) {
            return helpers.mergeNs(laroux, path, source);
        },

        readyPassed: false,

        ready: function (callback) {
            if (!laroux.readyPassed) {
                events.add('ContentLoaded', callback);
                return;
            }

            callback();
        },

        setReady: function () {
            if (!laroux.readyPassed) {
                events.invoke('ContentLoaded');
                setInterval(timers.ontick, 100);
                laroux.readyPassed = true;
            }
        }
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;

})();
