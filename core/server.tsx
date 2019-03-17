import * as React from 'react'
import * as http from 'http'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { URL } from 'url'
import { StaticRouter, Route, RouteProps, matchPath } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { getDevConfig } from 'scripts/dev-config'

import ServerRenderer = require('index')

const devConfig = getDevConfig()

class Server {

  private app: http.Server
  private readonly port = 3030
  private readonly clientChunkPath: URL
  private readonly container: string
  private readonly originalHTML: string
  private readonly AppContainer: React.ComponentType<ServerRenderer.AppContainerProps>
  private readonly routes: RouteProps[]

  constructor(opts: ServerRenderer.RenderOptions) {
    this.clientChunkPath = new URL(
      devConfig.clientChunkName,
      `http://localhost:${devConfig.webpackServerPort}${devConfig.clientPublicPath}`
    )
    this.container = opts.container
    this.AppContainer = opts.AppContainer || React.Fragment
    this.routes = opts.routes
    this.originalHTML = readFileSync(devConfig.htmlPath, 'utf-8')
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

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const routes = this.routes
    const isMatched = routes.some(route => {
      return !!matchPath(req.url, route)
    })
    if (isMatched) {
      const AppContainer = this.AppContainer
      const content = renderToString(
        <StaticRouter 
          location={req.url} 
          context={{}}>
          <AppContainer>
            {routes.map((route, index) => {
              return (
                <Route 
                  key={index}
                  {...route}
                />
              )
            })}
          </AppContainer>
        </StaticRouter>
      )
      const html = this.renderHTML(content)
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    } else {
      res.end('Page not found')
    }
  }

  private renderHTML(content: string) {
    const $ = cheerio.load(this.originalHTML)
    $(this.container).append(content)
    $('body').append(`
      <script type='text/javascript' src='${this.clientChunkPath}'></script>
    `)
    return $.html()
  }

}

export function render(opts: ServerRenderer.RenderOptions) {
  const server = new Server(opts)
  server.start()
}

export * from 'react-router-dom'