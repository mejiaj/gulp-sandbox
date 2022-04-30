const gulp = require("gulp");
const svgstore = require("gulp-svgstore");
const svgmin = require("gulp-svgmin")
const path = require("path");

function compileIcons() {
  return gulp
    .src("./assets/uswds/img/usa-icons/*.svg")
    .pipe(svgmin((file) => {
      const prefix = path.basename(file.relative, path.extname(file.relative))
      return {
        plugins: [{
          cleanupIDs: {
            minify: true
          }
        }]
      }
    }))
    .pipe(svgstore())
    .pipe(gulp.dest("test/dest"))
}

exports.icons = compileIcons;
