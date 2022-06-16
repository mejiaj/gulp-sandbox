const gulp = require("gulp");
const uswds = require("@uswds/compile");

uswds.settings.version = 3;

exports.initUSWDS = uswds.init;
exports.compileSass = uswds.compileSass;
