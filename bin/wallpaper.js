#!/usr/bin/env node

const program = require("commander");
const wallpaper = require("wallpaper");
const fs = require("fs-extra");
const path = require("path");
const isUrl = require("is-url-superb");
const tempfile = require("tempfile");
const got = require("got");
const {
  setWallpaper,
  switchWallpaper,
  logError,
  logSuccess,
  reportDownload,
  clearWallpapers
} = require("../lib/util");
const Unsplash = require("../lib/unsplash");
const Bing = require("../lib/bing");
const QJP = require("../lib/qvjunping");

const { version } = require("../package.json");
const bingApi = new Bing();
const qjpApi = new QJP();
const unsplashApi = new Unsplash();

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
          logError(`'${file}' is not a valid url`);
        })
        .on("downloadProgress", progress => {
          reportDownload({ ...progress, url: file });
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
          logError(`${colors.red.underline(file)} is not a valid path`)
        );
      }

      await setWallpaper(file, scale);
    }
  });

program
  .command("get")
  .description("Get desktop wallpaper real path")
  .action(async () => {
    logSuccess(
      `Your current desktop wallpaper is from: ${await wallpaper.get()}`
    );
  });

program
  .command("random <from>")
  .description("Random desktop wallpaper change. from: [QJP, unsplash, bing]")
  .option(
    "-s --scale [mode]",
    "Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS"
  )
  .action(async (from, { scale }) => {
    let url = "";
    from = from.toUpperCase();

    if (from === "QJP") {
      url = await qjpApi.getRandom();
    } else if (from === "UNSPLASH") {
      url = await unsplashApi.getRandom();
    } else if (from === "BING") {
      url = await bingApi.getRandom();
    } else {
      return logError(`unknown argument '${from}'. See 'wallpaper random -h'`);
    }

    if (!isUrl(url)) {
      return logError("fetch random source failed, retry it!");
    }

    const temp = tempfile(path.extname(url));

    got
      .stream(url)
      .on("error", err => {
        logError(`fetch random source failed, retry it!`);
      })
      .on("downloadProgress", progress => {
        reportDownload({ ...progress, url });
      })
      .pipe(fs.createWriteStream(temp))
      .on("finish", async () => {
        await setWallpaper(temp, scale, url);
      });
  });

program
  .command("daily <from>")
  .description("Daily wallpaper. from: [bing, unsplash]")
  .option(
    "-s --scale [mode]",
    "Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS"
  )
  .action(async (from, { scale }) => {
    let url = "";
    from = from.toUpperCase();

    if (from === "BING") {
      url = await bingApi.getDaily();
    } else if (from === "UNSPLASH") {
      url = await unsplashApi.getDaily();
    } else {
      return logError(`unknown argument ${from}. See 'wallpaper daily -h'`);
    }

    if (!isUrl(url)) {
      return logError("fetch random source failed, retry it!");
    }

    const temp = tempfile(path.extname(url));

    got
      .stream(url)
      .on("error", err => {
        logError(`fetch daily source failed, retry it!`);
      })
      .on("downloadProgress", progress => {
        reportDownload({ ...progress, url });
      })
      .pipe(fs.createWriteStream(temp))
      .on("finish", async () => {
        await setWallpaper(temp, scale, url);
      });
  });

  program
  .command("clear")
  .description("Clear all cached wallpaper.")
  .action(async () => {
    await clearWallpapers();
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

program.on("--help", function() {
  console.log("");
  console.log("Examples:");
  console.log("  $ wallpaper update https://examples.com/wallpaper.jpg");
  console.log("  $ wallpaper random QJP");
  console.log("  $ wallpaper daily bing");
});

program.on("command:*", function() {
  logError(
    `Invalid command: ${program.args.join(
      " "
    )}\nSee --help for a list of available commands.`
  );
  process.exit(1);
});

Object.getPrototypeOf(program).constructor.prototype.unknownOption = flags => {
  logError(
    `unknown option: ${flags}\nSee --help for a list of available commands.`
  );
  process.exit(1);
};

program.parse(process.argv);
