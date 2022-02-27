import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Amplify from 'aws-amplify'
import config from '../src/aws-exports'
import AuthContext from '../src/context/AuthContext'

import { Provider } from 'react-redux'
import { store } from '../src/redux/store'

Amplify.configure({
  ssr: true,
  ...config,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthContext>
        <Component {...pageProps} />
      </AuthContext>
    </Provider>
  )
}

export default MyApp
