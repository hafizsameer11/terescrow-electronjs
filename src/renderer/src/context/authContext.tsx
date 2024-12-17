import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export enum UserRoles {
  admin = 'admin',
  agent = 'agent',
  customer = 'customer'
}

interface AuthContextType {
  token: string
  userData: {
    id: number
    firstname: string
    lastname: string
    username: string
    email: string
    role: UserRoles | string
    profilePicture: string | null
  } | null
  dispatch: React.Dispatch<AuthAction>
}

// Define Auth State and Actions
interface AuthState {
  token: string
  userData: AuthContextType['userData']
}

type AuthAction =
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_USER_DATA'; payload: AuthContextType['userData'] }
  | { type: 'LOGOUT' }

// Initial State
const initialState: AuthState = {
  token: '',
  userData: null
}

// Reducer Function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload }
    case 'LOGOUT':
      return { ...initialState }
    default:
      throw new Error(`Unhandled action type: ${(action as any).type}`)
  }
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  return (
    <AuthContext.Provider value={{ dispatch, token: state.token, userData: state.userData }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom Hook to Access Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
