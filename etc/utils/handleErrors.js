/*
  handleErrors.js
  ===============

  Handles compilation errors in order to send them to notification center
*/

module.exports = (function () {
    'use strict';

    var notify = require('gulp-notify');

    return function () {
        var args = Array.prototype.slice.call(arguments);

        // Send error to notification center with gulp-notify
        notify.onError({
            title: 'Compile Error',
            message: '<%= error %>'
        }).apply(this, args);

        // Keep gulp from hanging on this task
        this.emit('end');
    };

}());
