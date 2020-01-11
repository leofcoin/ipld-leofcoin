'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var CID = _interopDefault(require('cids'));
var multicodec = _interopDefault(require('multicodec'));
var multihashing = _interopDefault(require('multihashing-async'));
var protons = _interopDefault(require('protons'));
var classIs = _interopDefault(require('class-is'));

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

const codec = multicodec.LEOFCOIN_BLOCK;
const defaultHashAlg = multicodec.KECCAK_512;


const serialize = block => {
  return protons(proto).LFCBlock.encode(block)
};

const deserialize = buffer => {
  return protons(proto).LFCBlock.decode(buffer)
};

/**
 * @returns {Promise.<CID>}
 */
const cid = async buffer => {
  const multihash = await multihashing(buffer, defaultHashAlg);
  const codecName = multicodec.print[codec];

  return new CID(1, 'leofcoin-block', multihash, 'base58btc')
};
var util = { serialize, deserialize, cid, codec, defaultHashAlg };

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
    if (CID.isCID(value)) {
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
  if (Buffer.isBuffer(node) || CID.isCID(node) || typeof node === 'string' ||
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

var LFCTransactionLink = classIs(class LFCTransactionLink {
  get _keys() {
    return ['multihash', 'size']
  }
  constructor(link) {
    if (link) {
      this._defineLink(link);
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

var LFCNode = classIs(class LFCNode {
  get _keys() {
    return ['index', 'prevHash', 'time', 'transactions', 'nonce']
  }
  constructor(block) {
    
    if (Buffer.isBuffer(block)) {
      this._defineBlock(deserialize(block));
    } else if (block) {
      this._defineBlock(block);
    }
  }
  
  serialize() {
    return serialize(this._keys.reduce((p, c) => {
      p[c] = this[c];
      return p
    }, {}))
  }
  
  _defineBlock(block) {
    return this._keys.forEach(key => {
      if (key === 'transactions') {
        block[key] = block[key].map(tx => new LFCTransactionLink(tx));
      }
      Object.defineProperty(this, key, {
        value: block[key],
        writable: false
      });
    })
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
}, { className: 'LFCNode', symbolName: '@leofcoin/ipld-lfc/lfc-node'});

var index = { 
  util, codec: util.codec, defaultHashAlg: util.defaultHashAlg, LFCNode, resolver
};

module.exports = index;
