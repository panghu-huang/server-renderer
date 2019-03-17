import path from 'path'
import typescript from 'rollup-plugin-typescript'

const resolve = absolutePath => path.resolve(__dirname, '..', absolutePath)

export default {
  input: resolve('core/server.tsx'),
  output: {
    file: resolve('lib/server.js'),
    format: 'cjs',
  },
  plugins: [
    typescript()
  ],
}