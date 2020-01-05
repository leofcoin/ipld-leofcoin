import CID from 'cids'
import multicodec from 'multicodec'
import multihashing from 'multihashing-async'
import protons from 'protons'
import proto from './proto.js'

const codec = multicodec.LEOFCOIN_BLOCK
const defaultHashAlg = multicodec.KECCAK_512


export const serialize = block => {
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

export { codec, defaultHashAlg }
export default { serialize, deserialize, cid, codec, defaultHashAlg }