/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

// fetch - partially taken from 'window.fetch polyfill' project
//         can be found at: https://github.com/github/fetch
var fetchPolyfill = function fetchPolyfill() {};

exports['default'] = fetch || fetchPolyfill;
module.exports = exports['default'];