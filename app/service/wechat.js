'use strict';
const Service = require('egg').Service;

// 微信相关接口常量
const jscode2sessionUri = 'https://api.weixin.qq.com/sns/jscode2session'; // 微信临时授权码
const tokenUri = 'https://api.weixin.qq.com/cgi-bin/token'; // 微信凭据

class WechatService extends Service {
  async login(code) {
    /**
     * @description 登录凭证校验
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/code2Session.html?search-key=jscode2session
     */
    const { appId, appSecret } = this.app.config.wechat;
    const url = `${jscode2sessionUri}?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.ctx.curl(url, { dataType: 'json' });
    return res.data;
  }

  async getToken() {
    /**
     * @description 获取小程序全局唯一后台接口调用凭据
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/getAccessToken.html
     */
    const { appId, appSecret } = this.app.config.wechat;
    const url = `${tokenUri}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const res = await this.ctx.curl(url, { dataType: 'json' });
    return res.data;
  }
}

module.exports = WechatService;
