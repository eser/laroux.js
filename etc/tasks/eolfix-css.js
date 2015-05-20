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
            taskName = 'eolfix-css:' + item,
            tempDir = resolvePath('~/' + item + '/css'),
            tempSources = tempDir + '/**/*.css';

        gulp.task(taskName, ['preprocess-css'], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                .pipe(eol('\n', true))
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
    });

    gulp.task('eolfix-css', taskList);

}());
