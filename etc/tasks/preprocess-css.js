(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        del = require('del'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        less = require('gulp-less'),
        rename = require('gulp-rename'),
        addSrc = require('gulp-add-src'),
        taskList = [],
        taskListClean = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'preprocess-css:' + item,
            taskNameClean = 'preprocess-css-clean:' + item,
            tempDir = resolvePath('~/' + item + '/css');

        gulp.task(taskNameClean, function (cb) {
            del(tempDir, cb);
        });

        gulp.task(taskName, [taskNameClean], function () {
            return gulp.src(bundle.lessFiles)
                .on('error', handleErrors)
                .pipe(less({
                    strictMath: true,
                    compress: false,
                    yuicompress: false,
                    optimization: 0
                }))
                .pipe(rename({ suffix: '.less' }))
                .pipe(addSrc(bundle.cssFiles))
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
        taskListClean.push(taskNameClean);
    });

    gulp.task('preprocess-css', taskList);
    gulp.task('preprocess-css-clean', taskListClean);

}());
