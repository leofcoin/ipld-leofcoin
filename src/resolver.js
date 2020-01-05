import { deserialize } from './util.js';

const error = text => {
  const stack = new Error().stack;
  const caller = stack.split('\n')[2].trim();
  console.groupCollapsed(text);
  console.log(caller)
  console.groupEnd();
  return
}
/**
 *  Resolves a path within a LFC block
 *
 * @param {Buffer} buffer - Binary representation of an LFC block
 * @param {String} [path='/'] - Path to resolve
 * @returns {Object} result - Result of the path if it was resolved successfully
 * @returns {*} result.value - Value the path resolved with
 * @returns {string} result.remainderPath - If the path resolves half-way to a
 *   link, then the `remainderPath` is the part after the link that can be used
 *   for further resolving
 *
 */
export const resolve = (buffer, path) => {
  let value = deserialize(buffer)
  
  const parts = path.split('/').filter(Boolean)
  
  while (parts.length) {
    const key = parts.shift()
    if (value[key] === undefined) throw error(`LFCBlock has no property '${key}'`)
    
    value = value[key]
    if (CID.isCID(value)) {
      return {
        value,
        remainderPath: parts.join('/')
      }
    }
  }
  return {
    value,
    remainderPath: ''
  }
}

export const traverse = function * (node, path) {
  if (Buffer.isBuffer(node) || CID.isCID(node) || typeof node === 'string' ||
      node === null) {
    return
  }
  for (const item of Object.keys(node)) {
    const nextpath = path === undefined ? item : path + '/' + item
    yield nextpath
    yield * traverse(node[item], nextpath)
  }
}

export const tree = function * (buffer) {
  const node = deserialize(buffer)

  yield * traverse(node)
}

export default { resolve, traverse, tree }