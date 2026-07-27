import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { getMusicTransitionPhase } from '../src/sound/musicTiming.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [engine, hook, player, store, settings, styles] = await Promise.all([
  readFile(resolve(root, 'src/sound/music.ts'), 'utf8'),
  readFile(resolve(root, 'src/sound/useMusic.ts'), 'utf8'),
  readFile(resolve(root, 'src/ui/layout/MusicPlayer.tsx'), 'utf8'),
  readFile(resolve(root, 'src/demo/store.tsx'), 'utf8'),
  readFile(resolve(root, 'src/screens/Settings.tsx'), 'utf8'),
  readFile(resolve(root, 'src/styles/global.css'), 'utf8'),
])

assert.equal(getMusicTransitionPhase(120, 10_000), 'idle', 'a track must not transition minutes before its end')
assert.equal(getMusicTransitionPhase(30, 10_000), 'preload', 'the next track should preload before the fade window')
assert.equal(getMusicTransitionPhase(9.9, 10_000), 'fadeout', 'fade-out should begin only inside the final ten seconds')
assert.equal(getMusicTransitionPhase(0, 10_000), 'idle', 'an ended event owns the zero-second boundary')

assert.match(engine, /getMusicTransitionPhase\(remaining, MUSIC_FADE_MS\)/, 'the playback engine must use the unit-safe scheduler')
assert.doesNotMatch(engine, /MUSIC_INITIAL_DELAY_MS|initialPlaybackAt|scheduleDelayedPlay/, 'manual playback must never wait on an internal timer')
assert.match(engine, /pause\(\) \{\s*this\.requestedPlayback = false\s*this\.suspendPlayback\(\)/, 'manual pause must stop audio immediately')
assert.match(engine, /playPromise/, 'parallel play requests must be coalesced')
assert.match(engine, /if \(!blocked\) this\.requestedPlayback = false/, 'an autoplay block must preserve the user preference')
assert.match(engine, /fadeOutForTrackEnd/, 'track endings must use a sequential fade')
assert.doesNotMatch(engine, /private async crossfade/, 'tracks must not overlap during automatic transitions')

assert.match(hook, /if \(!enabled\) \{\s*music\.pause\(\)/, 'disable must bypass any in-flight start')
assert.match(hook, /void setEnabled\(!enabled\)/, 'the topbar button must always invert saved playback intent')
assert.match(store, /musicOn: true/, 'fresh installations should enable background music')
assert.match(store, /musicPreferenceVersion/, 'legacy autoplay resets must be migrated once')
assert.doesNotMatch(store, /music\.status !== 'blocked'.*musicOn: false/s, 'blocked autoplay must not disable the saved preference')
assert.doesNotMatch(settings, /30 секунд|30 seconds|короткой паузы|short pause/, 'settings must not promise a delayed start')

assert.doesNotMatch(player, /music-volume-value/, 'the compact topbar volume control should not render a percentage')
assert.doesNotMatch(player, /disabled=\{busy\}/, 'the stop button must remain available during a start attempt')
assert.match(styles, /\.music-volume-control::after/, 'the hover path to the volume popover must be bridged')

console.log('Music playback regression checks passed.')
