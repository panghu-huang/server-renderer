import * as React from 'react'

const App: React.FC = ({ Component, pageProps }: any) => {
  console.log(2);
  
  return (
    <div>
      <Component {...pageProps}/>
    </div>
  )
}

export default App