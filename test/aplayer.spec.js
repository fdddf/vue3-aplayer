import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, markRaw, nextTick, toRaw } from 'vue'
import { mount } from '@vue/test-utils'
import VueAPlayer from '../src/index.js'
import Icon from '../src/components/aplayer-icon.vue'

const songs = [
  { title: 'Song A', artist: 'Artist A', src: 'https://example.com/a.mp3' },
  { title: 'Song B', artist: 'Artist B', src: 'https://example.com/b.mp3' },
  { title: 'Song C', artist: 'Artist C', src: 'https://example.com/c.mp3' },
]

const wrappers = []
function mountPlayer (props = {}, options = {}) {
  const wrapper = mount(VueAPlayer, { props: { music: songs[0], ...props }, ...options })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach(w => w.unmount())
})

describe('VueAPlayer', () => {
  it('renders the current song', () => {
    const wrapper = mountPlayer()
    expect(wrapper.find('.aplayer-title').text()).toBe('Song A')
    expect(wrapper.find('.aplayer-author').text()).toBe('Artist A')
    expect(wrapper.find('audio').element.src).toBe(songs[0].src)
  })

  it('falls back to placeholder title and artist', () => {
    const wrapper = mountPlayer({ music: { src: 'https://example.com/x.mp3' } })
    expect(wrapper.find('.aplayer-title').text()).toBe('Untitled')
    expect(wrapper.find('.aplayer-author').text()).toBe('Unknown')
  })

  it('renders the playlist', () => {
    const wrapper = mountPlayer({ list: songs })
    expect(wrapper.classes()).toContain('aplayer-withlist')
    const items = wrapper.findAll('.aplayer-list li')
    expect(items).toHaveLength(3)
    expect(items[0].classes()).toContain('aplayer-list-light')
  })

  it('switches song when a list item is clicked', async () => {
    const wrapper = mountPlayer({ list: songs })
    await wrapper.findAll('.aplayer-list li')[1].trigger('click')
    expect(wrapper.emitted('update:music')[0]).toEqual([songs[1]])
    expect(wrapper.find('.aplayer-title').text()).toBe('Song B')
    expect(wrapper.find('audio').element.src).toBe(songs[1].src)
  })

  it('reshuffles the play order when shuffle is toggled', async () => {
    const wrapper = mountPlayer({ list: songs })
    expect(wrapper.vm.shuffledList).toEqual(songs)

    await wrapper.findAll('.aplayer-icon-mode')[0].trigger('click')
    expect(wrapper.emitted('update:shuffle')[0]).toEqual([true])
    // current song stays first, the rest is a permutation of the list
    expect(toRaw(wrapper.vm.shuffledList[0])).toBe(songs[0])
    expect([...wrapper.vm.shuffledList].sort((a, b) => a.title.localeCompare(b.title))).toEqual(songs)
  })

  it('works with a non-reactive list', async () => {
    // items stay raw while the player wraps `music` in a reactive proxy
    const list = markRaw(songs.map(song => ({ ...song })))
    const wrapper = mountPlayer({ music: list[1], list, shuffle: true })
    expect(wrapper.vm.playIndex).toBe(0)
    expect(wrapper.findAll('.aplayer-list li')[1].classes()).toContain('aplayer-list-light')
  })

  it('follows list prop changes', async () => {
    const wrapper = mountPlayer({ list: songs.slice(0, 2) })
    await wrapper.setProps({ list: songs })
    expect(wrapper.vm.shuffledList).toEqual(songs)
    expect(wrapper.findAll('.aplayer-list li')).toHaveLength(3)
  })

  it('does not replay the previous song after the music prop changes without a list', async () => {
    const wrapper = mountPlayer()
    await wrapper.setProps({ music: songs[1] })
    expect(wrapper.vm.shuffledList).toEqual([songs[1]])
  })

  it('cycles repeat modes', async () => {
    const wrapper = mountPlayer({ repeat: 'list' })
    const button = () => wrapper.findAll('.aplayer-icon-mode')[1]
    await button().trigger('click')
    await button().trigger('click')
    await button().trigger('click')
    expect(wrapper.emitted('update:repeat').map(e => e[0])).toEqual(['repeat-one', 'no-repeat', 'repeat-all'])
  })

  it('toggles the playlist panel', async () => {
    const wrapper = mountPlayer({ list: songs })
    const menu = wrapper.find('.aplayer-icon-menu')
    expect(menu.classes()).not.toContain('inactive')
    await menu.trigger('click')
    expect(wrapper.find('.aplayer-icon-menu').classes()).toContain('inactive')
  })

  it('syncs volume and muted props to the audio element', async () => {
    const wrapper = mountPlayer({ volume: 0.5 })
    const audio = wrapper.find('audio').element
    expect(audio.volume).toBe(0.5)
    await wrapper.setProps({ volume: 0.2, muted: true })
    expect(audio.volume).toBe(0.2)
    expect(audio.muted).toBe(true)
  })

  it('shows native controls only when asked and not in mini mode', async () => {
    const wrapper = mountPlayer({ controls: true })
    expect(wrapper.find('audio').element.controls).toBe(true)
    await wrapper.setProps({ mini: true })
    expect(wrapper.find('audio').element.controls).toBe(false)
  })

  it('passes currentMusic and playStat to the display slot', () => {
    const display = vi.fn(() => h('div', { class: 'custom-display' }))
    const wrapper = mountPlayer({}, { slots: { display } })
    expect(wrapper.find('.custom-display').exists()).toBe(true)
    expect(wrapper.classes()).toContain('aplayer-withlrc')
    const slotProps = display.mock.calls[0][0]
    expect(slotProps.currentMusic).toEqual(songs[0])
    expect(slotProps.playStat).toEqual({ duration: 0, loadedTime: 0, playedTime: 0 })
  })

  it('renders inline lrc', async () => {
    const wrapper = mountPlayer({
      showLrc: true,
      music: { ...songs[0], lrc: '[00:00.00]first\n[00:05.00]second' },
    })
    await nextTick()
    expect(wrapper.findAll('.aplayer-lrc p').map(p => p.text())).toEqual(['first', 'second'])
  })

  it('uses hls.js passed to app.use() for m3u8 sources', () => {
    const instances = []
    class FakeHls {
      static isSupported () { return true }
      constructor () {
        this.loadSource = vi.fn()
        this.attachMedia = vi.fn()
        this.destroy = vi.fn()
        instances.push(this)
      }
    }
    const wrapper = mountPlayer(
      { music: { src: 'https://example.com/live.m3u8?token=1' } },
      { global: { plugins: [[VueAPlayer, { hls: FakeHls }]] } },
    )
    expect(instances).toHaveLength(1)
    expect(instances[0].loadSource).toHaveBeenCalledWith('https://example.com/live.m3u8?token=1')
    expect(instances[0].attachMedia).toHaveBeenCalledWith(wrapper.find('audio').element)
  })
})

describe('install', () => {
  it('registers <aplayer> and <APlayer>', () => {
    const app = createApp({})
    app.use(VueAPlayer)
    expect(app.component('Aplayer')).toBe(VueAPlayer)
    expect(app.component('APlayer')).toBe(VueAPlayer)
  })
})

describe('aplayer-icon', () => {
  it('renders every bundled icon', () => {
    for (const type of ['play', 'pause', 'menu', 'shuffle', 'repeat-all', 'repeat-one', 'volume-up', 'volume-down', 'volume-off', 'loading']) {
      const path = mount(Icon, { props: { type } }).find('path')
      expect(path.attributes('d'), type).toBeTruthy()
    }
  })

  it('maps prev/next to the skip icon', () => {
    const next = mount(Icon, { props: { type: 'next' } })
    expect(next.find('path').attributes('d')).toBeTruthy()
    expect(next.find('svg').attributes('style')).toContain('rotate(180deg)')
  })
})
