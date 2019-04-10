import * as React from 'react'
import { parse } from 'url'
import { Location } from 'history'
import { RouterContext } from './RouterContext'
import { router } from './router'
import { RouterContainerProps, RouterStore } from 'index.d'

type Props = RouterContainerProps

class Router extends React.Component<Props, RouterStore> {

  constructor(props: Props) {
    super(props)
    const url = parse(props.location)
    this.state = {
      location: {
        state: null,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      },
    }
    router.subscribe(this.handleHistoryChange)
  }

  public shouldComponentUpdate(nextProps: Props, nextState: RouterStore) {
    return this.state.location !== nextState.location
  }

  public render() {
    return (
      <RouterContext.Provider value={this.state}>
        {this.props.children}
      </RouterContext.Provider>
    )
  }

  private handleHistoryChange = (location: Location) => {
    this.setState({ location })
  }

}

export default Router