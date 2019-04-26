const test = require("ava");
const execa = require("execa");
const os = require("os");
const path = require("path");
const fs = require("fs-extra");

const _cache = path.join(__dirname, ".test_cache.json");
const temp = path.join(__dirname, "./test_images/test3.jpg");

test.before(async t => {
  await fs.writeFile(
    _cache,
    JSON.stringify({
      index: 0,
      cacheFiles: []
    })
  );
});

test.beforeEach(async t => {
  await execa.stdout("../bin/wallpaper.js", ["update", temp], {
    cwd: __dirname
  });
});

test.after(async t => {
  await fs.unlink(_cache);
});

test.serial("get", async t => {
  t.true(
    (await execa.stdout("../bin/wallpaper.js", ["get"], { cwd: __dirname }))
      .length > 0
  );
});

test.serial("update", async t => {
  const tempImagePath = path.join(__dirname, "./test_images/test1.jpg");
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["update", tempImagePath], {
    cwd: __dirname
  });

  const updateImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    updateImagePath.includes(path.resolve(tempImagePath)) &&
      !updateImagePath.includes(orignalImagePath)
  );
});

test.serial("daily:bing", async t => {
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["daily", "bing"], {
    cwd: __dirname
  });

  const randomImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    randomImagePath.includes(os.tmpdir()) &&
      !randomImagePath.includes(orignalImagePath)
  );
});

test.serial("daily:unsplash", async t => {
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["daily", "unsplash"], {
    cwd: __dirname
  });

  const randomImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    randomImagePath.includes(os.tmpdir()) &&
      !randomImagePath.includes(orignalImagePath)
  );
});

test.serial("random:QJP", async t => {
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["random", "QJP"], {
    cwd: __dirname
  });

  const randomImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    randomImagePath.includes(os.tmpdir()) &&
      !randomImagePath.includes(orignalImagePath)
  );
});

test.serial("random:unsplash", async t => {
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["random", "unsplash"], {
    cwd: __dirname
  });

  const randomImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    randomImagePath.includes(os.tmpdir()) &&
      !randomImagePath.includes(orignalImagePath)
  );
});

test.serial("random:bing", async t => {
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["random", "bing"], {
    cwd: __dirname
  });

  const randomImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    randomImagePath.includes(os.tmpdir()) &&
      !randomImagePath.includes(orignalImagePath)
  );
});

test.serial("switch", async t => {
  const orignalImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  const testImagsPaths = [
    path.join(__dirname, "./test_images/test1.jpg"),
    path.join(__dirname, "./test_images/test2.jpg")
  ];

  await execa.stdout("../bin/wallpaper.js", ["update", testImagsPaths[0]], {
    cwd: __dirname
  });
  await execa.stdout("../bin/wallpaper.js", ["update", testImagsPaths[1]], {
    cwd: __dirname
  });

  await execa.stdout("../bin/wallpaper.js", ["switch", "-p"], {
    cwd: __dirname
  });
  const preImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    preImagePath.includes(path.resolve(testImagsPaths[0])) &&
      !preImagePath.includes(orignalImagePath)
  );

  await execa.stdout("../bin/wallpaper.js", ["switch", "-n"], {
    cwd: __dirname
  });
  const nextImagePath = await execa.stdout("../bin/wallpaper.js", ["get"], {
    cwd: __dirname
  });
  t.true(
    nextImagePath.includes(path.resolve(testImagsPaths[1])) &&
      !nextImagePath.includes(preImagePath)
  );

  await execa.stdout("../bin/wallpaper.js", ["switch", "-l"], {
    cwd: __dirname
  });
  t.is(
    await execa.stdout("../bin/wallpaper.js", ["get"], { cwd: __dirname }),
    nextImagePath
  );
});
