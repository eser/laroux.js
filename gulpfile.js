/*jslint nomen: true */
/*global require, process, __dirname */
(function () {
    'use strict';

    var packageJSON = require('./package'),
        gulp = require('gulp'),
        jshint = require('gulp-jshint'),
        jscs = require('gulp-jscs'),
        karma = require('gulp-karma'),
        less = require('gulp-less'),
        concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        csscomb = require('gulp-csscomb'),
        cssmin = require('gulp-cssmin'),
        uglify = require('gulp-uglify'),
        recess = require('gulp-recess'),
        browserify = require('browserify'),
        es6ify = require('es6ify'),
        source = require('vinyl-source-stream'),

        jsFile = './src/laroux.js',

        testFiles = [
            './tests/**/*.js'
        ],

        lintFiles = {
            js: [
                './gulpfile.js',
                './src/**/*.js',
                './tests/**/*.js'
            ],
            css: [
                './src/**/*.less'
            ]
        },

        lessFiles = [
            './src/**/*.less'
        ];

    gulp.task('lint:js', function () {
        return gulp.src(lintFiles.js)
            .pipe(jshint('./config/.jshintrc'))
            .pipe(jshint.reporter('default', { verbose: true }))
            .pipe(jscs('./config/.jscsrc'))
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

    gulp.task('lint:css', function () {
        return gulp.src(lintFiles.css)
            .pipe(recess())
            .pipe(recess.reporter())
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

    gulp.task('test', function () {
        return gulp.src(testFiles)
            .pipe(karma({
                configFile: __dirname + '/config/karma.conf.js',
                action: 'run'
            }))
            .on('error', function (err) {
                // Make sure failed tests cause gulp to exit non-zero
                throw err;
            });
    });

    gulp.task('css:dist', function () {
        return gulp.src(lessFiles)
            .pipe(less({
                strictMath: true
            }))
            .pipe(concat('laroux.css'))
            .pipe(csscomb())
            .pipe(gulp.dest('./dist'))
            .pipe(cssmin())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('js:browserify', function () {
        return browserify({ debug: true })
            .add(es6ify.runtime)
            .require(require.resolve(jsFile), { entry: true })
            .transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
            .bundle()
            .pipe(source('laroux.js'))
            .pipe(gulp.dest('./build/js'));
    });

    gulp.task('js:dist', function () {
        return gulp.src('./build/js/**/*.js')
            .pipe(gulp.dest('./dist'))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('lint', ['lint:js', 'lint:css']);
    gulp.task('js', ['lint:js', 'js:browserify', 'js:dist']);
    gulp.task('css', ['lint:css', 'css:dist']);
    gulp.task('default', ['css', 'js', 'test']);
}());
