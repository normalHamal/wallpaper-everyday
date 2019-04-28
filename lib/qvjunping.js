const { logError } = require("./util");
const got = require("got");

module.exports = class QJP {
  constructor() {
    this.api = "https://car.qvjunping.me/api/random";
  }

  async getDaily() {}

  async getRandom() {
    try {
      const { body } = await got(this.api, {
        json: true
      });

      return `${body.image.url}`;
    } catch (error) {
      logError("Network is not good, please try again");
    }

    return "";
  }
};
