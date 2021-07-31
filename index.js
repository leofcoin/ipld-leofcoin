'use strict';

var CID = require('cids');
var multicodec = require('multicodec');
var multihashing = require('multihashing');
var protons = require('protons');
var ipldLfcTx = require('ipld-lfc-tx');
var classIs = require('class-is');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var CID__default = /*#__PURE__*/_interopDefaultLegacy(CID);
var multicodec__default = /*#__PURE__*/_interopDefaultLegacy(multicodec);
var multihashing__default = /*#__PURE__*/_interopDefaultLegacy(multihashing);
var protons__default = /*#__PURE__*/_interopDefaultLegacy(protons);
var classIs__default = /*#__PURE__*/_interopDefaultLegacy(classIs);

var proto = `// LFC Block

message LFCTransactionLink {
  required string multihash = 1;
  required uint64 size = 2;
}

message LFCBlock {
  required uint64 index = 1;
  required string prevHash = 2;
  required uint64 time = 3;
  required uint64 nonce = 4;
  repeated LFCTransactionLink transactions = 5;
}`;

const isLink = link => link ? Boolean(link.multihash && link.size) : false;

const codec = multicodec__default['default'].LEOFCOIN_BLOCK;
const defaultHashAlg = multicodec__default['default'].KECCAK_512;

const serialize = block => {
  return protons__default['default'](proto).LFCBlock.encode(block)
};

const deserialize = buffer => {
  return protons__default['default'](proto).LFCBlock.decode(buffer)
};

/**
 * @returns {Promise.<CID>}
 */
const cid = buffer => {
  const multihash = multihashing__default['default'](buffer, defaultHashAlg);
  multicodec__default['default'].print[codec];
  return new CID__default['default'](1, 'leofcoin-block', multihash, 'base58btc')
};

const validate = json => {
  if (json.isLFCNode) json = json.toJSON();
  if (json.prevHash.length !== 94) throw new Error(`Expected: 94 got ${json.prevHash.length} @LFCNode.prevHash.length`)
  if (typeof json.prevHash !== 'string') throw new Error(`Expected: typeof string got ${typeof json.prevHash} @LFCNode.prevHash`)
  if (typeof json.hash !== 'string') throw new Error(`Expected: typeof string got ${typeof json.hash} @LFCNode.hash`)
  if (json.hash.length !== 94) throw new Error(`Expected: 94 got ${json.hash.length} @LFCNode.hash.length`)
  if (isNaN(json.time)) throw new Error(`Expected: typeof number got ${typeof json.time} @LFCNode.time`)
  if (isNaN(json.index)) throw new Error(`Expected: typeof number got ${typeof json.index} @LFCNode.index`)
  if (isNaN(json.nonce)) throw new Error(`Expected: typeof number got ${typeof json.nonce} @LFCNode.nonce`)

  for (const tx of json.transactions) {
    try {
      ipldLfcTx.util.isValid(tx);
    } catch (e) {
      throw new Error(`invalid transaction ${e}`)
    }
  }
};

const isValid = data => {
  try {
    const valid = validate(data);
    return true
  } catch (e) {
    return false
  }
};
var util = { serialize, deserialize, cid, codec, defaultHashAlg, isValid, validate };

const error = text => {
  const stack = new Error().stack;
  const caller = stack.split('\n')[2].trim();
  console.groupCollapsed(text);
  console.log(caller);
  console.groupEnd();
  return
};
/**
 *  Resolves a path within a LFC block
 *
 * @param {Buffer} buffer - Binary representation of an LFC block
 * @param {String} [path='/'] - Path to resolve
 * @returns {Object} result - Result of the path if it was resolved successfully
 * @returns {*} result.value - Value the path resolved with
 * @returns {string} result.remainderPath - If the path resolves half-way to a
 *   link, then the `remainderPath` is the part after the link that can be used
 *   for further resolving
 *
 */
const resolve = (buffer, path = '/') => {
  let value = deserialize(buffer);
  
  const parts = path.split('/').filter(Boolean);
  
  while (parts.length) {
    const key = parts.shift();
    if (value[key] === undefined) throw error(`LFCBlock has no property '${key}'`)
    
    value = value[key];
    if (CID__default['default'].isCID(value)) {
      return {
        value,
        remainderPath: parts.join('/')
      }
    }
  }
  return {
    value,
    remainderPath: ''
  }
};

const traverse = function * (node, path) {
  if (Buffer.isBuffer(node) || CID__default['default'].isCID(node) || typeof node === 'string' ||
      node === null) {
    return
  }
  for (const item of Object.keys(node)) {
    const nextpath = path === undefined ? item : path + '/' + item;
    yield nextpath;
    yield * traverse(node[item], nextpath);
  }
};

const tree = function * (buffer) {
  const node = deserialize(buffer);
  yield * traverse(node);
};

var resolver = { resolve, traverse, tree };

var LFCTransactionLink = classIs__default['default'](class LFCTransactionLink {
  get _keys() {
    return ['multihash', 'size']
  }
  constructor(link) {
    if (link) {
      if (!isLink(link)) {
        link = new ipldLfcTx.LFCTx(link);
        const size = link.size;
        const cid = ipldLfcTx.util.cid(link.serialize());
        link = { multihash: cid.toBaseEncodedString(), size };
      }
      this._defineLink(link);
      return this
    }
  }

  _defineLink(link) {
    return this._keys.forEach(key => {
      Object.defineProperty(this, key, {
        value: link[key],
        writable: false
      });
    })
  }

  isLink(link) {
    if (link.multihash && link.size) return true
    return false
  }

  toJSON() {
    return this._keys.reduce((p, c) => {
      p[c] = this[c];
      return p
    }, {})
  }

  toString () {
    return `LFCTransactionLink <multihash: "${this.multihash.toString()}", size: "${this.size}">`
  }
}, { className: 'LFCTransactionLink', symbolName: '@leofcoin/ipld-lfc/lfc-transaction-link'});

var LFCNode = classIs__default['default'](class LFCNode {
  get _keys() {
    return ['index', 'prevHash', 'time', 'transactions', 'nonce']
  }
  constructor(block) {
    if (Buffer.isBuffer(block)) {
      this._defineBlock(deserialize(block));
    } else if (block) {
      this._defineBlock(block);
    }
    return this
  }

  serialize() {
    return serialize(this._keys.reduce((p, c) => {
      p[c] = this[c];
      return p
    }, {}))
  }

  _defineBlock(block) {
    for (var key of this._keys) {
      if (key === 'transactions') {
        const _tx = [];
        for (const tx of block.transactions) {
          _tx.push(new LFCTransactionLink(tx));
        }
        block.transactions = _tx;
      }
      Object.defineProperty(this, key, {
        value: block[key],
        writable: false
      });
    }
  }

  toJSON() {
    return this._keys.reduce((p, c) => {
      if (c === 'transactions') p[c] = this[c].map(tx => tx.toJSON());
      else p[c] = this[c];
      return p
    }, {})
  }

  toString () {
    return `LFCNode <index: "${this.index.toString()}", prevHash: "${this.prevHash.toString('hex')}", time: "${this.time.toString()}", nonce: "${this.nonce.toString()}", transactions: "${this.transactions.length}", size: ${this.size}>`
  }

  get size () {
    return this.transactions.reduce((p, c) => p + c.size, this.serialize().length)
  }

  get isLFCNode() {
    return true
  }

}, { className: 'LFCNode', symbolName: '@leofcoin/ipld-lfc/lfc-node'});

var index = { 
  util, codec: util.codec, defaultHashAlg: util.defaultHashAlg, LFCNode, resolver
};

module.exports = index;
