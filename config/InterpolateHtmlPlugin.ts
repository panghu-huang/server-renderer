import escapeStringRegexp from 'escape-string-regexp'
import { Compiler, compilation } from 'webpack'

class InterpolateHtmlPlugin {

  private readonly replacements: object
  constructor(replacements: object) {
    this.replacements = replacements
  }

  apply(compiler: Compiler) {
    const replacements = this.replacements
    compiler.hooks.compilation.tap('InterpolateHtmlPlugin', (compilation: compilation.Compilation) => {
      // @ts-ignore
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
        'InterpolateHtmlPlugin',
        (data: any, cb: (...args: any) => void) => {
          Object.keys(replacements).forEach(key => {
            // @ts-ignore
            const value = replacements[key]
            data.html = data.html.replace(
              new RegExp('%' + escapeStringRegexp(key) + '%', 'g'),
              value,
            )
          })
          cb(null, data)
        }
      )
    })
  }
}

export default InterpolateHtmlPlugin