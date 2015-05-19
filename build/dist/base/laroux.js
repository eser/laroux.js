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

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxStackJs = require('./laroux.stack.js');

var _larouxStackJs2 = _interopRequireDefault(_larouxStackJs);

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
        stack: _larouxStackJs2['default']
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;
})();

module.exports = exports['default'];