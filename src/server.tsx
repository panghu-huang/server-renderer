import * as React from 'react'
import * as http from 'http'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { renderToString } from 'react-dom/server'
import App from './App'

interface ServerOpts {
  container: string
  clientChunkPath: string
  htmlPath: string
  port?: number
}

class Server {

  private app: http.Server
  private port = 3030
  private clientChunkPath: string
  private container: string
  private originalHTML: string

  constructor(opts: ServerOpts) {
    this.clientChunkPath = opts.clientChunkPath
    this.container = opts.container
    this.originalHTML = readFileSync(opts.htmlPath, 'utf-8')
    if (opts.port) {
      this.port = opts.port
    }
  }

  public start() {
    this.app = http.createServer(this.handleRequest)
    this.app.listen(this.port)
  }

  public async close() {
    if (this.app) {
      await this.app.close()
    }
  }

  private handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.url === '/') {
      const content = renderToString(<App />)
      res.setHeader('Content-Type', 'text/html')
      const html = this.renderHTML(content)
      res.end(html)
    } else {
      res.end()
    }
  }

  private renderHTML = (content: string) => {
    const $ = cheerio.load(this.originalHTML)
    $(this.container).append(content)
    $('body').append(`
      <script type='text/javascript' src='${this.clientChunkPath}'></script>
    `)
    return $.html()
  }
}

export default Server