(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        eol = require('gulp-eol'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'eolfix-js:' + item,
            tempDir = resolvePath('~/' + item + '/js'),
            tempSources = tempDir + '/**/*.js';

        gulp.task(taskName, ['preprocess-js'], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                .pipe(eol('\n', true))
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
    });

    gulp.task('eolfix-js', taskList);

}());
