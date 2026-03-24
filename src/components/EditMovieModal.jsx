import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import GenreSelect    from './GenreSelect'
import PlatformSelect from './PlatformSelect'
import styles from './AddMovieModal.module.css'

export default function EditMovieModal({ movie, onClose, onSave }) {
  const [title,      setTitle]      = useState(movie.title || '')
  const [genres,     setGenres]     = useState([])   // genre ids
  const [platform,   setPlatform]   = useState(null) // platform id
  const [watchLink,  setWatchLink]  = useState(movie.watch_link || '')
  const [submitting, setSubmitting] = useState(false)
  const [dbGenres,   setDbGenres]   = useState([])
  const [dbPlatforms,setDbPlatforms]= useState([])

  // Load DB lookups + pre-fill current values
  useEffect(() => {
    const load = async () => {
      const [{ data: gData }, { data: pData }] = await Promise.all([
        supabase.from('genres').select('*').order('name'),
        supabase.from('platforms').select('*').order('name'),
      ])
      if (gData) {
        setDbGenres(gData)
        // Pre-fill genres — match names to ids
        if (movie.genres?.length) {
          const ids = movie.genres
            .map(name => gData.find(g => g.name === name)?.id)
            .filter(Boolean)
          setGenres(ids)
        }
      }
      if (pData) {
        setDbPlatforms(pData)
        // Pre-fill platform
        const pName = movie.platform || movie.where_to_watch
        if (pName) {
          const match = pData.find(p => p.name === pName)
          if (match) setPlatform(match.id)
        }
      }
    }
    load()
  }, [movie])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleSave = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSave(movie.id, {
        title:       title.trim(),
        poster_path: movie.poster_path || null,
        release_year: movie.release_year || null,
        duration:    movie.duration || null,
        genre_ids:   genres,
        platform_id: platform,
        watch_link:  watchLink.trim() || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>

        <h3 className={styles.title}>Edit <span>movie</span></h3>

        <input
          className={styles.input}
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

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
          className={styles.submitBtn}
          onClick={handleSave}
          disabled={!title.trim() || submitting}
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}