import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { joinByCode } from '../lib/circles'
import styles from './JoinCircle.module.css'

/**
 * Handles two cases:
 *  1. /join?code=ABCD1234  — auto-joins on mount
 *  2. /join               — shows manual code entry form
 */
export default function JoinCircle({ session }) {
  const [searchParams]              = useSearchParams()
  const navigate                    = useNavigate()
  const codeFromUrl                 = searchParams.get('code')?.toUpperCase() || ''

  const [code,    setCode]    = useState(codeFromUrl)
  const [status,  setStatus]  = useState('idle')   // idle | joining | success | error
  const [message, setMessage] = useState('')
  const [circleName, setCircleName] = useState('')

  const userId = session?.user?.id

  const attemptJoin = async (joinCode) => {
    if (!joinCode.trim()) return
    setStatus('joining')
    setMessage('')
    try {
      const circle = await joinByCode(joinCode.trim(), userId)
      setCircleName(circle.name)
      setStatus('success')
      // Redirect to home after a short celebration moment
      setTimeout(() => navigate('/'), 2200)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong.')
    }
  }

  // Auto-join if code came from URL
  useEffect(() => {
    if (codeFromUrl) attemptJoin(codeFromUrl)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault()
    attemptJoin(code)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>WATCH<span>CIRCLE</span></div>

        {status === 'success' ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>You're in!</h2>
            <p className={styles.successSub}>
              Welcome to <strong>{circleName}</strong>. Taking you there now…
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>Join a Circle</h2>
            <p className={styles.sub}>
              {codeFromUrl
                ? 'Verifying your invite code…'
                : 'Enter the invite code you received.'}
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                className={`${styles.input} ${status === 'error' ? styles.inputError : ''}`}
                type="text"
                value={code}
                onChange={e => {
                  setCode(e.target.value.toUpperCase())
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="e.g. ABCD1234"
                maxLength={12}
                autoFocus={!codeFromUrl}
                disabled={status === 'joining'}
                spellCheck={false}
                autoComplete="off"
              />

              {status === 'error' && (
                <p className={styles.errorMsg}>{message}</p>
              )}

              <button
                className={styles.joinBtn}
                type="submit"
                disabled={!code.trim() || status === 'joining'}
              >
                {status === 'joining' ? (
                  <span className={styles.joining}>
                    <span className={styles.spinner} />
                    Joining…
                  </span>
                ) : 'Join Circle'}
              </button>
            </form>

            <button
              className={styles.backLink}
              onClick={() => navigate('/')}
            >
              ← Back to WatchCircle
            </button>
          </>
        )}

      </div>
    </div>
  )
}