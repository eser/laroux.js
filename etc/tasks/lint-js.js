(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        jshint = require('gulp-jshint'),
        jscs = require('gulp-jscs'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'lint-js:' + item,
            taskNamePreprocess = 'preprocess-js:' + item,
            tempSources = resolvePath('~/' + item + '/js/**/*.js');

        gulp.task(taskName, [taskNamePreprocess], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                .pipe(jshint('./etc/config/.jshintrc'))
                .pipe(jshint.reporter('default', { verbose: true }))
                .pipe(jscs('./etc/config/.jscsrc'));
        });

        taskList.push(taskName);
    });

    gulp.task('lint-js', taskList);

}());
