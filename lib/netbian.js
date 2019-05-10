const { logError } = require("./util");
const got = require("got");
const cheerio = require("cheerio");

module.exports = class NetBian {
  constructor() {
    this.baseUrl = "http://www.netbian.com/";
    this.request = got.extend({
      headers: {
        Referer: this.baseUrl,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
      }
    });
  }

  async geturls(pageUrl) {
    try {
      const { body } = await this.request(pageUrl);
      const $ = cheerio.load(body);
      const img = $(".pic img")[0].attribs.src;

      if (!img) {
        logError("Request picture failed. Please try again in a little while!");
      } else {
        return await img;
      }
    } catch (error) {
      logError("Network is not good, please try again");
    }

    return "";
  }

  async getPages(pageUrl) {
    try {
      const { body } = await this.request(pageUrl);
      const $ = cheerio.load(body);

      const result = $(".list a");

      if (!result) {
        logError("Request picture failed. Please try again in a little while!");
      } else {
        do {
          const random = (Math.random() * result.length) >> 0;
          const href = result[random].attribs.href;

          if (/^http/.test(href)) {
            continue;
          }

          return await this.geturls(`${this.baseUrl}${href}`);
        } while (true);
      }
    } catch (error) {
      logError("Network is not good, please try again");
    }

    return "";
  }

  async getRandom() {
    return await this.getPages(
      `${this.baseUrl}index_${~~Math.random() * 1000 + 2}.htm`
    );
  }
};
