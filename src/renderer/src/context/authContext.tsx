import { AccountActivity, Role } from '@renderer/api/queries/datainterfaces'
import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { isReadOnlyDemoUser } from '@renderer/utils/appleReviewUser'

export enum UserRoles {
  admin = 'admin',
  agent = 'agent',
  auditor = 'auditor',
  customer = 'customer'
}

/** Browse-only support agent (no writes). */
export function isReadOnlyDemoMode(userData: AuthContextType['userData']): boolean {
  return isReadOnlyDemoUser(userData)
}

/** Block mutations in the admin app (buttons, API writes). */
export function canPerformAdminActions(userData: AuthContextType['userData']): boolean {
  return !isReadOnlyDemoMode(userData)
}

/** Admin + agent can open crypto exchange rate tiers on /rates */
export function canManageExchangeRates(role: string | undefined | null, userData?: AuthContextType['userData']): boolean {
  if (userData && isReadOnlyDemoMode(userData)) return false
  return role === UserRoles.admin || role === UserRoles.agent
}

function normalizeRole(role: string | undefined | null): string {
  return String(role ?? '').trim().toLowerCase()
}

export function isAdminRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === UserRoles.admin
}

export function isAgentRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === UserRoles.agent
}

/** Agents + admins: master wallet view, sweep, transaction tracking disburse */
export function canAccessWalletOperations(
  role: string | undefined | null,
  userData?: AuthContextType['userData']
): boolean {
  if (userData && isReadOnlyDemoMode(userData)) return false
  const r = normalizeRole(role)
  return r === UserRoles.admin || r === UserRoles.agent
}

/** Batch sweep of user deposits → master wallet or vendor */
export function canSweepUserDeposits(
  role: string | undefined | null,
  userData?: AuthContextType['userData']
): boolean {
  return canAccessWalletOperations(role, userData)
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
    readOnlyMode?: boolean
    profilePicture: string | null
    customRole?: Role[],
    accountActivity?: AccountActivity[]
    // status: string
//
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
