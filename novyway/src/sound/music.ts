import { getMusicTransitionPhase } from './musicTiming'

export type MusicStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'blocked' | 'unavailable' | 'error'

export const MUSIC_FADE_MS = 10_000

type MusicTrack = { id: number; title: string; url: string }
type PlaylistResponse = { enabled: boolean; localPreview: boolean; tracks: MusicTrack[]; legalNotice: string | null }
type Listener = () => void

class BackgroundMusic {
  private tracks: MusicTrack[] = []
  private players: [HTMLAudioElement, HTMLAudioElement] | null = null
  private active = 0
  private trackIndex = 0
  private transitioning = false
  private prepared = false
  private preparePromise: Promise<void> | null = null
  private playPromise: Promise<boolean> | null = null
  private playbackGeneration = 0
  private transitionTimer: number | null = null
  private requestedPlayback = false
  private backgroundPlayback = false
  private envelopes: [number, number] = [0, 0]
  private listeners = new Set<Listener>()
  private _status: MusicStatus = 'loading'
  private _error: string | null = null
  private _localPreview = false
  private _muted = false
  volume = 0.59

  get status() { return this._status }
  get error() { return this._error }
  get localPreview() { return this._localPreview }
  get isPlaying() { return this._status === 'playing' }
  get muted() { return this._muted }
  get trackCount() { return this.tracks.length }
  get currentTrack() { return this.tracks[this.trackIndex] ?? null }
  get enabledIntent() { return this.requestedPlayback }
  get playsInBackground() { return this.backgroundPlayback }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private emit(status?: MusicStatus, error: string | null = null) {
    if (status) this._status = status
    this._error = error
    for (const listener of this.listeners) listener()
  }

  async prepare() {
    if (this.prepared) return
    if (this.preparePromise) return this.preparePromise
    this.emit('loading')
    this.preparePromise = (async () => {
      try {
        const response = await fetch('/api/music/playlist', { cache: 'no-store' })
        if (!response.ok) throw new Error('playlist_http_' + response.status)
        const body = await response.json() as PlaylistResponse
        this.tracks = body.tracks
        this._localPreview = body.localPreview
        this.prepared = true
        this.emit(body.enabled && body.tracks.length > 0 ? 'ready' : 'unavailable')
      } catch (error) {
        this.emit('error', error instanceof Error ? error.message : 'playlist_unavailable')
      } finally {
        this.preparePromise = null
      }
    })()
    return this.preparePromise
  }

