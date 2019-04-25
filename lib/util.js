const colors = require("colors");
const wallpaper = require("wallpaper");
const fs = require("fs-extra");
const path = require("path");
const ora = require("ora");
const logUpdate = require("log-update");
const spinner = ora();
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
    console.log(`${colors.bgGreen("✔ ")} ${info}`);
  }

  static logWarning(info) {
    console.log(`${colors.bgYellow.black("! ")} ${info}`);
  }

  static logError(info) {
    console.log(`${colors.bgRed("✖ ")} ${info}`);
  }

  static reportDownload({ percent, total, url }) {
    const finished = percent === 1;

    logUpdate(`
      ${
        finished ? colors.green("✔") : colors.gray(spinner.frame())
      } Request ${url}\n
    `);
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
      Util.logError(error.message);
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
      return Util.logWarning(
        `please type "wallpaper switch -h" to see how to use`
      );
    }

    let { cacheFiles = [], index } = JSON.parse(
      await fs.readFile(_cache, "utf8")
    );
    const len = cacheFiles.length;

    if (!len) {
      return Util.logWarning(`You haven't cached any wallpaper yet`);
    }

    (pre && index--) || (next && index++) || (latest && (index = len - 1));

    if (index < 0 || index > len - 1) {
      return Util.logWarning(`It's already the first or last wallpaper`);
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
      Util.logSuccess(
        (pre && "Switch the previous wallpaper") ||
          (next && "Switch the next wallpaper") ||
          (latest && "Switch the latest wallpaper")
      );
    } catch (error) {
      Util.logError(error.message);
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
    return cacheFiles.findIndex(
      f =>
        (f.path === file.path || (f.url === file.url && f.url !== "")) === index
    );
  });

  await fs.writeFile(
    _cache,
    JSON.stringify(
      {
        index: Math.max(cacheFiles.length - 1, 0),
        cacheFiles
      },
      null,
      2
    )
  );
}
