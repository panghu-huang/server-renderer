import * as React from 'react'
import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { URL } from 'url'
import { RouterContext } from './RouterContext'
import { renderToString } from 'react-dom/server'
import { getConfig } from 'scripts/config'
import Router from './Router'
import Link from './Link'
import Error from './Error'
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
  private readonly Error: React.ComponentType<ServerRenderer.ErrorProps>
  private readonly routes: ServerRenderer.Route[]

  constructor(opts: ServerRenderer.RenderOptions) {
    this.clientChunkPath = new URL(
      config.clientChunkName,
      `http://localhost:${config.webpackServerPort}${config.clientPublicPath}`
    )
    this.container = opts.container
    this.AppContainer = opts.AppContainer || React.Fragment
    this.Error = opts.Error || Error
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
      console.clear()
      console.log('Server listen on: http://localhost:' + this.port)
    })
  }

  private async handleRequest(ctx: Koa.ParameterizedContext) {
    const routes = this.routes
    const url = ctx.url
    const matchedRoute = routes.find(route => {
      return path2Regexp(route.path, [], { strict: true }).test(url)
    })
    const AppContainer = this.AppContainer
    const Error = this.Error
    if (!matchedRoute) {
      const content = renderToString(
        <Error error='Page not found' />
      )
      return ctx.body = this.renderHTML(content, {}, 'Page not found')
    }
    const { pageProps, error } = await this.getInitialProps(
      AppContainer, matchedRoute, url
    )
    let app
    if (error) {
      app = renderToString(
        <Error error={error} />
      )
    } else {
      app = renderToString(
        <Router
          location={url}
          AppContainer={AppContainer}
          pageProps={pageProps}
          routes={routes}
        />
      )
    }
    ctx.body = this.renderHTML(app, pageProps, error)
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

  private renderHTML(content: string, pageProps: object, error: any) {
    const $ = cheerio.load(this.originalHTML)
    $(this.container).html(content)
    $('head').append(`
      <script type='text/javascript'>
          __APP_DATA__="${encodeURIComponent(
            JSON.stringify({ pageProps, error }))
          }"
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
    matchedRoute: ServerRenderer.Route,
    url: string): Promise<{ pageProps: object, error: any }> {
    if (AppContainer.getInitialProps) {
      try {
        const pageProps =  await AppContainer.getInitialProps({
          Component: matchedRoute.component,
          url,
        })
        return { pageProps, error: null }
      } catch (error) {
        return { pageProps: {}, error }
      }
    }
    return {
      pageProps: {},
      error: null,
    }
  }

}

export function render(opts: ServerRenderer.RenderOptions) {
  const server = new Server(opts)
  server.start()
}

export * from 'history'
export { Router, Link, RouterContext }