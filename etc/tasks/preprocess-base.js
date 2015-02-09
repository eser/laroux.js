(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        tempClean = require('../utils/tempClean'),
        preprocess = require('gulp-preprocess');

    gulp.task('preprocess:base', ['lint:js'], function () {
        tempClean();

        return gulp.src(config.preprocessFiles)
            .on('error', handleErrors)
            .pipe(preprocess({
                context: {
                    BUILD: 'base',
                    ENV: 'all',
                    COMPAT: false
                }
            }))
            .pipe(gulp.dest('./temp/base'));
    });

}());
