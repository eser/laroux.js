/*
  gulpfile.js
  ===========

  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in gulp/tasks. Any files in that directory get
  automatically required below.

  To add a new task, simply add a new task file that directory.
  gulp/tasks/default.js specifies the default set of tasks to run
  when you run `gulp`.
*/

(function () {
    'use strict';

    var gulp = require('gulp'),
        requireDir = require('require-dir');

    // Require all tasks in gulp/tasks, including subfolders
    requireDir('./etc/tasks', { recurse: true });

    gulp.task('lint', ['lint:js', 'lint:css']);
    gulp.task('js:dist', ['js:dist-bundle', 'js:dist-backward']);
    gulp.task('js', ['lint:js', 'js:dist']);
    gulp.task('css', ['lint:css', 'css:dist']);
    gulp.task('default', ['css', 'js', 'test']);

}());
