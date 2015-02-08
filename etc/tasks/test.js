(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        karma = require('gulp-karma');

    gulp.task('test', function () {
        return gulp.src(config.testFiles)
            .on('error', handleErrors)
            .pipe(karma({
                configFile: './etc/config/karma.conf.js',
                action: 'run'
            }));
    });

}());
