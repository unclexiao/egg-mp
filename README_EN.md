# egg-mp

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mp.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mp
[travis-image]: https://img.shields.io/travis/eggjs/egg-mp.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mp
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-mp.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-mp?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mp.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mp
[snyk-image]: https://snyk.io/test/npm/egg-mp/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mp
[download-image]: https://img.shields.io/npm/dm/egg-mp.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mp

<!--
Description here.
-->
## Introductions
basic backend service for mp(wechat mini program)

## Features
- [X] wechat login
- [x] get user information
- [ ] push template message
- [ ] wechat payment
- [ ] create qrcode


## Install

```bash
$ npm i egg-mp --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.mp = {
  enable: true,
  package: 'egg-mp',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.mp = {
  appId: 'your appid', 
  appSecret: 'your appscret'
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

```javascript
async login() {
    const { ctx, service } = this;
    const query = ctx.request.query;
    const rule = { code: { type: "string" } };
    ctx.validate(rule, query); // code params is required
    let res = await service.wechat.login(query.code);
    // {
    //   session_key: "Sop9yRVgqnCFjsqANnNE2Q==",
    //   openid: "oo17M4gnwK3iQd6dxcA5mLDkoHA8"
    // };
}
```

## Questions & Suggestions

Please open an issue [here](https://github.com/unclexiao/egg-mp/issues).

## License

[MIT](LICENSE)
