const colors = require("colors");
const wallpaper = require("wallpaper");
const fs = require("fs-extra");
const path = require("path");
const ora = require("ora");
const logUpdate = require("log-update");
const spinner = ora();
// file for caching used wallpapers
const _cache = path.join(process.env.HOME, ".wallpaper", ".cache.json");

// init cache file
if (!fs.existsSync(_cache)) {
  const dir = path.join(process.env.HOME, ".wallpaper");

  !fs.existsSync(dir) && fs.mkdirSync(dir);
  fs.writeFileSync(
    _cache,
    JSON.stringify({
      index: 0,
      cacheFiles: []
    })
  );
}

module.exports = class Util {
  static logSuccess(info) {
    console.log(`${colors.green("✔ ")} ${info}`);
  }

  static logWarning(info) {
    console.log(`${colors.yellow("‼ ")} ${info}`);
  }

  static logError(info) {
    console.log(`${colors.red("✖ ")} ${info}`);
  }

  static reportDownload({ percent, transferred, url }) {
    const finished = percent === 1;

    logUpdate(`
      ${
        finished ? colors.green("✔ ") : colors.gray(spinner.frame())
      } ${colors.green((transferred / 1024).toFixed(1) + "k")} Request ${url}\n
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
      Util.logSuccess("Wallpaper set Successful");
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

  // clear cached files
  static async clearWallpapers() {
    let { cacheFiles = [] } = JSON.parse(await fs.readFile(_cache, "utf8"));

    await Promise.all(
      cacheFiles.map(async file => {
        try {
          fs.unlink(file.path);
        } catch (error) {
          Util.logError(`Delete file failed: "${file.path}"`);
        }
      })
    );

    await fs.unlink(_cache);
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

  let { cacheFiles = [] } = JSON.parse(await fs.readFile(_cache, "utf8"));

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
