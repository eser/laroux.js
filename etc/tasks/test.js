(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        karma = require('gulp-karma');

    gulp.task('test', ['pack'], function () {
        var files = [];

        Object.keys(config.bundles).forEach(function (item) {
            files = files.concat(config.bundles[item].testFiles);
        });

        return gulp.src(files)
            .on('error', handleErrors)
            .pipe(karma({
                configFile: './etc/config/karma.conf.js',
                action: 'run'
            }));
    });

}());
