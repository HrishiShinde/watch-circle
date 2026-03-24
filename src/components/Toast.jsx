import { useEffect, useState } from 'react'
import styles from './Toast.module.css'

// ── Individual toast item ────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10)
    // Start exit animation before removal
    const t2 = setTimeout(() => setVisible(false), toast.duration - 300)
    const t3 = setTimeout(() => onRemove(toast.id), toast.duration)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [toast, onRemove])

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${visible ? styles.visible : ''}`}>
      <span className={styles.icon}>{icons[toast.type] || '✓'}</span>
      <span className={styles.message}>{toast.message}</span>
    </div>
  )
}

// ── Toast container ───────────────────────────────────────────
export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}