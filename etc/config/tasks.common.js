module.exports = {
    bundles: {
        base: {
            banner: [
                '/**',
                ' * <%= pkg.name %> - <%= pkg.description %> (<%= pkg.bundle %> bundle)',
                ' *',
                ' * @version v<%= pkg.version %>',
                ' * @link <%= pkg.link %>',
                ' * @license <%= pkg.license %>',
                ' */',
                ''
            ].join('\n'),

            jsFiles: [
                './src/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'base',
                ENV: 'base',
                COMPAT: false
            },

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './tests/**/*.js'
            ],

            packs: [
                {
                    uglify: false,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    dest: './build/dist/base/',
                    files: [
                        '~/base/js/laroux.js',
                        '~/base/js/laroux.helpers.js',
                        '~/base/js/laroux.events.js',
                        '~/base/js/laroux.fetchObject.js',
                        '~/base/js/laroux.ajax.js',
                        '~/base/js/laroux.timers.js',
                        '~/base/js/laroux.promiseObject.js',
                        '~/base/js/laroux.vars.js',
                        '~/base/js/laroux.date.js',
                        '~/base/js/laroux.types.js',
                        '~/base/js/laroux.templates.js'
                    ]
                }
            ]
        },

        web: {
            banner: [
                '/**',
                ' * <%= pkg.name %> - <%= pkg.description %> (<%= pkg.bundle %> bundle)',
                ' *',
                ' * @version v<%= pkg.version %>',
                ' * @link <%= pkg.link %>',
                ' * @license <%= pkg.license %>',
                ' */',
                ''
            ].join('\n'),

            jsFiles: [
                './src/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'web',
                ENV: 'web',
                COMPAT: true
            },

            jsBrowserifyEntryPoints: [
                'web/laroux.web.js'
            ],

            jsBrowserifyOutputFile: '_browserified.js',

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './tests/**/*.js'
            ],

            packs: [
                {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    concat: 'laroux.js',
                    dest: './build/dist/web/',
                    files: [
                        // FIXME '~/web/js/laroux.backward.js',
                        '~/web/js/_browserified.js'
                    ]
                }
            ]
        }
    },

    selfCheckFiles: [
        './gulpfile.js',
        './etc/config/**/*.js',
        './etc/tasks/**/*.js',
        './etc/utils/**/*.js',
        './tests/**/*.js'
    ],

    cleanFiles: [
        './build/reports/coverage/**/*',
        '!./build/reports/coverage/.gitkeep',
        './build/temp/**/*',
        '!./build/temp/.gitkeep'
    ]
};
