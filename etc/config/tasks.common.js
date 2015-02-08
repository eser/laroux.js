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

    jsFiles: {
        bundle: [
            './src/js/laroux.js'
        ],
        backward: [
            './src/js/laroux.backward.js'
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
        './build/dist/**/*',
        './build/reports/coverage/**/*'
    ]
};
