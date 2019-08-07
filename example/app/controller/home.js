'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const {
      ctx,
      service,
    } = this;
    service.mp.getToken().then(res => console.log(res));
    ctx.body = 'hi, egg';
  }
}

module.exports = HomeController;
