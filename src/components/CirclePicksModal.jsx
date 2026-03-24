import { useState, useEffect } from 'react'
import { X, Sparkles, Tv, User, Calendar } from 'lucide-react'
import { TMDB_IMG } from '../lib/supabase'
import PosterFallback from './PosterFallback'
import styles from './CirclePicksModal.module.css'

export default function CirclePicksModal({ movie, onClose, onViewDetail }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const posterUrl = movie.poster_path && !imgError
    ? `${TMDB_IMG}${movie.poster_path}`
    : null

  const genre = Array.isArray(movie.genres)
    ? movie.genres[0]
    : movie.genre || null

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X size={15} /></button>

        <div className={styles.header}>
          <Sparkles size={15} className={styles.sparkle} />
          <span>CirclePicks</span>
        </div>
        <p className={styles.subhead}>Tonight's pick for your circle</p>

        <div className={styles.movieRow}>
          <div className={styles.posterWrap}>
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                className={styles.poster}
                onError={() => setImgError(true)}
              />
            ) : (
              <PosterFallback title={movie.title} genre={genre} size="md" />
            )}
          </div>

          <div className={styles.info}>
            {genre && <div className={styles.genreTag}>{genre}</div>}
            <h2 className={styles.title}>{movie.title}</h2>

            {movie.release_year && (
              <div className={styles.metaRow}><Calendar size={12} />{movie.release_year}</div>
            )}
            {movie.where_to_watch && (
              <div className={styles.metaRow}><Tv size={12} />{movie.where_to_watch}</div>
            )}
            <div className={styles.metaRow}>
              <User size={12} />Added by <strong>{movie.added_by_name}</strong>
            </div>

            {movie.avg_rating && (
              <div className={styles.rating}>
                <span className={styles.ratingStar}>★</span>
                <span className={styles.ratingNum}>{Number(movie.avg_rating).toFixed(1)}</span>
                <span className={styles.ratingMeta}>/ 10</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.detailBtn}
            onClick={() => { onClose(); onViewDetail(movie) }}
          >
            View details &amp; rate
          </button>
          <button className={styles.closeTextBtn} onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}