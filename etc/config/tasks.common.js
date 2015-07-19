module.exports = {
    bundles: {
        'laroux': {
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
                './src/laroux/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'laroux',
                ENV: 'web',
                COMPAT: true
            },

            jsBrowserifyEntryPoints: [
                'laroux.js'
            ],

            jsBrowserifyOutputFile: '_browserified.js',

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './src/laroux/js.tests/**/*.js'
            ],

            packs: [
                {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    concat: 'laroux.js',
                    dest: './build/dist/laroux/',
                    files: [
                        // FIXME '~/laroux/js/laroux.backward.js',
                        '~/laroux/js/_browserified.js'
                    ]
                }
            ]
        },

        'laroux-node': {
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
                './src/laroux/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'laroux',
                ENV: 'node',
                COMPAT: false
            },

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './src/laroux/js.tests/**/*.js'
            ],

            packs: [
                {
                    uglify: false,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    dest: './build/dist/laroux-node/',
                    files: [
                        '~/laroux-node/js/laroux.js',
                        '~/laroux-node/js/laroux.ajax.js',
                        '~/laroux-node/js/laroux.events.js',
                        '~/laroux-node/js/laroux.helpers.js',
                        '~/laroux-node/js/laroux.intl.js',
                        '~/laroux-node/js/laroux.promiseObject.js',
                        '~/laroux-node/js/laroux.require.js',
                        '~/laroux-node/js/laroux.storyboard.js',
                        '~/laroux-node/js/laroux.templates.js',
                        '~/laroux-node/js/laroux.timers.js',
                        '~/laroux-node/js/laroux.types.js',
                        '~/laroux-node/js/laroux.validation.js',
                        '~/laroux-node/js/laroux.vars.js'
                    ]
                }
            ]
        },

        'laroux.web': {
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
                './src/laroux.web/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'laroux.web',
                ENV: 'web',
                COMPAT: true
            },

            jsBrowserifyEntryPoints: [
                'laroux.web.js'
            ],

            jsBrowserifyOutputFile: '_browserified.js',

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './src/laroux.web/js.tests/**/*.js'
            ],

            packs: [
                {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    concat: 'laroux.web.js',
                    dest: './build/dist/laroux.web/',
                    files: [
                        '~/laroux.web/js/_browserified.js'
                    ]
                }
            ]
        },

        'laroux.web.mvvm': {
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
                './src/laroux.web.mvvm/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'laroux.web.mvvm',
                ENV: 'web',
                COMPAT: true
            },

            jsBrowserifyEntryPoints: [
                'laroux.web.mvvm.js'
            ],

            jsBrowserifyOutputFile: '_browserified.js',

            lessFiles: [
            ],

            cssFiles: [
            ],

            testFiles: [
                './src/laroux.web.mvvm/js.tests/**/*.js'
            ],

            packs: [
                {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    concat: 'laroux.web.mvvm.js',
                    dest: './build/dist/laroux.web.mvvm/',
                    files: [
                        '~/laroux.web.mvvm/js/_browserified.js'
                    ]
                }
            ]
        },

        'laroux.web.ui': {
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
                './src/laroux.web.ui/js/**/*.js'
            ],

            jsPreprocessVars: {
                BUNDLE: 'laroux.web.ui',
                ENV: 'web',
                COMPAT: true
            },

            jsBrowserifyEntryPoints: [
                'laroux.web.ui.js'
            ],

            jsBrowserifyOutputFile: '_browserified.js',

            lessFiles: [
                './src/laroux.web.ui/less/**/*.less'
            ],

            cssFiles: [
            ],

            testFiles: [
                './src/laroux.web.ui/js.tests/**/*.js'
            ],

            packs: [
                {
                    uglify: true,
                    minifyCSS: false,
                    csscomb: false,
                    header: true,
                    concat: 'laroux.web.ui.js',
                    dest: './build/dist/laroux.web.ui/',
                    files: [
                        '~/laroux.web.ui/js/_browserified.js'
                    ]
                },
                {
                    uglify: false,
                    minifyCSS: true,
                    csscomb: true,
                    header: true,
                    concat: 'laroux.web.ui.css',
                    dest: './build/dist/laroux.web.ui/',
                    files: [
                        '~/laroux.web.ui/css/laroux.web.ui.less.css'
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
