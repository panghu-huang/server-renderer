import * as http from 'http'
import * as path from 'path'
import * as types from 'src/types'
import { createReadStream, existsSync } from 'fs'
import { getConfig } from 'config/config'
import { renderToString } from './renderToString'

const config = getConfig()

function createServer(options: types.RenderOptions) {
  const app = http.createServer(async (req, res) => {
    if (req.url?.startsWith(config.publicPath)) {
      const filePath = path.join(
        config.distDir,
        'client',
        req.url.replace(config.publicPath, '')
      )
      if (existsSync(filePath)) {
        const stream = createReadStream(filePath)
        stream.pipe(res)
        stream.on('close', () => {
          res.end()
        })
      } else {
        res.statusCode = 404
        res.end()
      }
    } else {
      const html = await renderToString(req.url || '/', options)
      res.end(html)
    }
  })

  app.listen(config.port, () => {
    console.log(`Application running on http://localhost:${config.port}`)
  })
}

export function render(options: types.RenderOptions) {
  createServer(options)
}

export { renderToString } from './renderToString'
export { default as Link } from './Link'
export { history, useLocation, useParams } from './Router'
