import * as React from 'react'
import * as types from 'src/types'
import { Router } from './Router'

const Root: React.FC<types.RouterProps> = props => {
  return (
    <Router
      url={props.url}
      routes={props.routes}
      component={props.component}
      pageProps={props.pageProps}
      App={props.App}
    />
  )
}

export default Root