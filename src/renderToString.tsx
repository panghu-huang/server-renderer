import * as React from 'react'
import * as fs from 'fs'
import * as cheerio from 'cheerio'
import * as types from 'src/types'
import { getConfig } from 'config/config'
import { findMatchedRoute, callGetInitialProps } from 'src/utils'
import ReactDOMServer from 'react-dom/server'
import Root from 'src/Root'
import DefaultApp from 'src/App'

const config = getConfig()
const htmlPath = config.isDev ? config.htmlTemplatePath : config.builtHTMLPath
const template = fs.readFileSync(htmlPath, 'utf8')

function writeDataToHTML($: CheerioStatic, pageProps: object) {
  const data = JSON.stringify({
    pageProps,
  })
  const scripts = $('script')
  if (scripts.length) {
    $(scripts.get(0)).before(`
      <script type="text/javascript">
        window.__APP_DATA__ = ${data}
      </script>
      `
    )
  } else {
    $('body').append(
      `<script type="text/javascript">
          window.__APP_DATA__ = ${data}
      </script>`
    )
  }
}

function appendScriptOnDevelop($: CheerioStatic) {
  if (config.isDev) {
    const scriptUrl = config.publicPath + 'app.js'
    $('body').append(`
      <script type="text/javascript" src="${scriptUrl}"></script>
    `)
  }
}

export async function renderToString(url: string, options: types.RenderOptions): Promise<string> {
  const $ = cheerio.load(template, {
    decodeEntities: config.decodeEntities,
  })
  const matched = findMatchedRoute(url, options.routes)
  const App = options.App || DefaultApp
  const initialProps = await callGetInitialProps(
    App,
    matched && matched.component,
    url,
  )
  const content = ReactDOMServer.renderToString(
    <Root
      url={url}
      routes={options.routes || []}
      component={matched ? matched.component : null}
      pageProps={initialProps}
      App={App}
    />
  )
  $(options.container).html(content)
  appendScriptOnDevelop($)
  writeDataToHTML($, initialProps)
  return $.html()
}
