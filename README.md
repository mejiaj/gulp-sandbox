# How to test this branch

## Prerequisites

1. Clone [USWDS repo](`https://github.com/uswds/uswds`)
1. Checkout branch `jm-uswds-core-module`
1. Go to the `./packages/uswds-core`
1. Run `npm link`
1. Go to `./packages/uswds-utilities`
1. Run `npm link`
1. Go to `./packages/uswds-typography`
1. Run `npm link`
1. Go to `./packages/usa-accordion`
1. Run `npm link`

## Test steps

1. Run `npm install`
1. Run `npm link @uswds/uswds-typography @uswds/uswds-core @uswds/uswds-utilities @uswds/usa-accordion`
1. Run `npx gulp compileSass` task to compile `./sass/styles.scss`
1. Run `npm start` task to start local server

### SASS

USWDS utilities **should** compile successfully and you should be able to verify via local server.

### JS

Packages use commonJS modules, so we'd need a tool like rollup, webpack, or requireJS to get working.
