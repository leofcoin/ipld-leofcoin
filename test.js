const test = require('tape');
const { util, LFCNode, resolver } = require('./index.js');

const hashBuffer = Buffer.alloc(32)
const hash = hashBuffer.toString('hex')
const time = 1593712815480
const prevHash = Buffer.alloc(47).toString('hex')
const _hash = Buffer.alloc(47).toString('hex')


const ntx = {
  multihash: 'z3vzxp8V5ZtBo5x66ft9sxBWLwzqUDSJsYMgnwHb9adoLpcoBDi',
  size: 128
}
const nblock = {
    index: 1,
    prevHash: 'zsNS6wZiHSc2QPHmjV8TMNn798b4Kp9jpjsBNeUkPhaJTza3GosWUgE72Jy3X9jKMrFCcDni7Pq4yXogQN4TcAfrPmTXFt',
    time: 1608475835,
    transactions: [ ntx ],
    nonce: 4962188,
    hash: 'zsNS6wZiHS2zLW5VfnhCnFq5SXedvtn7KfDu378Cuxjops4MB7q7XPgzcuhKCV6HZaxDnYag92fTrkKvJWp4f5FiYBzywE'
  }

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
  prevHash,
  time,
  transactions: rawTransactions,
  nonce: 0,
  hash: _hash
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
  tape.plan(7)

  let node

  serialized = await util.serialize(block)
  console.log(util.cid(serialized));
  tape.ok(Boolean(serialized.length === 135), 'should serialize')
  deserialized = await util.deserialize(serialized)
  tape.ok(Boolean(Object.keys(deserialized).length === 5), 'should deserialize')

  let equal = true;
  for (const key of Object.keys(block)) {
    if (deserialized[key] === undefined) equal = false
  }
  tape.ok(equal, 'everything should be defined')

  const b = await util.serialize(nblock)
  const t = await util.deserialize(b)
  console.log(t.time);

  node = await new LFCNode(serialized)
  const tree = await resolver.tree(node.serialize())
  tape.ok(Boolean(node.index === 0), 'should resolve')

  node = await new LFCNode(rawBlock)
  serialized = await util.serialize(node.toJSON())
  tape.ok(Boolean(serialized.length === 165), 'should serialize raw transactions')
  try {
    rawBlock.transactions = rawTransactions
    await util.validate(rawBlock)
    tape.ok(true, 'should validate')
  } catch (e) {
    console.log(e);
    tape.ok(false, 'should validate')
  }

  tape.ok(node.isLFCNode, 'isLFCNode')
})
