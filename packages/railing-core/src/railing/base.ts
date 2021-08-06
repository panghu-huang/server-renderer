import { IRailing, IRailingOptions } from '@railing/types'

abstract class Railing implements IRailing {

  protected readonly options: IRailingOptions

  constructor(options: IRailingOptions) {
    this.options = options
  }

  public abstract get middlewares(): any

  public get hooks() {
    return {
      htmlTemplate: null,
      htmlRendered: null,
    }
  }

  public abstract start(): void
}

export default Railing