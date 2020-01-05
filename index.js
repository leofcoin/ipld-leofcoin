'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var CID = _interopDefault(require('cids'));
var multicodec = _interopDefault(require('multicodec'));
var multihashing = _interopDefault(require('multihashing-async'));
var protons = _interopDefault(require('protons'));
var classIs = _interopDefault(require('class-is'));
var ipldLfcTx = require('ipld-lfc-tx');

var proto = `// LFC Block

message LFCOutput {
  required uint64 index = 1;
  required uint64 amount = 2;
  required string address = 3;
}

message LFCInput {
  required uint64 index = 1;
  required string tx = 2;  
  required uint64 amount = 3;
  required string address = 4;
  required string signature = 5;
}


message LFCTransaction {
  required string id = 1;
  required uint64 time = 2;
  required string hash = 3;
  optional string reward = 4;
  repeated LFCInput inputs = 5;
  repeated LFCOutput outputs = 6;
}

message LFCBlock {
  required uint64 index = 1;
  required string prevHash = 2;
  required uint64 time = 3;
  required uint64 nonce = 4;
  repeated LFCTransaction transactions = 5;
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
        block[key] = block[key].map(tx => new ipldLfcTx.LFCTx(tx));
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
  
  addTransaction(transactions) {
    if (!Array.isArray(transactions)) transactions = [transactions];
    
    transactions.map(tx);
  }
}, { className: 'LFCNode', symbolName: '@leofcoin/ipld-lfc/lfc-node'});

var index = { 
  util, codec: util.codec, defaultHashAlg: util.defaultHashAlg, LFCNode
};

module.exports = index;
