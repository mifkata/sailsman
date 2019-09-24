# sailsman
Test helpers for [sails](https://github.com/balderdashy/sails) that aid in testing most commpon cases, when making API calls to `sails`.

Sailsman allows you to:
  * Start, stop and restart sails
  * Load fixtures
  * Set the session values for the current user
  * Make API calls to `sails` using [supertest](https://github.com/visionmedia/supertest)

The goal is, with minimal setup to be able to configure [mocha](https://github.com/mochajs/mocha  (or another test runner) to `lift` or `lower` Sails at any point in time, whilst giving you the same easy of access to global variables, as `sails` would.

## Install

Library usage, assumes that you to have [sails](https://github.com/balderdashy/sails), this package doesn't depend on it and thus doesn't install it, when you include `sailsman` in your package.

```sh
npm install --save-dev sailsman
```

## License
MIT
