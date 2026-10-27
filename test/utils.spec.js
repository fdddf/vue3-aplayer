import { describe, expect, it } from 'vitest'
import { clamp, getPointer, parseLrc } from '../src/utils'

describe('parseLrc', () => {
  it('returns an empty list for empty input', () => {
    expect(parseLrc('')).toEqual([])
    expect(parseLrc(undefined)).toEqual([])
  })

  it('parses mm:ss, mm:ss.xx and mm:ss.xxx tags', () => {
    expect(parseLrc('[00:01]a\n[00:02.50]b\r\n[01:03.250]c')).toEqual([
      [1, 'a'],
      [2.5, 'b'],
      [63.25, 'c'],
    ])
  })

  it('expands multiple time tags and sorts by time', () => {
    expect(parseLrc('[00:10.00][00:02.00]chorus\n[00:05.00]verse')).toEqual([
      [2, 'chorus'],
      [5, 'verse'],
      [10, 'chorus'],
    ])
  })

  it('strips inline word timings', () => {
    expect(parseLrc('[00:01.00]<00:01.00>hello <00:01.50>world')).toEqual([[1, 'hello world']])
  })

  it('ignores lines without a time tag', () => {
    expect(parseLrc('[ti:title]\n[00:01.00]a')).toEqual([[1, 'a']])
  })
})

describe('clamp', () => {
  it('clamps into [0, 1] by default', () => {
    expect(clamp(-0.2)).toBe(0)
    expect(clamp(0.4)).toBe(0.4)
    expect(clamp(1.7)).toBe(1)
  })
})

describe('getPointer', () => {
  it('reads touch events from changedTouches', () => {
    const touch = { clientX: 12 }
    expect(getPointer({ changedTouches: [touch] })).toBe(touch)
  })

  it('returns mouse events as is', () => {
    const e = { clientX: 3 }
    expect(getPointer(e)).toBe(e)
  })
})
