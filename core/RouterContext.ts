import { createContext } from 'react'
import { RouterStore } from 'index.d'

const routerStore: RouterStore = {
  location: {
    pathname: '',
    search: '',
    state: null,
    hash: '',
  },
}

export const RouterContext = createContext(routerStore)