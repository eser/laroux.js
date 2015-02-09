(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        tempClean = require('../utils/tempClean'),
        preprocess = require('gulp-preprocess');

    gulp.task('preprocess:web', ['lint:js'], function () {
        tempClean();

        return gulp.src(config.preprocessFiles)
            .on('error', handleErrors)
            .pipe(preprocess({
                context: {
                    BUILD: 'web',
                    ENV: 'web',
                    COMPAT: false
                }
            }))
            .pipe(gulp.dest('./temp/web'));
    });

}());
