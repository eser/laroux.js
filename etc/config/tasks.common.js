module.exports = {
    banner: [
        '/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' *',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.link %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n'),

    jsFiles: {
        base: [
            './temp/base/laroux.js'
        ],
        web: [
            './temp/web/laroux.js'
        ],
        webcompat: [
            './temp/webcompat/laroux.js'
        ]
    },

    testFiles: [
        './tests/**/*.js'
    ],

    lintFiles: {
        js: [
            './gulpfile.js',
            './src/js/**/*.js',
            './tests/**/*.js'
        ],
        css: [
            './src/less/**/*.{css,less}'
        ]
    },

    preprocessFiles: [
        './src/js/**/*.js'
    ],

    lessFiles: [
        './src/less/**/*.less'
    ],

    tempFiles: [
        './temp/base/**/*',
        '!./temp/base/.gitkeep',
        './temp/web/**/*',
        '!./temp/web/.gitkeep',
        './temp/webcompat/**/*',
        '!./temp/webcompat/.gitkeep'
    ],

    cleanFiles: [
        './build/dist/base/**/*',
        './build/dist/web/**/*',
        './build/dist/webcompat/**/*',
        './build/reports/coverage/**/*'
    ]
};
