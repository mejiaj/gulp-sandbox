Testing [USWDS PR #4939](https://github.com/uswds/uswds/pull/4939).

## How to test
1. Run `npm install`
1. Run `npx gulp serve`
1. Confirm static page with uninitialized accordion example
1. Paste code example (There's also an unminified version of script)
```js
const dynamicScript = document.createElement("script");
dynamicScript.setAttribute("src", "./assets/uswds/js/uswds-nodomready.min.js");
document.body.appendChild(dynamicScript);
```
1. Confirm accordion now is initialized
