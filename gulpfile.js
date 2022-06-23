const browserSync = require("browser-sync");
const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));

function compileSass() {
  return gulp
    .src("./sass/styles.scss")
    .pipe(sass({
      includePaths: "./node_modules/@uswds"
    }).on("error", sass.logError))
    .pipe(gulp.dest("./assets/css"));
}

function serve() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });

  gulp.watch("./*.html").on("change", browserSync.reload);
}

exports.serve = serve;
exports.compileSass = compileSass;
