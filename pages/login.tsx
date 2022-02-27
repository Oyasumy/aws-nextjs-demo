import { Button } from '@mui/material'
import { Auth } from 'aws-amplify'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useUser } from '../src/context/AuthContext'
import styles from '../styles/Login.module.css'

const Login = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const [stepCode, setStepCode] = useState(false)

  const { setUser, user } = useUser()

  const router = useRouter()

  async function signUp() {
    try {
      if (stepCode) {
        confirmSignUp()
        return
      }

      const { user } = await Auth.signUp({
        username: userName,
        password,
        attributes: {
          email, // optional
          // other custom attributes
        },
      })
      confirm('Sign up success and Confirm CODE!!')

      setStepCode(true)
      console.log(user)
    } catch (error) {
      confirm(`Sign up Failed!! ${error}`)

      console.log('error signing up:', error)
    }
  }

  async function signIn() {
    try {
      const user = await Auth.signIn(userName, password)
      console.log('user', user)

      if (user) {
        setUser(user)
      }
      console.log('call sign')
      confirm('Sign in success!!')
      router.push('/posts/')
    } catch (error) {
      confirm(`Sign in Failed!! ${error}`)

      console.log('error signing in', error)
    }
  }

  async function confirmSignUp() {
    try {
      await Auth.confirmSignUp(userName, code)
      confirm('Confirm Code success!!')
    } catch (error) {
      confirm(`Confirm Failed!! ${error}`)

      console.log('error confirming sign up', error)
    }
  }

  async function signOut() {
    try {
      await Auth.signOut()
      confirm('Logout success!!')
    } catch (error) {
      confirm(`Logout Failed!! ${error}`)

      console.log('error signing out: ', error)
    }
  }

  return (
    <div>
      <div className={`${styles.container}`}>
        <h1>SignUp</h1>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="user name">User Name</label>
          <input
            type="text"
            name="username"
            id=""
            value={userName}
            onChange={(e: any) => setUserName(e.target.value)}
          />
        </div>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="password">Password</label>
          <input
            type="text"
            name="password"
            id=""
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </div>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            id=""
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </div>
        {stepCode && (
          <>
            <label htmlFor="email">Code</label>
            <input
              type="text"
              name="code"
              id=""
              value={code}
              onChange={(e: any) => setCode(e.target.value)}
            />
          </>
        )}
        <button className={`${styles.buttonSubmit}`} onClick={() => signUp()}>SignUp</button>
      </div>

      <div className={`${styles.container}`}>
        <h1>Login</h1>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="user name">User Name</label>
          <input
            type="text"
            name="username"
            id=""
            value={userName}
            onChange={(e: any) => setUserName(e.target.value)}
          />
        </div>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="password">Password</label>
          <input
            type="text"
            name="password"
            id=""
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </div>

        <button className={`${styles.buttonSubmit}`} onClick={() => signIn()}>Login</button>
      </div>

      {user && (
        <div className={`${styles.buttonSubmit}`}>
          <Button  variant="outlined" color="error" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      data: null,
    },
  }
}

export default Login
