const { src, watch, series, parallel } = require("gulp")
const uswds = require("@uswds/compile");
const browserSync = require("browser-sync").create()

uswds.settings.version = 3;
uswds.paths.dist.theme = './sass';

function serve() {
  browserSync.init({
    server: "."
  })

  // watch(uswds.paths.dist.theme, myWatchTask)
  watch(uswds.paths.dist.theme, series(uswds.compileSass, cssInject))
}

function cssInject() {
  return src(uswds.paths.dist.theme)
    .pipe(browserSync.stream())
}


// async function myWatchTask(done) {
//   const uswdsCompile = await uswds.compileSass
//   uswdsCompile()
//   cssInject()
//   // This works, but triggers full refresh
//   // browserSync.reload()
//   done()
// }


// exports.myWatchTask = series(uswds.compileSass, browserSync.reload)
exports.compile = uswds.compileSass
exports.default = serve
