import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

// cream fg: rgb(240,236,228) → [0.941, 0.925, 0.894]
const FG: [number, number, number] = [0.941, 0.925, 0.894]

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr  = Math.min(window.devicePixelRatio ?? 1, 2)
    const size = canvas.offsetWidth || 600

    let phi   = 0.6
    let rafId = 0

    canvas.style.opacity = '0'
    canvas.style.transition = 'opacity 1.2s ease'

    const globe = createGlobe(canvas, {
      devicePixelRatio:   dpr,
      width:              size * dpr,
      height:             size * dpr,
      phi,
      theta:              0.32,
      dark:               1,
      diffuse:            1.5,
      mapSamples:         20000,
      mapBrightness:      4.5,
      mapBaseBrightness:  0.06,
      baseColor:          FG,
      markerColor:        FG,
      glowColor:          FG,
      markers:            [],
    })

    let firstFrame = true

    const animate = () => {
      if (firstFrame) {
        canvas.style.opacity = '1'
        firstFrame = false
      }
      if (!reduced) {
        phi += 0.003
        globe.update({ phi })
      }
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      globe.destroy()
    }
  }, [])

  return <canvas ref={canvasRef} className="globe-canvas" aria-hidden="true" />
}
