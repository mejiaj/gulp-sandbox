# Description

This branch is for testing [USWDS-Compile issue #39](https://github.com/uswds/uswds-compile/issues/39).

# Requirements

- Node v14

# How to test

1. Run `npm install`
1. Run `npx gulp initUSWDS`
1. Verify errors
1. Go into `node_modules/@uswds/compile/gulpfile.js`
1. Replace `replaceAll()` with `replace()`
1. Run `npx gulp initUSWDS` again
1. There should be **no** errors
