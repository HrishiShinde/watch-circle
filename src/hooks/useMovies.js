import { useState, useEffect, useCallback } from 'react'
import { fetchMovies, addMovie, editMovie, deleteMovie, rateMovie, fetchProfile } from '../lib/movies'
import { supabase } from '../lib/supabase'

export function useMovies(session) {
  const [movies,   setMovies]   = useState([])
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const userId = session?.user?.id

  // ── Initial load ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [moviesData, profileData] = await Promise.all([
        fetchMovies(userId),
        fetchProfile(userId),
      ])
      setMovies(moviesData)
      setProfile(profileData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  // ── Realtime subscription — new movies added by other users appear instantly ─
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('movies-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movies' },
        () => load() // reload on any change
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ratings' },
        () => load()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId, load])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async (movieData) => {
    const newMovie = await addMovie(movieData, userId)
    setMovies(prev => [newMovie, ...prev])
    return newMovie
  }, [userId])

  const handleEdit = useCallback(async (movieId, movieData) => {
    const updated = await editMovie(movieId, movieData, userId)
    setMovies(prev => prev.map(m => m.id === movieId ? updated : m))
    return updated
  }, [userId])

  const handleDelete = useCallback(async (movieId) => {
    await deleteMovie(movieId)
    setMovies(prev => prev.filter(m => m.id !== movieId))
  }, [])

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