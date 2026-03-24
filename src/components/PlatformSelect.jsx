import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './PlatformSelect.module.css'

function PlatformLogo({ logoUrl, name, size = 'sm' }) {
  const [err, setErr] = useState(false)
  if (!logoUrl || err) return <span className={styles.emoji}>🎬</span>
  return (
    <div className={styles.logoWrap}>
      <img
        src={logoUrl}
        alt={name}
        className={styles.logoImg}
        onError={() => setErr(true)}
      />
    </div>
  )
}

export default function PlatformSelect({ selected = null, onChange, useIds = false }) {
  const [open,      setOpen]      = useState(false)
  const [platforms, setPlatforms] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    supabase.from('platforms').select('*').order('name').then(({ data }) => {
      if (data) setPlatforms(data)
    })
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
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
      <div
        className={`${styles.trigger} ${open ? styles.open : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {selectedPlatform ? (
          <div className={styles.selectedItem}>
            <PlatformLogo logoUrl={selectedPlatform.logo_url} name={selectedPlatform.name} />
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
          {platforms.map(p => {
            const isSelected = useIds ? selected === p.id : selected === p.name
            return (
              <div
                key={p.id}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(p)}
              >
                <PlatformLogo logoUrl={p.logo_url} name={p.name} />
                <span className={styles.optionName}>{p.name}</span>
                {isSelected && <span className={styles.check}>✓</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}