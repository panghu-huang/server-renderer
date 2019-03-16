

declare namespace ItSSR {

  interface ServerOpts {
    clientChunkPath: string
    htmlPath: string
    port?: number
  }
  
  class Server {
    constructor(opts: ServerOpts);
  }

}

export = ItSSR