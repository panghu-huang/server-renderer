import * as path from 'path'
import { Configuration } from 'webpack'

const appDirectory = process.cwd()
const resolve = (absolutePath: string) => path.resolve(appDirectory, absolutePath)

export interface GenerateWebpackOpts {
  isDev?: boolean
  isServer?: boolean
}

export function genWebpackConfig(opts: GenerateWebpackOpts) {
  const { isDev = false, isServer = false } = opts
  const chunkName = isServer ? 'server' : 'client'
  const config: Configuration = {
    mode: isDev ? 'development' : 'production',
    target: isServer ? 'node' : 'web',
    entry: resolve(`src/${chunkName}.tsx`),
    output: {
      path: resolve('build'),
      publicPath: isServer ? '/' : '/static/',
      filename: isServer ? 'server[hash:4].js' : 'client.js',
      libraryTarget: isServer ? 'commonjs2' : 'umd',
    },
    cache: false,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          loader: 'ts-loader',
        }
      ]
    }
  }

  return config
}