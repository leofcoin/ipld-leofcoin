import classIs from 'class-is'
import { serialize, deserialize } from './../util'
import { LFCTx } from 'ipld-lfc-tx';

export default classIs(class LFCNode {
  get _keys() {
    return ['index', 'prevHash', 'time', 'transactions', 'nonce']
  }
  constructor(block) {
    
    if (Buffer.isBuffer(block)) {
      this._defineBlock(deserialize(block))
    } else if (block) {
      this._defineBlock(block)
    }
  }
  
  serialize() {
    return serialize(this._keys.reduce((p, c) => {
      p[c] = this[c]
      return p
    }, {}))
  }
  
  _defineBlock(block) {
    return this._keys.forEach(key => {
      if (key === 'transactions') {
        block[key] = block[key].map(tx => new LFCTx(tx))
      }
      Object.defineProperty(this, key, {
        value: block[key],
        writable: false
      })
    })
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
  
  addTransaction(transactions) {
    if (!Array.isArray(transactions)) transactions = [transactions]
    
    transactions.map(tx)
  }
}, { className: 'LFCNode', symbolName: '@leofcoin/ipld-lfc/lfc-node'})