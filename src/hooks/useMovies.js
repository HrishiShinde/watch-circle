import { useState, useEffect, useCallback } from 'react'
import {
  fetchMovies, fetchCircleMovies, addMovieToCircle,
  addMovie, editMovie, deleteMovie, rateMovie, fetchProfile, fetchMovieById, fetchMovieByTMDBId
} from '../lib/movies'
import { supabase } from '../lib/supabase'

export function useMovies(session, activeCircle) {
  const [movies,   setMovies]   = useState([])
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const userId = session?.user?.id

  // ── Derive circle scope ────────────────────────────────────────────────────
  // null activeCircle = Global, otherwise scoped to that circle's id
  const circleId = activeCircle?.id ?? null
  
  // ── Load movies ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [moviesData, profileData] = await Promise.all([
        circleId ? fetchCircleMovies(circleId, userId) : fetchMovies(userId),
        profile ? Promise.resolve(profile) : fetchProfile(userId),
      ])
      setMovies(moviesData)
      if (!profile) setProfile(profileData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, circleId])

  useEffect(() => { load() }, [load])

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`movies-realtime-${circleId ?? 'global'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movies' },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ratings' },
        () => load()
      )

    // Also listen to circle_movies changes when in a circle context
    if (circleId) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'circle_movies', filter: `circle_id=eq.${circleId}` },
        () => load()
      )
    }

    channel.subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, circleId, load])

  // ── Add movie ──────────────────────────────────────────────────────────────
  // Always adds to Global (movies table) first.
  // If in a circle context, also inserts into circle_movies.
  const handleAdd = useCallback(async (movieData) => {
    // Check if the movie already exists.
    let movie = await fetchMovieByTMDBId(movieData.tmdb_id, userId)

    // If the movie doesn't exists add it else use same movie id.
    if (!movie) {
      movie = await addMovie(movieData, userId)
    }

    if (circleId) {
      await addMovieToCircle(circleId, movie.id, userId)
    }

    // Optimistically prepend to current list
    setMovies(prev => [movie, ...prev])
    return movie
  }, [userId, circleId])

  // ── Edit movie ─────────────────────────────────────────────────────────────
  const handleEdit = useCallback(async (movieId, movieData) => {
    const updated = await editMovie(movieId, movieData, userId)
    setMovies(prev => prev.map(m => m.id === movieId ? updated : m))
    return updated
  }, [userId])

  // ── Delete movie ───────────────────────────────────────────────────────────
  // In circle context: removes from circle only (not Global)
  // In Global context: deletes from DB entirely
  const handleDelete = useCallback(async (movieId) => {
    if (circleId) {
      const { error } = await supabase
        .from('circle_movies')
        .delete()
        .eq('circle_id', circleId)
        .eq('movie_id', movieId)
      if (error) throw error
    } else {
      await deleteMovie(movieId)
    }
    setMovies(prev => prev.filter(m => m.id !== movieId))
  }, [circleId])

  // ── Rate movie ─────────────────────────────────────────────────────────────
  const handleRate = useCallback(async (movieId, rating) => {
    const updated = await rateMovie(movieId, userId, rating)
    setMovies(prev => prev.map(m => m.id === movieId ? updated : m))
    return updated
  }, [userId])

  return {
    movies,
    profile,
    loading,
    error,
    reload: load,
    handleAdd,
    handleEdit,
    handleDelete,
    handleRate,
  }
}