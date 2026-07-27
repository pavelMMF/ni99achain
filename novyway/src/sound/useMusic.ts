import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useSettings } from '../demo/store'
import { sound } from './engine'
import { music } from './music'

export function useMusic() {
  const { s, update } = useSettings()
  const [, force] = useReducer((value) => value + 1, 0)
  const [busy, setBusy] = useState(false)
  const operation = useRef(0)

  useEffect(() => music.subscribe(force), [])

  const setEnabled = useCallback(async (enabled: boolean) => {
    const generation = ++operation.current
    update({ musicOn: enabled })

    if (!enabled) {
      music.pause()
      setBusy(false)
      return
    }

    sound.stopIdleAmbience()
    setBusy(true)
    const started = await music.play()
    if (generation !== operation.current) return
    setBusy(false)

    if (!started && music.status !== 'blocked' && music.status !== 'paused') {
      update({ musicOn: false })
    }
  }, [update])

  const playing = s.musicOn && music.status === 'playing'
  const enabled = s.musicOn
  const toggle = useCallback(() => {
    void setEnabled(!enabled)
  }, [enabled, setEnabled])
  const next = useCallback(() => { void music.skipNext() }, [])
  const toggleMute = useCallback(() => music.toggleMute(), [])

  return {
    status: music.status,
    playing,
    enabled,
    busy,
    starting: busy,
    muted: music.muted,
    currentTrack: music.currentTrack,
    trackCount: music.trackCount,
    error: music.error,
    localPreview: music.localPreview,
    available: music.status !== 'unavailable',
    setEnabled,
    toggle,
    next,
    toggleMute,
  }
}
