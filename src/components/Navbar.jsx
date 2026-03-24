import { Sun, Moon, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './Navbar.module.css'

export default function Navbar({ session, theme, onToggleTheme }) {
  const initials = session?.user?.user_metadata?.display_name
    ? session.user.user_metadata.display_name.slice(0, 1).toUpperCase()
    : session?.user?.email?.slice(0, 1).toUpperCase() || 'U'

  const displayName = session?.user?.user_metadata?.display_name
    || session?.user?.email?.split('@')[0]
    || 'User'

  const handleLogout = () => supabase.auth.signOut()

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        WATCH<span>CIRCLE</span>
      </div>
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