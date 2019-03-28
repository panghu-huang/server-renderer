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
  loading: boolean
  data: any
  error: null | string | Error
  component: RouteComponent | null
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
    const { routes, location, pageProps, error } = props
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
      loading: false,
      data: pageProps,
      error,
      component: matchedRoute
        ? matchedRoute.component
        : null
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
          data: null,
          error: null,
          loading: false,
        }
      }, () => {
        this.fetchInitialProps(component, location.pathname)
      })
    })
  }

  public render() {
    const { AppContainer } = this.props
    const { routerStore, component, data, loading, error } = this.state
    return (
      <RouterContext.Provider value={routerStore}>
        <AppContainer>
          {this.renderContent(component, data, loading, error)}
        </AppContainer>
      </RouterContext.Provider>
    )
  }

  public componentWillUnmount() {
    this.unlisten()
  }

  private renderContent(
    Component: RouteComponent | null,
    data: any,
    loading: boolean,
    error: Error | null | string
  ) {
    if (Component) {
      return (
        <Component
          data={data}
          loading={loading}
          error={error}
        />
      )
    }
    return null
  }

  private fetchInitialProps = async (comp: RouteComponent | null, pathname: string) => {
    if (comp && comp.getInitialProps) {
      this.setState({ loading: true })
      try {
        const initialProps = await comp.getInitialProps(pathname)
        this.setState(({ component }) => {
          if (comp !== component) {
            return null
          }
          return {
            data: initialProps,
            loading: false,
          }
        })
      } catch (error) {
        this.setState(({ component }) => {
          if (comp !== component) {
            return null
          }
          return { loading: false, error }
        })
      }
    }
  }

  private getMatchedRoute(routes: Route[], pathname: string): Route | null {
    return routes.find(route => {
      return path2Regexp(pathname).test(route.path)
    })
  }

}

export default Router