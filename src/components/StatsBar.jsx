import styles from './StatsBar.module.css'

export default function StatsBar({ total, watched, avgRating }) {
  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.c1}`}>
        <div className={styles.num}>{total}</div>
        <div className={styles.label}>Total movies</div>
      </div>
      <div className={`${styles.card} ${styles.c2}`}>
        <div className={styles.num}>{watched}</div>
        <div className={styles.label}>Watched</div>
      </div>
      <div className={`${styles.card} ${styles.c3}`}>
        <div className={styles.num}>{total - watched}</div>
        <div className={styles.label}>Unwatched</div>
      </div>
      <div className={`${styles.card} ${styles.c4}`}>
        <div className={styles.num}>{avgRating || '—'}</div>
        <div className={styles.label}>Avg rating</div>
      </div>
    </div>
  )
}