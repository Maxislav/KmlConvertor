/**
 * Created by maxim on 9/13/16.
 */
const jade = require('gulp-jade');
const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const  livereload  = require('gulp-livereload');

const syncDev = [
  'jade',
  'watch'
];


gulp.task('jade', function() {
    var LOCALS = {};

    return gulp.src('./*.jade')
        .pipe(jade({
            locals: LOCALS,
            pretty: true
        }))
        .pipe(gulp.dest('./'))
        .pipe(livereload())
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('./*.jade',['jade']);
});

gulp.task('default', gulpsync.sync(syncDev));