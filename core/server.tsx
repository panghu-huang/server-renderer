import * as React from 'react'
import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { URL } from 'url'
import { renderToString } from 'react-dom/server'
import { getConfig } from 'scripts/config'
import Router from './Router'
// @ts-ignore
import send from 'koa-send'
// @ts-ignore
import path2Regexp from 'path-to-regexp'

import ServerRenderer = require('index.d')

const config = getConfig()
const isDev = process.env.NODE_ENV === 'development'

class Server {

  private readonly port = config.serverPort
  private readonly clientChunkPath: URL
  private readonly container: string
  private readonly originalHTML: string
  private readonly AppContainer: ServerRenderer.AppContainerType
  private readonly routes: ServerRenderer.Route[]

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
    const app = new Koa()
    const router = new KoaRouter()
    if (!isDev) {
      app.use(this.serveFiles)
    }
    router.get('*', this.handleRequest.bind(this))
    app.use(router.routes())
    app.listen(this.port, () => {
      console.log('Server listen on: http://localhost:' + this.port)
    })
  }

  private async handleRequest(ctx: Koa.ParameterizedContext) {
    const routes = this.routes
    const pathname = ctx.url
    const matchedRoute = routes.find(route => {
      return path2Regexp(pathname).test(route.path)
    })
    if (matchedRoute) {
      const AppContainer = this.AppContainer
      const pageProps = await this.getInitialProps(pathname, matchedRoute)
      const content = renderToString(
        <Router 
          location={pathname} 
          AppContainer={AppContainer}
          pageProps={pageProps}
          routes={routes}
        />
      )
      ctx.body = this.renderHTML(content, pageProps)
    } else {
      ctx.body = 'Page not found'
    }
  }

  private async serveFiles(ctx: Koa.ParameterizedContext, next: () => Promise<void>) {
    const staticDirName = config.staticDirName
    const staticDirectory = config.staticDirectory
    const path = ctx.path
    if (path.startsWith(`/${staticDirName}/`)) {
      await send(
        ctx,
        path.replace(`/${staticDirName}/`, ''),
        { root: staticDirectory }
      )
    } else {
      await next()
    }
  }

  private renderHTML(content: string, pageProps: object) {
    const $ = cheerio.load(this.originalHTML)
    $(this.container).html(content)
    $('head').append(`
      <script type='text/javascript'>
          __APP_DATA__='${encodeURIComponent(JSON.stringify({ pageProps }))}'
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
    pathname: string,
    matchedRoute: ServerRenderer.Route
  ) {
    const { component } = matchedRoute
    if (component.getInitialProps) {
      return await component.getInitialProps(pathname)
    }
    return {}
  }

}

export function render(opts: ServerRenderer.RenderOptions) {
  const server = new Server(opts)
  server.start()
}

export * from 'history'
export {
  Router
}