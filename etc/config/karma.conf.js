/*global module */
module.exports = function (config) {
    'use strict';

    config.set({
        basePath: '../../',
        frameworks: ['jasmine'],
        files: [
            'build/dist/**/*.js',
            'tests/**/*.js'
        ],
        exclude: [],
        preprocessors: {
            'tests/**/*.js': ['coverage']
        },
        reporters: ['dots', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true,
        coverageReporter: {
            type: 'lcov',
            dir: 'build/reports/coverage/'
        }
    });
};
