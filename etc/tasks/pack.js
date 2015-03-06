(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        pkg = require('../../package.json'),
        handleErrors = require('../utils/handleErrors'),
        resolvePath = require('../utils/resolvePath'),
        concat = require('gulp-concat'),
        csscomb = require('gulp-csscomb'),
        header = require('gulp-header'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'pack:' + item,
            taskNameBrowserify = 'browserify:' + item,
            taskNameLint = 'lint-css:' + item,
            subtaskList = [],
            subtaskCount = 0,

            bundleInfo = {
                name: pkg.name,
                bundle: item,
                description: pkg.description,
                version: pkg.version,
                link: pkg.homepage,
                license: pkg.licenses[0].type
            };

        Object.keys(bundle.packs).forEach(function (item2) {
            var pack = bundle.packs[item2],
                subtaskName = taskName + ':' + subtaskCount++;

            gulp.task(subtaskName, [taskNameBrowserify, taskNameLint], function () {
                var stream = gulp.src(resolvePath.array(pack.files))
                    .on('error', handleErrors)
                    .pipe(concat(item2));

                if (pack.csscomb) {
                    stream = stream.pipe(csscomb({
                        configPath: './etc/config/.csscomb.json'
                    }));
                }

                if (pack.header) {
                    stream = stream.pipe(header(
                        bundle.banner,
                        { pkg: bundleInfo }
                    ));
                }

                return stream.pipe(gulp.dest('.'));
            });

            subtaskList.push(subtaskName);
        });

        gulp.task(taskName, subtaskList);

        taskList.push(taskName);
    });

    gulp.task('pack', taskList);

}());
