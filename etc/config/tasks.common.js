module.exports = {
    banner: [
        '/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' *',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.licenses[0].type %>',
        ' */',
        ''
    ].join('\n'),

    bundleNameVersion: 'laroux-<%= bundle.name %>-<%= bundle.version %>.<%= bundle.ext %>',
    bundleNameLatest: 'laroux-<%= bundle.name %>-latest.<%= bundle.ext %>',

    jsFiles: {
        base: [
            './src/js/laroux{base}.js'
        ],
        web: [
            './src/js/laroux.js'
        ],
        webcompat: [
            './src/js/laroux.backward.js',
            './src/js/laroux.js'
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

    lessFiles: [
        './src/less/**/*.less'
    ],

    cleanFiles: [
        './build/dist/base/**/*',
        './build/dist/web/**/*',
        './build/dist/webcompat/**/*',
        './build/reports/coverage/**/*'
    ]
};
