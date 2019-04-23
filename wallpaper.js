#!/usr/bin/env node

const program = require("commander");
const wallpaper = require("wallpaper");
const fs = require("fs-extra");
const path = require("path");
const isUrl = require("is-url-superb");
const tempfile = require("tempfile");
const got = require("got");
const { setWallpaper, switchWallpaper, logError, logSuccess } = require("./lib/util");
const Bing = require("./lib/bing");
const QJP = require("./lib/qvjunping");

const { version } = require("./package.json");
const bingApi = new Bing();
const qjpApi = new QJP();

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
          logError(`failed: ${colors.red.underline(file)} is not a valid url`);
        })
        .pipe(fs.createWriteStream(temp))
        .on("finish", async () => {
          await setWallpaper(temp, scale, file);
        });
    } else {
      file = path.resolve(file);

      // why here check file whether exist?
      // Prevents invalid file paths from being written to the cache file
      if (!fs.existsSync(file)) {
        return console.log(
          logError(`failed: ${colors.red.underline(file)} is not a valid path`)
        );
      }

      await setWallpaper(file, scale);
    }
    logSuccess('Wallpaper update Successful');
  });

program
  .command("get")
  .description("Get desktop wallpaper real path")
  .action(async () => {
    logSuccess(await wallpaper.get());
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
  .action(async ({ scale, bing }) => {
    let url = "";

    if (bing) {
      url = await bingApi.getDaily();
    } else {
      url = await qjpApi.getRandom();
    }

    if (!url) {
      return;
    }

    const temp = tempfile(path.extname(url));

    got
      .stream(url)
      .on("error", err => {
        console.log(
          colors.red(`failed: fetch random source failed, retry it!`)
        );
      })
      .pipe(fs.createWriteStream(temp))
      .on("finish", async () => {
        await setWallpaper(temp, scale, url);
        logSuccess('Wallpaper random Successful');
      });
  });

program
  .command("switch")
  .description("Switch cached wallpapers")
  .option("-p --pre", "Switch the previous wallpaper")
  .option("-n --next", "Switch the next wallpaper")
  .option("-l --latest", "Switch the latest wallpaper")
  .action(async ({ pre, next, latest }) => {
    await switchWallpaper({ pre, next, latest });
  });

program.parse(process.argv);
