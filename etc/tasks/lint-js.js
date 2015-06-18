(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        eslint = require('gulp-eslint'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'lint-js:' + item,
            tempSources = resolvePath('~/' + item + '/js/**/*.js');

        gulp.task(taskName, ['eolfix-js'], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                .pipe(eslint({ configFile: './etc/config/.eslintrc.json' }))
                .pipe(eslint.format());
                // .pipe(eslint.failAfterError());
        });

        taskList.push(taskName);
    });

    gulp.task('lint-js', taskList);

}());
