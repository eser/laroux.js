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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxAjaxJs = require('./laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxDateJs = require('./laroux.date.js');

var _larouxDateJs2 = _interopRequireDefault(_larouxDateJs);

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxEventsJs = require('./laroux.events.js');

var _larouxEventsJs2 = _interopRequireDefault(_larouxEventsJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxStackJs = require('./laroux.stack.js');

var _larouxStackJs2 = _interopRequireDefault(_larouxStackJs);

var _larouxTemplatesJs = require('./laroux.templates.js');

var _larouxTemplatesJs2 = _interopRequireDefault(_larouxTemplatesJs);

var _larouxTimersJs = require('./laroux.timers.js');

var _larouxTimersJs2 = _interopRequireDefault(_larouxTimersJs);

var _larouxVarsJs = require('./laroux.vars.js');

var _larouxVarsJs2 = _interopRequireDefault(_larouxVarsJs);

exports['default'] = (function () {
    'use strict';

    var laroux = function laroux(selector, parent) {
        if (selector instanceof Array) {
            return _larouxHelpersJs2['default'].toArray((parent || document).querySelectorAll(selector));
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

    _larouxHelpersJs2['default'].extend(laroux, _larouxHelpersJs2['default']);
    _larouxHelpersJs2['default'].extend(laroux, {
        ajax: _larouxAjaxJs2['default'],
        date: _larouxDateJs2['default'],
        deferred: _larouxDeferredJs2['default'],
        events: _larouxEventsJs2['default'],
        stack: _larouxStackJs2['default'],
        templates: _larouxTemplatesJs2['default'],
        timers: _larouxTimersJs2['default'],
        vars: _larouxVarsJs2['default'],

        cached: {
            single: {},
            array: {},
            id: {}
        },

        c: function c(selector) {
            if (selector instanceof Array) {
                return laroux.cached.array[selector] || (laroux.cached.array[selector] = _larouxHelpersJs2['default'].toArray(document.querySelectorAll(selector)));
            }

            return laroux.cached.single[selector] || (laroux.cached.single[selector] = document.querySelector(selector));
        },

        id: function id(selector, parent) {
            return (parent || document).getElementById(selector);
        },

        idc: function idc(selector) {
            return laroux.cached.id[selector] || (laroux.cached.id[selector] = document.getElementById(selector));
        },

        readyPassed: false,

        ready: function ready(fnc) {
            if (!laroux.readyPassed) {
                _larouxEventsJs2['default'].add('ContentLoaded', fnc);
                return;
            }

            fnc();
        },

        setReady: function setReady() {
            if (!laroux.readyPassed) {
                _larouxEventsJs2['default'].invoke('ContentLoaded');
                setInterval(_larouxTimersJs2['default'].ontick, 100);
                laroux.readyPassed = true;
            }
        }
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;
})();

module.exports = exports['default'];