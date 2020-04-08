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

In order for your `sails` instance to not collide with your `test` instance, make sure to configure the `sails` port for the `test` environment:

```javascript
// config/env/test.js
module.exports = {
  port: 31337
}
```

## Usage
This example assumes that you're using something like mocha or another
test library. So the first thing that you want to do is to lift sails, so that
you can run tests against it.

### Configuring your test environment

```javascript
// this script is written, assuming that it's located in
// sails-root/test/setup.js
const { Sailsman } = require('sailsman');

// sails options that you want to override
// this is useful, when you want to disable a specific hook
// in the test environment, in this example - we're disabling
// the Next.js hook
const sailsOptions = {
  hooks: {
    next: false
  }
};

// This to tell Sailsman where to find fixture files and the
// temporary database using "sails-disk", read more about fixtures below
const fixturesConfig = {
  path: path.resolve(__dirname, 'fixtures'),
  dbPath: path.resolve(__dirname, '..', '.tmp', 'localDiskDb')
};

// create a globally available instance of Sailsman for your tests
global.sailsman = new Sailsman(sailsOptions, fixturesConfig);

before('Start Sailsman', () => sailsman.startSilent());
after('Stop Sailsman', () => sailsman.stop());
```

### Usage in a test script
This example makes a post to your locally defined endpoint, we assume it's
bound to `POST /api/authenticate` and there's a user in the database with
username and password `test` and ID `1`. Also, we assume that when the user
is authenticated, we set the session property of `userId` to equal `1`.

```javascript
const assert = require('assert');

describe('Endpoint test', () => {
  it('should authenticate correctly', () => {
    sailsman.agent                // instance of superagent bound to sails
      .post('/api/authenticate')
      .type('form')
      .send({ username: 'test', password: 'test' })
      .expect(200)
      .then(async () => {
        // returns the session object
        // in a request/controller action this would equal req.session
        const session = await sailsman.getSession();

        // some session validation
        assert(session.userId === 1);
      })
  });
});
```

## Sailsman API

| | |
|-|-|
| `global.sailsman = new Sailsman(sailsOptions, fixtureOptions)`| Creates new instance of Sailsman. For `sailsOptions` read the [Advanced Usage](https://sailsjs.com/documentation/reference/application/advanced-usage) documentation on sails under section `Properties (advanced)`. For `fixtureOptions` read below |
| `sailsman.start()` (async) | Starts/Lifts `sails` |
| `sailsman.startVerbose()` (async) | Same as `sailsman.start()`, but also displays the Sails lift output. |
| `sailsman.stop()` (async) | Stops/Lowers `sails` |
| `sailsman.restart()` (async) | Restarts `sails`. This is useful when you want to test different behaviour, based on different environment variable settings. |
| `sailsman.getSession()` | Returns an instance of the `sails` session for the test agent. This is the same as `req.session` inside a controller action or a policy/middleware |
| `sailsman.setSession(newValue)` | This replaces the current session object's value for the test agent. Example usage `sailsman.setSession({ id: 'test', email: 'test@test.com' })`. |
| `sailsman.agent` | Returns an instance of `supertest` that is bound to the `express` instance, that `sails` run. From there you can run `sails.agent.get()`, `sails.agent.post()`, etc. Refer to the [Supertest Documentation](https://github.com/visionmedia/supertest#example) for more information. |
| `sailsman.sails` | Returns the `sails` instance, created with `new require('sails').Sails()` |
| `sailsman.app` | The app created by running `sailsman.sails.lift()` |

## Working with fixtures
There's not much magic around implementing fixtures with `Sailsman`. Simply said, these will populate your test database much more easily, than having to do them manually in a different way. 

Usage is easy - create a directory (`tests/fixtures` for example) and put a single `JSON` file for each `model` that you want to populate with data during tests.

So, for example, if you have a model called `User` and you want to poulate it, create `test/fixtures/User.json` with something like this:

```json
[
  {
    "id": 1,
    "username": "test",
    "password": "pass",
    "email": "test@test.com"
  },
  {
    "username": "test2",
    "password": "pass2",
    "email": "test2@test.com"
  }
]
```

Naturally, if your database is configured to generate the primary key atuomatically, you don't need to enter `id` values, this is only useful, when you want to bind a specific object, to specific `id`, so you can later on look it up in your tests, if you need to.

## License
[MIT](./LICENSE.md)
