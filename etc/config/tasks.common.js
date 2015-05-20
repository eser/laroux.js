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
                        '~/base/js/laroux.async.js',
                        '~/base/js/laroux.helpers.js',
                        '~/base/js/laroux.events.js',
                        '~/base/js/laroux.ajax.js',
                        '~/base/js/laroux.timers.js',
                        '~/base/js/laroux.deferred.js',
                        '~/base/js/laroux.vars.js',
                        '~/base/js/laroux.date.js',
                        '~/base/js/laroux.stack.js',
                        '~/base/js/laroux.templates.js'
                        /*
                        '~/base/js/web/laroux.web.js',
                        '~/base/js/web/laroux.anim.js',
                        '~/base/js/web/laroux.css.js',
                        '~/base/js/web/laroux.dom.js',
                        '~/base/js/web/laroux.forms.js',
                        '~/base/js/web/laroux.keys.js',
                        '~/base/js/web/laroux.mvc.js',
                        '~/base/js/web/laroux.touch.js'
                        */
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
                './src/less/laroux.ui.less'
            ],

            cssFiles: [
                './src/css/**/*.css'
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
                },

                {
                    uglify: false,
                    minifyCSS: true,
                    csscomb: true,
                    header: true,
                    concat: 'laroux.css',
                    dest: './build/dist/web/',
                    files: [
                        '~/web/css/**/*.css'
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
