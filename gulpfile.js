/*jslint nomen: true */
/*global require, __dirname */
(function () {
    'use strict';

    var pkg = require('./package.json'),
        gulp = require('gulp'),
        header = require('gulp-header'),
        sourcemaps = require('gulp-sourcemaps'),
        jshint = require('gulp-jshint'),
        jscs = require('gulp-jscs'),
        karma = require('gulp-karma'),
        less = require('gulp-less'),
        concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        csscomb = require('gulp-csscomb'),
        minifyCSS = require('gulp-minify-css'),
        uglify = require('gulp-uglify'),
        recess = require('gulp-recess'),
        browserify = require('browserify'),
        es6ify = require('es6ify'),
        source = require('vinyl-source-stream'),
        del = require('del'),

        banner = [
            '/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' *',
            ' * @version v<%= pkg.version %>',
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.licenses[0].type %>',
            ' */',
            ''
        ].join('\n'),

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

    gulp.task('css:dist', ['lint:css'], function () {
        return gulp.src(lessFiles)
            .pipe(less({
                strictMath: true,
                compress: false,
                yuicompress: false,
                optimization: 0
            }))
            .pipe(concat('laroux.css'))
            .pipe(csscomb({ configPath: __dirname + '/config/.csscomb.json', verbose: true }))
            .pipe(header(banner, { pkg: pkg }))
            .pipe(gulp.dest('./dist'))
            .pipe(sourcemaps.init())
            .pipe(minifyCSS({
                advanced: false,
                compatibility: 'ie8',
                keepSpecialComments: 0,
                processImport: false,
                // rebase: true,
                // relativeTo: '',
                shorthandCompacting: true
            }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(banner, { pkg: pkg }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('js:browserify', ['lint:js'], function () {
        return browserify({ debug: true })
            // .add(es6ify.runtime)
            .require(require.resolve(jsFile), { entry: true })
            // .transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
            .bundle()
            .pipe(source('laroux.js'))
            .pipe(gulp.dest('./build/js'));
    });

    gulp.task('js:dist', ['js:browserify'], function () {
        return gulp.src('./build/js/**/*.js')
            .pipe(header(banner, { pkg: pkg }))
            .pipe(gulp.dest('./dist'))
            .pipe(sourcemaps.init())
            .pipe(uglify({
                preserveComments: false
            }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(banner, { pkg: pkg }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('clean', function (cb) {
        del([
            './build/coverage/**/*',
            './build/js/**/*',
            './dist/**/*',
            '!./dist/.git*'
        ], cb);
    });

    gulp.task('lint', ['lint:js', 'lint:css']);
    gulp.task('js', ['lint:js', 'js:browserify', 'js:dist']);
    gulp.task('css', ['lint:css', 'css:dist']);
    gulp.task('default', ['css', 'js', 'test']);
}());
