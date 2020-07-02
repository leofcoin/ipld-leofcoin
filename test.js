const test = require('tape');
const { util, LFCNode, resolver } = require('./index.js');

const hashBuffer = Buffer.alloc(32)
const hash = hashBuffer.toString('hex')
const time = 1593712815480

const rawTransactions = [{
  id: hash,
  time,
  reward: 'minted',
  script: '',
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

const transactions = [{
  multihash: 'z3vzxp8ZtAWkSkXo7DQzyXMCgeQc29dH4RGz92wopg6QMexmjfi',
  size: 362
}]

const rawBlock = {
  index: 0,
  prevHash: hash,
  time,
  transactions: rawTransactions,
  nonce: 0
}

const block = {
  index: 0,
  prevHash: hash,
  time,
  transactions,
  nonce: 0
}

let serialized;
let deserialized;

test('can serialize', async tape => {
  tape.plan(5)
  
  let node
  
  serialized = await util.serialize(block)
  tape.ok(Boolean(serialized.length === 135), 'should serialize')
  
  deserialized = await util.deserialize(serialized)
  tape.ok(Boolean(Object.keys(deserialized).length === 5), 'should deserialize')
  
  let equal = true;
  for (const key of Object.keys(block)) {
    if (deserialized[key] === undefined) equal = false
  }  
  tape.ok(equal, 'everything should be defined')
  
    
  node = new LFCNode(serialized)
  const tree = await resolver.tree(node.serialize())
  tape.ok(Boolean(node.index === 0), 'should resolve')
  
  serialized = await util.serialize(rawBlock)
  node = new LFCNode(serialized)
  tape.ok(Boolean(serialized.length === 135), 'should serialize raw transactions')
})