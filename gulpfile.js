var gulp = require('gulp');
var deploy = require('gulp-gh-pages');
gulp.task('deploy', function() {
  return gulp.src('./build/start_project/web-mobile/**/*')
    .pipe(deploy());
});
gulp.task('default', ['deploy']);
