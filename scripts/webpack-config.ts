import * as path from 'path'
import * as webpack from 'webpack'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import * as mergeWebpackConfig from 'webpack-merge'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { getConfig, Configuration, CustomConfiguration } from './config'

export interface GenerateWebpackOpts {
  rootDirectory: string
  isDev?: boolean
  isServer?: boolean
}

export function genWebpackConfig(opts: GenerateWebpackOpts) {
  const { rootDirectory, isDev = false, isServer = false } = opts
  const config = getConfig()
  const resolve = absolutePath => path.resolve(rootDirectory, absolutePath)

  const outputDirectory = getOutputDirectoty(config, isDev, isServer)
  const plugins = getBundlePlugins(opts, config)

  const webpackConfig: webpack.Configuration = {
    devtool: (isDev && !isServer) ? 'source-map' : false,
    stats: isDev ? 'errors-only' : 'normal',
    mode: isDev ? 'development' : 'production',
    target: isServer ? 'node' : 'web',
    entry: resolve('src/index.tsx'),
    output: {
      path: outputDirectory,
      publicPath: isServer 
      ? config.serverPublicPath 
      : config.clientPublicPath,
      filename: isServer 
        ? config.serverChunkName 
        : config.clientChunkName,
      libraryTarget: isServer ? 'commonjs2' : 'umd',
      pathinfo: false,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
      alias: {
        'server-renderer': isServer 
          ? 'server-renderer/lib/server.js' 
          : 'server-renderer/lib/client.js',
        src: config.srcDirectory,
      },
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          exclude: /node_modules/,
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
          },
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: getSassLoaders(isServer, isDev),
        }
      ],
    },
    plugins,
    optimization: (isDev || isServer)
      ? undefined
      : {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            react: {
              name: 'commons',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/
            }
          }
        },
        minimize: !isDev && !isServer,
      },
  }
  
  if (!isServer) {
    webpackConfig.node = {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    }
  }

  return mergeConfig(webpackConfig, config, opts)
}

function mergeConfig(
  webpackConfig: webpack.Configuration, 
  config: Configuration,
  opts: GenerateWebpackOpts
) {
  if (existsSync(config.customConfigFile)) {
    const customConfig = require(config.customConfigFile) as CustomConfiguration
    if ('function' === typeof customConfig.webpack) {
      return customConfig.webpack(webpackConfig, opts)
    }
    return mergeWebpackConfig(webpackConfig, customConfig.webpack)
  }
  return webpackConfig
}

function getBundlePlugins(
  { rootDirectory, isDev, isServer }: GenerateWebpackOpts,
  config: Configuration
) {
  let plugins = []
  if (!isServer) {
    // 客户端
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        tsconfig: path.join(rootDirectory, 'tsconfig.json'),
        tslint: path.join(rootDirectory, 'tslint.json'),
      })
    )
    if (!isDev) {
      plugins = plugins.concat(
        [
          new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
          }),
          new webpack.optimize.ModuleConcatenationPlugin(),
          new webpack.optimize.AggressiveMergingPlugin(),
          new HtmlWebpackPlugin({
            template: config.htmlTemplatePath,
            filename: config.htmlFilename,
          })
        ]
      )
    }
  }
  const envConfig = getEnvConfig(
    rootDirectory,
    isDev,
  )
  if (Object.keys(envConfig).length) {
    plugins.push(
      new webpack.DefinePlugin(envConfig)
    )
  }
  return plugins
}

function getOutputDirectoty(config: Configuration, isDev:boolean, isServer: boolean) {
  if (isDev || isServer) {
    return config.buildDirectory
  }
  return config.staticDirectory
}

function getSassLoaders(isServer: boolean, isDev: boolean) {
  const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
      modules: true,
      localIdentName: '[name]_[local]__[hash:base64:4]',
    },
  }
  if (isServer) {
    return [
      require.resolve('isomorphic-style-loader'),
      cssLoader,
      require.resolve('sass-loader'),
    ]
  } else {
    if (isDev) {
      return [
        require.resolve('style-loader'),
        cssLoader,
        require.resolve('sass-loader'),
      ]
    }
    return [
      MiniCssExtractPlugin.loader,
      cssLoader,
      require.resolve('sass-loader')
    ]
  }
}

function getEnvConfig(rootDirectory: string, isDev): { [n: string]: string } {
  const envFiles = ['.env', `.env.${isDev ? 'development' : 'production'}`]
  const config = envFiles.reduce((config, filename) => {
    if (existsSync(filename)) {
      const content = readFileSync(join(rootDirectory, filename), 'utf-8')
      content.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value && key.startsWith('APP_')) {
          config[`process.env.${key.trim()}`] = JSON.stringify(value.trim())
        }
      })
    }
    return config
  }, {})
  return config
}
