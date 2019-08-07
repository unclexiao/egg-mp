'use strict';
const Service = require('egg').Service;
const crypto = require('crypto');

// 微信相关接口常量
const jscode2sessionUri = 'https://api.weixin.qq.com/sns/jscode2session'; // 微信临时授权码
const tokenUri = 'https://api.weixin.qq.com/cgi-bin/token'; // 微信凭据
const msgSecCheck = 'https://api.weixin.qq.com/wxa/msg_sec_check'; // 微信敏感词
const sendMsgUri =
  'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send'; // 微信服务通知

class WechatService extends Service {
  async login(code) {
    /**
     * @description 登录凭证校验
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html?search-key=jscode2session
     */
    const {
      appId,
      appSecret,
    } = this.app.config.mp;
    const url = `${jscode2sessionUri}?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.ctx.curl(url, {
      dataType: 'json',
    });
    return res.data;
  }

  async getToken() {
    /**
     * @description 获取小程序全局唯一后台接口调用凭据
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
     */
    const {
      appId,
      appSecret,
    } = this.app.config.mp;
    const url = `${tokenUri}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const res = await this.ctx.curl(url, {
      dataType: 'json',
    });
    return res.data;
  }

  async decryptData(sessionKey, encryptedData, iv) {
    /**
     * @description 加密数据解密算法
     * @link https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html
     */
    const {
      appId,
    } = this.app.config.mp;
    const sessionKeyBuffer = new Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = new Buffer.from(encryptedData, 'base64');
    const ivStr = new Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivStr);
    let decoded = '';
    try {
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
      decoded += decipher.final('utf8');
      decoded = JSON.parse(decoded);
    } catch (err) {
      throw new Error('Illegal Buffer');
    }
    if (decoded.watermark.appid !== appId) {
      throw new Error('Illegal Appid');
    }
    return decoded;
  }

  async checkIsSensitive(content) {
    /**
     * @description 检查一段文本是否含有违法违规内容。
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/msgSecCheck.html?search-key=msg_sec_check
     */
    const token = await this.getToken();
    const access_token = token.access_token;
    const res = await this.ctx.curl(`${msgSecCheck}?access_token=${access_token}`, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        content,
      },
    });
    return res.data.errcode === 87014;
  }

  async pushMessage(params) {
    /**
     * @description 模板消息
     * @link https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/template-message.html
     */
    const body = {
      touser: params.openid,
      template_id: params.templateid,
      page: params.page,
      form_id: params.formid,
      data: params.formid,
      emphasis_keyword: params.emphasis_keyword,
    };
    const token = await this.getToken();
    const access_token = token.access_token;
    const res = await this.ctx.curl(`${sendMsgUri}?access_token=${access_token}`, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: body,
    });
    return res.data;
  }

}

module.exports = WechatService;
