/*jslint node: true */
'use strict';

import helpers from './laroux.helpers.js';

// fetch - partially taken from 'window.fetch polyfill' project
//         can be found at: https://github.com/github/fetch
let fetchPolyfill = function () {
};

export default (fetch || fetchPolyfill);
