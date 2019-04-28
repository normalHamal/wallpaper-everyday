const { logError } = require("./util");
const got = require("got");

module.exports = class Unsplash {
  async getDaily() {
    try {
      const { headers } = await got(
        "https://source.unsplash.com/1920x1080/daily?Pc desktop wallpaper",
        {
          followRedirect: false
        }
      );

      return headers.location;
    } catch (error) {
      logError("Network is not good, please try again");
    }

    return "";
  }

  async getRandom() {
    try {
      const { headers } = await got(
        "https://source.unsplash.com/1920x1080/?wallpaper",
        {
          followRedirect: false
        }
      );

      return headers.location;
    } catch (error) {
      logError("Network is not good, please try again");
    }

    return "";
  }
};
