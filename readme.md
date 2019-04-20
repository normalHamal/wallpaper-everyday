# wallpaper-everyday

![travis-ci-status](https://travis-ci.com/normalHamal/wallpaper-everyday.svg?token=czeEFWLqsGpBh6jhTeTm&branch=master) ![npm](https://img.shields.io/npm/v/wallpaper-everyday.svg) ![npm](https://img.shields.io/npm/dm/wallpaper-everyday.svg)

> Manage the desktop wallpaper and fetch random wallpaper

Works on macOS, Linux, and Windows.


## Install

```bash
$ npm install --global wallpaper-everyday
```


## Usage

```bash
$ wallpaper -h
Usage: wallpaper [options] [command]

Options:
  -V, --version            output the version number
  -h, --help               output usage information
  -s, --scale              Scaling method: [auto, fill, fit, stretch, center](Default: auto) Only available on macOS
  -b, --bing               use daily wallpaper from https://cn.bing.com to set up desktop wallpaper
  -p, --pre                Switch the previous wallpaper
  -n, --next               Switch the next wallpaper
  -l, --latest             Switch the latest wallpaper

Commands:
  update [-s|--scale] <file>  Update desktop wallpaper with file path or remote url
  get                      Get desktop wallpaper real path
  random [-s|--scale][-b|--bing]         Random desktop wallpaper change
  switch [-p|--pre][-n|--next][-l|--latest]         Switch cached wallpapers
```


## Related

- [wallpaper](https://github.com/sindresorhus/wallpaper) - API for this module
