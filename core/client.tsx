import * as React from 'react'
import { hydrate } from 'react-dom'
import { RouterContext } from './RouterContext'
import { router } from './router'
import { RenderOptions, GlobalAppData } from 'index.d'
import RouterContainer from './RouterContainer'
import Container from './Container'
import DefaultError from './Error'
import Link from './Link'

export function render(opts: RenderOptions) {
  const App = opts.App || React.Fragment
  const routes = opts.routes
  const url = window.location.href
  const appData: GlobalAppData = JSON.parse(
    decodeURIComponent(window.__APP_DATA__)
  )
  const Error = opts.Error || DefaultError
  const app = (
    <RouterContainer location={url}>
      <Container
        location={url}
        routes={routes}
        App={App}
        Error={Error}
        pageProps={appData.pageProps}
      />
    </RouterContainer>
  )
  hydrate(app, document.querySelector(opts.container))
}

export { router, Link, RouterContext }
export * from 'history'