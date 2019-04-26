const { retry, logError } = require("./util");
const got = require("got");

module.exports = class Bing {
  constructor() {
    this.api =
      "https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN";
  }

  async getDaily() {
    try {
      const { body } = await retry(
        async () =>
          await got(this.api, {
            json: true
          })
      );

      return `https://cn.bing.com/${body.images[0].url}`;
    } catch (error) {
      logError("Network is not good, please try again");
    }
  }

  async getRandom() {
    const res = await got("https://source.unsplash.com/collection/1065976/", {
      followRedirect: false
    });

    return res.headers.location;
  }
};
