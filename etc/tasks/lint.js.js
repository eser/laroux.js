(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        jshint = require('gulp-jshint'),
        jscs = require('gulp-jscs');

    gulp.task('lint:js', function () {
        return gulp.src(config.lintFiles.js)
            .pipe(jshint('./etc/config/.jshintrc'))
            .pipe(jshint.reporter('default', { verbose: true }))
            .pipe(jscs('./etc/config/.jscsrc'))
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

}());
