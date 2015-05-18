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

            packs: {
                './build/dist/base/laroux.js': {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    files: [
                        '~/base/js/laroux.js',
                        '~/base/js/laroux.helpers.js',
                        '~/base/js/laroux.events.js',
                        '~/base/js/laroux.ajax.js',
                        '~/base/js/laroux.timers.js',
                        '~/base/js/laroux.promise.js',
                        '~/base/js/laroux.vars.js',
                        '~/base/js/laroux.date.js',
                        '~/base/js/laroux.stack.js'
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

            jsBrowserifyEntryPoints: [
                'laroux.js'
            ],

            jsBrowserifyOutputFile: '_browserified.js',

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
                    /*
                        '~/web/js/laroux.js',
                        '~/web/js/laroux.helpers.js',
                        '~/web/js/laroux.events.js',
                        '~/web/js/laroux.ajax.js',
                        '~/web/js/laroux.timers.js',
                        '~/web/js/laroux.promise.js',
                        '~/web/js/laroux.vars.js',
                        '~/web/js/laroux.date.js',
                        '~/web/js/laroux.stack.js',

                        '~/web/js/laroux.css.js',
                        '~/web/js/laroux.dom.js',
                        '~/web/js/laroux.forms.js',
                        '~/web/js/laroux.wrapper.js',

                        '~/web/js/laroux.anim.js',
                        '~/web/js/laroux.keys.js',
                        '~/web/js/laroux.mvc.js',
                        '~/web/js/laroux.templates.js',

                        '~/web/js/laroux.touch.js',
                        '~/web/js/laroux.web.js',

                        '~/web/js/laroux.ui.js',
                        '~/web/js/laroux.ui.popup.js',
                        '~/web/js/laroux.ui.loading.js',
                        '~/web/js/laroux.ui.dynamicDates.js',
                        '~/web/js/laroux.ui.scrollView.js'
                    */
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
