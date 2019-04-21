#!/usr/bin/env node

const program = require("commander");
const wallpaper = require("wallpaper");
const fs = require("fs-extra");
const path = require("path");
const isUrl = require("is-url-superb");
const tempfile = require("tempfile");
const got = require("got");
const colors = require("colors");

const { version } = require("./package.json");
const randomApi = "https://car.qvjunping.me/api/random";
// file for caching used wallpapers
const _cache = path.join(__dirname, "._cache.json");

program.version(version);

program
  .command("update <file>")
  .description("Update desktop wallpaper with file path or remote url")
  .option(
    "-s --scale [mode]",
    "Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS"
  )
  .action(async (file, { scale }) => {
    if (isUrl(file)) {
      // if a url
      // Get a random temporary file and copy to it
      const temp = tempfile(path.extname(file));

      got
        .stream(file)
        .on("error", err => {
          console.log(
            colors.red(
              `failed: ${colors.red.underline(file)} is not a valid url`
            )
          );
        })
        .pipe(fs.createWriteStream(temp))
        .on("finish", async () => {
          await setWallpaper(temp, scale);
        });
    } else {
      file = path.resolve(file);

      if (!fs.existsSync(file)) {
        return console.log(
          colors.red(
            `failed: ${colors.red.underline(file)} is not a valid path`
          )
        );
      }

      try {
        await setWallpaper(file, scale);
      } catch (error) {
        console.log(colors.red(error));
      }
    }
  });

program
  .command("get")
  .description("Get desktop wallpaper real path")
  .action(async () => {
    console.log(colors.green.underline(await wallpaper.get()));
  });

program
  .command("random")
  .description("Random desktop wallpaper change")
  .option(
    "-s --scale [mode]",
    "Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS"
  )
  .option(
    "-b --bing",
    "use daily wallpaper from https://cn.bing.com to set up desktop wallpaper"
  )
  .action(({ scale, bing }) => {
    const url = (bing && `${randomApi}?from=bing`) || randomApi;
    const temp = tempfile(path.extname(url));

    got
      .stream(url)
      .on("error", err => {
        console.log(colors.red(`failed: fetch random source failed`));
      })
      .pipe(fs.createWriteStream(temp))
      .on("finish", async () => {
        try {
          await setWallpaper(temp, scale);
        } catch (error) {
          console.log(colors.red(error));
        }
      });
  });

program
  .command("switch")
  .description("Switch cached wallpapers")
  .option("-p --pre", "Switch the previous wallpaper")
  .option("-n --next", "Switch the next wallpaper")
  .option("-l --latest", "Switch the latest wallpaper")
  .action(async ({ pre, next, latest }) => {
    try {
      await switchWallpaper({ pre, next, latest });
    } catch (error) {
      console.log(colors.red(error));
    }
  });

program.parse(process.argv);

/**
 * unique file path and write to cache file
 *
 * @private
 * @param {string} path
 * @returns
 */
async function cacheUsedFile(path) {
  if (!path) return;

  let { cacheFiles = [] } = fs.existsSync(_cache)
    ? JSON.parse(await fs.readFile(_cache, "utf8"))
    : {};

  cacheFiles = [...new Set([...cacheFiles, path])];

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

/**
 * cache wallpaper path and set it up
 *
 * @param {string} path
 * @param {string} scale auto|fill|fit|stretch|center
 */
async function setWallpaper(path, scale) {
  await cacheUsedFile(path);
  await wallpaper.set(path, scale);
}

async function switchWallpaper({ pre, next, latest }) {
  let { cacheFiles = [], index } = JSON.parse(
    await fs.readFile(_cache, "utf8")
  );
  const len = cacheFiles.length;

  if (!len) {
    return console.log(colors.yellow(`You haven't cached any wallpaper yet`));
  }

  (pre && index--) || (next && index++) || (latest && (index = len - 1));

  if (index < 0 || index > len - 1) {
    return console.log(
      colors.yellow(`It's already the first or last wallpaper`)
    );
  }

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
  await wallpaper.set(cacheFiles[index]);
}
