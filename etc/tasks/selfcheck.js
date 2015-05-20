(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        jshint = require('gulp-jshint'),
        jscs = require('gulp-jscs');

    gulp.task('selfcheck', function () {
        return gulp.src(config.selfCheckFiles)
            .on('error', handleErrors)
            .pipe(jshint('./etc/config/.jshintrc'))
            .pipe(jshint.reporter('default', { verbose: true }))
            .pipe(jscs('./etc/config/.jscsrc'));
    });

}());
