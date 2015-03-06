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

            jsBrowsifyEntryPoints: [
                'laroux.js'
            ],

            jsBrowsifyOutputFile: '_browserified.js',

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './tests/**/*.js'
            ],

            packs: {
                './build/dist/base/laroux.js': {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    files: [
                        '~/base/js/_browserified.js'
                    ]
                }
            }
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

            jsBrowsifyEntryPoints: [
                'laroux.js'
            ],

            jsBrowsifyOutputFile: '_browserified.js',

            lessFiles: [
                './src/less/laroux.ui.less'
            ],

            cssFiles: [
                './src/css/**/*.css'
            ],

            testFiles: [
                './tests/**/*.js'
            ],

            packs: {
                './build/dist/web/laroux.js': {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    files: [
                        '~/web/js/_browserified.js'
                    ]
                },

                './build/dist/web/laroux.css': {
                    uglify: false,
                    minifyCSS: true,
                    csscomb: true,
                    header: true,
                    files: [
                        '~/web/css/**/*.css'
                    ]
                }
            }
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
