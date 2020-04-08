'use strict';

const captureOutput = require('intercept-stdout');
const sails = require('sails');
const supertest = require('supertest');
const { promisify } = require('util');
const { rmdir, isDir } = require('./lib/_helpers');
const { loadFixtures } = require('./lib/fixtures');
const { SessionManager } = require('./lib/SessionManager');

const app = Symbol('app');
const agent = Symbol('agent');
const instance = Symbol('inst');
const config = Symbol('config');
const fixtures = Symbol('fixtures');
const session = Symbol('session');
const cookiemonster = Symbol('cookiemonster');

const defaultFixtureConfig = {
  path: null,
  dbPath: null,
};

class Sailsman {
  constructor(sailsConfig, fixtureConfig) {
    sails.log.debug = () => null;

    this[cookiemonster] = `/sailsman-cookiemonster-${Date.now()}`;
    this[config] = {
      ...sailsConfig,
      routes: {
        ...sailsConfig.routes,
        [`GET ${this[cookiemonster]}`]: (_, res) => res.sendStatus(200),
      },
    };

    this[fixtures] = Object.assign({}, defaultFixtureConfig, fixtureConfig);
  }

  get app() {
    return this[app];
  }

  get agent() {
    return this[agent];
  }

  get sails() {
    return this[instance];
  }

  get sessionCookieName() {
    return this[app].config.session.name;
  }

  getSession() {
    return this[session].getSession();
  }

  setSession(data) {
    return this[session].setSession(data);
  }

  async startVerbose() {
    if(this[instance]) {
      await this.stop();
    }

    try {
      await this.deleteTestDb();

      this[instance] = new sails.Sails();
      const lift = promisify(this[instance].lift);

      this[app] = await lift(this[config]);
      await this.loadDataFixtures();

      this[agent] = supertest.agent(this[app].hooks.http.app);
      this[session] = new SessionManager({
        app: this[app],
        agent: this[agent],
        sails: this[instance],
        cookieUrl: this[cookiemonster],
      });

      return true;
    } catch(e) {
      throw new Error(e);
    }
  }

  async stop() {
    if(!this[instance]) {
      return true;
    }

    try {
      const lower = promisify(this[instance].lower);
      await lower();
      this[instance] = null;

      return true;
    } catch(e) {
      throw new Error(e);
    }
  }

  async start() {
    const stopOutputCapture = captureOutput();
    await this.startVerbose();
    return stopOutputCapture();
  }

  async restart() {
    if(!this[instance]) {
      throw new Error('Sailsman.restart() failed: no Sails instance to restart');
    }

    return this.start();
  }

  async deleteTestDb() {
    const { path, dbPath } = this[fixtures];

    if(isDir(path) && isDir(dbPath)) {
      await rmdir(dbPath);
    }

    return true;
  }

  async loadDataFixtures() {
    const { path } = this[fixtures];

    if(!isDir(path)) {
      return true;
    }

    return loadFixtures(this[app], path);
  }
}

module.exports = { Sailsman };
