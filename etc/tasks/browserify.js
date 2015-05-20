(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        browserify = require('browserify'),
        source = require('vinyl-source-stream'),
        rename = require('gulp-rename'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'browserify:' + item,
            tempDir = resolvePath('~/' + item + '/js'),
            tempFile = bundle.jsBrowserifyOutputFile,
            entries = [];

        if (bundle.jsBrowserifyEntryPoints !== null) {
            for (var item2 in bundle.jsBrowserifyEntryPoints) {
                entries.push(tempDir + '/' + bundle.jsBrowserifyEntryPoints[item2]);
            }
        }

        gulp.task(taskName, ['babel'], function () {
            var browserified;

            if (entries.length > 0) {
                browserified = browserify({ entries: entries })
                    .bundle()
                    .on('error', handleErrors)
                    .pipe(source(bundle.jsBrowserifyEntryPoints[0]));
            } else {
                browserified = gulp.src([])
                    .on('error', handleErrors);
            }

            return browserified
                .pipe(rename(tempFile))
                .pipe(gulp.dest(tempDir));
        });

        taskList.push(taskName);
    });

    gulp.task('browserify', taskList);

}());
