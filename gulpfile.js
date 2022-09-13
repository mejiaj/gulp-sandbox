const gulp = require("gulp");
const uswds = require("@uswds/compile");
const browserSync = require("browser-sync").create();

uswds.settings.version = 3;

function serve() {
  browserSync.init({
    server: "."
  })

  // watch(uswds.paths.dist.theme, myWatchTask)
  gulp.watch(uswds.paths.dist.theme, gulp.series(uswds.compileSass, cssInject))
}

function cssInject() {
  return src(uswds.paths.dist.theme)
    .pipe(browserSync.stream())
}

exports.serve = serve;
exports.initUSWDS = uswds.init;
exports.updateUSWDS = uswds.updateUswds;
exports.compileSass = uswds.compileSass;
