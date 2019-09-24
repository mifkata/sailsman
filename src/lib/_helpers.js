'use strict';

const util = require('util');
const rimraf = require('rimraf');
const fs = require('fs');

const rmdir = util.promisify(rimraf);
const readdir = util.promisify(fs.readdir);
const isDir = dir => fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();

module.exports = {
  isDir,
  rmdir,
  readdir,
};
