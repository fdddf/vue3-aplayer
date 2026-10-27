<template>
  <svg xmlns="http://www.w3.org/2000/svg" height="100%" version="1.1" :viewBox="svg.viewBox" width="100%"
       :style="style">
    <path class="aplayer-fill" :d="svg.d"></path>
  </svg>
</template>

<script>
  const rawSvgs = import.meta.glob('../assets/*.svg', { query: '?raw', import: 'default', eager: true })
  const SVGs = Object.keys(rawSvgs).reduce((svgs, path) => {
    const svg = rawSvgs[path]
    svgs[path.match(/([^/]+)\.svg$/)[1]] = {
      viewBox: svg.match(/viewBox="([^"]+)"/)[1],
      d: svg.match(/\sd="([^"]+)"/)[1],
    }
    return svgs
  }, {})

  export default {
    props: ['type'],
    computed: {
      svg () {
        const icon = (this.type === 'prev' || this.type === 'next') ? 'skip' : this.type
        return SVGs[icon] || {}
      },
      style () {
        if (this.type === 'next') {
          return {
            transform: 'rotate(180deg)',
          }
        }
        return {}
      }
    }
  }
</script>