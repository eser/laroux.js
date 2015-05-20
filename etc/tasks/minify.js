(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        pkg = require('../../package.json'),
        handleErrors = require('../utils/handleErrors'),
        path = require('path'),
        buffer = require('vinyl-buffer'),
        sourcemaps = require('gulp-sourcemaps'),
        uglify = require('gulp-uglify'),
        minifyCSS = require('gulp-minify-css'),
        header = require('gulp-header'),
        rename = require('gulp-rename'),
        taskList = [];

    Object.keys(config.bundles).forEach(function (item) {
        var bundle = config.bundles[item],
            taskName = 'minify:' + item,
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

            if (!pack.minifyCSS && !pack.uglify) {
                return;
            }

            gulp.task(subtaskName, ['pack'], function () {
                var stream = null;

                if (pack.concat) {
                    stream = gulp.src(path.join(pack.dest, pack.concat));
                } else {
                    var files = [];

                    pack.files.forEach(function (item3) {
                        files.push(path.join(pack.dest, path.basename(pack.files[item3])));
                    });

                    stream = gulp.src(files);
                }

                stream = stream
                    .on('error', handleErrors)
                    .pipe(buffer())
                    .pipe(sourcemaps.init({ loadMaps: true }));

                if (pack.uglify) {
                    stream = stream.pipe(uglify({
                        preserveComments: false
                    }));
                }

                if (pack.minifyCSS) {
                    stream = stream.pipe(minifyCSS({
                        advanced: false,
                        compatibility: 'ie8',
                        keepSpecialComments: 0,
                        processImport: false,
                        // rebase: true,
                        // relativeTo: '',
                        shorthandCompacting: true
                    }));
                }

                if (pack.header) {
                    stream = stream.pipe(header(
                        bundle.banner,
                        { pkg: bundleInfo }
                    ));
                }

                stream = stream.pipe(rename({
                    dirname: pack.dest,
                    suffix: '.min'
                }))
                    .pipe(sourcemaps.write('./'))
                    .pipe(gulp.dest('.'));

                return stream;
            });

            subtaskList.push(subtaskName);
        });

        gulp.task(taskName, subtaskList);

        taskList.push(taskName);
    });

    gulp.task('minify', taskList);

}());