  private ensurePlayers() {
    if (this.players) return this.players
    const first = new Audio()
    const second = new Audio()
    for (const player of [first, second]) {
      player.preload = 'none'
      player.setAttribute('playsinline', '')
      player.addEventListener('timeupdate', () => this.handleProgress(player))
      player.addEventListener('ended', () => this.advanceAfterEnd(player))
      player.addEventListener('error', () => {
        if (player.src) this.emit('error', 'music_stream_failed')
      })
    }
    this.players = [first, second]
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.backgroundPlayback && this.requestedPlayback) {
        this.suspendPlayback()
      } else if (!document.hidden && this.requestedPlayback && !this.isPlaying) {
        void this.play()
      }
    })
    return this.players
  }

  private targetVolume() {
    if (this._muted) return 0
    return Math.max(0, Math.min(1, this.volume)) * 0.25
  }

  private applyVolumes() {
    if (!this.players) return
    const target = this.targetVolume()
    this.players[0].volume = target * this.envelopes[0]
    this.players[1].volume = target * this.envelopes[1]
  }

  private clearTransition() {
    if (this.transitionTimer === null) return
    window.clearInterval(this.transitionTimer)
    this.transitionTimer = null
  }

  private fadeInActive(generation: number) {
    if (!this.players) return
    this.clearTransition()
    const active = this.active
    const initialEnvelope = 0.18
    this.envelopes[active] = initialEnvelope
    this.applyVolumes()
    const started = performance.now()
    const tick = () => {
      if (generation !== this.playbackGeneration || !this.players || active !== this.active) {
        this.clearTransition()
        return
      }
      const progress = Math.min(1, (performance.now() - started) / MUSIC_FADE_MS)
      this.envelopes[active] = initialEnvelope + (1 - initialEnvelope) * Math.sin(progress * Math.PI / 2)
      this.applyVolumes()
      if (progress >= 1) this.clearTransition()
    }
    tick()
    this.transitionTimer = window.setInterval(tick, 100)
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value))
    this.applyVolumes()
  }

  setMuted(value: boolean) {
    if (this._muted === value) return
    this._muted = value
    this.applyVolumes()
    this.emit()
  }

  toggleMute() {
    this.setMuted(!this._muted)
    return this._muted
  }

  setBackgroundPlayback(value: boolean) {
    if (this.backgroundPlayback === value) return
    this.backgroundPlayback = value
    if (document.hidden && !value && this.requestedPlayback) {
      this.suspendPlayback()
    } else if (!document.hidden && this.requestedPlayback && !this.isPlaying) {
      void this.play()
    }
    this.emit()
  }

  async skipNext() {
    if (!this.prepared) await this.prepare()
    if (this.tracks.length === 0) return false
    this.trackIndex = (this.trackIndex + 1) % this.tracks.length
    if (!this.requestedPlayback) {
      this.emit()
      return true
    }
    if (document.hidden && !this.backgroundPlayback) {
      this.emit('paused')
      return true
    }

    const players = this.ensurePlayers()
    const currentIndex = this.active
    const nextIndex = 1 - currentIndex
    const current = players[currentIndex]
    const next = players[nextIndex]
    const generation = ++this.playbackGeneration

    this.transitioning = false
    this.clearTransition()
    current.pause()
    current.removeAttribute('src')
    current.load()
    next.pause()
    next.src = this.tracks[this.trackIndex].url
    next.preload = 'auto'
    next.currentTime = 0
    this.envelopes = [0, 0]
    this.active = nextIndex
    this.applyVolumes()

    try {
      await next.play()
      if (generation !== this.playbackGeneration || !this.requestedPlayback) {
        next.pause()
        return false
      }
      this.emit('playing')
      this.fadeInActive(generation)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'skip_failed'
      this.emit(this.isAutoplayBlock(error, message) ? 'blocked' : 'error', message)
      return false
    }
  }

  play() {
    this.requestedPlayback = true
    if (this.playPromise) return this.playPromise
    const attempt = this.startPlayback()
    this.playPromise = attempt
    void attempt.finally(() => {
      if (this.playPromise === attempt) this.playPromise = null
    })
    return attempt
  }

  private async startPlayback() {
    if (!this.prepared) await this.prepare()
    if (!this.requestedPlayback) return false
    if (this.tracks.length === 0) {
      this.requestedPlayback = false
      this.emit('unavailable', 'music_public_license_required')
      return false
    }
    if (document.hidden && !this.backgroundPlayback) {
      this.emit('paused')
      return true
    }

    const players = this.ensurePlayers()
    if (this.isPlaying) return true
    const generation = ++this.playbackGeneration
    const current = players[this.active]
    if (!current.src) current.src = this.tracks[this.trackIndex].url
    this.envelopes[this.active] = 0
    this.applyVolumes()

    try {
      await current.play()
      if (generation !== this.playbackGeneration || !this.requestedPlayback) {
        current.pause()
        return false
      }
      this.emit('playing')
      this.fadeInActive(generation)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'autoplay_blocked'
      const blocked = this.isAutoplayBlock(error, message)
      if (!blocked) this.requestedPlayback = false
      this.emit(blocked ? 'blocked' : 'error', message)
      return false
    }
  }

  pause() {
    this.requestedPlayback = false
    this.suspendPlayback()
  }

  private suspendPlayback() {
    this.playbackGeneration += 1
    this.transitioning = false
    this.clearTransition()
    if (this.players) {
      for (const player of this.players) player.pause()
      this.envelopes = [0, 0]
      this.applyVolumes()
    }
    this.emit('paused')
  }

  private isAutoplayBlock(error: unknown, message: string) {
    return error instanceof DOMException
      ? error.name === 'NotAllowedError'
      : /autoplay|notallowed|user.*gesture/i.test(message)
  }

  private handleProgress(player: HTMLAudioElement) {
    if (!this.players || player !== this.players[this.active] || !Number.isFinite(player.duration)) return
    const remaining = player.duration - player.currentTime
    const phase = getMusicTransitionPhase(remaining, MUSIC_FADE_MS)
    if (phase === 'preload') this.prepareNext()
    if (phase === 'fadeout' && !this.transitioning) this.fadeOutForTrackEnd()
  }

  private prepareNext() {
    if (!this.players || this.tracks.length < 2) return
    const next = this.players[1 - this.active]
    const nextTrack = this.tracks[(this.trackIndex + 1) % this.tracks.length]
    if (!next.src.endsWith(nextTrack.url)) {
      next.src = nextTrack.url
      next.preload = 'auto'
      this.envelopes[1 - this.active] = 0
      next.load()
    }
  }

  private fadeOutForTrackEnd() {
    if (!this.players || this.tracks.length === 0) return
    this.clearTransition()
    this.transitioning = true
    const generation = this.playbackGeneration
    const active = this.active
    const startEnvelope = this.envelopes[active] > 0 ? this.envelopes[active] : 1
    this.envelopes[1 - active] = 0
    this.applyVolumes()
    const started = performance.now()
    const tick = () => {
      if (
        generation !== this.playbackGeneration
        || !this.players
        || active !== this.active
        || !this.transitioning
      ) {
        this.clearTransition()
        return
      }
      const progress = Math.min(1, (performance.now() - started) / MUSIC_FADE_MS)
      this.envelopes[active] = startEnvelope * Math.cos(progress * Math.PI / 2)
      this.envelopes[1 - active] = 0
      this.applyVolumes()
      if (progress >= 1) this.clearTransition()
    }
    tick()
    this.transitionTimer = window.setInterval(tick, 100)
  }

  private advanceAfterEnd(player: HTMLAudioElement) {
    if (!this.players || player !== this.players[this.active] || this.tracks.length === 0) return
    const players = this.players
    const currentIndex = this.active
    const nextIndex = 1 - currentIndex
    const nextTrackIndex = (this.trackIndex + 1) % this.tracks.length
    const next = players[nextIndex]
    const nextTrack = this.tracks[nextTrackIndex]

    this.transitioning = false
    this.clearTransition()
    player.pause()
    player.removeAttribute('src')
    player.load()
    if (!next.src.endsWith(nextTrack.url)) {
      next.src = nextTrack.url
      next.preload = 'auto'
    }
    this.envelopes = [0, 0]
    this.active = nextIndex
    this.trackIndex = nextTrackIndex
    this.applyVolumes()

    if (!this.requestedPlayback) {
      this.emit('paused')
      return
    }

    const generation = this.playbackGeneration
    void next.play()
      .then(() => {
        if (generation !== this.playbackGeneration || !this.requestedPlayback) {
          next.pause()
          return
        }
        this.emit('playing')
        this.fadeInActive(generation)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'music_stream_failed'
        const blocked = this.isAutoplayBlock(error, message)
        if (!blocked) this.requestedPlayback = false
        this.emit(blocked ? 'blocked' : 'error', message)
      })
  }
}

export const music = new BackgroundMusic()
