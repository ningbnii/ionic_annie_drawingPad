var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var plumber = require('gulp-plumber');
var order = require('gulp-order');

var paths = {
  sass: ['./scss/*.scss'],
  controllers: ['www/controllers/*.js'],
  services: ['www/services/*.js']
};

gulp.task('default', ['watch', 'sass', 'concatControllers', 'concatServices']);

gulp.task('sass', function(done) {
  gulp.src('./scss/*.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('concatControllers', function() {
  gulp.src('www/controllers/*.js')
    .pipe(plumber())
    //.pipe(stripDebug())
    .pipe(order(['www/controllers/index.js', 'www/controllers/*.js'], { base: '.' }))
    .pipe(concat('controllers.js'))
    .pipe(gulp.dest('./www/js/'))
});

gulp.task('concatServices', function() {
  gulp.src('www/services/*.js')
    .pipe(plumber())
    //.pipe(stripDebug())
    .pipe(order(['www/services/index.js', 'www/services/*.js'], { base: '.' }))
    .pipe(concat('services.js'))
    .pipe(gulp.dest('./www/js/'))
});

gulp.task('watch', ['sass'], function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.controllers, ['concatControllers']);
  gulp.watch(paths.services, ['concatServices']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
