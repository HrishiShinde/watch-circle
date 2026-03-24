import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
// import { supabase } from './lib/supabase'

const MOCK_SESSION = {
  user: {
    id: '1',
    email: 'hrishi@example.com',
    user_metadata: { display_name: 'Hrishi' },

  }
}

export default function App() {
  // const [session, setSession] = useState(undefined) // undefined = loading

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })
  //   return () => subscription.unsubscribe()
  // }, [])

  // Still checking auth
  // if (session === undefined) return (
  //   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
  //     <div className="loader" />
  //   </div>
  // )

  // return (
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/" element={session ? <Home session={session} /> : <Navigate to="/login" replace />} />
  //       <Route path="/login"  element={!session ? <Login />  : <Navigate to="/" replace />} />
  //       <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" replace />} />
  //       <Route path="*" element={<Navigate to="/" replace />} />
  //     </Routes>
  //   </BrowserRouter>
  // )
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Home session={MOCK_SESSION} />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}