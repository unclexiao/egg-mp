# 改动历史
## 2019-08-16, Version 1.0.11 @unclexiao
 * 新增对[微信服务号](https://www.npmjs.com/package/md5)支持，如授权登录、查看公开信息
 * 删除[md5](https://www.npmjs.com/package/md5)模块，采用内置的[crypto](https://nodejs.org/docs/latest-v10.x/api/crypto.html)

## 2019-08-07, Version 1.0.8 @unclexiao
 * 新增[检测是否含有敏感词](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.msgSecCheck.html)
  * 新增 [推送模板消息](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/template-message.html)
 * 新增 [微信小程序支付](https://api.mch.weixin.qq.com/pay/unifiedorder)
 
## 2019-07-15, Version 1.0.5 @unclexiao
 * 修复[Lodash严重安全漏洞](https://www.infoq.cn/article/k7C-ZvXKOHh284ToEy9K)

## 2019-04-16, Version 1.0.3 @unclexiao
 * 支持[解析加密数据](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html)(unionid)

## 2019-03-05, Version 1.0.1 @unclexiao
 * 支持微信[授权码登录](https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html?search-key=jscode2session)(openid)