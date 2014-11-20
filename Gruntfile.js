module.exports = function(grunt) {

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
            basejs: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.js',
                    'src/laroux.ajax.js',
                    'src/laroux.anim.js',
                    'src/laroux.css.js',
                    'src/laroux.date.js',
                    'src/laroux.dom.js',
                    'src/laroux.events.js',
                    'src/laroux.forms.js',
                    'src/laroux.helpers.js',
                    'src/laroux.mvc.js',
                    'src/laroux.stack.js',
                    'src/laroux.templates.js',
                    'src/laroux.timers.js',
                    'src/laroux.triggers.js',
                    'src/laroux.ui.js',
                    'src/laroux.vars.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            },
            mimicjs: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.wrapper.js'
                ],
                dest: 'dist/<%= pkg.name %>.mimic.js'
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
            basejs: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.basejs.dest %>']
                }
            },
            mimicjs: {
                files: {
                    'dist/<%= pkg.name %>.mimic.min.js': ['<%= concat.mimicjs.dest %>']
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
            files: ['Gruntfile.js', 'src/**/*.js']
        },
        watch: {
            basejs: {
                files: ['<%= concat.basejs.src %>'],
                tasks: ['test', 'basejs']
            },
            mimicjs: {
                files: ['<%= concat.mimicjs.src %>'],
                tasks: ['test', 'mimicjs']
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
                    'dist/<%= pkg.name %>.mimic.js',
                    'dist/<%= pkg.name %>.min.js',
                    'dist/<%= pkg.name %>.mimic.min.js',
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('basejs', ['concat:basejs', 'uglify:basejs']);
    grunt.registerTask('mimicjs', ['concat:mimicjs', 'uglify:mimicjs']);
    grunt.registerTask('js', ['basejs', 'mimicjs']);
    grunt.registerTask('css', ['less:css', 'concat:css', 'cssmin:css']);
    grunt.registerTask('default', ['test', 'js', 'css', 'clean:temp']); // , 'copy'

};