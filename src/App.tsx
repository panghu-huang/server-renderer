import * as React from 'react'

class App extends React.Component {

  public render() {
    return (
      <div>
        <p>this is div</p>
        <button onClick={this.showAlert}>click me</button>
      </div>
    )
  }

  private showAlert() {
    alert(21312)
  }
}

export default App