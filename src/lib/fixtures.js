'use strict';

const path = require('path');
const fs = require('fs');
const { readdir } = require('./_helpers');

const fixturePattern = /\.json$/;

const loadFixtures = async (app, fixturesPath) => {
  const files = await readdir(fixturesPath);
  const fixtures = files.filter(fixture => fixturePattern.test(fixture));
  const promises = [];

  fixtures.forEach(fixture => {
    const model = fixture.substr(0, fixture.length - 5).toLowerCase();
    if(!app.models.hasOwnProperty(model)) {
      console.warn(`[Fixtures] Unable to find model "${model}" for fixtures/${fixture}`);
      return;
    }

    const fullPath = path.resolve(fixturesPath, fixture);
    const data = fs.readFileSync(fullPath, 'utf8');
    let records;

    try {
      records = JSON.parse(data);
    } catch(e) {
      console.warn(`[Fixtures] Invalid JSON in fixtures/${fixture}`);
      return e;
    }

    if(!Array.isArray(records)) {
      console.warn(`[Fixtures] Records in fixtures/${fixture} are not an array`);
      return;
    } else if(records.length === 0) {
      console.info(`[Fixtures] No records in fixtures/${fixture}`);
    } else {
      console.info(`[Fixtures] Inserting ${records.length} records from fixtures/${fixture}`);
      promises.push(
        app.models[model].createEach(records).meta({ fetch: true })
      );
    }
  });

  console.info('\n');
  return Promise.all(promises);
};

module.exports = {
  loadFixtures,
};
