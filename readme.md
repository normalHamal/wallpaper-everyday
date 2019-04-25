# 🏠 wallpaper-everyday

![travis-ci-status](https://travis-ci.com/normalHamal/wallpaper-everyday.svg?token=czeEFWLqsGpBh6jhTeTm&branch=master) ![npm](https://img.shields.io/npm/v/wallpaper-everyday.svg) ![npm](https://img.shields.io/npm/dm/wallpaper-everyday.svg)

> Manage the desktop wallpaper and fetch random wallpaper

Works on macOS, Linux, and Windows.

![](http://static.qvjunping.me/8c37c72f-8291-4462-acb4-9c2d541a07f2.gif)


## Install ☟

```bash
$ npm install --global wallpaper-everyday
```


## ✍Usage

```bash
$ wallpaper -h
Usage: wallpaper [options] [command]

Options:
  -V, --version            output the version number
  -h, --help               output usage information

Commands:
  update [options] <file>  Update desktop wallpaper with file path or remote url
  get                      Get desktop wallpaper real path
  random [options] <from>  Random desktop wallpaper change. from: [QJP, unsplash]
  daily [options] <from>   Daily wallpaper. from: [bing, unsplash]
  switch [options]         Switch cached wallpapers

Examples:
  $ wallpaper update https://examples.com/wallpaper.jpg
  $ wallpaper random QJP
  $ wallpaper daily bing
```


## ❤Related

- [wallpaper](https://github.com/sindresorhus/wallpaper) - API for this module
