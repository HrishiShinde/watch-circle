// ─── TMDB API helpers ─────────────────────────────────────────────────────────
const TMDB_KEY  = import.meta.env.VITE_TMDB_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

export const TMDB_IMG      = 'https://image.tmdb.org/t/p/w500'
export const TMDB_IMG_ORIG = 'https://image.tmdb.org/t/p/original'

// Search movies
export async function searchTMDB(query) {
  if (!query || query.length < 2) return []
  const res  = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`)
  const data = await res.json()
  return (data.results || []).slice(0, 6)
}

// Fetch full movie details (includes runtime/duration)
export async function fetchTMDBMovie(tmdbId) {
  const res  = await fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}`)
  const data = await res.json()
  return data
}

// Fetch genre list from TMDB and return id→name map
let _genreCache = null
export async function fetchTMDBGenreMap() {
  if (_genreCache) return _genreCache
  const res  = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`)
  const data = await res.json()
  _genreCache = Object.fromEntries((data.genres || []).map(g => [g.id, g.name]))
  return _genreCache
}

// Match TMDB genre names to our genres table ids
export function matchGenreIds(tmdbGenreIds, tmdbGenreMap, ourGenres) {
  return tmdbGenreIds
    .map(tmdbId => {
      const name = tmdbGenreMap[tmdbId]
      if (!name) return null
      // Find matching genre in our DB genres (case-insensitive)
      const match = ourGenres.find(g =>
        g.name.toLowerCase() === name.toLowerCase() ||
        // Handle TMDB "Science Fiction" → our "Sci-Fi"
        (name === 'Science Fiction' && g.name === 'Sci-Fi')
      )
      return match ? match.id : null
    })
    .filter(Boolean)
    .slice(0, 3) // max 3 genres
}

export function tmdbGenres(genreIds, genreMap) {
  return genreIds
    .slice(0, 2)
    .map(id => genreMap[id])
    .filter(Boolean)
    .join(', ')
}