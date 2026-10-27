/**
 * Parse lrc, suppose multiple time tag
 * @see https://github.com/MoePlayer/APlayer/blob/master/src/js/lrc.js#L83
 * @author DIYgod(https://github.com/DIYgod)
 *
 * @param {String} lrc_s - Format:
 * [mm:ss]lyric
 * [mm:ss.xx]lyric
 * [mm:ss.xxx]lyric
 * [mm:ss.xx][mm:ss.xx][mm:ss.xx]lyric
 * [mm:ss.xx]<mm:ss.xx>lyric
 *
 * @return {Array} [[time, text], [time, text], [time, text], ...]
 */
export function parseLrc (lrc_s) {
  if (lrc_s) {
    lrc_s = lrc_s.replace(/([^\]^\n])\[/g, (match, p1) => p1 + '\n[')
    const lyric = lrc_s.split(/\r?\n/)
    const lrc = []
    const lyricLen = lyric.length
    for (let i = 0; i < lyricLen; i++) {
      // match lrc time
      const lrcTimes = lyric[i].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g)
      // match lrc text
      const lrcText = lyric[i].replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, '').replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, '').replace(/^\s+|\s+$/g, '')

      if (lrcTimes) {
        // handle multiple time tag
        const timeLen = lrcTimes.length
        for (let j = 0; j < timeLen; j++) {
          const oneTime = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(lrcTimes[j])
          const min2sec = oneTime[1] * 60
          const sec2sec = parseInt(oneTime[2])
          const msec2sec = oneTime[4] ? parseInt(oneTime[4]) / ((oneTime[4] + '').length === 2 ? 100 : 1000) : 0
          const lrcTime = min2sec + sec2sec + msec2sec
          lrc.push([lrcTime, lrcText])
        }
      }
    }
    // sort by time
    lrc.sort((a, b) => a[0] - b[0])
    return lrc
  }
  else {
    return []
  }
}

export function warn (message) {
  return console.warn(`[Vue-APlayer] ${message}`)
}

export function clamp (value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Pointer position (mouse or touch) of an event
 */
export function getPointer (e) {
  return (e.changedTouches && e.changedTouches[0]) || e
}
