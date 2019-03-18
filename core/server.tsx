import * as React from 'react'
import * as http from 'http'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { URL } from 'url'
import { StaticRouter, matchPath, RouteProps } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { getConfig } from 'scripts/config'
import Container from './Container'

import ServerRenderer = require('index')

const config = getConfig()
const isDev = process.env.NODE_ENV === 'development'

class Server {

  private app: http.Server
  private readonly port = 3030
  private readonly clientChunkPath: URL
  private readonly container: string
  private readonly originalHTML: string
  private readonly AppContainer: ServerRenderer.AppContainerType
  private readonly routes: RouteProps[]

  constructor(opts: ServerRenderer.RenderOptions) {
    this.clientChunkPath = new URL(
      config.clientChunkName,
      `http://localhost:${config.webpackServerPort}${config.clientPublicPath}`
    )
    this.container = opts.container
    this.AppContainer = opts.AppContainer || React.Fragment
    this.routes = opts.routes
    const htmlPath = isDev ? config.htmlTemplatePath : config.htmlPath
    this.originalHTML = readFileSync(htmlPath, 'utf-8')
  }

  public start() {
    this.app = http.createServer(this.handleRequest.bind(this))
    this.app.listen(this.port, () => {
      console.log('Server listen on: http://localhost:' + this.port)
    })
  }

  public async close() {
    if (this.app) {
      await this.app.close()
    }
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const routes = this.routes
    const pathname = req.url
    const matchedIndex = routes.findIndex(route => {
      return !!matchPath(pathname, route)
    })
    if (matchedIndex !== -1) {
      const AppContainer = this.AppContainer
      const matchedRoute = routes[matchedIndex]
      const pageProps = await this.getInitialProps(AppContainer, pathname, matchedRoute)
      const content = renderToString(
        <StaticRouter 
          location={pathname} 
          context={{}}>
          <Container 
            routes={routes}
            matchedIndex={matchedIndex}
            pageProps={pageProps}
            AppContainer={AppContainer}
          />
        </StaticRouter>
      )
      const html = this.renderHTML(content, pageProps)
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    } else {
      res.end('Page not found')
    }
  }

  private renderHTML(content: string, pageProps: object) {
    const $ = cheerio.load(this.originalHTML)
    $(this.container).html(content)
    $('body').append(`
      <script type='text/javascript'>
          __APP_DATA__="${encodeURIComponent(JSON.stringify({ pageProps }))}"
      </script>
    `)
    if (isDev) {
      $('body').append(`
        <script type='text/javascript' src='${this.clientChunkPath}'></script>
      `)
    }
    return $.html()
  }

  private async getInitialProps(
    AppContainer: ServerRenderer.AppContainerType,
    pathname: string,
    matchedRoute: RouteProps
  ) {
    const { getInitialProps } = AppContainer
    if (getInitialProps) {
      return await getInitialProps({ pathname, route: matchedRoute })
    }
    return {}
  }

}

export function render(opts: ServerRenderer.RenderOptions) {
  const server = new Server(opts)
  server.start()
}

export * from 'react-router-dom'