(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        tempClean = require('../utils/tempClean'),
        preprocess = require('gulp-preprocess');

    gulp.task('preprocess:webcompat', ['lint:js'], function () {
        tempClean();

        return gulp.src(config.preprocessFiles)
            .on('error', handleErrors)
            .pipe(preprocess({
                context: {
                    BUILD: 'webcompat',
                    ENV: 'web',
                    COMPAT: true
                }
            }))
            .pipe(gulp.dest('./temp/webcompat'));
    });

}());
