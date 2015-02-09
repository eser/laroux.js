/*
  tempClean.js
  ============

  Cleans temp directory
*/

module.exports = (function () {
    'use strict';

    var config = require('../config/tasks.common'),
        del = require('del');

    return function () {
        del(config.tempFiles);
    };

}());
