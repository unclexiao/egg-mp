'use strict';
const Service = require('egg').Service;
const crypto = require("crypto");

// 微信相关接口常量
const jscode2sessionUri = 'https://api.weixin.qq.com/sns/jscode2session'; // 微信临时授权码
const tokenUri = 'https://api.weixin.qq.com/cgi-bin/token'; // 微信凭据

class WechatService extends Service {
  async login(code) {
    /**
     * @description 登录凭证校验
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html?search-key=jscode2session
     */
    const { appId, appSecret } = this.app.config.mp;
    const url = `${jscode2sessionUri}?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.ctx.curl(url, { dataType: 'json' });
    return res.data;
  }

  async getToken() {
    /**
     * @description 获取小程序全局唯一后台接口调用凭据
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
     */
    const { appId, appSecret } = this.app.config.mp;
    const url = `${tokenUri}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const res = await this.ctx.curl(url, { dataType: 'json' });
    return res.data;
  }

  async decryptData(sessionKey, encryptedData, iv) {
    /**
     * @description 加密数据解密算法
     * @link https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html
     */
    const { appId } = this.app.config.mp;
    const sessionKeyBuffer = new Buffer.from(sessionKey, "base64");
    const encryptedDataBuffer = new Buffer.from(encryptedData, "base64");
    iv = new Buffer.from(iv, "base64");
    try {
      let decipher = crypto.createDecipheriv("aes-128-cbc", sessionKeyBuffer, iv);
      decipher.setAutoPadding(true);
      let decoded = decipher.update(encryptedDataBuffer, "binary", "utf8");
      decoded += decipher.final("utf8");
      decoded = JSON.parse(decoded);
    } catch (err) {
      throw new Error("Illegal Buffer");
    }
    if (decoded.watermark.appid !== appId) {
      throw new Error("Illegal Appid");
    }
    return decoded;
  }
}

module.exports = WechatService;
