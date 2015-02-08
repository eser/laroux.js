(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        recess = require('gulp-recess');

    gulp.task('lint:css', function () {
        return gulp.src(config.lintFiles.css)
            .pipe(recess())
            .pipe(recess.reporter())
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

}());
