import * as React from 'react'
import { mount } from 'enzyme'
import Container from '../core/Container'
import Error from '../core/Error'
import App from '../core/DefaultApp'

describe('Container', () => {
  const routes = [
    {
      path: '/',
      name: 'home',
      component: () => {
        return (
          <div className='home'>home</div>
        )
      }
    },
    {
      path: '/props',
      name: 'props',
      component: (props) => {
        console.log('props page', props)
        return (
          <div className='props'>{props.name} - {props.age}</div>
        )
      }
    },
    {
      path: '/others',
      name: 'others',
      component: () => {
        return (
          <div className='others'>others</div>
        )
      }
    },
  ]

  it('当前 Route 是否正确: /', () => {
    const wrapper = mount(
      <Container
        routes={routes}
        location='http://locahost/'
        Error={Error}
        App={App}
        pageProps={{}}
      />
    )
    expect(wrapper.find('.home').text()).toEqual('home')
  })

  it('当前 Route 是否正确: /others', () => {
    const wrapper = mount(
      <Container
        routes={routes}
        location='http://locahost/others'
        Error={Error}
        App={App}
        pageProps={{}}
      />
    )
    expect(wrapper.find('.others').text()).toEqual('others')
  })

  it('当前 Route 是否正确: 404', () => {
    const wrapper = mount(
      <Container
        routes={routes}
        location='http://locahost/notfound'
        Error={Error}
        App={App}
        pageProps={{}}
      />
    )
    expect(wrapper.text()).toEqual('Page not found')
  })

  it('props 传递', () => {
    // 经过 getInitialProps 会包裹一层 data
    const data = { name: 'Wokeyi', age: '18' }
    const wrapper = mount(
      <Container
        routes={routes}
        location='http://locahost/props'
        Error={Error}
        App={App}
        pageProps={{ data }}
      />
    )
    expect(wrapper.find('.props').text()).toEqual('Wokeyi - 18')
  })

})