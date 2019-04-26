const got = require("got");

module.exports = class Unsplash {
  async getDaily() {
    const res = await got(
      "https://source.unsplash.com/daily?Pc desktop wallpaper",
      {
        followRedirect: false
      }
    );

    return res.headers.location;
  }

  async getRandom() {
    const res = await got("https://source.unsplash.com/1600x900/?wallpaper", {
      followRedirect: false
    });

    return res.headers.location;
  }
};
