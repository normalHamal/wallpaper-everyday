const colors = require('colors');
const wallpaper = require('wallpaper');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const logUpdate = require('log-update');
const spinner = ora();
const isUrl = require('is-url-superb');
const tempfile = require('tempfile');
const got = require('got');
// file for caching used wallpapers
const _cache = path.join(process.env.HOME, '.wallpaper', '.cache.json');

// init cache file
if (!fs.existsSync(_cache)) {
  const dir = path.join(process.env.HOME, '.wallpaper');

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
    console.log(`${colors.green('✔ ')} ${info}`);
  }

  static logWarning(info) {
    console.log(`${colors.yellow('‼ ')} ${info}`);
  }

  static logError(info) {
    console.log(`${colors.red('✖ ')} ${info}`);
  }

  static reportDownload({ percent, total, transferred, url }) {
    const minSize = 20 * 1024;
    const finished = percent === 1;
    const size = (transferred / 1024).toFixed(1) + 'k';

    if (total < minSize) {
      logUpdate(`${colors.red('✖ ')}${colors.red(size)} Request ${url}\n`);
    } else {
      logUpdate(
        `${
          finished ? colors.green('✔ ') : colors.gray(spinner.frame())
        } ${colors.green(size)} Request ${url}\n`
      );
    }
  }

  /**
   * cache wallpaper path and set it up
   *
   * @static
   * @param {string} url
   * @param {string} scale auto|fill|fit|stretch|center
   */
  static async setWallpaper(url, scale) {
    try {
      if (!isUrl(url)) {
        await cacheUsedFile(path.resolve(url));
        await wallpaper.set(path.resolve(url), scale);
        Util.logSuccess('Wallpaper set Successful');
        return;
      }

      const temp = tempfile(path.extname(url));
      await cacheUsedFile(temp, url);

      got
        .stream(url)
        .on('error', err => {
          Util.logError(`fetch source failed, retry it!`);
        })
        .on('downloadProgress', progress => {
          Util.reportDownload({ ...progress, url });
        })
        .pipe(fs.createWriteStream(temp))
        .on('finish', async () => {
          await wallpaper.set(temp, scale);
          Util.logSuccess('Wallpaper set Successful');
        });
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
      await fs.readFile(_cache, 'utf8')
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
        (pre && 'Switch the previous wallpaper') ||
          (next && 'Switch the next wallpaper') ||
          (latest && 'Switch the latest wallpaper')
      );
    } catch (error) {
      Util.logError(error.message);
    }
  }

  // clear cached files
  static async clearWallpapers() {
    let { cacheFiles = [] } = JSON.parse(await fs.readFile(_cache, 'utf8'));
    let hasClearAll = true;

    await Promise.all(
      cacheFiles.map(async file => {
        try {
          await fs.unlink(file.path);
        } catch (error) {
          hasClearAll = false;
          Util.logError(`Delete file failed: "${file.path}"`);
        }
      })
    );

    await fs.unlink(_cache);
    hasClearAll &&
      Util.logSuccess('clear all cached wallpapers and also the cache file');
  }
};

/**
 * unique file path and write to cache file
 *
 * @private
 * @param {string} file
 * @param {string} url
 * @returns
 */
async function cacheUsedFile(path, url) {
  if (!path) return;

  let { cacheFiles = [] } = JSON.parse(await fs.readFile(_cache, 'utf8'));

  let item = { path, url };
  cacheFiles.push(item);

  // union
  cacheFiles = cacheFiles.filter((file, index) => {
    return (
      cacheFiles.findIndex(
        f => f.path === file.path || (f.url === file.url && f.url !== '')
      ) === index
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
