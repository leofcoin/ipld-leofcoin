import classIs from 'class-is';
import { serialize, deserialize } from './../util';

export default classIs(class LFCTransactionLink {
  get _keys() {
    return ['multihash', 'size']
  }
  constructor(link) {
    if (link) {
      this._defineLink(link)
    }
  }
  
  _defineLink(link) {
    return this._keys.forEach(key => {
      Object.defineProperty(this, key, {
        value: link[key],
        writable: false
      })
    })
  }
  
  toJSON() {
    return this._keys.reduce((p, c) => {
      p[c] = this[c]
      return p
    }, {})
  }
  
  toString () {
    return `LFCTransactionLink <multihash: "${this.multihash.toString()}", size: "${this.size}">`
  }
}, { className: 'LFCTransactionLink', symbolName: '@leofcoin/ipld-lfc/lfc-transaction-link'})