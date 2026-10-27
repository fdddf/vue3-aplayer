import VueAPlayer from './vue-aplayer.vue'
import { setConfig } from './config'

/**
 * app.use(VueAPlayer, { hls: Hls, colorThief: ColorThief })
 * registers <aplayer> / <APlayer> globally.
 */
VueAPlayer.install = (app, options = {}) => {
  setConfig(options)
  // eslint-disable-next-line vue/multi-word-component-names -- resolves <aplayer>
  app.component('Aplayer', VueAPlayer)
  app.component('APlayer', VueAPlayer)
}

export default VueAPlayer
