/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.2.0
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

var _larouxEventsJs = require('./laroux.events.js');

var _larouxEventsJs2 = _interopRequireDefault(_larouxEventsJs);

var _larouxFetchObjectJs = require('./laroux.fetchObject.js');

var _larouxFetchObjectJs2 = _interopRequireDefault(_larouxFetchObjectJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxIntlJs = require('./laroux.intl.js');

var _larouxIntlJs2 = _interopRequireDefault(_larouxIntlJs);

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

var _larouxRequireJs = require('./laroux.require.js');

var _larouxRequireJs2 = _interopRequireDefault(_larouxRequireJs);

var _larouxStoryboardJs = require('./laroux.storyboard.js');

var _larouxStoryboardJs2 = _interopRequireDefault(_larouxStoryboardJs);

var _larouxTypesJs = require('./laroux.types.js');

var _larouxTypesJs2 = _interopRequireDefault(_larouxTypesJs);

var _larouxTemplatesJs = require('./laroux.templates.js');

var _larouxTemplatesJs2 = _interopRequireDefault(_larouxTemplatesJs);

var _larouxTimersJs = require('./laroux.timers.js');

var _larouxTimersJs2 = _interopRequireDefault(_larouxTimersJs);

var _larouxValidationJs = require('./laroux.validation.js');

var _larouxValidationJs2 = _interopRequireDefault(_larouxValidationJs);

var _larouxVarsJs = require('./laroux.vars.js');

var _larouxVarsJs2 = _interopRequireDefault(_larouxVarsJs);

exports['default'] = (function () {
    'use strict';

    var laroux = function laroux(selector, parent) {
        if (selector.constructor === Array) {
            return _larouxHelpersJs2['default'].toArray((parent || document).querySelectorAll(selector));
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

    _larouxHelpersJs2['default'].merge(laroux, _larouxHelpersJs2['default']);
    _larouxHelpersJs2['default'].merge(laroux, {
        ajax: _larouxAjaxJs2['default'],
        events: _larouxEventsJs2['default'],
        fetch: _larouxFetchObjectJs2['default'],
        intl: _larouxIntlJs2['default'],
        promise: _larouxPromiseObjectJs2['default'],
        require: _larouxRequireJs2['default'],
        storyboard: _larouxStoryboardJs2['default'],
        types: _larouxTypesJs2['default'],
        templates: _larouxTemplatesJs2['default'],
        timers: _larouxTimersJs2['default'],
        validation: _larouxValidationJs2['default'],
        vars: _larouxVarsJs2['default'],

        extend: function extend(source) {
            return _larouxHelpersJs2['default'].merge(laroux, source);
        },

        extendNs: function extendNs(path, source) {
            return _larouxHelpersJs2['default'].mergeNs(laroux, path, source);
        },

        readyPassed: false,

        ready: function ready(callback) {
            if (!laroux.readyPassed) {
                _larouxEventsJs2['default'].add('ContentLoaded', callback);
                return;
            }

            callback();
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