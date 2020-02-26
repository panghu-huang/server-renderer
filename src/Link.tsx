import * as React from 'react'
import * as types from 'src/types'
import { history } from './Router'

const Link: React.FC<types.LinkProps> = ({
  to, onClick, ...otherProps
}) => {
  const handler = React.useCallback(
    (evt: React.MouseEvent) => {
      if (onClick) {
        onClick(evt as any)
      }
      if (!evt.isDefaultPrevented()) {
        evt.preventDefault()
        history.push(to)
      }
    },
    [to, onClick]
  )

  return (
    <a onClick={handler} href={to} {...otherProps}/>
  )
}

export default Link

