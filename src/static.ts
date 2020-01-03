import { join } from 'path'
import { IncomingMessage, ServerResponse } from 'http'
import { getType as getContentType } from 'mime'
import { createReadStream, existsSync, statSync } from 'fs'
import { getConfig } from 'config/config'

const config = getConfig()

export function sendStaticFile(req: IncomingMessage, res: ServerResponse) {
  const filePath = join(
    config.distDir,
    'client',
    (req.url as string).replace(config.publicPath, '')
  )
  if (existsSync(filePath)) {
    if (!config.isDev) {
      const time = statSync(filePath).mtime
      const lastModified = new Date(time).toUTCString()
      res.setHeader('Last-Modified', lastModified)
      res.setHeader('Cache-Control', 'public')

      const ifModifiedSince = req.headers['if-modified-since']
      if (ifModifiedSince === lastModified) {
        res.statusCode = 304
        res.end()
        return
      }
    }
    res.setHeader('Content-Type', getContentType(filePath) ?? 'text/plain')
    const stream = createReadStream(filePath)
    stream.pipe(res)
    stream.on('close', () => {
      res.end()
    })
  } else {
    res.statusCode = 404
    res.end()
  }
}