# Changelog

## 2.0.0

### Breaking changes

- The build moved from webpack 4 to Vite. Output files are now `dist/vue3-aplayer.mjs` (ESM), `dist/vue3-aplayer.umd.js` (UMD, global `VueAPlayer`) and `dist/vue3-aplayer.css`.
- CSS is no longer injected by JavaScript. Import it with `import 'vue3-aplayer/style.css'`.
- hls.js is no longer `require`d implicitly. Pass it with `app.use(VueAPlayer, { hls: Hls })`, or load it as the `window.Hls` global.
- color-thief can be passed with `app.use(VueAPlayer, { colorThief })`, and still falls back to `window.ColorThief`. Both colorthief 2.x and 3.x are supported.
- The package only ships `dist/`. Imports from `vue3-aplayer/src/...` no longer work.
- The `controls` prop now works in production builds too. It used to be limited to development.

### Features

- `app.use(VueAPlayer)` registers `<aplayer>` / `<APlayer>` globally. Calling `app.use()` used to trigger a Vue warning because the component had no `install` method.
- All emitted events are declared in `emits`, so `v-model:music|shuffle|repeat|muted|volume` work without warnings.

### Fixes

- The shuffle button reshuffles the play order immediately. It used to take effect only after the list wrapped around.
- The play order follows changes to the `list` prop.
- Changing `music` without a list no longer replays the previous song when the current one ends.
- The current song is highlighted and indexed correctly when `list` is not reactive (e.g. `markRaw` or `shallowRef`).
- The playlist fold/unfold transition works again, after the Vue 3 `-enter` to `-enter-from` class rename.
- Touch seeking on the progress bar works. It used to read `clientX` from the TouchEvent and produced `NaN`.
- Seeking and volume dragging use `getBoundingClientRect()`, so they stay accurate in float mode after the player was dragged, and inside scrolled containers.
- Document-level drag listeners are removed when the player unmounts mid-drag.
- An `m3u8` song set as the initial `music` now goes through hls.js too. Switching from an HLS song to a regular one detaches hls.js.
- Lyrics fetched from a URL can no longer overwrite the lyrics of a song selected later. Failed requests log a warning.
- The `prev`/`next` icons resolve to the `skip` icon as intended.
- `duration` stays `0` instead of `NaN` while no media is loaded, and for live streams.
- `autoplay` is skipped on mobile, as the existing `shouldAutoplay` logic intended.
- An undefined `preload` prop no longer sets `preload="undefined"` on the audio element.
- No `window` access during component creation, which keeps SSR from crashing on import.

### Maintenance

- Vue 3.5, Vite 8, Vitest, ESLint 10 flat config, dart-sass (`@use` instead of the deprecated `@import`).
- Unit tests for the lyrics parser and the player component.
- GitHub Actions for CI, the demo page (GitHub Pages) and npm publishing. These replace Travis CI.
- Dependabot replaces Renovate.
- The demo uses media that is still online, replacing dead CDN links.
- Development moved to the `main` branch.

## 1.7.3

- Initial Vue 3 port of [Vue-APlayer](https://github.com/SevenOutman/vue-aplayer) 1.6.1.
