'use strict';
const Service = require('egg').Service;
const crypto = require('crypto');

// 微信相关接口常量
const jscode2sessionUri = 'https://api.weixin.qq.com/sns/jscode2session'; // 微信临时授权码
const tokenUri = 'https://api.weixin.qq.com/cgi-bin/token'; // 微信凭据
const msgSecCheck = 'https://api.weixin.qq.com/wxa/msg_sec_check'; // 微信敏感词
const sendMsgUri =
  'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send'; // 微信服务通知
const payUri = 'https://api.mch.weixin.qq.com/pay/unifiedorder'; // 微信统一下单

class MPService extends Service {

  /**
  * 登录凭证校验
  * @param {String} code 临时授权码
  * @return {Object} 微信返回的数据
  * @see https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html?search-key=jscode2session
  */
  async login(code) {
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

  /**
  * 获取Token
  * @return {Object} 微信返回的数据
  * @see https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
  */
  async getToken() {
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

  /**
  * 加密数据解密算法
  * @param {String} sessionKey sessionKey
  * @param {String} encryptedData encryptedData
  * @param {String} iv iv
  * @return {Object} 微信返回的数据
  * @see https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html
  */
  async decryptData(sessionKey, encryptedData, iv) {
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

  /**
  * 是否含有敏感内容
  * @param {String} content 文本内容
  * @return {Boolean} 是否敏感内容
  * @see https://developers.weixin.qq.com/miniprogram/dev/api/msgSecCheck.html?search-key=msg_sec_check
  */
  async checkIsSensitive(content) {
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

  /**
  * 推送模板消息
  * @param {Object} params 推送消息
  * @return {Boolean} 微信返回的数据
  * @see https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/template-message.html
  */
  async pushMessage(params) {
    const body = {
      touser: params.openid,
      template_id: params.templateid,
      page: params.page,
      form_id: params.formid,
      data: params.data,
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

  /**
  * 统一下单
  * @param {String} openid 目标用户
  * @param {Object} data 推送消息
  * @return {Object} 用于小程序发起支付
  * @see https://api.mch.weixin.qq.com/pay/unifiedorder
  */
  async createOrder(openid, data) {
    const {
      ctx,
    } = this;
    const signedParams = this._firstSignOrder(openid, data);
    const successXml = await ctx.curl(payUri, {
      method: 'POST',
      data: ctx.helper.json2xml(signedParams),
    });
    const json = ctx.helper.xml2json(successXml.data);
    if (json.return_code === 'FAIL') {
      return {
        code: -1,
        msg: json.return_msg,
      };
    }
    return this._secondSignOrder(json);
  }

  // 第一次签名
  _firstSignOrder(openid, data) {
    const {
      app,
      ctx,
      service,
    } = this;
    const {
      appId,
      mchId,
    } = app.config.mp;
    const params = {
      openid,
      appid: appId,
      mch_id: mchId,
      nonce_str: service.sign.createNonceStr(),
      out_trade_no: data.tradeNo || new Date().getTime(), // 内部订单号
      total_fee: data.totalFee || 1, // 单位为分的标价金额
      body: data.body || '未知产品-测试商品', // 应用市场上的APP名字-商品概述	
      spbill_create_ip: ctx.ip, // 支付提交用户端ip
      notify_url: data.notifyUrl || '', // 异步接收微信支付结果通知
      trade_type: 'JSAPI',
    };
    params.sign = service.sign.getPaySign(params); // 首次签名，用于验证支付通知
    return params;
  }

  // 第二次签名
  _secondSignOrder(json) {
    const {
      app,
      service,
    } = this;
    const {
      appId,
    } = app.config.mp;
    const res = {
      appId,
      timeStamp: service.sign.createTimestamp(),
      nonceStr: json.nonce_str,
      package: `prepay_id=${json.prepay_id}`,
      signType: 'MD5',
    }; // 不能随意增减，必须是这些字段
    res.paySign = service.sign.getPaySign(res); // 第二次签名，用于提交到微信
    return res;
  }
}

module.exports = MPService;
