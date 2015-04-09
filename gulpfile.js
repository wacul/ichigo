var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
gulp.task('scripts', function() {
  var tsResult =
    gulp.src('front/*.ts')
      .pipe(ts({
        declarationFiles: false,
        noExternalResolve: true
      }));
  return merge([
    tsResult.js.pipe(gulp.dest('front'))
  ]);
});
