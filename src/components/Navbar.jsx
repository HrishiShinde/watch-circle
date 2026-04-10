import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, LogOut, ChevronDown, Globe, User, Users, Plus, Settings, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './Navbar.module.css'

export default function Navbar({
  session,
  theme,
  onToggleTheme,
  circles,
  personalCircle,
  activeCircle,
  onCircleChange,
  onCreateCircle,
  onViewCircle,      // (circle) => void — opens CircleDetailModal
  onJoinCircle,      // () => void — opens join flow
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hoveredCircleId, setHoveredCircleId] = useState(null)
  const dropdownRef = useRef(null)

  const initials = session?.user?.user_metadata?.display_name
    ? session.user.user_metadata.display_name.slice(0, 1).toUpperCase()
    : session?.user?.email?.slice(0, 1).toUpperCase() || 'U'

  const displayName = session?.user?.user_metadata?.display_name
    || session?.user?.email?.split('@')[0]
    || 'User'

  const handleLogout = () => supabase.auth.signOut()

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setHoveredCircleId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (circle) => {
    onCircleChange(circle)
    setDropdownOpen(false)
    setHoveredCircleId(null)
  }

  const activeLabel = activeCircle ? activeCircle.name : 'Global'

  // Only show gear when a named circle (not Global/Personal) is active
  const showGear = activeCircle && !activeCircle.is_personal

  return (
    <nav className={styles.nav}>

      {/* ── Left: Logo + Context Switcher ── */}
      <div className={styles.left}>
        <div className={styles.logo}>
          WATCH<span>CIRCLE</span>
        </div>

        <div className={styles.contextWrapper} ref={dropdownRef}>
          <button
            className={`${styles.contextTrigger} ${dropdownOpen ? styles.contextTriggerOpen : ''}`}
            onClick={() => setDropdownOpen(p => !p)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className={styles.contextLabel}>{activeLabel}</span>
            <ChevronDown
              size={13}
              className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
            />
          </button>

          {/* Gear icon — only when a named circle is active */}
          {showGear && (
            <button
              className={styles.gearBtn}
              onClick={() => onViewCircle(activeCircle)}
              title={`${activeCircle.name} settings`}
            >
              <Settings size={14} />
            </button>
          )}

          {dropdownOpen && (
            <div className={styles.dropdown} role="listbox">

              {/* Global */}
              <button
                className={`${styles.dropdownItem} ${!activeCircle ? styles.dropdownItemActive : ''}`}
                onClick={() => select(null)}
                role="option"
                aria-selected={!activeCircle}
              >
                <Globe size={14} className={styles.itemIcon} />
                <span>Global</span>
                {!activeCircle && <span className={styles.activeDot} />}
              </button>

              {/* Personal */}
              {personalCircle && (
                <button
                  className={`${styles.dropdownItem} ${activeCircle?.is_personal ? styles.dropdownItemActive : ''}`}
                  onClick={() => select(personalCircle)}
                  role="option"
                  aria-selected={activeCircle?.is_personal}
                >
                  <User size={14} className={styles.itemIcon} />
                  <span>Personal</span>
                  {activeCircle?.is_personal && <span className={styles.activeDot} />}
                </button>
              )}

              {/* Named circles */}
              {circles.length > 0 && (
                <>
                  <div className={styles.divider} />
                  {circles.map(circle => (
                    <div
                      key={circle.id}
                      className={styles.circleItemWrapper}
                      onMouseEnter={() => setHoveredCircleId(circle.id)}
                      onMouseLeave={() => setHoveredCircleId(null)}
                    >
                      <button
                        className={`${styles.dropdownItem} ${activeCircle?.id === circle.id ? styles.dropdownItemActive : ''}`}
                        onClick={() => select(circle)}
                        role="option"
                        aria-selected={activeCircle?.id === circle.id}
                      >
                        <Users size={14} className={styles.itemIcon} />
                        <span className={styles.circleName}>{circle.name}</span>
                        {circle.role === 'moderator' && (
                          <span className={styles.modBadge}>MOD</span>
                        )}
                        {activeCircle?.id === circle.id && <span className={styles.activeDot} />}
                      </button>

                      {/* Hover member preview */}
                      {hoveredCircleId === circle.id && circle._members?.length > 0 && (
                        <div className={styles.memberPreview}>
                          {circle._members.slice(0, 4).map((m, i) => (
                            <div key={i} className={styles.previewRow}>
                              <div className={styles.previewAvatar}>{m.initials}</div>
                              <span className={styles.previewName}>{m.display_name}</span>
                              {m.role === 'moderator' && <span className={styles.previewMod}>MOD</span>}
                            </div>
                          ))}
                          {circle._members.length > 4 && (
                            <div className={styles.previewMore}>
                              …and {circle._members.length - 4} more (probably all watching something without you 👀)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Create Circle */}
              <div className={styles.divider} />
              <button
                className={`${styles.dropdownItem} ${styles.createItem}`}
                onClick={() => { setDropdownOpen(false); onCreateCircle() }}
              >
                <Plus size={14} className={styles.itemIcon} />
                <span>Create Circle</span>
              </button>
              <button
                className={`${styles.dropdownItem} ${styles.joinItem}`}
                onClick={() => { setDropdownOpen(false); onJoinCircle() }}
              >
                <LogIn size={14} className={styles.itemIcon} />
                <span>Join with Code</span>
              </button>

            </div>
          )}
        </div>
      </div>

      {/* ── Right: Theme toggle, user chip, logout ── */}
      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className={styles.userChip}>
          <div className={styles.avatar}>{initials}</div>
          <span className={styles.userName}>{displayName}</span>
        </div>
        <button className={styles.iconBtn} onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>

    </nav>
  )
}