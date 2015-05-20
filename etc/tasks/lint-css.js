(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        csslint = require('gulp-csslint'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'lint-css:' + item,
            tempSources = resolvePath('~/' + item + '/css/**/*.css');

        gulp.task(taskName, ['eolfix-css'], function () {
            return gulp.src(tempSources)
                .on('error', handleErrors)
                // .pipe(csslint('./etc/config/.csslintrc'))
                .pipe(csslint({
                    'adjoining-classes': false,
                    'box-model': false,
                    'box-sizing': false,
                    'compatible-vendor-prefixes': false,
                    important: false,
                    'known-properties': false,
                    'outline-none': false,
                    'fallback-colors': false,
                    floats: false,
                    'font-sizes': false,
                    gradients: false,
                    'qualified-headings': false,
                    'regex-selectors': false,
                    shorthand: false,
                    'text-indent': false,
                    'unique-headings': false,
                    'universal-selector': false,
                    'unqualified-attributes': false,
                    'zero-units': false
                }))
                .pipe(csslint.reporter());
        });

        taskList.push(taskName);
    });

    gulp.task('lint-css', taskList);

}());
