import path from 'path'

const resolve = absolutePath => path.resolve(__dirname, '..', absolutePath)

export default {
  input: resolve('core/index.js'),
  output: {
    file: resolve('lib/index.js'),
    format: 'umd',
    name: 'ServerRenderer',
  },
}