'use strict';
const xml = require('xml-js');

module.exports = {
  xml2json(xmlStr) {
    let result = xml.xml2json(xmlStr, {
      compact: true,
      spaces: 4,
    });
    result = JSON.parse(result);
    return this.deleteCDATA(result.xml);
  },

  json2xml(json) {
    const result = xml.json2xml(json, {
      compact: true,
      spaces: 4,
    });
    return '<xml>\n' + result + '\n</xml>';
  },

  deleteCDATA(args) {
    const keys = Object.keys(args);
    const obj = {};
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (typeof args[k] === 'object') {
        obj[k] = args[k]._cdata;
      }
    }
    return obj;
  },
};
