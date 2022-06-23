const browserSync = require("browser-sync");
const gulp = require("gulp");
const sass = require("sass")(require("sass"));

function compileSass() {
  return gulp.src("./sass/styles.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./assets/css"))
}

function serve() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  })
}

exports.serve = serve;
exports.compileSass = compileSass;
