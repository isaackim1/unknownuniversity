'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { AppState } from './types'

const STORAGE_KEY = 'udc-app-state'

const defaultState: AppState = {
  intake: null,
  profile: null,
  submissions: [],
  currentModule: 'Problem Validation',
  goNoGoStatus: 'pending',
}

function loadInitialState(): AppState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...(JSON.parse(raw) as Partial<AppState>) }
  } catch {
    return defaultState
  }
}

const AppContext = createContext<
  [AppState, React.Dispatch<React.SetStateAction<AppState>>] | undefined
>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)

  // Hydrate from sessionStorage after mount to avoid an SSR/client mismatch.
  useEffect(() => {
    setState(loadInitialState())
  }, [])

  // Persist on every change so a hard refresh mid-flow keeps the founder's progress.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota / serialization errors */
    }
  }, [state])

  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
