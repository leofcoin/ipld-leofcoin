const test = require('tape');
const { util, LFCNode } = require('./index.js');

const hashBuffer = Buffer.alloc(32)
const hash = hashBuffer.toString('hex')
const time = new Date().getTime()

const transactions = [{
  id: hash,
  time,
  hash,
  reward: 'minted',
  inputs: [{
    index: 0,
    tx: hash,
    amount: 150,
    address: hash,
    signature: hash
  }],
  outputs: [{
    index: 0,
    amount: 150,
    address: hash
  }]
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
  tape.ok(Boolean(serialized.length === 506))
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

test('LFCNode', tape => {
  tape.plan(1)
  const node = new LFCNode(serialized)
  console.log(node.toJSON());
  tape.ok(Boolean(node.index === 0))
})