/**
 * laroux.js - A jquery substitute for modern browsers (web bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.extend.js":2,"./laroux.extendNs.js":3,"./laroux.toArray.js":4}],2:[function(require,module,exports){
// FIXME: Laroux: not used version in favor of speed, redundant loop extracted in case of
//                if there are multiple source objects to merge with target
//
// export function extend() {
//     'use strict';
//
//     var target = Array.prototype.shift.call(arguments);
//
//     for (var i = 0, length1 = arguments.length; i < length1; i++) {
//         var argument = arguments[i],
//             keys = Object.keys(argument);
//
//         for (var j = 0, length2 = keys.length; j < length2; j++) {
//             var key = keys[j];
//
//             if (target[key] instanceof Array) {
//                 target[key] = target[key].concat(argument[key]);
//                 continue;
//             }
//
//             if (target[key] instanceof Object) {
//                 extend(target[key], argument[key]);
//                 continue;
//             }
//
//             target[key] = argument[key];
//         }
//     }
//
//     return target;
// }
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.extend = extend;

function extend(target, source) {
    'use strict';

    var keys = Object.keys(source);

    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];

        if (target[key] instanceof Array) {
            target[key] = target[key].concat(source[key]);
            continue;
        }

        if (target[key] instanceof Object) {
            extend(target[key], source[key]);
            continue;
        }

        target[key] = source[key];
    }

    return target;
}
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.extendNs = extendNs;

var _larouxExtendJs = require('./laroux.extend.js');

function extendNs(target, path, source) {
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
        (0, _larouxExtendJs.extend)(ptr, source);
    }

    return target;
}
},{"./laroux.extend.js":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.toArray = toArray;

function toArray(obj) {
    'use strict';

    var length = obj.length,
        items = new Array(length);

    for (var i = 0; i < length; i++) {
        items[i] = obj[i];
    }

    return items;
}
},{}]},{},[1]);
