import { useEffect, useRef } from 'react'
import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/dist/locomotive-scroll.css'
import './App.css'

// ─── Change this one string to update the manifesto ───────────────────────────
const MANIFESTO = "Us. The problems worth solving aren't the ones worth funding. Or pursuing at all. We solve them anyway — not for the money, but for the people who need it."

interface Project {
  name: string
  description: string
  url: string
  displayUrl: string
}

const projects: Project[] = [
  {
    name: 'OpenBoxOffice',
    description:
      'Open-source, fee-free ticketing for the organizations that need it most. Coming Q3 2026 for nonprofits and PTOs.',
    url: 'https://openboxoffice.org',
    displayUrl: 'openboxoffice.org',
  },
]

function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const manifestoWrapperRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    const manifestoWrapper = manifestoWrapperRef.current
    const progressBar = progressBarRef.current
    if (!scrollContainer || !manifestoWrapper) return

    const lit = manifestoWrapper.querySelector<HTMLElement>('.manifesto--lit')
    if (!lit) return

    let nLines = 0
    const measureLines = () => {
      const lineH = parseFloat(window.getComputedStyle(lit).lineHeight)
      nLines = Math.round(manifestoWrapper.getBoundingClientRect().height / lineH)
      // Keep per-line scroll budget constant regardless of screen size / line count
      scrollContainer.style.height = `${Math.max(350, nLines * 55)}svh`
    }
    measureLines()

    const ro = new ResizeObserver(measureLines)
    ro.observe(manifestoWrapper)

    const scroll = new LocomotiveScroll({
      scrollCallback: () => {
        if (nLines === 0) return

        const rect = scrollContainer.getBoundingClientRect()
        const scrollableH = scrollContainer.offsetHeight - window.innerHeight
        const progress = Math.max(0, Math.min(1, -rect.top / scrollableH))

        // Progress bar: grow while active, fade out when complete
        if (progressBar) {
          progressBar.style.width = `${progress * 100}%`
          progressBar.style.opacity = progress >= 1 ? '0' : '1'
        }

        if (progress >= 1) {
          lit.style.clipPath = 'none'
          return
        }

        // Start shimmer only once reveal begins so animation always starts fresh
        if (progress > 0 && lit.style.animationPlayState !== 'running') {
          lit.style.animationPlayState = 'running'
        }

        const lineProgress = progress * nLines
        const L = Math.min(Math.floor(lineProgress), nLines - 1)
        const partialX = (lineProgress - L) * 100

        let polygon: string
        if (L === 0) {
          const botPct = (1 / nLines) * 100
          polygon = `polygon(0% 0%, ${partialX}% 0%, ${partialX}% ${botPct}%, 0% ${botPct}%)`
        } else {
          const topPct = (L / nLines) * 100
          const botPct = ((L + 1) / nLines) * 100
          polygon = `polygon(0% 0%, 100% 0%, 100% ${topPct}%, ${partialX}% ${topPct}%, ${partialX}% ${botPct}%, 0% ${botPct}%)`
        }

        lit.style.clipPath = polygon
      },
    })

    return () => {
      scroll.destroy()
      ro.disconnect()
    }
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="screen">
        <nav className="nav" aria-label="Site navigation">
          <img src="/discern.svg" width={48} height={48} alt="Discern Co." />
        </nav>

        <section className="hero">
          <div className="container">
            <h1 className="hero-name">
              Discern <em>Co.</em>
            </h1>
            <p className="hero-slogan">see further.</p>
          </div>
          <div className="scroll-hint" aria-hidden="true">
            ↓
          </div>
        </section>
      </div>

      <section className="problem">
        <div className="container">
          <p className="problem__intro">
            The software industry is very good at solving problems for people who can pay.
          </p>
          <p className="problem__body">
            Nonprofits. PTOs. Community theaters. The people doing the most essential work have remained an afterthought since the beginning. Not because it's hard. But because building for them doesn't scale, make money, or seem "novel" — and the solution never gets built.
          </p>
        </div>
      </section>

      <div className="problem-closing">
        <div className="container">
          <p className="problem-closing__line">If nobody does —</p>
          <p className="problem-closing__line"><strong>who does?</strong></p>
        </div>
      </div>

      <div className="mission-scroll" ref={scrollContainerRef}>
        <section className="mission">
          <div className="container">
            <div className="manifesto-wrapper" ref={manifestoWrapperRef}>
              <p className="manifesto manifesto--dim">{MANIFESTO}</p>
              <p className="manifesto manifesto--lit" aria-hidden="true">{MANIFESTO}</p>
            </div>
          </div>
          <div className="mission-progress" ref={progressBarRef} />
        </section>
      </div>

      <section id="main" className="work" aria-label="Projects">
        <div className="container">
          <h2 className="work__heading">What We're Building</h2>
          <p className="work__sub">More on the way.</p>
          {projects.map((p) => (
            <article key={p.name} className="project">
              <h2 className="project__name">
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.name}
                  <span className="project__external" aria-hidden="true">↗︎</span>
                </a>
              </h2>
              <p className="project__desc">{p.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contribute" aria-label="Contribute">
        <div className="container contribute__inner">
          <h2 className="contribute__heading">Want to Contribute?</h2>
          <p className="contribute__sub">Everything we build is open. If you share the mission, we'd love your help — code, design, feedback, or just a star.</p>
          <a
            className="contribute__cta"
            href="https://github.com/discern-co"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
            <span className="contribute__cta-arrow" aria-hidden="true">↗︎</span>
          </a>
        </div>
      </section>

      <footer className="footer" aria-label="Site footer">
        <div className="container footer__inner">
          <img src="/discern.svg" width={28} height={28} alt="Discern Co." />
          <div className="footer__links">
            <a href="mailto:hello@discern.computer">hello@discern.computer</a>
            <a
              href="https://github.com/discern-co"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <span className="footer__external" aria-hidden="true">↗︎</span>
            </a>
          </div>
          <span className="footer__slogan">see further.</span>
        </div>
      </footer>
    </>
  )
}

export default App
