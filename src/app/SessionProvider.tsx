'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

interface SessionContextType {
  session: Session | null
  setSession: (session: Session | null) => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {}
})

export function useSessionContext() {
  return useContext(SessionContext)
}

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Initial session fetch on load
    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!error) {
        setSession(data.session)
      }
    }

    initializeSession()

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
    })

    // Clean up subscription on unmount
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}
