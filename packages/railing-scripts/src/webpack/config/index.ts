import * as path from 'path'
import * as webpack from 'webpack'
import { IRailingConfig } from '@railing/types'
import * as nodeExternals from 'webpack-node-externals'
import type { ICreateWebpackConfigOptions } from '../../types'

function createBabelLoaderOptions(isServer: boolean) {
  const presets = [
    require.resolve('@babel/preset-react'),
    [
      require.resolve('@babel/preset-typescript'),
      {
        isTSX: true,
        allExtensions: true,
        allowNamespaces: false,
      }
    ],
  ]
  if (!isServer) {
    presets.push(require.resolve('@babel/preset-env'))
  }
  return {
    plugins: isServer
      ? [require.resolve('@babel/plugin-proposal-class-properties')]
      : [
        require.resolve('@babel/plugin-proposal-class-properties'),
        [
          require.resolve('@babel/plugin-transform-runtime'),
          {
            helpers: true,
            regenerator: true,
            useESModules: false,
          },
        ],
      ],
    presets,
  }
}

export function createWebpackConfig(
  railingConfig: IRailingConfig,
  options: ICreateWebpackConfigOptions
): webpack.Configuration {
  const rootDir = process.cwd()

  const resolveAppPath = (...paths: string[]) => path.resolve(rootDir, ...paths)

  const outputDir = railingConfig.outputDir || 'build'
  console.log(path.join(outputDir, options.isServer ? 'server' : 'client'));


  const webpackConfig: webpack.Configuration = {
    bail: options.isDev,
    mode: options.isDev ? 'development' : 'production',
    // only client and in development mode
    devtool: (options.isDev && !options) ? 'cheap-module-eval-source-map' : false,
    stats: options.isServer ? 'none' : 'normal',
    target: options.isServer ? 'node' : 'web',
    entry: {
      app: resolveAppPath('app.tsx')
    },
    output: {
      path: resolveAppPath(outputDir, options.isServer ? 'server' : 'client'),
      // TODO
      publicPath: '/',
      filename: (!options.isServer && !options.isDev) ? 'js/[name].[chunkhash:5].js' : '[name].js',
      chunkFilename: (!options.isServer && !options.isDev) ? 'js/[name].[chunkhash:5].chunk.js' : '[name].chunk.js',
      libraryTarget: options.isServer ? 'commonjs' : 'umd',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        src: resolveAppPath('src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: createBabelLoaderOptions(options.isServer),
        }
      ]
    },
    externals: options.isServer ? [nodeExternals()] : undefined,
    // plugins: []
  }

  return webpackConfig
}