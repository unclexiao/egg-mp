# egg-mp

## 介绍
微信小程序（Wechat Mini-Program）常规的后端服务，献给了不起的[EggJS](https://eggjs.org/zh-cn/)

## 特性
- [X] 小程序登录
- [X] 小程序授权
- [ ] 小程序支付
- [ ] 推送模板消息
- [ ] 接入微信开放平台
- [ ] 检测是否含有敏感词
- [ ] 生成二维码/小程序码
- [ ] 接入在线客服消息


## 安装

```bash
$ npm i egg-mp --save
```

## 启用插件

```js
// {app_root}/config/plugin.js
exports.mp = {
  enable: true,
  package: 'egg-mp',
};
```

## 应用配置

```js
// {app_root}/config/config.default.js
exports.mp = {
  appId: 'your appid', 
  appSecret: 'your appscret'
};
```

请查看官网的 [config/config.default.js](config/config.default.js) 获取更详细说明.

## 简单实例

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

## 问题与建议

请在[这里](https://github.com/unclexiao/egg-mp/issues)向我提出问题

## 开源协议

[MIT](LICENSE)
