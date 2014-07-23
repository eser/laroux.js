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
            js: {
                options: {
                    separator: ';'
                },
                src: [
                    'src/laroux.js',
                    'src/laroux.ajax.js',
                    'src/laroux.cookies.js',
                    'src/laroux.css.js',
                    'src/laroux.date.js',
                    'src/laroux.dom.js',
                    'src/laroux.events.js',
                    'src/laroux.forms.js',
                    'src/laroux.helpers.js',
                    'src/laroux.stack.js',
                    'src/laroux.storage.js',
                    'src/laroux.templates.js',
                    'src/laroux.timers.js',
                    'src/laroux.triggers.js',
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
            js: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
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
            },
            js: {
                files: ['<%= concat.js.src %>'],
                tasks: ['jshint', 'concat:js', 'uglify:js']
            }
        },
        clean: {
            all: {
                src: [
                    'dist/<%= pkg.name %>.js',
                    'dist/<%= pkg.name %>.min.js',
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
    grunt.registerTask('js', ['jshint', 'concat:js', 'uglify:js']);
    grunt.registerTask('css', ['less:css', 'concat:css', 'cssmin:css']);
    grunt.registerTask('default', ['jshint', 'concat:js', 'uglify:js', 'less:css', 'concat:css', 'cssmin:css', 'clean:temp']); // , 'copy'

};