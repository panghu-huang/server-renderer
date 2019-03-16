import * as React from 'react'
import * as http from 'http'
import { renderToString } from 'react-dom/server'
import App from './App'

let i = 0

class Server {

  private app: http.Server
  private port = 3030
  private clientChunkPath: string

  constructor(clientChunkPath: string, port?: number) {
    this.clientChunkPath = clientChunkPath
    if (port) {
      this.port = port
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
      res.end(`
        <html>
          <body>
            <div class="app-container">${content}</div>
            <script src='${this.clientChunkPath}'></script>
          </body>
        </html>
      `)
    } else {
      res.end()
    }
  }
}

export default Server