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
            taskNameLint = 'lint-js:' + item,
            tempSources = resolvePath('~/' + item + '/js/**/*.js'),
            tempDir = resolvePath('~/' + item + '/js');

        gulp.task(taskName, [taskNameLint], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                .pipe(babel())
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
    });

    gulp.task('babel', taskList);

}());
