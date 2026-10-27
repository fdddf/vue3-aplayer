<template>
  <div id="app">
    <div class="container">
      <h1 align="center">Vue-APlayer</h1>
      <p align="center">
        <img :src="`https://img.shields.io/badge/DEMO-v${version}-41b883.svg?style=flat-square`"/>
        <a href="https://www.npmjs.com/package/vue3-aplayer"><img
          src="https://img.shields.io/npm/v/vue3-aplayer.svg?style=flat-square"/></a>
        <a href="https://github.com/fdddf/vue3-aplayer/blob/main/LICENSE"><img
          src="https://img.shields.io/npm/l/vue3-aplayer.svg?style=flat-square"/></a>
      </p>
      <h3>Basic (zero config)</h3>
      <aplayer :music="basic" />

      <h3>Featured</h3>
      <aplayer
        theme="pic"
        shuffle
        repeat="list"
        show-lrc
        v-model:muted="muted"
        v-model:volume="volume"
        :music="list[0]"
        :list="list"
      />
      <ul style="text-align: start">
        <li>Playlist</li>
        <li>Lyrics scroll</li>
        <li>Per-song theme & self-adapting theme</li>
        <li>HLS support</li>
        <li>External controls</li>
        <ul>
          <li>
            <a role="button" tabindex="-1" @click="muted = !muted">
              {{ muted ? 'Unmute' : 'Mute' }} player
            </a>
          </li>
          <li>Volume: <input type="number" step="0.1" min="0" max="1" v-model.number="volume"></li>
        </ul>
      </ul>
      <h3>Mini mode / Float mode (try dragging it around)</h3>
      <aplayer mini float :music="mini" />
      <footer align="center">
        <p>
          Music by <a href="https://www.soundhelix.com" target="_blank">SoundHelix</a>,
          covers from <a href="https://picsum.photos" target="_blank">Lorem Picsum</a>,
          HLS stream from <a href="https://test-streams.mux.dev" target="_blank">Mux</a>.
          Based on <a href="https://github.com/SevenOutman/vue-aplayer" target="_blank">Vue-APlayer</a>
          and <a href="https://github.com/MoePlayer/APlayer" target="_blank">APlayer</a>.
        </p>
      </footer>
    </div>
  </div>
</template>
<script>
  import { version } from '../../package.json'

  const song = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`
  const cover = (id) => `https://picsum.photos/id/${id}/300/300`
  const demoLrc = [
    '[00:00.00]Vue-APlayer demo',
    '[00:04.00]Lyrics can be an LRC string',
    '[00:08.00]or a URL to a .lrc file',
    '[00:12.00][00:24.00]Repeated lines use multiple time tags',
    '[00:16.00]The current line follows the playback',
    '[00:20.00]Drag the progress bar to seek',
    '[00:28.00]Enjoy the music',
  ].join('\n')

  export default {
    name: 'App',
    data () {
      return {
        version,
        volume: 0.8,
        muted: false,
        basic: {
          title: 'SoundHelix Song 1',
          artist: 'T. Schürger',
          src: song(1),
          pic: cover(1025),
        },
        list: [
          {
            title: 'SoundHelix Song 2',
            artist: 'T. Schürger',
            src: song(2),
            pic: cover(1043),
            lrc: demoLrc,
          },
          {
            title: 'Big Buck Bunny (HLS)',
            artist: 'Blender Foundation',
            src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            pic: cover(1084),
          },
          {
            title: 'SoundHelix Song 3',
            artist: 'T. Schürger',
            src: song(3),
            pic: cover(1015),
            theme: '#e8565c',
          },
          {
            title: 'SoundHelix Song 4',
            artist: 'T. Schürger',
            src: song(4),
            pic: cover(1069),
            lrc: demoLrc,
          },
        ],
        mini: {
          title: 'SoundHelix Song 5',
          artist: 'T. Schürger',
          src: song(5),
          pic: cover(1062),
        },
      }
    }
  }
</script>
<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  body {
    font-family: Source Sans Pro, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: linear-gradient(135deg, rgb(65, 184, 131), rgb(74, 156, 238));
    color: #fff;
    overflow-y: auto;
  }

  #app {
    text-align: center;
  }

  .container {
    max-width: 32rem;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50px;
    padding: 0 15px;
  }

  h1 {
    font-size: 48px;
    margin: 30px 0 10px;
  }

  h3 {
    font-size: 24px;
  }

  input {
    background-color: transparent;
    outline: none;
    border: none;
    color: inherit;
    font-size: inherit;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, .5);
  }

  a {
    color: #35495e;
    text-decoration: none;
  }

  p {
    font-size: 18px;
  }
</style>