import CID from 'cids'
import multicodec from 'multicodec'
import multihashing from 'multihashing-async'
import protons from 'protons'
import proto from './proto.js'
import { LFCTx, util as lfcTxUtil} from 'ipld-lfc-tx'
import { isLink } from './lfc-transaction-link/util'

const codec = multicodec.LEOFCOIN_BLOCK
const defaultHashAlg = multicodec.KECCAK_512

export const serialize = async block => {
  const _transactions = []
  for (let tx of block.transactions) {
      if (!isLink(tx)) {
        tx = new LFCTx(tx)
        const cid = await lfcTxUtil.cid(await tx.serialize())
        tx = { multihash: cid.toBaseEncodedString(), size: tx.size }
      }
    _transactions.push(tx)
  }
  block.transactions = _transactions
  return protons(proto).LFCBlock.encode(block)
}

export const deserialize = buffer => {
  return protons(proto).LFCBlock.decode(buffer)
}

/**
 * @returns {Promise.<CID>}
 */
export const cid = async buffer => {
  const multihash = await multihashing(buffer, defaultHashAlg)
  const codecName = multicodec.print[codec]

  return new CID(1, 'leofcoin-block', multihash, 'base58btc')
}

export const validate = json => {
  if (json.isLFCNode) json = json.toJSON()
  if (json.prevHash.length !== 94) throw new Error(`Expected: 94 got ${json.prevHash.length} @LFCNode.prevHash.length`)
  if (typeof json.prevHash !== 'string') throw new Error(`Expected: typeof string got ${typeof json.prevHash} @LFCNode.prevHash`)
  if (typeof json.hash !== 'string') throw new Error(`Expected: typeof string got ${typeof json.hash} @LFCNode.hash`)
  if (json.hash.length !== 128) throw new Error(`Expected: 128 got ${json.hash.length} @LFCNode.hash.length`)
  if (isNaN(json.time)) throw new Error(`Expected: typeof number got ${typeof json.time} @LFCNode.time`)
  if (isNaN(json.index)) throw new Error(`Expected: typeof number got ${typeof json.index} @LFCNode.index`)
  if (isNaN(json.nonce)) throw new Error(`Expected: typeof number got ${typeof json.nonce} @LFCNode.nonce`)
  
  for (const tx of json.transactions) {
    try {
      lfcTxUtil.isValid(tx)
    } catch (e) {
      throw new Error(`invalid transaction ${e}`)
    }
  }
}

export const isValid = data => {
  try {
    const valid = validate(data)
    return true
  } catch (e) {
    return false
  }
}

export { codec, defaultHashAlg }
export default { serialize, deserialize, cid, codec, defaultHashAlg, isValid, validate }