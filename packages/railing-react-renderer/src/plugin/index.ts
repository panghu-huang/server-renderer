export class RailingReactRendererPlugin {
  apply(railing) {
    // or
    railing.setRenderer(renderer)
    railing.setClientEntry('../client.tsx'),
    railing.setServerEntry('../server.tsx')

    railing.webpackConfig.setAilas({
      __build__: path.join(rootDir, 'build')
    })
  }

  runtime() {
    
  }
}