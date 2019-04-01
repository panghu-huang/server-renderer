import * as React from 'react'
import { ErrorProps } from 'index.d'

const Error: React.SFC<ErrorProps> = ({ error }) => {
  return (
    <div data-error>{String(error)}</div>
  )
}

export default Error