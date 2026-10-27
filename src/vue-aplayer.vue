<template>
  <div
    class="aplayer"
    :class="{
      'aplayer-mini': mini,
      'aplayer-withlist' : !mini && musicList.length > 0,
      'aplayer-withlrc': !mini && (!!$slots.display || showLrc),
      'aplayer-float': isFloatMode,
      'aplayer-loading': isPlaying && isLoading
    }"
    :style="floatStyleObj"
  >
    <div class="aplayer-body">
      <thumbnail
        :pic="currentMusic.pic"
        :playing="isPlaying"
        :enable-drag="isFloatMode"
        :theme="currentTheme"
        @toggleplay="toggle"
        @dragbegin="onDragBegin"
        @dragging="onDragAround"
      />
      <div class="aplayer-info" v-show="!mini">
        <div class="aplayer-music">
          <span class="aplayer-title">{{ currentMusic.title || 'Untitled' }}</span>
          <span class="aplayer-author">{{ currentMusic.artist || 'Unknown' }}</span>
        </div>
        <slot name="display" :currentMusic="currentMusic" :playStat="playStat">
          <lyrics :current-music="currentMusic" :play-stat="playStat" v-if="showLrc" />
        </slot>
        <controls
          :shuffle="shouldShuffle"
          :repeat="repeatMode"
          :stat="playStat"
          :volume="audioVolume"
          :muted="isAudioMuted"
          :theme="currentTheme"
          :is-mobile="isMobile"
          :list-shown="showList"
          @toggleshuffle="shouldShuffle = !shouldShuffle"
          @togglelist="showList = !showList"
          @togglemute="toggleMute"
          @setvolume="setAudioVolume"
          @dragbegin="onProgressDragBegin"
          @dragend="onProgressDragEnd"
          @dragging="onProgressDragging"
          @nextmode="setNextMode"
        />
      </div>
    </div>
    <audio ref="audio"></audio>
    <music-list
      :show="showList && !mini"
      :current-music="currentMusic"
      :music-list="musicList"
      :play-index="playIndex"
      :listmaxheight="listMaxHeight"
      :theme="currentTheme"
      @selectsong="onSelectSong"
    />
  </div>
