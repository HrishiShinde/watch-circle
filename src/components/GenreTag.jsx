import { getGenreColor } from '../lib/models'
import styles from './GenreTag.module.css'

/**
 * A single colored genre pill.
 * Pass onRemove to make it dismissible (used in AddMovieModal).
 */
export default function GenreTag({ name, onRemove, size = 'md' }) {
  const color = getGenreColor(name)

  // Derive a soft background from the hex color (15% opacity)
  const bg  = `${color}26`   // 26 hex = 15% alpha
  const border = `${color}55` // 55 hex = 33% alpha

  return (
    <span
      className={`${styles.tag} ${styles[size]}`}
      style={{ color, background: bg, borderColor: border }}
    >
      {name}
      {onRemove && (
        <button className={styles.remove} onClick={() => onRemove(name)} style={{ color }}>
          ×
        </button>
      )}
    </span>
  )
}