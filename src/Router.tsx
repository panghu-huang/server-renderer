import * as React from 'react'
import * as H from 'history'
import * as types from 'src/types'
import { unstable_batchedUpdates } from 'react-dom'
import { parse as parseUrl, Url } from 'url'
import { match as createMatchFn } from 'path-to-regexp'
import { findMatchedRoute, callGetInitialProps } from 'src/utils'

const RouterContext = React.createContext({} as {
  location: H.Location,
  params: object
})

export const history = 'undefined' === typeof window
  ? H.createMemoryHistory()
  : H.createBrowserHistory()

export const useLocation = () => {
  return React.useContext(RouterContext).location
}

export const useParams = () => {
  return React.useContext(RouterContext).params
}

function matchParams(path: string, pathname: string) {
  const matchFn = createMatchFn(path)
  const matched = matchFn(pathname)
  return matched ? matched.params : {}
}

export const Router: React.FC<types.RouterProps> = props => {
  const component = React.useRef<React.ComponentType<any> | null>(props.component)
  const pageProps = React.useRef(props.pageProps)
  
  const [location, setLocation] = React.useState<H.Location>(() => {
    const parsedUrl: Url = parseUrl(props.url)
    return {
      pathname: parsedUrl.pathname || '/',
      search: parsedUrl.search || '',
      hash: parsedUrl.hash || '',
      state: null,
    }
  })
  const [params, setParams] = React.useState<object>(() => {
    const matchedRoute = findMatchedRoute(props.url, props.routes)
    return matchParams(matchedRoute ? matchedRoute.path : '', location.pathname)
  })

  React.useEffect(
    () => {
      const unlisten = history.listen(async (newLocation: H.Location) => {
        if (newLocation.pathname === location.pathname) {
          // H.locationsAreEqual(location, newLocation)
          // 忽略 search 变化
          return
        }
        const matched = findMatchedRoute(
          newLocation.pathname, 
          props.routes
        )
        if (matched) {
          const initialProps = await callGetInitialProps(
            props.App,
            matched.component,
            newLocation.pathname,
          )
          pageProps.current = initialProps
          component.current = matched.component
        } else {
          component.current = null
        }
        unstable_batchedUpdates(() => {
          setLocation(newLocation)
          setParams(
            matched ? matchParams(matched.path, newLocation.pathname) : {}
          )
        })
      })
      return unlisten
    },
    [location.pathname]
  )

  const store = React.useMemo(
    () => ({ location, params }), 
    [location]
  )

  return (
    <RouterContext.Provider value={store}>
      <props.App 
        {...pageProps.current}
        Component={component.current}
      />
    </RouterContext.Provider>
  )
}
