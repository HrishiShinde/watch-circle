import { useState, useMemo } from 'react'
import Navbar           from '../components/Navbar'
import StatsBar         from '../components/StatsBar'
import Toolbar          from '../components/Toolbar'
import GenreFilter      from '../components/GenreFilter'
import MovieCard        from '../components/MovieCard'
import MovieModal       from '../components/MovieModal'
import AddMovieModal    from '../components/AddMovieModal'
import EditMovieModal   from '../components/EditMovieModal'
import CirclePicksModal from '../components/CirclePicksModal'
import ToastContainer   from '../components/Toast'
import { useTheme }     from '../hooks/useTheme'
import { useToast }     from '../hooks/useToast'
import { useMovies }    from '../hooks/useMovies'
import styles from './Home.module.css'

const MOCK_MOVIES = [
  { id:1, title:'Dune: Part Two', genre:'Sci-Fi', duration:166,
    watch_link:'https://www.amazon.com',
    platform_logo:'https://media.themoviedb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg',
    where_to_watch:'Prime Video', watched_by_me:false, my_rating:null, avg_rating:8.4, rating_count:12,
    poster_path:'/d5NXSklpcKRLWhGMJq7R3WujIKM.jpg', release_year:'2024', added_by_name:'Hrishi', added_by:'1' },

  { id:2, title:'Oppenheimer', genre:'Drama', duration:180,
    watch_link:'https://www.peacocktv.com',
    platform_logo:'https://upload.wikimedia.org/wikipedia/commons/d/d3/NBCUniversal_Peacock_Logo.svg',
    where_to_watch:'Peacock', watched_by_me:true, my_rating:9, avg_rating:9.1, rating_count:8,
    poster_path:'/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', release_year:'2023', added_by_name:'Sam', added_by:'2' },

  { id:3, title:'The Substance', genre:'Horror', duration:140,
    watch_link:'https://mubi.com',
    platform_logo:'https://cdn.simpleicons.org/mubi',
    where_to_watch:'MUBI', watched_by_me:false, my_rating:null, avg_rating:null, rating_count:0,
    poster_path:'/lqoMzCcZYEFK729d6qzt349fB4o.jpg', release_year:'2024', added_by_name:'Hrishi', added_by:'1' },

  { id:4, title:'Alien: Romulus', genre:'Sci-Fi', duration:119,
    watch_link:'https://www.disneyplus.com',
    platform_logo:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    where_to_watch:'Disney+', watched_by_me:true, my_rating:7, avg_rating:7.3, rating_count:5,
    poster_path:'/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg', release_year:'2024', added_by_name:'Priya', added_by:'3' },

  { id:5, title:'Furiosa', genre:'Action', duration:148,
    watch_link:'https://www.netflix.com',
    platform_logo:'https://cdn.simpleicons.org/netflix',
    where_to_watch:'Netflix', watched_by_me:false, my_rating:null, avg_rating:null, rating_count:0,
    poster_path:'/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', release_year:'2024', added_by_name:'Sam', added_by:'2' },

  { id:6, title:'Inside Out 2', genre:'Animation', duration:96,
    watch_link:'https://www.disneyplus.com',
    platform_logo:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    where_to_watch:'Disney+', watched_by_me:true, my_rating:8, avg_rating:8.5, rating_count:9,
    poster_path:'/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', release_year:'2024', added_by_name:'Priya', added_by:'3' },

  { id:7, title:'Longlegs', genre:'Thriller', duration:101,
    watch_link:'https://www.google.com',
    platform_logo:'',
    where_to_watch:'', watched_by_me:false, my_rating:null, avg_rating:null, rating_count:0,
    poster_path:'/jZIYaISP3GBDekvnngrV6zLyNyz.jpg', release_year:'2024', added_by_name:'Jay', added_by:'4' },

  { id:8, title:'Hit Man', genre:'Comedy', duration:115,
    watch_link:'https://www.netflix.com',
    platform_logo:'https://cdn.simpleicons.org/netflix',
    where_to_watch:'Netflix', watched_by_me:false, my_rating:null, avg_rating:null, rating_count:0,
    poster_path:'/1126gjlBf4hTm9Sgf0ox3LGVEBt.jpg', release_year:'2024', added_by_name:'Sam', added_by:'2' },

  { id:9, title:'Civil War', genre:'Action', duration:109,
    watch_link:'https://mubi.com',
    platform_logo:'https://cdn.simpleicons.org/mubi',
    where_to_watch:'MUBI', watched_by_me:false, my_rating:null, avg_rating:6.8, rating_count:4,
    poster_path:'/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg', release_year:'2024', added_by_name:'Priya', added_by:'3' },

  { id:10, title:'A Quiet Place: Day One', genre:'Horror', duration:99,
    watch_link:'https://www.paramountplus.com',
    platform_logo:'https://cdn.simpleicons.org/paramountplus',
    where_to_watch:'Paramount+', watched_by_me:false, my_rating:null, avg_rating:null, rating_count:0,
    poster_path:'/yrpPYKijwSxqMKSBL6AEEMptkDW.jpg', release_year:'2024', added_by_name:'Jay', added_by:'4' },
];

