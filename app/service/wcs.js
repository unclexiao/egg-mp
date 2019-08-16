'use strict';

const Service = require('egg').Service;

const tokenUri = 'https://api.weixin.qq.com/cgi-bin/token';
const templateUri = 'https://api.weixin.qq.com/cgi-bin/message/template/send';
const usersUri = 'https://api.weixin.qq.com/cgi-bin/user/get';
const userInfoBatch = 'https://api.weixin.qq.com/cgi-bin/user/info/batchget';
const authUri = 'https://api.weixin.qq.com/sns/oauth2/access_token';

const jsonType = {
    dataType: 'json',
};

class WCSService extends Service {
    /**
    * @description 获取access_token
    * @link https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183
    */
    async getToken() {
        const {
            appId,
            appSecret,
        } = this.app.config.mp;
        const url = `${tokenUri}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
        const res = await this.ctx.curl(url, jsonType);
        return res.data;
    }

    /**
    * @description 微信网页授权
    * @link https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
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
    * @description 发送模板消息
    * @link https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433751277
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
    * @description 获取用户列表
    * @link https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140840
    */
    async getAllUsers(accessToken) {
        const url = `${usersUri}?access_token=${accessToken}`;
        const res = await this.ctx.curl(url, jsonType);
        const openids = res.data.data.openid;
        return openids;
    }

    /**
    * @description 获取用户信息
    * @link https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140839
    */
    async getUserInfo(accessToken, data) {
        const url = `${userInfoBatch}?access_token=${accessToken}`;
        const res = await this.ctx.curl(url, {
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
        });
        return res.data;
    }
}

module.exports = WCSService;
