import { useState, useEffect, useCallback } from 'react'
import {
  fetchCircles, fetchCircleMembers,
  createCircle, updateCircle, deleteCircle,
  promoteMember, removeMember, leaveCircle,
  generateInviteCode, fetchInviteCodes, joinByCode
} from '../lib/circles'
import { supabase } from '../lib/supabase'

// ── Flip this to false to use real Supabase data ─────────────────────────────
const USE_MOCK = false

const MOCK_CIRCLES = [
  { id: 'mock-1', name: 'Movie Nights', is_personal: false, open_invites: false, role: 'moderator', created_by: 'me' },
  { id: 'mock-2', name: 'Horror Club',  is_personal: false, open_invites: true,  role: 'member',    created_by: 'other' },
]
const MOCK_PERSONAL = { id: 'personal', name: 'Personal', is_personal: true, open_invites: false, role: 'moderator' }
const MOCK_MEMBERS = [
  { user_id: '1', display_name: 'Hrishi',  initials: 'H', role: 'moderator', joined_at: new Date().toISOString() },
  { user_id: '2', display_name: 'Sam',     initials: 'S', role: 'member',    joined_at: new Date().toISOString() },
  { user_id: '3', display_name: 'Priya',   initials: 'P', role: 'member',    joined_at: new Date().toISOString() },
  { user_id: '4', display_name: 'Jay',     initials: 'J', role: 'member',    joined_at: new Date().toISOString() },
  { user_id: '5', display_name: 'Ananya',  initials: 'A', role: 'member',    joined_at: new Date().toISOString() },
]

export function useCircles(userId) {
  const [circles,        setCircles]        = useState([])
  const [personalCircle, setPersonalCircle] = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      if (USE_MOCK) {
        setPersonalCircle(MOCK_PERSONAL)
        setCircles(MOCK_CIRCLES)
        return
      }
      const { personalCircle: pc, circles: cs } = await fetchCircles(userId)
      setPersonalCircle(pc)
      setCircles(cs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!userId || USE_MOCK) return
    const channel = supabase
      .channel('circles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_members', filter: `user_id=eq.${userId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circles' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, load])

  const getMembers = useCallback(async (circleId) => {
    if (USE_MOCK) return MOCK_MEMBERS
    return fetchCircleMembers(circleId)
  }, [])

  const handleCreate = useCallback(async (circleData) => {
    if (USE_MOCK) {
      const mock = { id: `mock-${Date.now()}`, ...circleData, is_personal: false, role: 'moderator' }
      setCircles(prev => [mock, ...prev])
      return mock
    }
    const newCircle = await createCircle(circleData, userId)
    setCircles(prev => [newCircle, ...prev])
    return newCircle
  }, [userId])

  const handleUpdate = useCallback(async (circleId, circleData) => {
    if (USE_MOCK) {
      setCircles(prev => prev.map(c => c.id === circleId ? { ...c, ...circleData } : c))
      return
    }
    const updated = await updateCircle(circleId, circleData)
    setCircles(prev => prev.map(c => c.id === circleId ? { ...c, ...updated } : c))
  }, [])

  const handleDelete = useCallback(async (circleId) => {
    if (USE_MOCK) {
      setCircles(prev => prev.filter(c => c.id !== circleId))
      return
    }
    await deleteCircle(circleId)
    setCircles(prev => prev.filter(c => c.id !== circleId))
  }, [])

  const handlePromote = useCallback(async (circleId, targetUserId) => {
    if (!USE_MOCK) await promoteMember(circleId, targetUserId)
  }, [])

  const handleRemoveMember = useCallback(async (circleId, targetUserId) => {
    if (!USE_MOCK) await removeMember(circleId, targetUserId)
  }, [])

  const handleLeave = useCallback(async (circleId) => {
    if (USE_MOCK) {
      setCircles(prev => prev.filter(c => c.id !== circleId))
      return
    }
    await leaveCircle(circleId, userId)
    setCircles(prev => prev.filter(c => c.id !== circleId))
  }, [userId])

  const handleGenerateCode = useCallback(async (circleId) => {
    if (USE_MOCK) return 'MOCK1234'
    return generateInviteCode(circleId, userId)
  }, [userId])

  const handleFetchCodes = useCallback(async (circleId) => {
    if (USE_MOCK) return [{ id: '1', code: 'MOCK1234', created_at: new Date().toISOString(), used_by: null }]
    return fetchInviteCodes(circleId)
  }, [])

  const handleJoin = useCallback(async (code) => {
    if (USE_MOCK) {
      const mockCircle = { id: `mock-${Date.now()}`, name: 'Joined Circle', is_personal: false, open_invites: false, role: 'member' }
      setCircles(prev => [...prev, mockCircle])
      return mockCircle
    }
    const circle = await joinByCode(code, userId)
    // Reload so the new circle_members row is reflected everywhere
    await load()
    return circle
  }, [userId, load])

  return {
    circles,
    personalCircle,
    loading,
    error,
    reload: load,
    getMembers,
    handleCreate,
    handleUpdate,
    handleDelete,
    handlePromote,
    handleRemoveMember,
    handleLeave,
    handleGenerateCode,
    handleFetchCodes,
    handleJoin
  }
}