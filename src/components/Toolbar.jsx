import { Search, Plus, Shuffle } from 'lucide-react'
import styles from './Toolbar.module.css'

const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'unwatched', label: 'Unwatched' },
  { key: 'watched',   label: 'Watched'   },
]

export default function Toolbar({ filter, onFilter, search, onSearch, onRandom, onAdd }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.searchWrap}>
        <Search size={14} className={styles.searchIcon} />
        <input
          className={styles.input}
          placeholder="Search by title or genre…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.fBtn} ${filter === f.key ? styles.active : ''}`}
            onClick={() => onFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.circlePicksBtn} onClick={onRandom} title="CirclePicks">
          <Shuffle size={13} />
          CirclePicks
        </button>
        <button className={styles.addBtn} onClick={onAdd} title="Add movie">
          <Plus size={14} />
          Add movie
        </button>
      </div>
    </div>
  )
}