export default function Home({ session }) {
  const { theme, toggle }                             = useTheme()
  const { toasts, removeToast, success, error: toastError, info } = useToast()
  const {
    movies, profile, loading, error,
    handleAdd, handleEdit, handleDelete, handleRate,
  } = useMovies(session)

  const [filter,          setFilter]          = useState('all')
  const [search,          setSearch]          = useState('')
  const [activeGenre,     setActiveGenre]     = useState(null)
  const [highlightId,     setHighlightId]     = useState(null)
  const [detailMovie,     setDetailMovie]     = useState(null)
  const [editMovie,       setEditMovie]       = useState(null)
  const [circlePickMovie, setCirclePickMovie] = useState(null)
  const [showAdd,         setShowAdd]         = useState(false)

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return movies.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(q) ||
        (m.genre || '').toLowerCase().includes(q)
      const matchFilter =
        filter === 'all' ||
        (filter === 'watched'   && m.watched_by_me) ||
        (filter === 'unwatched' && !m.watched_by_me)
      const matchGenre = !activeGenre ||
        (m.genres || []).includes(activeGenre) ||
        (m.genre || '').split(',').map(g => g.trim()).includes(activeGenre)
      return matchSearch && matchFilter && matchGenre
    })
  }, [movies, filter, search, activeGenre])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const watched = movies.filter(m => m.watched_by_me)
    const ratings = movies.filter(m => m.avg_rating).map(m => Number(m.avg_rating))
    const avg = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null
    return { total: movies.length, watched: watched.length, avg }
  }, [movies])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilter = (f) => { setFilter(f); setHighlightId(null) }
  const handleSearch = (v) => { setSearch(v); setHighlightId(null) }
  const handleGenre  = (g) => { setActiveGenre(g); setHighlightId(null) }

  const handleRandom = () => {
    const pool = movies.filter(m => !m.watched_by_me)
    if (!pool.length) { info("You've watched everything! Add more movies."); return }
    const pick = pool[Math.floor(Math.random() * pool.length)]
    setHighlightId(pick.id)
    setCirclePickMovie(pick)
  }

  const onRate = async (movieId, rating) => {
    try {
      const updated = await handleRate(movieId, rating)
      // Update detail modal with fresh data
      setDetailMovie(prev => prev?.id === movieId ? updated : prev)
      success('Marked as watched! 🎬')
    } catch (err) {
      toastError('Failed to save rating. Try again.')
    }
  }

  const onAdd = async (movieData) => {
    try {
      const newMovie = await handleAdd(movieData)
      setShowAdd(false)
      success(`"${newMovie.title}" added to the list!`)
    } catch (err) {
      toastError('Failed to add movie. Try again.')
    }
  }

  const onEditOpen = (movie) => {
    setDetailMovie(null)
    setEditMovie(movie)
  }

  const onSaveEdit = async (movieId, movieData) => {
    try {
      const updated = await handleEdit(movieId, movieData)
      setEditMovie(null)
      success(`"${updated.title}" updated!`)
    } catch (err) {
      toastError('Failed to update movie. Try again.')
    }
  }

  const onDelete = async (movieId) => {
    try {
      const movie = movies.find(m => m.id === movieId)
      await handleDelete(movieId)
      setDetailMovie(null)
      success(`"${movie?.title}" removed.`)
    } catch (err) {
      toastError('Failed to delete movie. Try again.')
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  const emptyMessage = () => {
    if (loading)     return { icon: '⏳', text: 'Loading your movies…' }
    if (error)       return { icon: '⚠️', text: `Something went wrong: ${error}` }
    if (search)      return { icon: '🔍', text: `No results for "${search}"` }
    if (activeGenre) return { icon: '🎭', text: `No ${activeGenre} movies yet` }
    if (filter === 'watched')   return { icon: '👀', text: 'Nothing watched yet — get watching!' }
    if (filter === 'unwatched') return { icon: '🎉', text: "You've watched everything!" }
    return { icon: '🎬', text: 'No movies yet. Add the first one!' }
  }
  const empty = emptyMessage()

  // Merge profile's is_moderator into session for permission checks
  const enrichedSession = profile ? {
    ...session,
    user: {
      ...session.user,
      user_metadata: {
        ...session.user.user_metadata,
        is_moderator: profile.is_moderator,
        display_name: profile.display_name,
      }
    }
  } : session

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Navbar session={enrichedSession} theme={theme} onToggleTheme={toggle} />

        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Your circle, Your picks</h1>
          <p className={styles.heroSub}>Track, rate &amp; discover movies with your circle</p>
        </div>

        <StatsBar total={stats.total} watched={stats.watched} avgRating={stats.avg} />

        <Toolbar
          filter={filter}  onFilter={handleFilter}
          search={search}  onSearch={handleSearch}
          onRandom={handleRandom}
          onAdd={() => setShowAdd(true)}
        />

        <GenreFilter
          movies={movies}
          activeGenre={activeGenre}
          onGenreChange={handleGenre}
        />

        {(loading || error || filtered.length === 0) ? (
          <div className={styles.empty}>
            <span>{empty.icon}</span>
            <p>{empty.text}</p>
            {!loading && !error && filter === 'all' && !search && !activeGenre && (
              <button className={styles.emptyAddBtn} onClick={() => setShowAdd(true)}>
                + Add a movie
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isHighlighted={highlightId === movie.id}
                onClick={setDetailMovie}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {circlePickMovie && (
        <CirclePicksModal
          movie={circlePickMovie}
          onClose={() => setCirclePickMovie(null)}
          onViewDetail={(m) => { setCirclePickMovie(null); setDetailMovie(m) }}
        />
      )}

      {detailMovie && (
        <MovieModal
          movie={detailMovie}
          session={enrichedSession}
          onClose={() => setDetailMovie(null)}
          onRate={onRate}
          onEdit={onEditOpen}
          onDelete={onDelete}
        />
      )}

      {editMovie && (
        <EditMovieModal
          movie={editMovie}
          onClose={() => setEditMovie(null)}
          onSave={onSaveEdit}
        />
      )}

      {showAdd && (
        <AddMovieModal
          onClose={() => setShowAdd(false)}
          onAdd={onAdd}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}