</template>
<script>
  import Thumbnail from './components/aplayer-thumbnail.vue'
  import MusicList from './components/aplayer-list.vue'
  import Controls from './components/aplayer-controller.vue'
  import Lyrics from './components/aplayer-lrc.vue'
  import { toRaw } from 'vue'
  import { warn } from './utils'
  import { getHls, getColorThief } from './config'

  /**
   * memorize self-adapting theme for cover image urls
   * @type {Object.<url, rgb()>}
   */
  const picThemeCache = {}

  // mutex playing instance
  let activeMutex = null


  const HLS_RE = /\.m3u8(?=(#|\?|$))/

  const MEDIA_EVENTS = [
    'abort',
    'canplay', 'canplaythrough',
    'durationchange',
    'emptied', 'encrypted', 'ended', 'error',
    'interruptbegin', 'interruptend',
    'loadeddata', 'loadedmetadata', 'loadstart',
    'mozaudioavailable',
    'pause', 'play', 'playing', 'progress',
    'ratechange',
    'seeked', 'seeking', 'stalled', 'suspend',
    'timeupdate',
    'volumechange',
    'waiting',
  ]

  /**
   * Extract the dominant color of a loaded <img> with color-thief (v2 or v3)
   * @return {String|null} css color
   */
  function getDominantColor (ColorThief, img) {
    if (typeof ColorThief.getColorSync === 'function') {
      // colorthief@3 exports functions
      const color = ColorThief.getColorSync(img)
      return color ? color.css() : null
    }
    // colorthief@2 exports a class
    const rgb = new ColorThief().getColor(img)
    return rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : null
  }

  const REPEAT = {
    NONE: 'none',
    MUSIC: 'music',
    LIST: 'list',
    NO_REPEAT: 'no-repeat',
    REPEAT_ONE: 'repeat-one',
    REPEAT_ALL: 'repeat-all',
  };

  const VueAPlayer = {
    name: 'APlayer',
    components: {
      Thumbnail,
      Controls,
      MusicList,
      Lyrics,
    },
    props: {
      music: {
        type: Object,
        required: true,
        validator (song) {
          return !!song.src
        },
      },
      list: {
        type: Array,
        default () {
          return []
        },
      },
      mini: {
        type: Boolean,
        default: false,
      },
      showLrc: {
        type: Boolean,
        default: false,
      },
      mutex: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        default: '#41b883',
      },

      listMaxHeight: String,
      /**
       * @since 1.4.1
       * Fold playlist initially
       */
      listFolded: {
        type: Boolean,
        default: false,
      },

      /**
       * @since 1.2.0 Float mode
       */
      float: {
        type: Boolean,
        default: false,
      },

      // Audio attributes as props
      // since 1.4.0
      // autoplay controls muted preload volume
      // autoplay is not observable

      /**
       * @since 1.4.0
       * not observable
       */
      autoplay: {
        type: Boolean,
        default: false,
      },

      /**
       * @since 1.4.0
       * whether to show native audio controls below Vue-APlayer
       * not work in mini mode
       *
       * observable
       */
      controls: {
        type: Boolean,
        default: false,
      },

      /**
       * @since 1.4.0
       * observable, sync
       */
      muted: {
        type: Boolean,
        default: false,
      },
      /**
       * @since 1.4.0
       * observable
       */
      preload: String,

      /**
       * @since 1.4.0
       * observable, sync
       */
      volume: {
        type: Number,
        default: 0.8,
        validator (value) {
          return value >= 0 && value <= 1
        },
      },

      // play order control
      // since 1.5.0

      /**
       * @since 1.5.0
       * @see https://support.apple.com/en-us/HT207230
       * twoWay
       */
      shuffle: {
        type: Boolean,
        default: false,
      },
      /**
       * @since 1.5.0
       * @see https://support.apple.com/en-us/HT207230
       * twoWay
       */
      repeat: {
        type: String,
        default: REPEAT.NO_REPEAT,
      },
    },
    emits: [
      'update:music', 'update:muted', 'update:volume', 'update:shuffle', 'update:repeat',
      ...MEDIA_EVENTS,
    ],
    data () {
      return {
        internalMusic: this.music,
        isPlaying: false,
        isSeeking: false,
        wasPlayingBeforeSeeking: false,
        isMobile: typeof navigator !== 'undefined' && /mobile/i.test(navigator.userAgent),
        playStat: {
          duration: 0,
          loadedTime: 0,
          playedTime: 0,
        },
        showList: !this.listFolded,

        // handle Promise returned from audio.play()
        // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
        audioPlayPromise: Promise.resolve(),


        // @since 1.2.0 float mode

        floatOriginX: 0,
        floatOriginY: 0,
        floatOffsetLeft: 0,
        floatOffsetTop: 0,


        // @since 1.3.0 self adapting theme
        selfAdaptingTheme: null,


        // @since 1.4.0
        // sync muted, volume

        internalMuted: this.muted,
        internalVolume: this.volume,

        // @since 1.4.1
        // Loading indicator
        isLoading: false,


        // @since 1.5.1
        // sync shuffle, repeat
        internalShuffle: this.shuffle,
        internalRepeat: this.repeat,
        // for shuffling
        shuffledList: [],
      }
    },
    computed: {
      // alias for $refs.audio
      audio () {
        return this.$refs.audio
      },

      // sync music
      currentMusic: {
        get () {
          return this.internalMusic
        },
        set (val) {
          this.$emit('update:music', val)
          this.internalMusic = val
        },
      },

      // props wrappers

      currentTheme () {
        return this.selfAdaptingTheme || this.currentMusic.theme || this.theme
      },
      isFloatMode () {
        return this.float && !this.isMobile
      },
      shouldAutoplay () {
        if (this.isMobile) return false
        return this.autoplay
      },
      musicList () {
        return this.list
      },
      shouldShowNativeControls () {
        return this.controls && !this.mini
      },

      // useful

      floatStyleObj () {
        // transform: translate(floatOffsetLeft, floatOffsetY)
        return {
          transform: `translate(${this.floatOffsetLeft}px, ${this.floatOffsetTop}px)`,
          webkitTransform: `translate(${this.floatOffsetLeft}px, ${this.floatOffsetTop}px)`,
        }
      },
      playIndex: {
        get () {
          return this.shuffledList.indexOf(toRaw(this.currentMusic))
        },
        set (val) {
          this.currentMusic = this.shuffledList[val % this.shuffledList.length]
        },
      },

      // since 1.4.0
      // sync muted, volume

      isAudioMuted: {
        get () {
          return this.internalMuted
        },
        set (val) {
          this.$emit('update:muted', val)
          this.internalMuted = val
        },
      },
      audioVolume: {
        get () {
          return this.internalVolume
        },
        set (val) {
          this.$emit('update:volume', val)
          this.internalVolume = val
        },
      },


      // since 1.5.0
      // sync shuffle, repeat
      shouldShuffle: {
        get () {
          return this.internalShuffle
        },
        set (val) {
          this.$emit('update:shuffle', val)
          this.internalShuffle = val
        },
      },
      repeatMode: {
        get () {
          switch (this.internalRepeat) {
            case REPEAT.NONE:
            case REPEAT.NO_REPEAT:
              return REPEAT.NO_REPEAT
            case REPEAT.MUSIC:
            case REPEAT.REPEAT_ONE:
              return REPEAT.REPEAT_ONE
            default:
              return REPEAT.REPEAT_ALL
          }
        },
        set (val) {
          this.$emit('update:repeat', val)
          this.internalRepeat = val
        },
      },
    },
    methods: {
      // Float mode

      onDragBegin () {
        this.floatOriginX = this.floatOffsetLeft
        this.floatOriginY = this.floatOffsetTop
      },
      onDragAround ({ offsetLeft, offsetTop }) {
        this.floatOffsetLeft = this.floatOriginX + offsetLeft
        this.floatOffsetTop = this.floatOriginY + offsetTop
      },

      // functions

      setNextMode () {
        if (this.repeatMode === REPEAT.REPEAT_ALL) {
          this.repeatMode = REPEAT.REPEAT_ONE
        } else if (this.repeatMode === REPEAT.REPEAT_ONE) {
          this.repeatMode = REPEAT.NO_REPEAT
        } else {
          this.repeatMode = REPEAT.REPEAT_ALL
        }
      },
      thenPlay () {
        this.$nextTick(() => {
          this.play()
        })
      },

      // controls

      // play/pause

      toggle () {
        if (!this.audio.paused) {
          this.pause()
        } else {
          this.play()
        }
      },
      play () {
        if (this.mutex) {
          if (activeMutex && activeMutex !== this) {
            activeMutex.pause()
          }
          activeMutex = this
        }
        // handle .play() Promise
        const audioPlayPromise = this.audio.play()
        if (audioPlayPromise) {
          return this.audioPlayPromise = new Promise((resolve, reject) => {
            // rejectPlayPromise is to force reject audioPlayPromise if it's still pending when pause() is called
            this.rejectPlayPromise = reject
            audioPlayPromise.then((res) => {
              this.rejectPlayPromise = null
              resolve(res)
            }).catch(warn)
          })
        }
      },
      pause () {
        this.audioPlayPromise
          .then(() => {
            this.audio.pause()
          })
          // Avoid force rejection throws Uncaught
          .catch(() => {
            this.audio.pause()
          })

        // audioPlayPromise is still pending
        if (this.rejectPlayPromise) {
          // force reject playPromise
          this.rejectPlayPromise()
          this.rejectPlayPromise = null
        }
      },

      // progress bar

      onProgressDragBegin (val) {
        this.wasPlayingBeforeSeeking = this.isPlaying
        this.pause()
        this.isSeeking = true

        // handle load failures
        if (!isNaN(this.audio.duration)) {
          this.audio.currentTime = this.audio.duration * val
        }
      },
      onProgressDragging (val) {
        if (isNaN(this.audio.duration)) {
          this.playStat.playedTime = 0
        } else {
          this.audio.currentTime = this.audio.duration * val
        }
      },
      onProgressDragEnd () {
        this.isSeeking = false

        if (this.wasPlayingBeforeSeeking) {
          this.thenPlay()
        }
      },

      // volume

      toggleMute () {
        this.setAudioMuted(!this.audio.muted)
      },
      setAudioMuted (val) {
        this.audio.muted = val
      },
      setAudioVolume (val) {
        this.audio.volume = val
        if (val > 0) {
          this.setAudioMuted(false)
        }
      },

      // playlist

      getShuffledList () {
        if (!this.list.length) {
          return [this.internalMusic]
        }
        // compare raw objects: the list may or may not be reactive
        const current = toRaw(this.internalMusic)
        let unshuffled = this.list.map(toRaw)
        if (!this.internalShuffle || unshuffled.length <= 1) {
          return unshuffled
        }

        let indexOfCurrentMusic = unshuffled.indexOf(current)
        if (unshuffled.length === 2 && indexOfCurrentMusic !== -1) {
          if (indexOfCurrentMusic === 0) {
            return unshuffled
          } else {
            return [current, unshuffled[0]]
          }
        }
        // shuffle list
        // @see https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        for (let i = unshuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const tmp = unshuffled[i]
          unshuffled[i] = unshuffled[j]
          unshuffled[j] = tmp
        }

        // take currentMusic to first
        if (indexOfCurrentMusic !== -1) {
          indexOfCurrentMusic = unshuffled.indexOf(current)
          if (indexOfCurrentMusic !== 0) {
            [unshuffled[0], unshuffled[indexOfCurrentMusic]] = [unshuffled[indexOfCurrentMusic], unshuffled[0]]
          }
        }

        return unshuffled
      },

      onSelectSong (song) {
        if (toRaw(this.currentMusic) === toRaw(song)) {
          this.toggle()
        } else {
          this.currentMusic = song
          this.thenPlay()
        }
      },

      // event handlers
      // for keeping up with audio states

      onAudioPlay () {
        this.isPlaying = true
      },
      onAudioPause () {
        this.isPlaying = false
      },
      onAudioWaiting () {
        this.isLoading = true
      },
      onAudioCanplay () {
        this.isLoading = false
      },
      onAudioDurationChange () {
        const duration = this.audio.duration
        if (duration !== 1) {
          // NaN while no media is loaded, Infinity for live streams
          this.playStat.duration = isFinite(duration) ? duration : 0
        }
      },
      onAudioProgress () {
        if (this.audio.buffered.length) {
          this.playStat.loadedTime = this.audio.buffered.end(this.audio.buffered.length - 1)
        } else {
          this.playStat.loadedTime = 0
        }
      },
      onAudioTimeUpdate () {
        this.playStat.playedTime = this.audio.currentTime
      },
      onAudioSeeking () {
        this.playStat.playedTime = this.audio.currentTime
      },
      onAudioSeeked () {
        this.playStat.playedTime = this.audio.currentTime
      },
      onAudioVolumeChange () {
        this.audioVolume = this.audio.volume
        this.isAudioMuted = this.audio.muted
      },
      onAudioEnded () {
        // determine next song according to shuffle and repeat
        if (this.repeatMode === REPEAT.REPEAT_ALL) {
          if (this.shouldShuffle && this.playIndex === this.shuffledList.length - 1) {
            this.shuffledList = this.getShuffledList()
          }
          this.playIndex++
          this.thenPlay()
        } else if (this.repeatMode === REPEAT.REPEAT_ONE) {
          this.thenPlay()
        } else {
          this.playIndex++
          if (this.playIndex !== 0) {
            this.thenPlay()
          } else if (this.shuffledList.length === 1) {
            this.audio.currentTime = 0
          }
        }
      },

      initAudio () {

        // since 1.4.0 Audio attributes as props

        this.audio.controls = this.shouldShowNativeControls
        this.audio.muted = this.muted
        if (this.preload) this.audio.preload = this.preload
        this.audio.volume = this.volume


        // since 1.4.0 Emit as many native audio events
        // @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events

        MEDIA_EVENTS.forEach(event => {
          this.audio.addEventListener(event, e => this.$emit(event, e))
        })


        // event handlers
        // they don't emit native media events

        this.audio.addEventListener('play', this.onAudioPlay)
        this.audio.addEventListener('pause', this.onAudioPause)
        this.audio.addEventListener('abort', this.onAudioPause)
        this.audio.addEventListener('waiting', this.onAudioWaiting)
        this.audio.addEventListener('canplay', this.onAudioCanplay)
        this.audio.addEventListener('progress', this.onAudioProgress)
        this.audio.addEventListener('durationchange', this.onAudioDurationChange)
        this.audio.addEventListener('seeking', this.onAudioSeeking)
        this.audio.addEventListener('seeked', this.onAudioSeeked)
        this.audio.addEventListener('timeupdate', this.onAudioTimeUpdate)
        this.audio.addEventListener('volumechange', this.onAudioVolumeChange)
        this.audio.addEventListener('ended', this.onAudioEnded)


        if (this.currentMusic) {
          this.loadSource(this.currentMusic.src)
        }
      },

      loadSource (src) {
        if (HLS_RE.test(src) && !this.audio.canPlayType('application/x-mpegURL') && !this.audio.canPlayType('application/vnd.apple.mpegURL')) {
          const Hls = getHls()
          if (Hls && Hls.isSupported()) {
            if (!this.hls) {
              this.hls = new Hls()
              this.hls.attachMedia(this.audio)
            }
            this.hls.loadSource(src)
            return
          }
          warn(Hls ? 'HLS is not supported on your browser' : 'hls.js is required to support m3u8, see https://github.com/fdddf/vue3-aplayer#hls-support')
        }
        this.destroyHls()
        this.audio.src = src
      },

      destroyHls () {
        if (this.hls) {
          this.hls.destroy()
          this.hls = null
        }
      },

      setSelfAdaptingTheme () {
        // auto theme according to current music cover image
        if ((this.currentMusic.theme || this.theme) !== 'pic') {
          this.selfAdaptingTheme = null
          return
        }
        const pic = this.currentMusic.pic
        if (!pic) {
          this.selfAdaptingTheme = null
          return
        }
        // use cache
        if (picThemeCache[pic]) {
          this.selfAdaptingTheme = picThemeCache[pic]
          return
        }
        const ColorThief = getColorThief()
        if (!ColorThief) {
          warn('color-thief is required to support self-adapting theme, see https://github.com/fdddf/vue3-aplayer#self-adapting-theme-color')
          return
        }
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          try {
            const color = getDominantColor(ColorThief, img)
            if (color) {
              picThemeCache[pic] = color
              // the song may have changed while the image was loading
              if (this.currentMusic.pic === pic) {
                this.selfAdaptingTheme = color
              }
            }
          } catch (e) {
            warn(`failed to pick theme color from ${pic}: ${e.message}`)
          }
        }
        img.src = pic
      },
    },
    watch: {
      music (music) {
        this.internalMusic = music
      },

      currentMusic (music) {
        // without a list, the play order is just the current song
        if (!this.list.length) {
          this.shuffledList = this.getShuffledList()
        }
        this.setSelfAdaptingTheme()
        this.loadSource(music.src)
      },

      // keep the play order in sync with the list and the shuffle switch
      list () {
        this.shuffledList = this.getShuffledList()
      },
      shouldShuffle () {
        this.shuffledList = this.getShuffledList()
      },
      theme () {
        this.setSelfAdaptingTheme()
      },

      // since 1.4.0
      // observe controls, muted, preload, volume

      shouldShowNativeControls (val) {
        this.audio.controls = val
      },
      isAudioMuted (val) {
        this.audio.muted = val
      },
      preload (val) {
        this.audio.preload = val
      },
      audioVolume (val) {
        this.audio.volume = val
      },

      // sync muted, volume

      muted (val) {
        this.internalMuted = val
      },
      volume (val) {
        this.internalVolume = val
      },


      // sync shuffle, repeat
      shuffle (val) {
        this.internalShuffle = val
      },
      repeat (val) {
        this.internalRepeat = val
      },
    },
    created () {
      this.shuffledList = this.getShuffledList()
    },
    mounted () {
      this.initAudio()
      this.setSelfAdaptingTheme()
      if (this.shouldAutoplay) this.play()
    },
    beforeUnmount () {
      if (activeMutex === this) {
        activeMutex = null
      }
      this.destroyHls()
    },
  }

  export default VueAPlayer

