'use strict';

const chai = require('chai');
const sinon = require('sinon');
const chaiString = require('chai-string');

chai.use(chaiString);
global.expect = chai.expect;
global.sinon = sinon;
