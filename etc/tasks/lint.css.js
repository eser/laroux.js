(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        recess = require('gulp-recess');

    gulp.task('lint:css', function () {
        return gulp.src(config.lintFiles.css)
            .on('error', handleErrors)
            .pipe(recess())
            .pipe(recess.reporter());
    });

}());
