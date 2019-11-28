# egg-mp

[![npm version](https://badge.fury.io/js/egg-mp.svg)](https://badge.fury.io/js/egg-mp)

[微信公众平台](https://mp.weixin.qq.com/)常规的后端服务，献给了不起的[EggJS](https://eggjs.org/zh-cn/)

## 特性
### 微信小程序
- [X] 小程序登录
- [X] 小程序授权
- [X] 小程序支付
- [X] 推送模板消息
- [X] 检测是否含有敏感词
- [ ] 生成二维码/小程序码
- [ ] 接入在线客服消息

### 微信服务号
- [X] 网页授权
- [X] 发送模板消息
- [X] 获取用户基础信息
- [X] 获取用户列表
- [X] 服务号网页支付
- [X] 前端调用JSSDK

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
  appId: '', // 公众平台应用编号
  appSecret: '', // 公众平台应用密钥
  mchId: '', // 商户平台商家编号
  apiKey: '', // 商户支付密钥
  notifyUrl: '' // 支付结果回调地址
};
```

请查看官网的 [config/config.default.js](config/config.default.js) 获取更详细说明.

## 简单实例

```javascript
async login() {
    const { ctx, service } = this;
    const { code } = ctx.request.query;
    let res = await service.mp.login(code);
    // {
    //   session_key: "Sop9yRVgqnCFjsqANnNE2Q==",
    //   openid: "oo17M4gnwK3iQd6dxcA5mLDkoHA8"
    // };
}
```

## 基础教程
- [配置项如何找到？](doc/CONFIG.md)
- 如何搭建环境？
- 如何本地调试？
- 登录与授权（获取用户信息）
- 微信支付（小程序、服务号）
- 推送消息（服务通知、模板消息）
- 生成二维码（或小程序码）

## 问题与建议

请在[这里](https://github.com/unclexiao/egg-mp/issues)向我提出问题

## 开源协议

[MIT](LICENSE)
