import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home   from './pages/Home'
import Login  from './pages/Login'
import Signup from './pages/Signup'
import { supabase } from './lib/supabase'
import styles from './App.module.css'

const MOCK_SESSION = {
  user: {
    id: '1',
    email: 'hrishi@example.com',
    user_metadata: { display_name: 'Hrishi' },

  }
}
export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null) // null = confirmed no session
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still checking auth — show a clean loading screen, never flash home
  if (session === undefined) return (
    <div className={styles.loader}>
      <div className={styles.logo}>WATCH<span>CIRCLE</span></div>
      <div className={styles.spinner} />
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={session ? <Home session={session} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!session ? <Signup /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}