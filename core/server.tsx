import * as React from 'react'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { URL } from 'url'
import { StaticRouter, matchPath, RouteProps } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { getConfig } from 'scripts/config'
import Container from './Container'
// @ts-ignore
import send from 'koa-send'

import ServerRenderer = require('index')

const config = getConfig()
const isDev = process.env.NODE_ENV === 'development'

class Server {

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
    const app = new Koa()
    const router = new Router()
    if (!isDev) {
      const staticDirName = config.staticDirName
      const staticDirectory = config.staticDirectory
      app.use(async (ctx, next) => {
        const path = ctx.path
        if(path.startsWith(`/${staticDirName}/`)) {
          await send(
            ctx, 
            path.replace(`/${staticDirName}/`, ''), 
            { root: staticDirectory }
          )
        } else {
          await next()
        }
      })
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
      ctx.body = this.renderHTML(content, pageProps)
    } else {
      ctx.body = 'Page not found'
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