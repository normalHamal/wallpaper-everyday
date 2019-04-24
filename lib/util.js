const colors = require("colors");
const wallpaper = require("wallpaper");
const fs = require("fs-extra");
const path = require("path");
// file for caching used wallpapers
const _cache = path.join(__dirname, "../._cache.json");

module.exports = class Util {
  /**
   * retry a function until times equals zero
   *
   * @static
   * @param {*} fn
   * @param {number} [times=3]
   * @returns
   */
  static async retry(fn, times = 3) {
    try {
      return await fn();
    } catch (error) {
      if (times === 0) throw error;
      return await retry(times - 1);
    }
  }

  static logSuccess(info) {
    console.log(`${colors.bgGreen("success")} ${info}`);
  }

  static logWarning(info) {
    console.log(`${colors.bgYellow("warn")} ${info}`);
  }

  static logError(info) {
    console.log(`${colors.bgRed("failed")} ${info}`);
  }

  /**
   * cache wallpaper path and set it up
   *
   * @static
   * @param {string} path
   * @param {string} scale auto|fill|fit|stretch|center
   * @param {string} url
   */
  static async setWallpaper(path, scale, url) {
    try {
      await cacheUsedFile(path, url);
      await wallpaper.set(path, scale);
    } catch (error) {
      this.logError(error.message);
    }
  }

  /**
   * switch wallpaper
   * @static
   * @param {Object} { pre, next, latest }
   * @returns
   */
  static async switchWallpaper({ pre, next, latest }) {
    if (!pre && !next && !latest) {
      return this.warning(
        `please type "wallpaper switch -h" to see how to use`
      );
    }

    let { cacheFiles = [], index } = JSON.parse(
      await fs.readFile(_cache, "utf8")
    );
    const len = cacheFiles.length;

    if (!len) {
      return this.warning(`You haven't cached any wallpaper yet`);
    }

    (pre && index--) || (next && index++) || (latest && (index = len - 1));

    if (index < 0 || index > len - 1) {
      return this.warning(`It's already the first or last wallpaper`);
    }

    try {
      fs.writeFile(
        _cache,
        JSON.stringify(
          {
            index,
            cacheFiles
          },
          null,
          2
        )
      );
      // should i cached scale mode?
      await wallpaper.set(cacheFiles[index].path);
    } catch (error) {
      this.logError(error.message);
    }
  }
};

/**
 * unique file path and write to cache file
 *
 * @private
 * @param {string} path
 * @param {string} url
 * @returns
 */
async function cacheUsedFile(path, url) {
  if (!path) return;

  let { cacheFiles = [] } = fs.existsSync(_cache)
    ? JSON.parse(await fs.readFile(_cache, "utf8"))
    : {};

  let item = { path, url };
  cacheFiles.push(item);

  // union
  cacheFiles = cacheFiles.filter((file, index) => {
    return !cacheFiles.find((f, i) => f.path === file.path && i !== index);
  });

  await fs.writeFile(
    _cache,
    JSON.stringify(
      {
        index: cacheFiles.length - 1,
        cacheFiles
      },
      null,
      2
    )
  );
}
