import { Compiler, compilation } from 'webpack'
import HTMLWebpackPlugin from 'html-webpack-plugin'

interface Options {
  script?: object
  style?: object
}

class HTMLAttributePlugin {

  private readonly options: Options

  constructor(options: Options = { script: {}, style: {} }) {
    this.options = options
  }

  public apply(compiler: Compiler) {
    const options = this.options
    if (typeof options !== 'object' || options == null) {
      return
    }
    compiler.hooks.compilation.tap(
      'HTMLAttributePlugin', 
      (compilation: compilation.Compilation) => {
        // @ts-ignore
        HTMLWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
          'HTMLAttributePlugin',
          (data: any, callback: Function) => {
            data.assetTags.scripts = data.assetTags.scripts.map((script: any) => {
              return {
                ...script,
                attributes: {
                  ...script.attributes,
                  ...options.script,
                }
              }
            })

            data.assetTags.styles = data.assetTags.styles.map((style: any) => {
              return {
                ...style,
                attributes: {
                  ...style.attributes,
                  ...options.style,
                }
              }
            })

            callback(null, data)
          }
        )
    })
  }
}

export default HTMLAttributePlugin