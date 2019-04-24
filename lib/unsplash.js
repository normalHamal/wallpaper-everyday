module.exports = class Unsplash {
  async getDaily() {
    return "https://source.unsplash.com/daily?wallpaper";
  }

  async getRandom() {
    return "https://source.unsplash.com/1600x900/?wallpaper";
  }
};
