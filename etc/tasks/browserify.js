(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        browserify = require('browserify'),
        es6ify = require('es6ify'),
        source = require('vinyl-source-stream'),
        rename = require('gulp-rename'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'browserify:' + item,
            taskNameLint = 'lint-js:' + item,
            tempDir = resolvePath('~/' + item + '/js'),
            tempFile = bundle.jsBrowsifyOutputFile,
            entries = [];

        if (bundle.jsBrowsifyEntryPoints !== null) {
            for (var item2 in bundle.jsBrowsifyEntryPoints) {
                entries.push(tempDir + '/' + bundle.jsBrowsifyEntryPoints[item2]);
            }
        }

        gulp.task(taskName, [taskNameLint], function () {
            var browserified;

            if (entries.length > 0) {
                browserified = browserify({ entries: entries, debug: true })
                    // .add(es6ify.runtime)
                    // .transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
                    .bundle()
                    .on('error', handleErrors)
                    .pipe(source(bundle.jsBrowsifyEntryPoints[0]));
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
