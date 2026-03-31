import { useState, useEffect, useRef } from 'react'
import { X, Clock, Calendar, User, ExternalLink, Pencil, Trash2, MoreVertical, Camera } from 'lucide-react'
import { TMDB_IMG } from '../lib/supabase'
import { getPlatformByName } from '../lib/models'
import GenreTag       from './GenreTag'
import PosterFallback from './PosterFallback'
import styles from './MovieModal.module.css'

const LABELS = ['','Terrible','Bad','Meh','Below avg','Average','Decent','Good','Great','Excellent','Masterpiece']

export default function MovieModal({ movie, session, onClose, onRate, onEdit, onDelete }) {
  const [hover,         setHover]         = useState(0)
  const [selected,      setSelected]      = useState(0)
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [imgError,      setImgError]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close menu on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const posterUrl = movie.poster_path && !imgError
    ? `${TMDB_IMG}${movie.poster_path}`
    : null

  const displayStar = hover || selected

  const genreList = Array.isArray(movie.genres)
    ? movie.genres
    : movie.genre ? movie.genre.split(',').map(g => g.trim()) : []

  const platformObj = getPlatformByName(movie.platform || movie.where_to_watch)

  // ── Permissions ───────────────────────────────────────────────────────────
  const userId      = session?.user?.id
  const isModerator = session?.user?.user_metadata?.is_moderator === true
  const isOwner     = userId && movie.added_by === userId
  const canEdit     = isOwner || isModerator

  const handleSubmit = async () => {
    if (!selected) { setError('Please pick a rating first!'); return }
    setSubmitting(true)
    setError('')
    await onRate(movie.id, selected)
    setSubmitting(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    onDelete?.(movie.id)
    onClose()
  }

  const formatDuration = (totalMinutes) => {
    if (!totalMinutes) return null
    const hours   = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    // Returns "2h 46m" if hours > 0, otherwise just "45m"
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>

        {/* ⋮ Menu — only for owner/mod */}
        {canEdit && (
          <div className={styles.menuWrap} ref={menuRef}>
            <button
              className={styles.menuBtn}
              onClick={() => { setMenuOpen(o => !o); setConfirmDelete(false) }}
              title="Options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className={styles.menuDropdown}>
                <button
                  className={styles.menuItem}
                  onClick={() => { setMenuOpen(false); onEdit?.(movie) }}
                >
                  <Pencil size={13} /> Edit movie
                </button>

                <button
                  className={styles.menuItem}
                  onClick={() => { setMenuOpen(false); onEdit?.(movie, true) }}
                >
                  <Camera size={13} /> Change poster
                </button>

                <div className={styles.menuDivider} />

                <button
                  className={`${styles.menuItem} ${styles.menuItemDelete} ${confirmDelete ? styles.menuItemConfirm : ''}`}
                  onClick={handleDelete}
                >
                  <Trash2 size={13} />
                  {confirmDelete ? 'Confirm delete?' : 'Delete movie'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Left: poster ── */}
        <div className={styles.posterCol}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className={styles.poster}
              onError={() => setImgError(true)}
            />
          ) : (
            <PosterFallback title={movie.title} genres={genreList} size="lg" />
          )}
        </div>

        {/* ── Right: details ── */}
        <div className={styles.body}>

          <h2 className={styles.title}>{movie.title}</h2>

          {/* Genre tags */}
          {genreList.length > 0 && (
            <div className={styles.genreTagRow}>
              {genreList.map(g => <GenreTag key={g} name={g} size="md" />)}
            </div>
          )}

          {/* Meta row: year • duration • added by */}
          <div className={styles.metaList}>
            <div className={styles.dflex}>
              {movie.release_year && (
                <div className={styles.metaRow}>
                  <Calendar size={13} />
                  <span>{movie.release_year}</span>
                </div>
              )}
              {movie.release_year && movie.duration && (
                <span className={styles.dot}>•</span>
              )}
              {movie.duration && (
                <div className={styles.metaRow}>
                  <Clock size={13} />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
              )}
            </div>
            <div className={styles.metaRow}>
              <User size={13} />
              <span><strong>{movie.added_by_name || 'someone'}</strong></span>
            </div>
          </div>

          {/* Rating + platform card */}
          <div className={styles.dflex} style={{ alignItems: 'stretch', marginTop: 14, justifyContent: "space-between" }}>
            {movie.avg_rating && (
              <div className={styles.communityRating}>
                <span className={styles.bigStar}>★</span>
                <span className={styles.bigNum}>{Number(movie.avg_rating).toFixed(1)}</span>
                <span className={styles.ratingMeta}>
                  / 10 &nbsp;·&nbsp; {movie.rating_count} {movie.rating_count === 1 ? 'rating' : 'ratings'}
                </span>
              </div>
            )}

            {(platformObj || movie.where_to_watch || movie.platform) && (
              <a
                href={movie.watch_link || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.platformCard} ${!movie.watch_link ? styles.platformCardNoLink : ''}`}
                onClick={e => { if (!movie.watch_link) e.preventDefault() }}
              >
                <div className={styles.platformLogo}>
                  {movie.platform_logo ? (
                    <img
                      src={movie.platform_logo}
                      alt={movie.where_to_watch}
                      className={styles.logoImg}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span>🎬</span>
                  )}
                </div>
                <div className={styles.platformInfo}>
                  <span className={styles.platformName}>
                    {platformObj?.name || movie.where_to_watch || movie.platform}
                  </span>
                  <span className={styles.platformSubtitle}>
                    {movie.watch_link ? 'Watch Now' : 'No link added'}
                  </span>
                </div>
                {movie.watch_link && (
                  <div className={styles.externalIcon}>
                    <ExternalLink size={14} strokeWidth={2.5} />
                  </div>
                )}
              </a>
            )}
          </div>

          <div className={styles.divider} />

          {/* Rating / watched */}
          {movie.watched_by_me ? (
            <div className={styles.alreadyWatched}>
              <div className={styles.awLabel}>Your rating</div>
              <div className={styles.awRating}>★ {movie.my_rating}/10</div>
              <div className={styles.awSub}>{LABELS[movie.my_rating]}</div>
            </div>
          ) : (
            <div className={styles.rateSection}>
              <p className={styles.ratePrompt}>Rate to mark as watched:</p>
              <div className={styles.stars}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`${styles.star} ${n <= displayStar ? styles.lit : ''}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setSelected(n)}
                    aria-label={`Rate ${n}`}
                  >★</button>
                ))}
              </div>
              <div className={styles.ratingLabel}>
                {displayStar > 0 && (
                  <>
                    {displayStar}/10 — {LABELS[displayStar]}
                  </>
                )}
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Mark as watched'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}