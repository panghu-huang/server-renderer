import path from 'path'
import typescript from 'rollup-plugin-typescript'

const resolve = absolutePath => path.resolve(__dirname, '..', absolutePath)

export default {
  input: resolve('core/client.tsx'),
  output: {
    file: resolve('lib/client.js'),
    format: 'umd',
    name: 'it-ssr',
  },
  plugins: [
    typescript()
  ],
}