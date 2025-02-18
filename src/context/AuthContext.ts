import { createContext, useContext } from 'react'
import { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
