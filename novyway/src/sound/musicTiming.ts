export type MusicTransitionPhase = 'idle' | 'preload' | 'fadeout'

export function getMusicTransitionPhase(
  remainingSeconds: number,
  fadeDurationMs: number,
  preloadWindowSeconds = 35,
): MusicTransitionPhase {
  if (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0) return 'idle'
  const fadeDurationSeconds = Math.max(0, fadeDurationMs) / 1000
  if (remainingSeconds <= fadeDurationSeconds) return 'fadeout'
  if (remainingSeconds <= preloadWindowSeconds) return 'preload'
  return 'idle'
}