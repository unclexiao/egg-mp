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

  async createOrder(openid, data) {
    /**
     * @description 统一下单
     * @link https://api.mch.weixin.qq.com/pay/unifiedorder
     */
    const {
      ctx,
      helper,
    } = this;
    const signedParams = this.firstSignOrder(openid, data);
    const successXml = await ctx.curl(payUri, {
      method: 'POST',
      data: helper.json2xml(signedParams),
    });
    const json = helper.xml2json(successXml.data);
    if (json.return_code === 'FAIL') {
      return {
        code: -1,
        msg: json.return_msg,
      };
    }
    return this.secondSignOrder(json);
  }

  // 第一次签名
  firstSignOrder(openid, data) {
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
      spbill_create_ip: ctx.ip, // 支付提交用户端ip
      notify_url: data.notifyUrl || '', // 异步接收微信支付结果通知
      trade_type: 'JSAPI',
    };
    params.sign = service.sign.getPaySign(params); // 首次签名，用于验证支付通知
    return params;
  }

  // 第二次签名
  secondSignOrder(json) {
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

module.exports = WechatService;
