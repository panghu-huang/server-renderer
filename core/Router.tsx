import * as React from 'react'
import {
  Location,
  UnregisterCallback,
  createBrowserHistory,
  createMemoryHistory,
  History
} from 'history'
import { parse } from 'url'
import { RouterContext } from './RouterContext'
import { RouterStore, RouterProps, RouteComponent, Route } from 'index.d'
import path2Regexp from 'path-to-regexp'

interface RouteState {
  routerStore: RouterStore
  component: RouteComponent | null
  pageProps: object
  loading: boolean
}

class Router extends React.Component<RouterProps, RouteState> {

  public static push
  public static replace
  public static go
  public static goBack

  private readonly history: History
  private unlisten: UnregisterCallback

  constructor(props: RouterProps) {
    super(props)
    const { routes, location: path, pageProps, history } = props
    const location = this.initLocation(path)
    const matchedRoute = this.getMatchedRoute(routes, location.pathname)
    const component = matchedRoute && matchedRoute.component
    this.history = this.initHistory(history)
    this.state = {
      loading: false,
      component,
      pageProps,
      routerStore: {
        location,
      },
    }
  }

  public componentDidMount() {
    const { routes } = this.props
    this.unlisten = this.history.listen((location: Location) => {
      const matched = this.getMatchedRoute(routes, location.pathname)
      const component = matched ? matched.component : null
      this.setState({
        routerStore: {
          location,
        },
        component,
        loading: false,
        pageProps: {},
      }, () => {
        this.fetchInitialProps(matched, location.pathname)
      })
    })
  }

  public render() {
    const { routerStore } = this.state
    return (
      <RouterContext.Provider value={routerStore}>
        {this.renderContent()}
      </RouterContext.Provider>
    )
  }

  public componentWillUnmount() {
    this.unlisten()
  }

  private renderContent() {
    const { AppContainer, Error } = this.props
    const { component, pageProps, loading } = this.state
    if (!component) {
      return (
        <Error error='Page not found' />
      )
    }
    return (
      <AppContainer
        loading={loading}
        Component={component}
        {...pageProps}
      />
    )
  }

  private fetchInitialProps = async (matchedRoute: Route | null, url: string) => {
    if (!matchedRoute) {
      return null
    }
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
    const matched = routes.find(route => {
      return path2Regexp(route.path, [], { strict: true }).test(pathname)
    })
    return matched || routes.find(route => route.path === '*' || !route.path)
  }

  private initLocation(location: string) {
    const url = parse(location)
    return {
      state: null,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    }
  }

  private initHistory = (history: History) => {
    if ('undefined' === typeof window) {
      history = createMemoryHistory()
    }
    history = history || createBrowserHistory()
    Router.push = history.push
    Router.replace = history.replace
    Router.go = history.go
    Router.goBack = history.goBack
    return history
  }

}

export default Router