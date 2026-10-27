<template>
  <div class="aplayer-lrc">
    <div
      class="aplayer-lrc-contents"
      :style="transformStyle"
    >
      <p
        v-for="(line, index) of lrcLines"
        :key="index"
        :class="{ 'aplayer-lrc-current': index === currentLineIndex }"
      >
        {{ line[1] }}
      </p>
    </div>
  </div>
</template>

<script>
  import { parseLrc, warn } from '../utils'

  export default {
    props: {
      currentMusic: {
        type: Object,
        required: true
      },
      playStat: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        displayLrc: '',
        currentLineIndex: 0,
      }
    },
    computed: {
      lrcLines () {
        return parseLrc(this.displayLrc)
      },
      transformStyle () {
        // transform: translateY(0); -webkit-transform: translateY(0);
        return {
          transform: `translateY(${-this.currentLineIndex * 16}px)`,
          webkitTransform: `translateY(${-this.currentLineIndex * 16}px)`,
        }
      },
    },
    methods: {
      applyLrc (lrc) {
        if (/^(https?:)?\/\//.test(lrc)) {
          this.displayLrc = ''
          this.fetchLrc(lrc)
        } else {
          this.displayLrc = lrc
        }
      },
      fetchLrc (src) {
        fetch(src)
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.text()
          })
          .then((lrc) => {
            // ignore responses for a song that is no longer current
            if (this.currentMusic.lrc === src) {
              this.displayLrc = lrc
            }
          })
          .catch((e) => warn(`failed to load lrc ${src}: ${e.message}`))
      },
      hideLrc () {
        this.displayLrc = ''
      },
    },
    watch: {
      currentMusic: {
        immediate: true,
        handler (music) {
          this.currentLineIndex = 0
          if (music.lrc) {
            this.applyLrc(music.lrc)
          } else {
            this.hideLrc()
          }
        }
      },
      'playStat.playedTime' (playedTime) {
        for (let i = 0; i < this.lrcLines.length; i++) {
          const line = this.lrcLines[i]
          const nextLine = this.lrcLines[i + 1]
          if (playedTime >= line[0] && (!nextLine || playedTime < nextLine[0])) {
            this.currentLineIndex = i
            break
          }
        }
      },
    }
  }
</script>
<style lang="scss">
  @use "../scss/variables" as *;

  .aplayer-lrc {
    position: relative;
    height: $lrc-height;
    text-align: center;
    overflow: hidden;
    margin-bottom: 7px;

    &:before {
      position: absolute;
      top: 0;
      z-index: 1;
      display: block;
      overflow: hidden;
      width: 100%;
      height: 10%;
      content: ' ';
      background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
    }

    &:after {
      position: absolute;
      bottom: 0;
      z-index: 1;
      display: block;
      overflow: hidden;
      width: 100%;
      height: 33%;
      content: ' ';
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%);
    }

    p {
      font-size: 12px;
      color: #666;
      line-height: 16px;
      height: 16px;
      padding: 0;
      margin: 0;
      transition: all 0.5s ease-out;
      opacity: 0.4;
      overflow: hidden;

      &.aplayer-lrc-current {
        opacity: 1;
        overflow: visible;
        height: initial;
      }
    }

    .aplayer-lrc-contents {
      width: 100%;
      transition: all 0.5s ease-out;
      user-select: text;
      cursor: default;
    }
  }
</style>