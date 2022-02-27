import { CognitoUser } from '@aws-amplify/auth'
import { Auth, Hub } from 'aws-amplify'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'

interface ContextUser {
  user: CognitoUser | null
  setUser: Dispatch<SetStateAction<CognitoUser | null>>
}

const UserContext = createContext<ContextUser>({} as ContextUser)

interface Props {
  children: React.ReactElement
}
export default function AuthContext({ children }: Props) {
  const [user, setUser] = useState<CognitoUser | null>(null)

  useEffect(() => {
    checkUser()
  }, [])
  useEffect(() => {
    Hub.listen('auth', () => {
      checkUser()
    })
  }, [])

  const checkUser = async () => {
    try {
      const amplifyUser = await Auth.currentAuthenticatedUser()

      if (amplifyUser) {
        // console.log('Check auth user', amplifyUser)
        setUser(amplifyUser)
      }
    } catch (error) {
      console.error('Error', error)

      setUser(null)
    }
  }
  console.log('USER', user)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): ContextUser => useContext(UserContext)
