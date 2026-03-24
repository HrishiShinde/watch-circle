import { supabase } from './supabase'

// ─── Shared select query ──────────────────────────────────────────────────────
// Note: profiles joined via added_by foreign key
// Supabase needs the explicit hint "profiles!added_by" to resolve the relationship
const MOVIE_SELECT = `
  id, title, poster_path, release_year, duration,
  tmdb_id, avg_rating, rating_count, added_by, created_at,
  profiles!added_by ( display_name, is_moderator ),
  movie_genres (
    genre_id,
    genres ( id, name, color )
  ),
  movie_platforms (
    platform_id, watch_link,
    platforms ( id, name, logo_url )
  ),
  ratings ( rating, user_id )
`

// ─── Shape raw Supabase row → clean movie object ──────────────────────────────
export function shapeMovie(row, userId) {
  const genres = (row.movie_genres || [])
    .map(mg => mg.genres?.name)
    .filter(Boolean)

  const platformData  = (row.movie_platforms || [])[0]
  const platform      = platformData?.platforms?.name    || null
  const platform_logo = platformData?.platforms?.logo_url || null
  const watch_link    = platformData?.watch_link          || null

  const myRating      = (row.ratings || []).find(r => r.user_id === userId)
  const watched_by_me = !!myRating
  const my_rating     = myRating?.rating || null

  return {
    id:             row.id,
    title:          row.title,
    poster_path:    row.poster_path,
    release_year:   row.release_year,
    duration:       row.duration,
    tmdb_id:        row.tmdb_id,
    avg_rating:     row.avg_rating,
    rating_count:   row.rating_count,
    added_by:       row.added_by,
    added_by_name:  row.profiles?.display_name || 'Someone',
    created_at:     row.created_at,
    genre:          genres.join(', ') || null,
    genres,
    platform,
    platform_logo,
    watch_link,
    where_to_watch: platform,
    watched_by_me,
    my_rating,
  }
}

// ─── Fetch all movies ─────────────────────────────────────────────────────────
export async function fetchMovies(userId) {
  const { data, error } = await supabase
    .from('movies')
    .select(MOVIE_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(row => shapeMovie(row, userId))
}

// ─── Fetch single movie by id ─────────────────────────────────────────────────
export async function fetchMovieById(movieId, userId) {
  const { data, error } = await supabase
    .from('movies')
    .select(MOVIE_SELECT)
    .eq('id', movieId)
    .single()
  if (error) throw error
  return shapeMovie(data, userId)
}

// ─── Add a movie ──────────────────────────────────────────────────────────────
export async function addMovie(movieData, userId) {
  // 1. Insert core movie row
  const { data: movie, error: movieErr } = await supabase
    .from('movies')
    .insert({
      title:        movieData.title,
      poster_path:  movieData.poster_path  || null,
      release_year: movieData.release_year || null,
      duration:     movieData.duration     || null,
      tmdb_id:      movieData.tmdb_id      || null,
      added_by:     userId,
    })
    .select()
    .single()

  if (movieErr) throw movieErr

  // 2. Insert genres junction rows
  if (movieData.genre_ids?.length) {
    const { error: genreErr } = await supabase
      .from('movie_genres')
      .insert(movieData.genre_ids.map(genre_id => ({
        movie_id: movie.id,
        genre_id,
      })))
    if (genreErr) throw genreErr
  }

  // 3. Insert platform junction row
  if (movieData.platform_id) {
    const { error: platformErr } = await supabase
      .from('movie_platforms')
      .insert({
        movie_id:    movie.id,
        platform_id: movieData.platform_id,
        watch_link:  movieData.watch_link || null,
      })
    if (platformErr) throw platformErr
  }

  return fetchMovieById(movie.id, userId)
}

// ─── Edit a movie ─────────────────────────────────────────────────────────────
export async function editMovie(movieId, movieData, userId) {
  // 1. Update core fields
  const { error: movieErr } = await supabase
    .from('movies')
    .update({
      title:        movieData.title,
      poster_path:  movieData.poster_path  || null,
      release_year: movieData.release_year || null,
      duration:     movieData.duration     || null,
    })
    .eq('id', movieId)

  if (movieErr) throw movieErr

  // 2. Replace genres — delete then re-insert
  await supabase.from('movie_genres').delete().eq('movie_id', movieId)
  if (movieData.genre_ids?.length) {
    await supabase.from('movie_genres').insert(
      movieData.genre_ids.map(genre_id => ({ movie_id: movieId, genre_id }))
    )
  }

  // 3. Replace platform — delete then re-insert
  await supabase.from('movie_platforms').delete().eq('movie_id', movieId)
  if (movieData.platform_id) {
    await supabase.from('movie_platforms').insert({
      movie_id:    movieId,
      platform_id: movieData.platform_id,
      watch_link:  movieData.watch_link || null,
    })
  }

  return fetchMovieById(movieId, userId)
}

// ─── Delete a movie ───────────────────────────────────────────────────────────
export async function deleteMovie(movieId) {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', movieId)
  if (error) throw error
}

// ─── Rate a movie (upsert) ────────────────────────────────────────────────────
export async function rateMovie(movieId, userId, rating) {
  const { error } = await supabase
    .from('ratings')
    .upsert(
      { movie_id: movieId, user_id: userId, rating },
      { onConflict: 'movie_id,user_id' }
    )
  if (error) throw error
  return fetchMovieById(movieId, userId)
}

// ─── Fetch user profile ───────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // If profile doesn't exist yet (race condition on signup), create it
  if (error?.code === 'PGRST116') {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select()
      .single()
    return newProfile
  }

  if (error) throw error
  return data
}