(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        del = require('del'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        preprocess = require('gulp-preprocess'),
        taskList = [],
        taskListClean = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'preprocess-js:' + item,
            taskNameClean = 'preprocess-js-clean:' + item,
            tempDir = resolvePath('~/' + item + '/js');

        gulp.task(taskNameClean, function (cb) {
            del(tempDir, cb);
        });

        gulp.task(taskName, [taskNameClean], function () {
            return gulp.src(config.bundles[item].jsFiles)
                .on('error', handleErrors)
                .pipe(preprocess({
                    context: config.bundles[item].jsPreprocessVars
                }))
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
        taskListClean.push(taskNameClean);
    });

    gulp.task('preprocess-js', taskList);
    gulp.task('preprocess-js-clean', taskListClean);

}());
