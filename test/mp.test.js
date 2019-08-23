'use strict';

const mock = require('egg-mock');
const assert = require('assert');

describe('test/mp.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/mp-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, mp')
      .expect(200);
  });

  it('should auth user', async () => {
    const ctx = app.mockContext();
    const code = '001OMmHL0SfDwb2ZOwHL0UukHL0OMmHH';
    const res = await ctx.service.wcs.auth(code);
    // {
    //   access_token:
    //     '24_u2on0IqLWXe9ep9abCCsdyBFy7Rts7F2V42BHa0s_hJycXL3QmECruH2vUXuOXO0LRsXe3VW0FMxIwLxVuEpnQ',
    //   expires_in: 7200,
    //   refresh_token:
    //     '24_-OGmr1dyiyNZQIs_yyU1JAMJgPJeNFea_V_jUUk-F3OXk6z6xLSsxQo0DiCbaEajNiN_Y1HVi_qgqpRlG98cOQ',
    //   openid: 'oxMV95vEbkzDLGgOk3EC4ylN1GRA',
    //   scope: 'snsapi_userinfo',
    //   unionid: 'opS3Q0S3ClxpHqtrNU62Q-E_JyuU'
    // };
    assert(res);
  });

  it('should create oreder', async () => {
    const ctx = app.mockContext();
    const openid = 'oxMV95vEbkzDLGgOk3EC4ylN1GRA';
    const res = await ctx.service.wcs.createOrder(openid, {});
    // {
    //   return_code: 'SUCCESS',
    //   return_msg: 'OK',
    //   appid: 'wx073c065ac1babbb9',
    //   mch_id: '1520830701',
    //   nonce_str: 'co7xR0U45Qs5AT9i',
    //   sign: 'A9CA77FC584586161FA1ABEF55FC85B5',
    //   result_code: 'SUCCESS',
    //   prepay_id: 'wx2214552736821452d3945c3e1380742900',
    //   trade_type: 'JSAPI'
    // };
    assert(res);
  });

  it('should get config', async () => {
    const ctx = app.mockContext();
    const url = 'https://www.amusingcode.com/static-pages/temp/weixin.html';
    const res = await ctx.service.wcs.getConfig(url);
    // {
    //   timestamp: 1566463091268,
    //   noncestr: 'sr3n3l2lql',
    //   signature: '7233875321e99319b91e8cf9a8ca4ea346621035',
    //   appId: 'wx073c065ac1babbb9'
    // }
    assert(res);
  });

});
