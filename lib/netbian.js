const { logError } = require("./util");
const got = require("got");
const cheerio = require("cheerio");

module.exports = class NetBian {
  constructor() {
    this.baseUrl = "http://pic.netbian.com";
    this.request = got.extend({
      headers: {
        Referer: "http://pic.netbian.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
      }
    });
  }

  async getPages(pageUrl) {
    try {
      const { body } = await this.request(pageUrl);
      const $ = cheerio.load(body);
      const urls = [];

      $(".slist li a").each((i, elem) => {
        urls.push(`${this.baseUrl}${elem.attribs.href}`);
      });

      if (!urls.length) {
        logError("Request picture failed. Please try again in a little while!");
      } else {
        return await this.geturls(urls[~~(Math.random() * urls.length)]);
      }
    } catch (error) {
      logError("Network is not good, please try again");
    }

    return "";
  }

  async geturls(pageUrl) {
    try {
      const { body } = await this.request(pageUrl);
      const $ = cheerio.load(body);

      const result = $("#img img").attr("src");

      if (!result) {
        logError("Request picture failed. Please try again in a little while!");
      } else {
        return `${this.baseUrl}${result}`;
      }
    } catch (error) {
      logError(error || "Network is not good, please try again");
    }

    return "";
  }

  async getRandom() {
    return await this.getPages(
      `${this.baseUrl}/4kyouxi/index_${~~Math.random() * 100 + 2}.html`
    );
  }
};
