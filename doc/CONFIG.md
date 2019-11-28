## 配置文件
建议参考EggJS官网的[多环境配置](https://eggjs.org/zh-cn/basics/config.html#%E5%A4%9A%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE)，本插件需要的配置项如下：

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
## 属性列表
各个属性的含义如下：

| 属性 | 值 | 说明 | 示例 |
| --- | --- | --- | --- |
| appId | 应用编号 | 开发设置-开发者ID-小程序ID | wxd44b41590ce4de64 |
| appSecret | 应用密钥 | 开发设置-开发者ID-小程序密钥 | 9727cc26585f092f24f1b253813sd13e |
| mchId | 商户编号 | 账户中心-账户设置-微信支付商户号 | 1521831701 |
| apiKey | 支付接口密钥 | 账户中心-安全中心-API密钥 | csw0UDk01S5nPSIzgbHaau7btQa2qBcd |
| notifyUrl | 支付回调地址 | 开发文档-API列表-统一下单 | https://www.unclexiao.com/notify |

## 常见问题
