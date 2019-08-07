'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const {
      app,
      ctx,
    } = this;
    ctx.body = 'hi, ' + app.plugins.mp.name;
  }
}

module.exports = HomeController;
