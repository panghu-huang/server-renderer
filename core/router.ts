import { 
  History, 
  Location,
  createBrowserHistory, 
  createMemoryHistory 
} from 'history'
import { Subscriber } from 'index.d'

class Router {

  public readonly history: History
  private subscriptions: Subscriber[] = []

  constructor() {
    const history = 'undefined' === typeof window
      ? createMemoryHistory()
      : createBrowserHistory()
    history.listen(this.handleHistoryChange)
    this.history = history
  }

  public push = (path: string, state?: any) => {
    this.history.push(path, state)
  }

  public replace = (path: string, state?: any) => {
    this.history.replace(path, state)
  }

  public go = (n: number) => {
    this.history.go(n)
  }

  public goBack = () => {
    this.history.goBack()
  }

  public subscribe = (subscriber: Subscriber) => {
    this.subscriptions.push(subscriber)
  }

  private handleHistoryChange = (location: Location) => {
    const subscriptions = this.subscriptions
    subscriptions.forEach(subscriber => subscriber(location))
  }

}

export const router = new Router()