(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        del = require('del');

    gulp.task('clean', function (cb) {
        del(config.cleanFiles, cb);
    });

}());
