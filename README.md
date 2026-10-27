<p align="center">
<img src="https://raw.githubusercontent.com/fdddf/vue3-aplayer/main/src/assets/vue-aplayer-round.png" alt="Vue-APlayer" width="100">
</p>
<h1 align="center">vue3-aplayer</h1>

> Vue 3 port of [Vue-APlayer](https://github.com/SevenOutman/vue-aplayer), the Vue implementation of [APlayer](https://github.com/MoePlayer/APlayer).

[![CI](https://github.com/fdddf/vue3-aplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/fdddf/vue3-aplayer/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/vue3-aplayer.svg?style=flat-square)](https://www.npmjs.com/package/vue3-aplayer)
[![npm](https://img.shields.io/npm/dt/vue3-aplayer.svg?style=flat-square)](https://www.npmjs.com/package/vue3-aplayer)
[![license](https://img.shields.io/npm/l/vue3-aplayer.svg?style=flat-square)](LICENSE)

[**Demo**](https://fdddf.github.io/vue3-aplayer/) · [**Documentation**](docs/README.md) · [**中文文档**](docs/README.zh-CN.md) · [**Changelog**](CHANGELOG.md)

![Screenshot](https://i.loli.net/2018/05/26/5b0912ce2e250.png)


## Features

- Beautiful clean UI
- Lyrics scroll
- Playlist with repeat & shuffle controls
- Custom theme color / Self-adapting theme color
- Drag and place anywhere
- Mutex play
- HLS support
- **Easy props and API**
- **Dependency free** and light-weight (~10KB gzipped JS + 5KB CSS)


## Install

```
npm i vue3-aplayer
```


## Usage

```js
import { createApp } from 'vue'
import VueAPlayer from 'vue3-aplayer'
import 'vue3-aplayer/style.css'
import App from './App.vue'

createApp(App)
  .use(VueAPlayer) // registers <aplayer> globally
  .mount('#app')
```

```html
<aplayer
  :music="{
    title: 'SoundHelix Song 1',
    artist: 'T. Schürger',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    pic: 'https://picsum.photos/id/1025/300/300'
  }"
/>
```

Or register it locally:

```vue
<script setup>
import Aplayer from 'vue3-aplayer'
import 'vue3-aplayer/style.css'
</script>
```

See the [full documentation](docs/README.md) for props, events, HLS and self-adapting theme setup.


## Upgrading from 1.x

- Import the stylesheet: `import 'vue3-aplayer/style.css'`, since CSS is no longer injected by JavaScript.
- HLS: pass hls.js explicitly with `app.use(VueAPlayer, { hls: Hls })`, or load it as the `window.Hls` global.
- Self-adapting theme: pass color-thief with `app.use(VueAPlayer, { colorThief })`, or load it as the `window.ColorThief` global. Both colorthief 2.x and 3.x work.
- `.sync` is now `v-model:music`, `v-model:volume`, `v-model:muted`, `v-model:shuffle` and `v-model:repeat`.
- The `controls` prop now works in production builds too.
- The package only ships `dist/`, so `vue3-aplayer/src/...` imports no longer work.

Full details are in the [changelog](CHANGELOG.md).


## Development

```
npm install
npm run dev        # demo page with hot reload at http://localhost:3000
npm test           # unit tests (Vitest)
npm run lint
npm run build      # library -> dist/
npm run build:demo # demo page -> demo/
```

Work happens on the `main` branch. Releases are published to npm when a GitHub release is created.


## Related projects

- [Vue-APlayer](https://github.com/SevenOutman/vue-aplayer): the Vue 2 original this project is forked from
- [APlayer](https://github.com/MoePlayer/APlayer): prior art
- [@moefe/vue-aplayer](https://github.com/MoePlayer/vue-aplayer): another Vue implementation of APlayer


## Thanks

[@SevenOutman](https://github.com/SevenOutman) for creating Vue-APlayer, and [@DIYgod](https://github.com/DIYgod) for creating APlayer.


## License

[MIT](LICENSE). Copyright (c) 2016-present Shenghao "Doma" Lei
