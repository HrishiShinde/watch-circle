import { useState, useEffect, useRef } from 'react'
import { X, Search, Loader } from 'lucide-react'
import { searchTMDB, fetchTMDBMovie, fetchTMDBGenreMap, matchGenreIds, TMDB_IMG } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import GenreSelect    from './GenreSelect'
import PlatformSelect from './PlatformSelect'
import styles from './AddMovieModal.module.css'

export default function AddMovieModal({ onClose, onAdd }) {
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [searching,   setSearching]   = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [genres,      setGenres]      = useState([])     // array of genre ids (numbers)
  const [platform,    setPlatform]    = useState(null)   // platform id (number)
  const [watchLink,   setWatchLink]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [manualMode,  setManualMode]  = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [dbGenres,    setDbGenres]    = useState([])     // from Supabase genres table
  const debounceRef = useRef(null)

  // Load genres from DB once
  useEffect(() => {
    supabase.from('genres').select('*').order('name').then(({ data }) => {
      if (data) setDbGenres(data)
    })
  }, [])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Debounced TMDB search
  useEffect(() => {
    if (manualMode || !query.trim()) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await searchTMDB(query)
      setResults(res)
      setSearching(false)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query, manualMode])

  // Auto-fill genres from TMDB when a movie is selected
  const handleTMDBSelect = async (movie) => {
    setSelected(movie)
    setResults([])
    setQuery(movie.title)

    if (movie.genre_ids?.length && dbGenres.length) {
      const genreMap   = await fetchTMDBGenreMap()
      const matchedIds = matchGenreIds(movie.genre_ids, genreMap, dbGenres)
      setGenres(matchedIds)
    }
  }

  const handleSubmit = async () => {
    if (manualMode && !manualTitle.trim()) return
    if (!manualMode && !selected) return
    setSubmitting(true)

    try {
      let duration = null
      // Fetch full TMDB details for runtime if we have a tmdb_id
      if (!manualMode && selected?.id) {
        const details = await fetchTMDBMovie(selected.id)
        duration = details.runtime || null
      }

      await onAdd({
        title:        manualMode ? manualTitle.trim() : selected.title,
        poster_path:  manualMode ? null : (selected.poster_path || null),
        release_year: manualMode ? null : (selected.release_date?.slice(0, 4) || null),
        duration,
        tmdb_id:      manualMode ? null : selected.id,
        genre_ids:    genres,    // array of our DB genre ids
        platform_id:  platform,  // our DB platform id
        watch_link:   watchLink.trim() || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = manualMode ? manualTitle.trim() : selected

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>

        <h3 className={styles.title}>Add a <span>movie</span></h3>

        {!manualMode ? (
          <>
            <div className={styles.searchWrap}>
              <Search size={13} className={styles.searchIcon} />
              <input
                className={styles.input}
                placeholder="Search TMDB — poster & details auto-fill…"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null); setGenres([]) }}
                autoFocus
              />
              {searching && <Loader size={13} className={styles.spinner} />}
            </div>

            {results.length > 0 && (
              <div className={styles.results}>
                {results.map(r => (
                  <div key={r.id} className={styles.result} onClick={() => handleTMDBSelect(r)}>
                    {r.poster_path
                      ? <img src={`${TMDB_IMG}${r.poster_path}`} alt={r.title} className={styles.rPoster} />
                      : <div className={styles.rPosterFallback}>🎬</div>
                    }
                    <div>
                      <div className={styles.rTitle}>{r.title}</div>
                      <div className={styles.rYear}>{r.release_date?.slice(0, 4) || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected && (
              <div className={styles.selectedCard}>
                {selected.poster_path && (
                  <img src={`${TMDB_IMG}${selected.poster_path}`} alt={selected.title} className={styles.selPoster} />
                )}
                <div>
                  <div className={styles.selTitle}>{selected.title}</div>
                  <div className={styles.selYear}>{selected.release_date?.slice(0, 4)}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.searchWrap}>
            <input
              className={styles.input}
              placeholder="Movie title"
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className={styles.fieldGap}>
          <GenreSelect
            selected={genres}
            onChange={setGenres}
            max={3}
            dbGenres={dbGenres}
            useIds={true}
          />
        </div>

        <div className={`${styles.fieldGap} ${styles.platformRow}`}>
          <div className={styles.platformCol}>
            <PlatformSelect
              selected={platform}
              onChange={setPlatform}
              useIds={true}
            />
          </div>
          <div className={styles.linkCol}>
            <input
              className={styles.input}
              placeholder="Watch link (optional)"
              value={watchLink}
              onChange={e => setWatchLink(e.target.value)}
              type="url"
              style={{ paddingLeft: '12px' }}
            />
          </div>
        </div>

        <button
          className={styles.manualToggle}
          onClick={() => { setManualMode(m => !m); setSelected(null); setQuery(''); setGenres([]) }}
        >
          {manualMode ? '← Search TMDB instead' : "Can't find it? Add manually"}
        </button>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Adding…' : 'Add to list'}
        </button>
      </div>
    </div>
  )
}