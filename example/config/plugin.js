'use strict';
const path = require('path');

/** @type Egg.EggPlugin */
exports.mp = {
  enable: true,
  // package: 'egg-mp',
  path: path.join(__dirname, '../../'),
};
