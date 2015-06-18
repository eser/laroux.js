(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        eslint = require('gulp-eslint');

    gulp.task('selfcheck', function () {
        return gulp.src(config.selfCheckFiles)
            .on('error', handleErrors)
            .pipe(eslint({ configFile: './etc/config/.eslintrc.json' }))
            .pipe(eslint.format());
            // .pipe(eslint.failAfterError());
    });

}());
