'use strict';

var gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss');

// server connect
gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true
  });
});

// css
gulp.task('css', function() {
   return gulp.src('css/style.css')
    //.pipe(sass().on('error', sass.logError))
    //.pipe(concatCss("bundle.css"))
    .pipe(autoprefixer({
            browsers: ['> 1%', 'IE 7'],
            cascade: false
        }))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename("bundle.min.css"))
    .pipe(gulp.dest('app/css/'))
    .pipe(connect.reload())
    .pipe(notify("CSS Done! :)"));
});

// min BootStrap
// gulp.task('BootStrap', function () {
//     return gulp.src('css/bootstrap.css')
//         .pipe(uncss({
//             html: ['app/index.html']
//         }))
//         .pipe(gulp.dest('app/css/'));
// });

// JavaScript
gulp.task('js', function() {
  return gulp.src('js/script.js')
    //.pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest('app/js/'))
    .pipe(notify("JS Done! :)"));
});
// html
gulp.task('html', function(){
  gulp.src('app/index.html')
  .pipe(connect.reload());
});

// watch
gulp.task('watch', function(){
  gulp.watch('css/style.css', ['css']);
  gulp.watch('app/index.html', ['html']);
  gulp.watch('js/script.js', ['js']);
});

// default
gulp.task('default', ['connect', 'html', 'css', 'js', 'watch']);