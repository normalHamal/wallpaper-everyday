#!/usr/bin/env node

const program = require("commander");
const wallpaper = require("wallpaper");
const isUrl = require("is-url-superb");
const {
  setWallpaper,
  switchWallpaper,
  logError,
  logSuccess,
  clearWallpapers,
  clearCurrentWallpaper
} = require("../lib/util");
const Unsplash = require("../lib/unsplash");
const Bing = require("../lib/bing");
const NetBian = require("../lib/netbian");

const { version } = require("../package.json");
const bingApi = new Bing();
const unsplashApi = new Unsplash();
const netbianApi = new NetBian();

program.version(version);

program
  .command("update <file>")
  .description("Update desktop wallpaper with file path or remote url")
  .option(
    "-s --scale [mode]",
    "Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS"
  )
  .action(async (file, { scale }) => {
    await setWallpaper(file, scale);
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
  .description("Random desktop wallpaper change. from: [unsplash, bing, netbian]")
  .option(
    "-s --scale [mode]",
    "Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS"
  )
  .action(async (from, { scale }) => {
    let url = "";
    from = from.toUpperCase();

    if (from === "UNSPLASH") {
      url = await unsplashApi.getRandom();
    } else if (from === "BING") {
      url = await bingApi.getRandom();
    } else if (from === "NETBIAN") {
      url = await netbianApi.getRandom();
    } else {
      return logError(`unknown argument '${from}'. See 'wallpaper random -h'`);
    }

    if (!isUrl(url)) {
      return logError("fetch random source failed, retry it!");
    }

    await setWallpaper(url, scale);
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

    await setWallpaper(url, scale);
  });

program
  .command("clear")
  .description("Clear the currently used wallpaper")
  .option("-a --all", "Clear all the cached wallpapers")
  .action(async ({ all }) => {
    if (all) {
      await clearWallpapers();
    } else {
      await clearCurrentWallpaper();
    }
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
