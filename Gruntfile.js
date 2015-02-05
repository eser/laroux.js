/*global module */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            css: {
                options: {
                    compress: false,
                    yuicompress: false,
                    optimization: 0
                },
                files: {
                    'temp/laroux.ui.css': [ 'src/laroux.ui.less' ]
                }
            }
        },
        concat: {
            backwardjs: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.backward.js'
                ],
                dest: 'dist/parts/<%= pkg.name %>.backward.js'
            },
            basejs: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.js',
                    'src/laroux.wrapper.js',
                    'src/laroux.ajax.js',
                    'src/laroux.css.js',
                    'src/laroux.dom.js',
                    'src/laroux.events.js',
                    'src/laroux.forms.js',
                    'src/laroux.helpers.js',
                    'src/laroux.timers.js',
                    'src/laroux.triggers.js',
                    'src/laroux.vars.js'
                ],
                dest: 'dist/parts/<%= pkg.name %>.base.js'
            },
            extjs: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.anim.js',
                    'src/laroux.date.js',
                    'src/laroux.keys.js',
                    'src/laroux.mvc.js',
                    'src/laroux.stack.js',
                    'src/laroux.templates.js',
                    'src/laroux.touch.js',
                    'src/laroux.ui.js'
                ],
                dest: 'dist/parts/<%= pkg.name %>.ext.js'
            },
            alljs: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.backward.js',

                    'src/laroux.js',
                    'src/laroux.wrapper.js',
                    'src/laroux.ajax.js',
                    'src/laroux.css.js',
                    'src/laroux.dom.js',
                    'src/laroux.events.js',
                    'src/laroux.forms.js',
                    'src/laroux.helpers.js',
                    'src/laroux.timers.js',
                    'src/laroux.triggers.js',
                    'src/laroux.vars.js',

                    'src/laroux.anim.js',
                    'src/laroux.date.js',
                    'src/laroux.keys.js',
                    'src/laroux.mvc.js',
                    'src/laroux.stack.js',
                    'src/laroux.templates.js',
                    'src/laroux.touch.js',
                    'src/laroux.ui.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            },
            css: {
                src: [
                    'temp/laroux.ui.css'
                ],
                dest: 'dist/<%= pkg.name %>.css'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            backwardjs: {
                files: {
                    'dist/parts/<%= pkg.name %>.backward.min.js': ['<%= concat.backwardjs.dest %>']
                }
            },
            basejs: {
                files: {
                    'dist/parts/<%= pkg.name %>.base.min.js': ['<%= concat.basejs.dest %>']
                }
            },
            extjs: {
                files: {
                    'dist/parts/<%= pkg.name %>.ext.min.js': ['<%= concat.extjs.dest %>']
                }
            },
            alljs: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.alljs.dest %>']
                }
            }
        },
        cssmin: {
            css: {
                src: 'dist/<%= pkg.name %>.css',
                dest: 'dist/<%= pkg.name %>.min.css'
            }
        },
        jshint: {
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            },
            files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js']
        },
        karma: {
            tests: {
                configFile: 'karma.conf.js'
            }
        },
        watch: {
            backwardjs: {
                files: ['<%= concat.backwardjs.src %>'],
                tasks: ['test', 'backwardjs', 'alljs']
            },
            basejs: {
                files: ['<%= concat.basejs.src %>'],
                tasks: ['test', 'basejs', 'alljs']
            },
            extjs: {
                files: ['<%= concat.extjs.src %>'],
                tasks: ['test', 'extjs', 'alljs']
            },
            less: {
                files: ['src/**/*.less'],
                tasks: ['less:css'],
                options: {
                    nospawn: true
                }
            },
            css: {
                files: ['<%= concat.css.src %>'],
                tasks: ['concat:css', 'cssmin:css']
            }
        },
        clean: {
            all: {
                src: [
                    'dist/<%= pkg.name %>.js',
                    'dist/parts/<%= pkg.name %>.backward.js',
                    'dist/parts/<%= pkg.name %>.base.js',
                    'dist/parts/<%= pkg.name %>.ext.js',
                    'dist/<%= pkg.name %>.min.js',
                    'dist/parts/<%= pkg.name %>.backward.min.js',
                    'dist/parts/<%= pkg.name %>.base.min.js',
                    'dist/parts/<%= pkg.name %>.ext.min.js',
                    'dist/<%= pkg.name %>.css',
                    'dist/<%= pkg.name %>.min.css'
                ]
            },
            temp: {
                src: [
                    '<%= concat.css.src %>'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('backwardjs', ['concat:backwardjs', 'uglify:backwardjs']);
    grunt.registerTask('basejs', ['concat:basejs', 'uglify:basejs']);
    grunt.registerTask('extjs', ['concat:extjs', 'uglify:extjs']);
    grunt.registerTask('alljs', ['concat:alljs', 'uglify:alljs']);
    grunt.registerTask('js', ['backwardjs', 'basejs', 'extjs', 'alljs']);
    grunt.registerTask('css', ['less:css', 'concat:css', 'cssmin:css']);
    grunt.registerTask('default', ['test', 'js', 'css', 'clean:temp']); // , 'copy'

};
