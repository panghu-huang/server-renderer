import path from 'path'
import typescript from 'rollup-plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'

const resolve = absolutePath => path.resolve(__dirname, '..', absolutePath)

export default {
  input: resolve('core/client.tsx'),
  output: {
    file: resolve('lib/client.js'),
    format: 'umd',
    name: 'ServerRenderer',
  },
  plugins: [
    typescript({ target: 'es5' }),
    uglify()
  ],
}