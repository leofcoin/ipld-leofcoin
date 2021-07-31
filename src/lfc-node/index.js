import classIs from 'class-is';
import { serialize, deserialize } from './../util';
import LFCTransactionLink from './../lfc-transaction-link/index';

export default classIs(class LFCNode {
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
      p[c] = this[c]
      return p
    }, {}))
  }

  _defineBlock(block) {
    for (var key of this._keys) {
      if (key === 'transactions') {
        const _tx = []
        for (const tx of block.transactions) {
          _tx.push(new LFCTransactionLink(tx))
        }
        block.transactions = _tx
      }
      Object.defineProperty(this, key, {
        value: block[key],
        writable: false
      });
    }
  }

  toJSON() {
    return this._keys.reduce((p, c) => {
      if (c === 'transactions') p[c] = this[c].map(tx => tx.toJSON())
      else p[c] = this[c]
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

}, { className: 'LFCNode', symbolName: '@leofcoin/ipld-lfc/lfc-node'})
