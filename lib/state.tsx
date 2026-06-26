'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AppState } from './types'

const defaultState: AppState = {
  intake: null,
  profile: null,
  submissions: [],
  currentModule: 'Problem Validation',
  goNoGoStatus: 'pending',
}

const AppContext = createContext<
  [AppState, React.Dispatch<React.SetStateAction<AppState>>] | undefined
>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useState<AppState>(defaultState)
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
