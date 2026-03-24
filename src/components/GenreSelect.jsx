import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { GENRES, getGenreColor } from '../lib/models'
import GenreTag from './GenreTag'
import styles from './GenreSelect.module.css'

/**
 * Multi-select genre picker.
 * Props:
 *   selected  : number[] | string[]  — selected genre ids or names
 *   onChange  : (ids or names) => void
 *   max       : number               — max genres selectable (default 3)
 *   dbGenres  : array                — genres from Supabase (optional, falls back to GENRES)
 *   useIds    : boolean              — if true, works with genre ids instead of names
 */
export default function GenreSelect({ selected = [], onChange, max = 3, dbGenres, useIds = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const genres = dbGenres?.length ? dbGenres : GENRES

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getKey    = (g) => useIds ? g.id   : g.name
  const isActive  = (g) => selected.includes(getKey(g))

  const toggle = (g) => {
    const key = getKey(g)
    if (isActive(g)) {
      onChange(selected.filter(s => s !== key))
    } else {
      if (selected.length >= max) return
      onChange([...selected, key])
    }
  }

  const remove = (key) => onChange(selected.filter(s => s !== key))

  // Get name for display (works for both id-mode and name-mode)
  const getNameForKey = (key) => {
    if (!useIds) return key
    return genres.find(g => g.id === key)?.name || key
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={`${styles.trigger} ${open ? styles.open : ''}`} onClick={() => setOpen(o => !o)}>
        {selected.length === 0 ? (
          <span className={styles.placeholder}>Select genres (up to {max})</span>
        ) : (
          <div className={styles.selectedTags}>
            {selected.map(key => (
              <GenreTag
                key={key}
                name={getNameForKey(key)}
                size="sm"
                onRemove={() => remove(key)}
              />
            ))}
          </div>
        )}
        <ChevronDown size={14} className={`${styles.chevron} ${open ? styles.rotated : ''}`} />
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.hint}>{selected.length}/{max} selected</div>
          <div className={styles.grid}>
            {genres.map(g => {
              const active   = isActive(g)
              const color    = g.color || getGenreColor(g.name)
              const disabled = !active && selected.length >= max
              return (
                <button
                  key={g.id || g.name}
                  className={`${styles.option} ${active ? styles.optionSelected : ''} ${disabled ? styles.optionDisabled : ''}`}
                  style={active ? { color, background: `${color}22`, borderColor: `${color}66` } : {}}
                  onClick={() => toggle(g)}
                  disabled={disabled}
                >
                  {g.name}
                  {active && <span className={styles.check}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}