import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './PlatformSelect.module.css'

export default function PlatformSelect({ selected = null, onChange, useIds = false }) {
  const [open,      setOpen]      = useState(false)
  const [platforms, setPlatforms] = useState([])
  const ref = useRef(null)

  // Load platforms from DB
  useEffect(() => {
    supabase.from('platforms').select('*').order('name').then(({ data }) => {
      if (data) setPlatforms(data)
    })
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedPlatform = useIds
    ? platforms.find(p => p.id === selected)
    : platforms.find(p => p.name === selected)

  const handleSelect = (platform) => {
    onChange(useIds ? platform.id : platform.name)
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={`${styles.trigger} ${open ? styles.open : ''}`} onClick={() => setOpen(o => !o)}>
        {selectedPlatform ? (
          <div className={styles.selectedItem}>
            {selectedPlatform.logo_url ? (
              <img
                src={selectedPlatform.logo_url}
                alt={selectedPlatform.name}
                className={styles.logoImg}
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className={styles.emoji}>🎬</span>
            )}
            <span className={styles.selectedName}>{selectedPlatform.name}</span>
            <button className={styles.clearBtn} onClick={handleClear}>×</button>
          </div>
        ) : (
          <span className={styles.placeholder}>Platform</span>
        )}
        <ChevronDown size={14} className={`${styles.chevron} ${open ? styles.rotated : ''}`} />
      </div>

      {open && (
        <div className={styles.dropdown}>
          {platforms.map(p => (
            <div
              key={p.id}
              className={`${styles.option} ${(useIds ? selected === p.id : selected === p.name) ? styles.optionSelected : ''}`}
              onClick={() => handleSelect(p)}
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className={styles.logoImg}
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <span className={styles.emoji}>🎬</span>
              )}
              <span className={styles.optionName}>{p.name}</span>
              {(useIds ? selected === p.id : selected === p.name) && (
                <span className={styles.check}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}