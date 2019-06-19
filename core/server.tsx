import * as React from 'react'
import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { URL } from 'url'
import { renderToString } from 'react-dom/server'
import { RouterContext } from './RouterContext'
import { history } from './history'
import { getConfig } from 'scripts/config'
import path2Regexp from 'path-to-regexp'
import send from 'koa-send'
import DefaultApp from './DefaultApp'
import Router from './Router'
import Container from './Container'
import Link from './Link'
import Error from './Error'

import ServerRenderer = require('index.d')

const config = getConfig()
const isDev = process.env.NODE_ENV === 'development'

class Server {

  private readonly clientChunkPath: URL
  private readonly container: string
  private readonly originalHTML: string
  private readonly App: ServerRenderer.AppComponentType
  private readonly Error: React.ComponentType<ServerRenderer.ErrorProps>
  private readonly routes: ServerRenderer.Route[]

  constructor(opts: ServerRenderer.RenderOptions) {
    this.clientChunkPath = new URL(
      config.clientChunkName,
      `http://localhost:${config.webpackServerPort}${config.clientPublicPath}`
    )
    this.container = opts.container
    this.App = opts.App || DefaultApp
    this.Error = opts.Error || Error
    this.routes = opts.routes
    const htmlPath = isDev ? config.htmlTemplatePath : config.htmlPath
    this.originalHTML = readFileSync(htmlPath, 'utf-8')
  }

  public start() {
    const app = new Koa()
    const router = new KoaRouter()
    const port = config.serverPort
    app.use(this.serveFiles)
    router.get('*', this.handleRequest.bind(this))
    app.use(router.routes())
    app.listen(port, () => {
      console.log('Server listen on: http://localhost:' + port)
    })
  }

  private async handleRequest(ctx: Koa.ParameterizedContext) {
    const routes = this.routes
    const url = ctx.url
    const fullUrl = ctx.origin + url
    const matchedRoute = routes.find(route => {
      return path2Regexp(route.path, [], { strict: true }).test(url)
    })
    const App = this.App
    const Error = this.Error
    const pageProps = await this.getInitialProps(
      ctx, App, matchedRoute, fullUrl,
    )
    const content = renderToString(
      <Router location={fullUrl}>
          <Container
            location={fullUrl}
            App={App}
            Error={Error}
            pageProps={pageProps}
            routes={routes}
          />
        </Router>
    )
    ctx.body = this.renderHTML(content, pageProps)
  }

  private async serveFiles(ctx: Koa.ParameterizedContext, next: () => Promise<void>) {
    const staticDirName = config.staticDirName
    const publicFilesDirectory = isDev
      ? config.buildDirectory
      : config.staticDirectory
    const path = ctx.path
    if (path.startsWith(`/${staticDirName}/`)) {
      await send(
        ctx,
        path.replace(`/${staticDirName}/`, ''),
        { root: publicFilesDirectory }
      )
    } else {
      await next()
    }
  }

  private renderHTML(content: string, pageProps: object) {
    const $ = cheerio.load(this.originalHTML, { decodeEntities: true })
    $(this.container).html(content)
    $('head').append(`
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
    ctx: Koa.ParameterizedContext,
    AppContainer: ServerRenderer.AppComponentType,
    matchedRoute: ServerRenderer.Route,
    url: string
  ): Promise<object> {
    if (matchedRoute && AppContainer.getInitialProps) {
      return await AppContainer.getInitialProps({
        Component: matchedRoute.component,
        url,
        ctx,
      })
    }
    return {}
  }

}

export function render(opts: ServerRenderer.RenderOptions) {
  const server = new Server(opts)
  server.start()
}

export * from 'history'
export { history, Link, RouterContext }