</script>

<style lang="scss">
  @use "./scss/variables" as *;

  .aplayer {
    font-family: Arial, Helvetica, sans-serif;
    color: #000;
    background-color: #fff;
    margin: 5px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    overflow: hidden;
    user-select: none;
    line-height: initial;

    * {
      box-sizing: content-box;
    }

    .aplayer-lrc-content {
      display: none;
    }

    .aplayer-body {
      display: flex;

      position: relative;
      .aplayer-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        text-align: start;
        padding: 14px 7px 0 10px;
        height: $aplayer-height;
        box-sizing: border-box;
        overflow: hidden;

        .aplayer-music {
          flex-grow: 1;

          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-left: 5px;
          user-select: text;
          cursor: default;
          padding-bottom: 2px;

          .aplayer-title {
            font-size: 14px;
          }

          .aplayer-author {
            font-size: 12px;
            color: #666;
          }
        }

        .aplayer-lrc {
          z-index: 0;
        }
      }
    }

    audio[controls] {
      display: block;
      width: 100%;
    }

    // Mini mode
    &.aplayer-mini {
      width: $aplayer-height;
    }

    &.aplayer-withlrc {
      .aplayer-body {
        .aplayer-pic {
          height: $aplayer-height-lrc;
          width: $aplayer-height-lrc;
        }

        .aplayer-info {
          height: $aplayer-height-lrc;
        }

        .aplayer-info {
          padding: 10px 7px 0 7px;
        }
      }
    }

    &.aplayer-withlist {
      .aplayer-body {
        .aplayer-info {
          border-bottom: 1px solid #e9e9e9;
        }

        .aplayer-controller .aplayer-time .aplayer-icon.aplayer-icon-menu {
          display: block;
        }
      }
    }

    /* floating player on top */
    position: relative;
    &.aplayer-float {
      z-index: 1;
    }
  }

  @keyframes aplayer-roll {
    0% {
      left: 0
    }
    100% {
      left: -100%
    }
  }
</style>