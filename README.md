# ipld-leofcoin

[![Coverage](https://coveralls.io/repos/github/ipld/js-ipld-leofcoin/badge.svg?branch=master)](https://coveralls.io/github/ipld/js-ipld-leofcoin?branch=master)
[![Travis](https://travis-ci.org/ipld/js-ipld-leofcoin.svg?branch=master)](https://travis-ci.org/ipld/js-ipld-leofcoin)
[![](https://david-dm.org/ipld/js-ipld-leofcoin.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-leofcoin)
[![](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D6.0.0-orange.svg?style=flat-square)

> JavaScript implementation of the [IPLD format spec](https://github.com/ipld/interface-ipld-format) for Leofcoin.

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm install ipld-leofcoin
```

### Use in Node.js

```JavaScript
const IpldLeofcoin = require('ipld-leofcoin')
```

### Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var IpldLeofcoin = require('ipld-leofcoin')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `IpldLeofcoin` obj available in the global namespace.

```html
<script src="https://unpkg.com/ipld-leofcoin/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipld-leofcoin/dist/index.js"></script>
```

## Usage

As this is is an implementation of the [IPLD format spec](https://github.com/ipld/interface-ipld-format), it should be used through the [IPLD resolver](https://github.com/ipld/js-ipld-resolver). See the IPLD format spec for details about the API.

Though it can also be used as a standalone module:

```JavaScript
const IpldLeofcoin = require('ipld-leofcoin')

// `leofcoinBlock` is some binary Leofcoin block
IpldLeofcoin.util.deserialize(leofcoinBlock, (err, dagNode) => {
  if (err) {
    throw err
  }
  console.log(dagNode)
})
```

## Maintainers

[@vandeurenglenn](https://github.com/vandeurenglenn)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipld/js-ipld-leofcoin/issues)!

## License

[MIT](LICENSE) © 2018 IPFS
[MIT](LICENSE) © 2018 Leofcoin
