import { useState } from 'react'
import { TMDB_IMG } from '../lib/supabase'
import PosterFallback from './PosterFallback'
import styles from './MovieCard.module.css'

export default function MovieCard({ movie, isHighlighted, onClick }) {
  const [imgError, setImgError] = useState(false)
  const posterUrl = movie.poster_path && !imgError
    ? `${TMDB_IMG}${movie.poster_path}`
    : null

  return (
    <div
      className={`${styles.card} ${movie.watched_by_me ? styles.watched : ''} ${isHighlighted ? styles.highlighted : ''}`}
      onClick={() => onClick(movie)}
    >
      <div className={styles.posterWrap}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className={styles.poster}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <PosterFallback title={movie.title} genre={movie.genre} size="md" />
        )}

        {movie.watched_by_me && (
          <div className={styles.watchedBadge}>WATCHED</div>
        )}
        {isHighlighted && (
          <div className={styles.pickBadge}>✦ PICK</div>
        )}
        <div className={styles.posterOverlay} />
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{movie.title}</div>
        <div className={styles.meta}>
          <span className={styles.genre}>{movie.genre || 'Unknown'}</span>
          {movie.avg_rating && (
            <span className={styles.rating}>★ {Number(movie.avg_rating).toFixed(1)}</span>
          )}
        </div>
        {/* {movie.where_to_watch && (
          <div className={styles.platform}>{movie.where_to_watch}</div>
        )} */}
      </div>
    </div>
  )
}