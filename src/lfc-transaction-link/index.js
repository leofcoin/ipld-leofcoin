import classIs from 'class-is';
import { LFCTx, util } from 'ipld-lfc-tx'
import { isLink } from './util'

export default classIs(class LFCTransactionLink {
  get _keys() {
    return ['multihash', 'size']
  }
  constructor(link) {
    if (link) {
      if (!isLink(link)) {
        link = new LFCTx(link)
        const size = link.size
        const cid = util.cid(link.serialize())
        link = { multihash: cid.toBaseEncodedString(), size }
      }
      this._defineLink(link)
      return this
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

  isLink(link) {
    if (link.multihash && link.size) return true
    return false
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
