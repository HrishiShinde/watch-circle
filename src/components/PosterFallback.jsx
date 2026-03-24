import { getGenreColor } from '../lib/models'
import styles from './PosterFallback.module.css'

/**
 * Reusable poster fallback — genre-colored gradient with initials.
 * Used in MovieCard, MovieModal, CirclePicksModal.
 * Props:
 *   title  : string
 *   genre  : string | null
 *   size   : 'sm' | 'md' | 'lg'  (controls font sizes)
 */
export default function PosterFallback({ title, genre, size = 'md' }) {
  const color    = getGenreColor(genre)
  const initials = title
    ? title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  return (
    <div
      className={`${styles.wrap} ${styles[size]}`}
      style={{ '--gc': color }}
    >
      <div className={styles.bg} />
      <div className={styles.initials}>{initials}</div>
      {genre && <div className={styles.genre}>{genre}</div>}
    </div>
  )
}