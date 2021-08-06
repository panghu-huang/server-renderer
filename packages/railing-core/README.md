```typescript
import { Railing } from '@railing/core'
import { ReactRenderer, RailingReactRendererPlugin } from '@railing/react-renderer'
import { IRailingConfigAPI } from '@railing/types'

/**
 * only client side render
 */
const renderer = new ReactRenderer({
  ssr: false,
  App: null,
  routes: [],
  config: {}
})

renderer.render()

// only server side renderer
const railing = new Railing({ 
  renderer,
  dev
})

railing.hooks.htmlTemplate.tap('updateHTMLTemplate', (a: { html: string, req: Request, res: Response }) => {

})

railing.hooks.htmlRendered.tap('updateHTML', (a: { html: string, req: Request, res: Response }) => {

})

railing.middlewares // return connect middlewares

railing.start({
  port
}) // create server and start

// use express or others
const app = express()

app.use(railing.middlewares)

app.listen()
/**
 * config
 */
const railingConfig = {
  entry: '',
  outDir: '',
  runtimeConfig: {

  },
  plugins: [
    new RailingReactRendererPlugin({
      template: 'index.html'
    }),
    (api: IRailingConfigAPI) => {
      api.hooks.webpack.tap('XxPlugin', webpackConfig => {

      })

      api.hooks.railingConfig.tap('XxPlugin', railingConfig => {

      })
    }
  ]
}
```