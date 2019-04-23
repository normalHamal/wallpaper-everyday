const test = require("ava");
const execa = require("execa");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");

const _cache = path.join(__dirname, "._cache.json");
const temp = "./test_images/test3.jpg";
let cacheFileBeforeTest = null;

test.before(async t => {
  cacheFileBeforeTest = await fs.readFile(_cache, 'utf8');
});

test.beforeEach(async t => {
  await execa.stdout("./wallpaper.js", ["update", temp], {
    cwd: __dirname
  });
});

test.after(async t => {
  await fs.writeFile(_cache, cacheFileBeforeTest);
});

test.serial("get", async t => {
  t.true(
    (await execa.stdout("./wallpaper.js", ["get"], { cwd: __dirname })).length >
      0
  );
});

test.serial("update", async t => {
  const tempImagePath = "./test_images/test1.jpg";
  const orignalImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("./wallpaper.js", ["update", tempImagePath], {
    cwd: __dirname
  });

  const updateImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    updateImagePath.includes(path.resolve(tempImagePath)) &&
      !updateImagePath.includes(orignalImagePath)
  );

  await clear(updateImagePath);
});

test.serial("random", async t => {
  const orignalImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("./wallpaper.js", ["random", "-b"], { cwd: __dirname });

  const randomImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    randomImagePath.includes(os.tmpdir()) &&
      !randomImagePath.includes(orignalImagePath)
  );

  await clear(randomImagePath);
});

test.serial("switch", async t => {
  const orignalImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });
  const testImagsPaths = ["./test_images/test1.jpg", "./test_images/test2.jpg"];

  await execa.stdout("./wallpaper.js", ["update", testImagsPaths[0]], {
    cwd: __dirname
  });
  await execa.stdout("./wallpaper.js", ["update", testImagsPaths[1]], {
    cwd: __dirname
  });

  await execa.stdout("./wallpaper.js", ["switch", "-p"], { cwd: __dirname });
  const preImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    preImagePath.includes(path.resolve(testImagsPaths[0])) &&
      !preImagePath.includes(orignalImagePath)
  );

  await execa.stdout("./wallpaper.js", ["switch", "-n"], { cwd: __dirname });
  const nextImagePath = await execa.stdout("./wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    nextImagePath.includes(path.resolve(testImagsPaths[1])) &&
      !nextImagePath.includes(preImagePath)
  );

  await execa.stdout("./wallpaper.js", ["switch", "-l"], { cwd: __dirname });
  t.is(
    await execa.stdout("./wallpaper.js", ["get"], { cwd: __dirname }),
    nextImagePath
  );

  await clear(path.resolve(testImagsPaths[0]));
  await clear(path.resolve(testImagsPaths[1]));
});

async function clear(file) {
  let { cacheFiles = [], index } = JSON.parse(
    await fs.readFile(_cache, "utf8")
  );

  if (!cacheFiles.length) {
    return await fs.unlink(_cache);
  }

  await fs.writeFile(
    _cache,
    JSON.stringify(
      {
        index,
        cacheFiles: cacheFiles.filter(i => !file.includes(i))
      },
      null,
      2
    )
  );
}
