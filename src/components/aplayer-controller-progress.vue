<template>
  <div
    class="aplayer-bar-wrap"
    @mousedown="onThumbMouseDown"
    @touchstart.passive="onThumbTouchStart"
    ref="barWrap"
  >
    <div class="aplayer-bar">
      <div
        class="aplayer-loaded"
        :style="{width: `${loadProgress * 100}%`}">
      </div>
      <div
        class="aplayer-played"
        :style="{width: `${playProgress * 100}%`, background: theme}"
      >
        <span
          ref="thumb"
          @mouseover="thumbHovered = true"
          @mouseout="thumbHovered = false"
          class="aplayer-thumb"
          :style="{borderColor: theme, backgroundColor: thumbHovered ? theme : '#fff'}"
        >
          <span class="aplayer-loading-icon"
                :style="{backgroundColor: theme }"
          >
            <icon type="loading"/>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import { clamp, getPointer } from '../utils'
  import Icon from './aplayer-icon.vue'

  export default {
    components: {
      Icon
    },
    props: ['loadProgress', 'playProgress', 'theme'],
    emits: ['dragbegin', 'dragging', 'dragend'],
    data () {
      return {
        thumbHovered: false,
      }
    },
    beforeUnmount () {
      this.removeDocumentListeners()
    },
    methods: {
      // getBoundingClientRect respects CSS transforms (float mode) and scrolled containers
      getPercentage (e) {
        const rect = this.$refs.barWrap.getBoundingClientRect()
        if (!rect.width) return 0
        return clamp((getPointer(e).clientX - rect.left) / rect.width)
      },
      onThumbMouseDown (e) {
        this.$emit('dragbegin', this.getPercentage(e))
        document.addEventListener('mousemove', this.onDocumentMove)
        document.addEventListener('mouseup', this.onDocumentUp)
      },
      onThumbTouchStart (e) {
        this.$emit('dragbegin', this.getPercentage(e))
        document.addEventListener('touchmove', this.onDocumentMove)
        document.addEventListener('touchend', this.onDocumentUp)
      },
      onDocumentMove (e) {
        this.$emit('dragging', this.getPercentage(e))
      },
      onDocumentUp (e) {
        this.removeDocumentListeners()
        this.$emit('dragend', this.getPercentage(e))
      },
      removeDocumentListeners () {
        document.removeEventListener('mousemove', this.onDocumentMove)
        document.removeEventListener('mouseup', this.onDocumentUp)
        document.removeEventListener('touchmove', this.onDocumentMove)
        document.removeEventListener('touchend', this.onDocumentUp)
      },
    },
  }
</script>
<style lang="scss">

  .aplayer-bar-wrap {
    margin: 0 0 0 5px;
    padding: 4px 0;
    cursor: pointer;
    flex: 1;

    .aplayer-bar {
      position: relative;
      height: 2px;
      width: 100%;
      background: #cdcdcd;

      .aplayer-loaded {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background: #aaa;
        height: 2px;
        transition: all 0.5s ease;

        will-change: width;
      }

      .aplayer-played {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        height: 2px;
        transition: background-color .3s;
        will-change: width;

        .aplayer-thumb {
          position: absolute;
          top: 0;
          right: 5px;
          margin-top: -5px;
          margin-right: -10px;
          width: 10px;
          height: 10px;
          border: 1px solid;
          transform: scale(.8);
          will-change: transform;
          transition: transform 300ms, background-color .3s, border-color .3s;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;

          &:hover {
            transform: scale(1);
          }

          overflow: hidden;
          .aplayer-loading-icon {
            display: none;
            width: 100%;
            height: 100%;

            svg {
              position: absolute;
              animation: spin 1s linear infinite;
              fill: #ffffff;
            }
          }
        }
      }
    }
  }

  .aplayer-loading {
    .aplayer-bar-wrap .aplayer-bar .aplayer-thumb .aplayer-loading-icon {
      display: block;
    }

    .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar .aplayer-played .aplayer-thumb {
      transform: scale(1);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0)
    }
    100% {
      transform: rotate(360deg)
    }
  }
</style>