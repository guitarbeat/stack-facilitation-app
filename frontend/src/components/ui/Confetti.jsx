import { useEffect } from 'react'

export default function Confetti({ triggerKey }) {
  useEffect(() => {
    if (!triggerKey) return

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7']
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '0'
    container.style.top = '0'
    container.style.width = '100%'
    container.style.height = '0'
    container.style.overflow = 'visible'
    container.style.zIndex = '9998'
    document.body.appendChild(container)

    const num = 80
    const particles = []

    for (let i = 0; i < num; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 8 + 4
      p.style.position = 'absolute'
      p.style.left = Math.random() * 100 + 'vw'
      p.style.top = '-10px'
      p.style.width = `${size}px`
      p.style.height = `${size}px`
      p.style.background = colors[Math.floor(Math.random() * colors.length)]
      p.style.opacity = '0.9'
      p.style.transform = `rotate(${Math.random() * 360}deg)`
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      p.style.boxShadow = '0 0 2px rgba(0,0,0,0.15)'

      container.appendChild(p)
      particles.push({ el: p, vy: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 1.5, rot: Math.random() * 2 - 1 })
    }

    let raf
    const start = performance.now()
    const duration = 2000

    const tick = (now) => {
      const t = now - start
      particles.forEach((pt) => {
        const rect = pt.el.getBoundingClientRect()
        const x = rect.left + pt.vx
        const y = rect.top + pt.vy + t * 0.002
        pt.el.style.transform = `translate(${x}px, ${y}px) rotate(${t * pt.rot}deg)`
        if (y > window.innerHeight + 20) {
          pt.el.remove()
        }
      })
      if (t < duration) {
        raf = requestAnimationFrame(tick)
      } else {
        container.remove()
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      container.remove()
    }
  }, [triggerKey])

  return null
}