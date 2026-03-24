import { useState, useCallback } from 'react'

let nextId = 1

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Convenience helpers
  const success = useCallback((msg) => toast(msg, 'success'), [toast])
  const error   = useCallback((msg) => toast(msg, 'error'),   [toast])
  const info    = useCallback((msg) => toast(msg, 'info'),    [toast])
  const warning = useCallback((msg) => toast(msg, 'warning'), [toast])

  return { toasts, removeToast, toast, success, error, info, warning }
}