## 安装

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


## 使用

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

// 全局注册为 <aplayer> / <APlayer>
createApp(App).use(VueAPlayer).mount('#app')

// 或者局部注册
export default {
  components: {
    Aplayer: VueAPlayer
  }
}
```



### Props

| 名称 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| music| Object | *必需* | 当前播放的音乐。 具体请看[音乐信息](#音乐信息) |
| list | Array | `[]` | 播放列表。如果 list 不是空数组，播放列表就会显示出来，即使 list 中只有一首歌并且它和 music 一样 |
| mini | Boolean | `false` | 迷你模式 |
| float | Boolean | `false` | 浮动模式。你可以在页面上随意拖放你的播放器 |
| showLrc | Boolean | `false` | 是否显示歌词 |
| mutex | Boolean | `true` | 是否在该播放器播放时暂停其他播放器 |
| theme | String | `'#41b883'` | 主题色。如果当前歌曲也设置了 `theme` 则以歌曲的为准 |
| shuffle | Boolean | `false` | 随机播放 |
| repeat | String | `'no-repeat'` | 轮播模式。值可以是 `'repeat-one'`（单曲循环）`'repeat-all'`（列表循环）或者 `'no-repeat'`（不循环）。为了好记，还可以使用对应的 `'music'` `'list'` `'none'` |
| listMaxHeight | String | *none* | 播放列表面板最大高度 |
| listFolded | Boolean | `false` | 默认收起播放列表 |

> `music`、`shuffle` 和 `repeat` 支持 `v-model`，例如 `v-model:music="current"`。



### 将 Audio 属性作为 props

这些 props 与 `<audio>` 的同名属性作用一致

| 名称 | 类型 | 默认值 | 是否可变 | 说明 |
| ---- | ---- | ------- | ---------- | ---------- |
| autoplay | Boolean | `false` | false | 自动播放。如果多个 mutex 播放器设置了 autoplay，只有第一个会自动播放。移动端不生效，并受浏览器自动播放策略限制 |
| controls | Boolean | `false` | true | 显示原生 audio 元素（在播放器面板和播放列表面板之间），迷你模式下不生效 |
| muted | Boolean | `false` | true | 静音 |
| preload | String | *none* | true | 音频预加载方式，可选 'none' 'metadata' 或 'auto' |
| volume | Number | `0.8` | true | 播放音量 |

>  `muted` 和 `volume` 也支持 `v-model`（`v-model:muted`、`v-model:volume`），你可以利用这一点做一些自定义的控制



### 音乐信息

`music` props 包含了当前播放歌曲的如下信息。

| 属性 | 默认值 | 说明 |
| -------- | ------- | ----------- |
| src | *必需* | 音频文件的 URL |
| title | `'Untitled'` | 歌曲名称 |
| artist | `'Unknown'` | 演唱者 |
| pic | *none* | 封面图片 URL |
| lrc | *none* | LRC 歌词或者歌词文件的 URL |
| theme | *none* | 歌曲的主题色，会覆盖播放器的主题色 |



### 事件

Vue-APlayer 会抛出它内部的 `<audio>` 元素上触发的所有媒体事件（`play`、`pause`、`ended`、`timeupdate`、`error` 等）。你可以[查阅 MDN 上的完整列表](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement#事件)。

另外还会抛出 `update:music`、`update:shuffle`、`update:repeat`、`update:muted` 和 `update:volume`，用于 `v-model`。



## 进阶使用

### 自适应主题色

如果你将一首歌的 `theme` 值设为 `'pic'`, Vue-APlayer 会从它的封面图片中提取颜色作为主题色。
你也可以直接将 Vue-APlayer 的 `theme` prop 设为 `'pic'`, 这样所有的歌曲都会使用自适应主题色。

需要 [color-thief](https://github.com/lokesh/color-thief)（2.x 或 3.x），并且封面图片需要带 CORS 响应头。

```js
import * as ColorThief from 'colorthief' // colorthief@3
// import ColorThief from 'colorthief'   // colorthief@2

app.use(VueAPlayer, { colorThief: ColorThief })
```

或者通过 CDN 引入（会挂载 `window.ColorThief`）：

```html
<script src="https://cdn.jsdelivr.net/npm/colorthief@3/dist/umd/color-thief.global.js"></script>
```



### 支持 HLS

Vue-APlayer 支持 `*.m3u8` 音频。Safari 原生支持 HLS，其他浏览器需要 [hls.js](https://github.com/video-dev/hls.js)：

```js
import Hls from 'hls.js'

app.use(VueAPlayer, { hls: Hls })
```

或者通过 CDN 引入（会挂载 `window.Hls`）：

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
```



### Slots

- `#display="{ currentMusic, playStat }"`

这个 slot 代表播放器主体上显示的内容, 默认是滚动歌词。

它接收两个 slot props: `currentMusic` 和 `playStat`（`{ duration, loadedTime, playedTime }`，单位为秒）。



## 贡献

Clone 这个 repo，然后

```
$ npm install
$ npm run dev
```

提交 PR（目标分支 `main`）前请先运行 `npm run lint && npm test`。
