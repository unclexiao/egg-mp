'use strict';

const mock = require('egg-mock');

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
});
