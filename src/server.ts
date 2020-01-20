import * as http from 'http'
import * as types from 'src/types'
import { getConfig } from 'config/config'
import { renderToString } from './renderToString'
import { sendStaticFile } from './static'

const config = getConfig()

function createServer(options: types.RenderOptions) {
  const app = http.createServer(async (req, res) => {
    if (req.url?.startsWith(config.publicPath)) {
      sendStaticFile(req, res)
    } else {
      const html = await renderToString(
        req,
        res,
        req.url || '/', 
        options
      )
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
