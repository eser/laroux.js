(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        pkg = require('../../package.json'),
        bundleLogger = require('../utils/bundleLogger'),
        handleErrors = require('../utils/handleErrors'),
        less = require('gulp-less'),
        concat = require('gulp-concat'),
        csscomb = require('gulp-csscomb'),
        header = require('gulp-header'),
        buffer = require('vinyl-buffer'),
        sourcemaps = require('gulp-sourcemaps'),
        minifyCSS = require('gulp-minify-css'),
        rename = require('gulp-rename');

    gulp.task('css:dist', ['lint:css'], function () {
        var bundleName = 'laroux.css';

        bundleLogger.start(bundleName);

        return gulp.src(config.lessFiles)
            .on('error', handleErrors)
            .pipe(less({
                strictMath: true,
                compress: false,
                yuicompress: false,
                optimization: 0
            }))
            .pipe(concat('laroux.css'))
            .pipe(csscomb({
                configPath: './etc/config/.csscomb.json',
                verbose: true
            }))
            .pipe(header(config.banner, { pkg: pkg }))
            .pipe(gulp.dest('./build/dist'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(minifyCSS({
                advanced: false,
                compatibility: 'ie8',
                keepSpecialComments: 0,
                processImport: false,
                // rebase: true,
                // relativeTo: '',
                shorthandCompacting: true
            }))
            .pipe(header(config.banner, { pkg: pkg }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./build/dist'))
            .on('end', function () { bundleLogger.end(bundleName); });
    });

}());
