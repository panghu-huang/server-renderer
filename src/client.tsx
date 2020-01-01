import * as React from 'react'
import * as types from 'src/types'
import { hydrate } from 'react-dom'
import { findMatchedRoute } from 'src/utils'
import Root from 'src/Root'
import DefaultApp from 'src/App'

export function render(options: types.RenderOptions) {
  const appData = window.__APP_DATA__
  const matched = findMatchedRoute(
    window.location.pathname, 
    options.routes,
  )
  const App = options.App || DefaultApp
  const app = (
    <Root
      url={window.location.href}
      routes={options.routes || []}
      pageProps={appData.pageProps}
      component={matched ? matched.component : null}
      App={App}
    />
  )
  hydrate(
    app,
    document.querySelector(options.container)
  )
}

export { default as Link } from './Link'
export { history, useLocation, useParams } from './Router'
