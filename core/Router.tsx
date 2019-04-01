import * as React from 'react'
import {
  Location,
  UnregisterCallback,
  createBrowserHistory,
  createMemoryHistory
} from 'history'
import { RouterContext } from './RouterContext'
import { RouterStore, RouterProps, RouteComponent, Route } from 'index.d'
// @ts-ignore
import path2Regexp from 'path-to-regexp'

interface RouteState {
  routerStore: RouterStore
  component: RouteComponent | null
  pageProps: object
  loading: boolean
}

const history = 'undefined' === typeof window
  ? createMemoryHistory()
  : createBrowserHistory()

class Router extends React.Component<RouterProps, RouteState> {

  public static push = history.push
  public static replace = history.replace
  public static go = history.go
  public static goBack = history.goBack

  private unlisten: UnregisterCallback

  constructor(props: RouterProps) {
    super(props)
    const { routes, location, pageProps } = props
    const matchedRoute = this.getMatchedRoute(routes, location)
    this.state = {
      routerStore: {
        location: {
          pathname: location,
          search: '',
          state: null,
          hash: '',
        },
      },
      component: matchedRoute
        ? matchedRoute.component
        : null,
      pageProps,
      loading: false,
    }
  }

  public componentDidMount() {
    const { routes } = this.props
    this.unlisten = history.listen((location: Location) => {
      const matched = this.getMatchedRoute(routes, location.pathname)
      const component = matched ? matched.component : null
      this.setState(({ routerStore }) => {
        return {
          routerStore: {
            ...routerStore, location,
          },
          component,
          loading: false,
          pageProps: undefined,
        }
      }, () => {
        this.fetchInitialProps(matched, location.pathname)
      })
    })
  }

  public render() {
    const { AppContainer } = this.props
    const { routerStore, component, pageProps, loading } = this.state
    return (
      <RouterContext.Provider value={routerStore}>
        <AppContainer 
          loading={loading}
          Component={component}
          {...pageProps}
        />
      </RouterContext.Provider>
    )
  }

  public componentWillUnmount() {
    this.unlisten()
  }

  private fetchInitialProps = async (matchedRoute: Route, url: string) => {
    const { AppContainer } = this.props
    if (AppContainer && AppContainer.getInitialProps) {
      this.setState({ loading: true })
      const initialProps = await AppContainer.getInitialProps({
        url,
        Component: matchedRoute.component,
      })
      this.setState({
        pageProps: initialProps,
        loading: false,
      })
    }
  }

  private getMatchedRoute(routes: Route[], pathname: string): Route | null {
    return routes.find(route => {
      return path2Regexp(route.path, [], { strict: true }).test(pathname)
    })
  }

}

export default Router