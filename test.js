const test = require('tape');
const { util, LFCNode, resolver } = require('./index.js');

const hashBuffer = Buffer.alloc(32)
const hash = hashBuffer.toString('hex')
const time = new Date().getTime()

const transactions = [{
  multihash: 'z3vzxp8c2jN7bFM8Aew9XnA3USDzLV7s3GbnS6JdevANJYUBimX',
  size: 500
}]

const block = {
  index: 0,
  prevHash: hash,
  time,
  transactions,
  nonce: 0
}

let serialized;
let deserialized;

test('can serialize', tape => {
  tape.plan(1)
  serialized = util.serialize(block)
  tape.ok(Boolean(serialized.length === 135))
})

test('can deserialize', tape => {
  tape.plan(1)
  deserialized = util.deserialize(serialized)
  tape.ok(Boolean(Object.keys(deserialized).length === 5))
})

test('deserialized is equal to serialized', tape => {
  tape.plan(1)
  let equal = true;
  for (const key of Object.keys(block)) {
    if (deserialized[key] === undefined) equal = false
  }  
  tape.ok(equal)  
})

test('LFCNode', async tape => {
  tape.plan(1)
  const node = new LFCNode(serialized)
  const tree = await resolver.tree(node.serialize())
  tape.ok(Boolean(node.index === 0))
})