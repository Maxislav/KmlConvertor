/**
 * Created by maxim on 9/13/16.
 */
var jade = require('gulp-jade');
var gulp = require('gulp');

gulp.task('jade', function() {
    var LOCALS = {};

    return gulp.src('./*.jade')
        .pipe(jade({
            locals: LOCALS,
            pretty: true
        }))
        .pipe(gulp.dest('./'))
});

gulp.task('watch', function () {
    gulp.watch('./*.jade',['jade']);
});