'use strict';

const app = Symbol('app');
const sails = Symbol('sails');
const agent = Symbol('agent');
const cookieUrl = Symbol('cookieUrl');

const COOKIE_CONFIG = {
  host: 'localhost',
  path: '/',
};

class SessionManager {
  constructor(config) {
    this[agent] = config.agent;
    this[sails] = config.sails;
    this[app] = config.app;
    this[cookieUrl] = config.cookieUrl;
  }

  get sessionCookieName() {
    return this[app].config.session.name;
  }

  get sessionCookie() {
    return this[agent].jar.getCookie(this.sessionCookieName, COOKIE_CONFIG);
  }

  get sid() {
    const cookie = this.sessionCookie;

    if(!cookie) {
      return null;
    }

    const str = `${this.sessionCookieName}=${cookie.value}; HttpOnly`;
    return this[sails].session.parseSessionIdFromCookie(str);
  }

  getSession() {
    return new Promise(resolve => {
      this[app].session.get(this.sid, (_, session) => resolve(session));
    });
  }

  async setSession(data) {
    if(!this.sid) {
      await this[agent].get(this[cookieUrl]);
    }

    const sessionData = {
      ...data,
      cookie: {
        path: '/',
        _expires: Date.now() + 2592000000,
        originalMaxAge: 2592000000,
        httpOnly: true,
        name: this.sessionCookieName,
      },
    };

    return new Promise(resolve => {
      this[app].session.set(this.sid, sessionData, (_, session) => resolve(session));
    });
  }
}

module.exports = { SessionManager };
