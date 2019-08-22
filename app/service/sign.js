'use strict';
const crypto = require('crypto');

const Service = require('egg').Service;

class SignService extends Service {
  // 生成随机字符串，用于微信支付
  createNonceStr() {
    return Math.random()
      .toString(36)
      .substr(2, 15);
  }

  // 生成时间戳，单位为秒，用于微信支付
  createTimestamp() {
    return parseInt(new Date().getTime() / 1000) + '';
  }

  // 序列化字符串
  raw(args) {
    const keys = Object.keys(args).sort(); // 参数名ASCII码从小到大排序（字典序）；
    let string = '';
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === 'sign' || !args[k]) {
        continue; // 如果参数的值为空不参与签名
      }
      if (typeof args[k] === 'array') {
        // 兼容xml场景，值为数组
        args[k] = args[k][0];
      }
      string += '&' + k + '=' + args[k];
    }
    string = string.substr(1);
    return string;
  }

  // 生成加密SHA1字符串
  sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
  }

  // 生成配置签名
  getConfigSign(args) {
    const rawStr = this.raw(args);
    const shaStr = this.sha1(rawStr);
    return shaStr.toLocaleLowerCase();
  }

  // 生成加密MD5字符串
  md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  // 生成支付签名
  getPaySign(args) {
    const {
      apiKey,
    } = this.app.config.mp;
    const rawStr = this.raw(args);
    const md5Str = this.md5(rawStr + '&key=' + apiKey);
    return md5Str.toUpperCase();
  }
}

module.exports = SignService;
