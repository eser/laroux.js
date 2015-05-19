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

var _larouxExtendJs = require('./laroux.extend.js');

var _larouxExtendNsJs = require('./laroux.extendNs.js');

var _larouxToArrayJs = require('./laroux.toArray.js');

exports['default'] = (function () {
    'use strict';

    var laroux = function laroux(selector, parent) {
        if (selector instanceof Array) {
            return (0, _larouxToArrayJs.toArray)((parent || document).querySelectorAll(selector));
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

    (0, _larouxExtendJs.extend)(laroux, {
        extend: _larouxExtendJs.extend,
        extendNs: _larouxExtendNsJs.extendNs,
        toArray: _larouxToArrayJs.toArray
    });

    if (global.$l === undefined) {
        global.$l = laroux;
    }

    return laroux;
})();

module.exports = exports['default'];