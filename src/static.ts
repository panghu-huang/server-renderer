import { join } from 'path'
import { IncomingMessage, ServerResponse } from 'http'
import { getType as getContentType } from 'mime'
import { createReadStream, exists, stat } from 'fs'
import { promisify } from 'util'
import { getConfig } from 'config/config'

const config = getConfig()
const existsAsync = promisify(exists)
const statAsync = promisify(stat)

export async function sendStaticFile(req: IncomingMessage, res: ServerResponse) {
  const filePath = join(
    config.distDir,
    'client',
    (req.url as string).replace(config.publicPath, '')
  )
  const isExists = await existsAsync(filePath)
  if (isExists) {
    if (!config.isDev) {
      const stats = await statAsync(filePath)
      const lastModified = new Date(stats.mtime).toUTCString()
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