(function () {
    'use strict';

    var gulp = require('gulp'),
        config = require('../config/tasks.common'),
        pkg = require('../../package.json'),
        bundleLogger = require('../utils/bundleLogger'),
        handleErrors = require('../utils/handleErrors'),
        browserify = require('browserify'),
        es6ify = require('es6ify'),
        source = require('vinyl-source-stream'),
        header = require('gulp-header'),
        buffer = require('vinyl-buffer'),
        sourcemaps = require('gulp-sourcemaps'),
        uglify = require('gulp-uglify'),
        minifyCSS = require('gulp-minify-css'),
        less = require('gulp-less'),
        csscomb = require('gulp-csscomb'),
        concat = require('gulp-concat'),
        rename = require('gulp-rename');

    gulp.task('dist-web:js', ['lint:js'], function () {
        var bundleName = 'laroux-web.js';

        bundleLogger.start(bundleName);

        return browserify({ entries: config.jsFiles.web, debug: true })
            // .add(es6ify.runtime)
            // .transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
            .bundle()
            .on('error', handleErrors)
            .pipe(source('laroux.js'))
            .pipe(header(config.banner, { pkg: pkg }))
            .pipe(rename({ basename: 'laroux-web' }))
            .pipe(gulp.dest('./build/dist/web'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify({
                preserveComments: false
            }))
            .pipe(header(config.banner, { pkg: pkg }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build/dist/web'))
            .on('end', function () { bundleLogger.end(bundleName); });
    });

    gulp.task('dist-web:css', ['lint:css'], function () {
        var bundleName = 'laroux-web.css';

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
            .pipe(rename({ basename: 'laroux-web' }))
            .pipe(gulp.dest('./build/dist/web'))
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
            .pipe(gulp.dest('./build/dist/web'))
            .on('end', function () { bundleLogger.end(bundleName); });
    });

    gulp.task('dist-web', ['dist-web:js', 'dist-web:css']);

}());
