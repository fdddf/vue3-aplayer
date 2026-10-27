/**
 * Optional third-party libraries, set via `app.use(VueAPlayer, options)`.
 * Falls back to globals so CDN `<script>` users need no configuration.
 */
const config = {
  hls: null,
  colorThief: null,
}

export function setConfig (options = {}) {
  if (options.hls) config.hls = options.hls
  if (options.colorThief) config.colorThief = options.colorThief
}

export function getHls () {
  return config.hls || (typeof window !== 'undefined' && window.Hls) || null
}

export function getColorThief () {
  return config.colorThief || (typeof window !== 'undefined' && window.ColorThief) || null
}
