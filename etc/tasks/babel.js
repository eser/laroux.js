(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        babel = require('gulp-babel'),
        concat = require('gulp-concat'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'babel:' + item,
            tempSources = resolvePath('~/' + item + '/js/**/*.js'),
            tempDir = resolvePath('~/' + item + '/js');

        gulp.task(taskName, ['lint-js'], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                .pipe(babel())
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
    });

    gulp.task('babel', taskList);

}());
