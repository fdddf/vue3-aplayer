## Installation

### Node

```
$ npm i vue3-aplayer
```

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vue3-aplayer/dist/vue3-aplayer.css">
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue3-aplayer"></script>
<script>
  Vue.createApp({ /* ... */ })
    .use(VueAPlayer)
    .mount('#app')
</script>
```


## Usage

```HTML
<aplayer autoplay
  :music="{
    title: 'SoundHelix Song 1',
    artist: 'T. Schürger',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    pic: 'https://picsum.photos/id/1025/300/300'
  }"
/>
```

```JS
import { createApp } from 'vue'
import VueAPlayer from 'vue3-aplayer'
import 'vue3-aplayer/style.css'

// register globally as <aplayer> / <APlayer>
createApp(App).use(VueAPlayer).mount('#app')

// or register locally
export default {
  components: {
    Aplayer: VueAPlayer
  }
}
```



### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| music| Object | *required* | Music info for current playing music, see [Music info](#music-info) |
| list | Array | `[]` | Music list to play and display. If list is not empty, music list panel will be shown, even if the only song in the list is identical to music prop. |
| mini | Boolean | `false` | Mini mode |
| float | Boolean | `false` | Float mode, in which you can drag the player around and leave it anywhere on your page |
| showLrc | Boolean | `false` | Whether to show lyrics or not |
| mutex | Boolean | `true` | Pause other players when this player is playing |
| theme | String | `'#41b883'` | Theme color, will be overridden by current `music`'s theme if set |
| shuffle | Boolean | `false` | Shuffle the playlist |
| repeat | String | `'no-repeat'` | How to repeat play. Either to `'repeat-one'` `'repeat-all'` or `'no-repeat'`. You can also use accordingly `'music'` `'list'` `'none'` for easier remembering |
| listMaxHeight | String | *none* | Max height of play list |
| listFolded | Boolean | `false` | Fold playlist initially |

> `music`, `shuffle` and `repeat` support `v-model`, e.g. `v-model:music="current"`.



### Audio attributes as props

These props are named after `<audio>` attributes and also work as they do.

| Name | Type | Default | Observable | Description |
| ---- | ---- | ------- | ---------- | ---------- |
| autoplay | Boolean | `false` | false | Starts playing as soon as loaded. If more than one mutex player are set autoplay, only the first one will play. Ignored on mobile devices, and subject to the browser's autoplay policy. |
| controls | Boolean | `false` | true | Shows native audio controls below the player, or between player and playlist. Doesn't work in Mini mode. |
| muted | Boolean | `false` | true | Player is muted. |
| preload | String | *none* | true | The way to load music, can be 'none' 'metadata' or 'auto' |
| volume | Number | `0.8` | true | Playback volume. |

>  `muted` and `volume` also support `v-model` (`v-model:muted`, `v-model:volume`), allowing you some custom external control capability.



### Music info

The `music` props contains info of the song to play.

| Property | Default | Description |
| -------- | ------- | ----------- |
| src | *required* | Music source url |
| title | `'Untitled'` | Music title |
| artist | `'Unknown'` | Music artist |
| pic | *none* | Music cover picture |
| lrc | *none* | lrc or url to a .lrc file, see: [LRC](https://aplayer.js.org/#/home?id=lrc) |
| theme | *none* | Song-specific theme color |



### Events

Vue-APlayer emits every Media Event triggered from its inner `<audio>` element (`play`, `pause`, `ended`, `timeupdate`, `error`...). You can [refer to MDN for the full list](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events).

It also emits `update:music`, `update:shuffle`, `update:repeat`, `update:muted` and `update:volume` for `v-model`.



## Advanced

### Self-adapting theme color

If you set a **Music Object**'s `theme` property to `'pic'`, Vue-APlayer will pick color from the songs cover image as theme color.
Also, you can set player's `theme` prop to `'pic'`, it will apply to every song.

This needs [color-thief](https://github.com/lokesh/color-thief) (2.x or 3.x), and the cover image must be served with CORS headers.

```js
import * as ColorThief from 'colorthief' // colorthief@3
// import ColorThief from 'colorthief'   // colorthief@2

app.use(VueAPlayer, { colorThief: ColorThief })
```

Or load it from a CDN, which exposes `window.ColorThief`:

```html
<script src="https://cdn.jsdelivr.net/npm/colorthief@3/dist/umd/color-thief.global.js"></script>
```



### HLS support

Vue-APlayer supports `*.m3u8` media. Safari plays HLS natively; other browsers need [hls.js](https://github.com/video-dev/hls.js):

```js
import Hls from 'hls.js'

app.use(VueAPlayer, { hls: Hls })
```

Or load it from a CDN, which exposes `window.Hls`:

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
```



### Slots

- `#display="{ currentMusic, playStat }"`

This slot represents the content displayed on the music info panel, which by default is the lyric scroll.

It receives two slot props: `currentMusic` and `playStat` (`{ duration, loadedTime, playedTime }`, in seconds).



## Contribute

Clone this repo, then

```
$ npm install
$ npm run dev
```

Run `npm run lint && npm test` before opening a pull request against `main`.
