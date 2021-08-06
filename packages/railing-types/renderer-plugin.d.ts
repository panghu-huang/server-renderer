export interface IRailingRenderOptions<T> {
  AppComponent: T
  container: string
  routes: string[]
}

export interface IRailingRendererPlugin<T = any> {
  name: string
  render(options: IRailingRenderOptions<T>): void
}