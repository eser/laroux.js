/*jslint nomen: true */
/*global require, process, __dirname */
(function () {
    'use strict';

    var packageJSON = require('./package'),
        gulp = require('gulp'),
        jshint = require('gulp-jshint'),
        karma = require('gulp-karma'),
        less = require('gulp-less'),
        concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        csscomb = require('gulp-csscomb'),
        cssmin = require('gulp-cssmin'),
        uglify = require('gulp-uglify'),
        recess = require('gulp-recess'),

        buildFiles = {
            backward: [
                './src/laroux.backward.js'
            ],
            base: [
                './src/laroux.js',
                './src/laroux.wrapper.js',
                './src/laroux.ajax.js',
                './src/laroux.css.js',
                './src/laroux.dom.js',
                './src/laroux.events.js',
                './src/laroux.forms.js',
                './src/laroux.helpers.js',
                './src/laroux.timers.js',
                './src/laroux.triggers.js',
                './src/laroux.vars.js'
            ],
            ext: [
                './src/laroux.anim.js',
                './src/laroux.date.js',
                './src/laroux.keys.js',
                './src/laroux.mvc.js',
                './src/laroux.stack.js',
                './src/laroux.templates.js',
                './src/laroux.touch.js',
                './src/laroux.ui.js'
            ],
            all: [
                './src/laroux.backward.js',

                './src/laroux.js',
                './src/laroux.wrapper.js',
                './src/laroux.ajax.js',
                './src/laroux.css.js',
                './src/laroux.dom.js',
                './src/laroux.events.js',
                './src/laroux.forms.js',
                './src/laroux.helpers.js',
                './src/laroux.timers.js',
                './src/laroux.triggers.js',
                './src/laroux.vars.js',

                './src/laroux.anim.js',
                './src/laroux.date.js',
                './src/laroux.keys.js',
                './src/laroux.mvc.js',
                './src/laroux.stack.js',
                './src/laroux.templates.js',
                './src/laroux.touch.js',
                './src/laroux.ui.js'
            ]
        },

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
            .pipe(jshint())
            .pipe(jshint.reporter('default', { verbose: true }))
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
                configFile: __dirname + '/karma.conf.js',
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

    gulp.task('js:backward', function () {
        return gulp.src(buildFiles.backward)
            .pipe(concat('laroux.backward.js'))
            .pipe(gulp.dest('./build/js'))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./build/js'));
    });

    gulp.task('js:base', function () {
        return gulp.src(buildFiles.base)
            .pipe(concat('laroux.base.js'))
            .pipe(gulp.dest('./build/js'))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./build/js'));
    });

    gulp.task('js:ext', function () {
        return gulp.src(buildFiles.base)
            .pipe(concat('laroux.ext.js'))
            .pipe(gulp.dest('./build/js'))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./build/js'));
    });

    gulp.task('js:dist', function () {
        return gulp.src(buildFiles.all)
            .pipe(concat('laroux.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('lint', ['lint:js', 'lint:css']);
    gulp.task('js', ['lint:js', 'js:backward', 'js:base', 'js:ext', 'js:dist']);
    gulp.task('css', ['lint:css', 'css:dist']);
    gulp.task('default', ['css', 'js', 'test']);
}());
