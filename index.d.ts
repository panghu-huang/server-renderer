import { RenderOptions } from 'core/types'

declare namespace ItSSR {

  interface ServerOpts {
    clientChunkPath: string
    htmlPath: string
    port?: number
  }
  
  class Server {
    constructor(opts: ServerOpts);
  }

  export function render(opts: RenderOptions): void;

}

export = ItSSR