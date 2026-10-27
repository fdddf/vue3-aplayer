import { createApp } from 'vue'
import Hls from 'hls.js'
import * as ColorThief from 'colorthief'
import VueAPlayer from '../index.js'
import App from './App.vue'

createApp(App)
  .use(VueAPlayer, { hls: Hls, colorThief: ColorThief })
  .mount('#app')
