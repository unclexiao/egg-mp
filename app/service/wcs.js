'use strict';

const Service = require('egg').Service;

const tokenUri = 'https://api.weixin.qq.com/cgi-bin/token'; // 换取统一令牌
const ticketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'; // Web端临时票据
const templateUri = 'https://api.weixin.qq.com/cgi-bin/message/template/send'; // 推送模板消息
const usersUri = 'https://api.weixin.qq.com/cgi-bin/user/get'; // 获取用户信息
const userInfoBatch = 'https://api.weixin.qq.com/cgi-bin/user/info/batchget'; // 批量获取用户信息
const authUri = 'https://api.weixin.qq.com/sns/oauth2/access_token'; // 微信网页授权
const payUri = 'https://api.mch.weixin.qq.com/pay/unifiedorder'; // 微信统一下单

const jsonType = {
  dataType: 'json',
};

class WCSService extends Service {
  /**
  * 获取Token
  * @return {String} 令牌
  * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183
  */
  async getToken() {
    const {
      appId,
      appSecret,
    } = this.app.config.mp;
    const url = `${tokenUri}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const res = await this.ctx.curl(url, jsonType);
    if (res.data.errcode){
      throw new Error(res.data.errmsg)
    }
    return res.data;
  }

  /**
  * 获取Ticket
  * @param {String} token 令牌
  * @return {Object} 票据信息
  * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
  */
  async getTicket(token) {
    const url = `${ticketUri}?access_token=${token}&type=jsapi`;
    const res = await this.ctx.curl(url, jsonType);
    if (res.data.errcode){
      throw new Error(res.data.errmsg)
    }
    return res.data;
  }

  /**
  * 获取权限验证配置
  * @param {String} url 调用JSAPI的网址
  * @return {Object} JSSDK初始化配置
  * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
  */
  async getConfig(url) {
    const tokenRes = await this.getToken();
    const ticketRes = await this.getTicket(tokenRes.access_token);
    const params = this._createConfigSign(ticketRes.ticket, url);
    params.appId = this.app.config.mp.appId;
    return params;
  }

  /**
  * 微信网页授权
  * @param {String} code 临时授权码
  * @return {Object} 微信返回的授权信息
  * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
  */
  async auth(code) {
    const {
      appId,
      appSecret,
    } = this.app.config.mp;
    const url = `${authUri}?grant_type=authorization_code&appid=${appId}&secret=${appSecret}&code=${code}`;
    const res = await this.ctx.curl(url, jsonType);
    return res.data;
  }

  /**
  * 发送模板消息
  * @param {String} accessToken accessToken
  * @param {Object} data 模板消息数据
  * @return {Object} 微信返回的推送结果
  * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433751277
  */
  async sendTemplateMsg(accessToken, data) {
    const url = `${templateUri}?access_token=${accessToken}`;
    const res = await this.ctx.curl(url, {
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
    });
    return res.data;
  }

  /**
  * 获取用户列表
  * @param {String} accessToken accessToken
  * @return {Object} 用户列表
  * @see  https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140840
  */
  async getUserList(accessToken) {
    const url = `${usersUri}?access_token=${accessToken}`;
    const res = await this.ctx.curl(url, jsonType);
    const openids = res.data.data.openid;
    return openids;
  }

  /**
  * 批量获取用户信息
  * @param {String} accessToken accessToken
  * @param {Array} openids 用户数据
  * @return {Object} 批量用户信息
  * @see https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140839
  */
  async getBatchUserInfo(accessToken, openids) {
    const url = `${userInfoBatch}?access_token=${accessToken}`;
    const res = await this.ctx.curl(url, {
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify(openids),
    });
    return res.data;
  }

  /**
  * 统一下单
  * @param {String} openid 开放平台编号
  * @param {Object} order 订单数据
  * @return {Object} 用于JSSDK调用支付接口
  * @see https://api.mch.weixin.qq.com/pay/unifiedorder
  */
  async createOrder(openid, order) {
    const {
      ctx,
    } = this;
    const signedParams = this._firstSignOrder(openid, order);
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

  // 生成配置签名
  _createConfigSign(ticket, url) {
    const {
      service,
    } = this;
    const timestamp = parseInt(new Date().getTime() / 1000);
    const params = {
      jsapi_ticket: ticket,
      url,
      timestamp,
      noncestr: service.sign.createNonceStr(),
    };
    params.signature = service.sign.getConfigSign(params); // 配置签名，用于Web端调用接口
    return params;
  }

  // 生成支付签名
  _firstSignOrder(openid, order) {
    const {
      app,
      ctx,
      service,
    } = this;
    const {
      appId,
      mchId,
      notifyUrl,
    } = app.config.mp;
    const params = {
      openid: openid || '',
      appid: appId,
      mch_id: mchId,
      nonce_str: service.sign.createNonceStr(),
      body: order.body || '我是测试商品',
      out_trade_no: order.tradeNo || new Date().getTime(), // 内部订单号
      total_fee: order.totalFee || 1, // 单位为分的标价金额
      spbill_create_ip: ctx.ip || '127.0.0.1', // 支付提交用户端ip
      notify_url: notifyUrl, // 异步接收微信支付结果通知
      trade_type: 'JSAPI',
    };
    params.sign = service.sign.getPaySign(params); // 订单签名，用于验证支付通知
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

module.exports = WCSService;
