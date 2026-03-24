import { useMemo } from 'react'
import { getGenreColor } from '../lib/models'
import styles from './GenreFilter.module.css'

export default function GenreFilter({ movies, activeGenre, onGenreChange }) {
  // Build genre list from actual movies in the list
  const genres = useMemo(() => {
    const counts = {}
    movies.forEach(m => {
      if (!m.genre) return
      // genre can be comma-separated e.g. "Sci-Fi, Action"
      m.genre.split(',').forEach(g => {
        const name = g.trim()
        if (name) counts[name] = (counts[name] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])  // sort by count desc
      .map(([name, count]) => ({ name, count }))
  }, [movies])

  if (!genres.length) return null

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.pill} ${!activeGenre ? styles.active : ''}`}
        onClick={() => onGenreChange(null)}
      >
        All genres
      </button>
      {genres.map(({ name, count }) => {
        const color = getGenreColor(name)
        const isActive = activeGenre === name
        return (
          <button
            key={name}
            className={`${styles.pill} ${isActive ? styles.activeGenre : ''}`}
            style={isActive
              ? { background: `${color}22`, borderColor: `${color}88`, color }
              : {}
            }
            onClick={() => onGenreChange(isActive ? null : name)}
          >
            {name}
            <span className={styles.count}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}