import { useEffect, useRef } from 'react'

type GlobeInstance = {
  destroy: () => void
  update: (state: {
    devicePixelRatio?: number
    phi?: number
    width?: number
    height?: number
  }) => void
}

// cream fg: rgb(240,236,228) -> [0.941, 0.925, 0.894]
const FG: [number, number, number] = [0.941, 0.925, 0.894]

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cancelled = false
    let globe: GlobeInstance | null = null
    let resizeObserver: ResizeObserver | null = null
    let intersectionObserver: IntersectionObserver | null = null
    let rafId = 0
    let frame = 0
    let phi = 0.6
    let isVisible = false
    let isPageVisible = document.visibilityState === 'visible'

    canvas.style.opacity = '0'
    canvas.style.transition = 'opacity 0.9s ease'

    const stop = () => {
      if (rafId === 0) return
      cancelAnimationFrame(rafId)
      rafId = 0
    }

    const updateSize = () => {
      if (!globe) return

      const size = Math.round(canvas.getBoundingClientRect().width || 600)
      const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5)

      globe.update({
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi,
      })
    }

    const tick = () => {
      if (!globe || reduced || !isVisible || !isPageVisible) {
        rafId = 0
        return
      }

      frame = (frame + 1) % 2
      if (frame === 0) {
        phi += 0.0022
        globe.update({ phi })
      }

      rafId = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!globe || reduced || !isVisible || !isPageVisible || rafId !== 0) return
      rafId = requestAnimationFrame(tick)
    }

    const handleVisibility = () => {
      isPageVisible = document.visibilityState === 'visible'
      if (isPageVisible) {
        start()
        return
      }
      stop()
    }

    document.addEventListener('visibilitychange', handleVisibility)

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false
        if (isVisible) {
          start()
          return
        }
        stop()
      },
      { threshold: 0.15 },
    )
    intersectionObserver.observe(canvas)

    void import('cobe').then(({ default: createGlobe }) => {
      if (cancelled) return

      const size = Math.round(canvas.getBoundingClientRect().width || 600)
      const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5)

      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi,
        theta: 0.32,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 9000,
        mapBrightness: 4.1,
        mapBaseBrightness: 0.05,
        baseColor: FG,
        markerColor: FG,
        glowColor: FG,
        markers: [],
      }) as GlobeInstance

      resizeObserver = new ResizeObserver(updateSize)
      resizeObserver.observe(canvas)

      canvas.style.opacity = '1'

      if (!reduced) {
        start()
      }
    })

    return () => {
      cancelled = true
      stop()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      globe?.destroy()
    }
  }, [])

  return <canvas ref={canvasRef} className="globe-canvas" aria-hidden="true" />
}
