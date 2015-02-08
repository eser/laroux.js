(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        karma = require('gulp-karma');

    gulp.task('test', function () {
        return gulp.src(config.testFiles)
            .pipe(karma({
                configFile: './etc/config/karma.conf.js',
                action: 'run'
            }))
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

}());
