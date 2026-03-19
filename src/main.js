import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { Italian } from 'flatpickr/dist/l10n/it.js'

gsap.registerPlugin(ScrollTrigger)

/* ════════════════════════════════════════════════════
   HERO ANIMATION
   ════════════════════════════════════════════════════ */
function initHero() {
  const tl = gsap.timeline({ delay: 0.2 })

  // eyebrow fades in
  tl.to('#h-eyebrow', {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  })

  // title words clip from bottom
  tl.to('#h-word-1', {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    duration: 0.7,
    ease: 'power3.out'
  }, '-=0.2')

  tl.to('#h-word-2', {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    duration: 0.7,
    ease: 'power3.out'
  }, '-=0.4')

  // red rule expands
  tl.to('.hero__rule', {
    width: '80px',
    duration: 0.5,
    ease: 'power2.inOut'
  }, '-=0.2')

  // descriptor + show + CTA fade in
  tl.to(['#h-descriptor', '#h-show', '#h-actions'], {
    opacity: 1,
    y: 0,
    stagger: 0.12,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.2')

  // Hero parallax
  gsap.to('#hero-bg', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  })
}

/* ════════════════════════════════════════════════════
   NAVBAR SCROLL
   ════════════════════════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById('nav')
  const burger = document.getElementById('burger')
  const mobileMenu = document.getElementById('mobile-menu')

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled')
    } else {
      nav.classList.remove('scrolled')
    }
  }, { passive: true })

  // Mobile menu toggle
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open')
    burger.classList.toggle('open', isOpen)
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open')
      burger.classList.remove('open')
      document.body.style.overflow = ''
    })
  })
}

/* ════════════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
}

/* ════════════════════════════════════════════════════
   FLATPICKR DATE PICKER
   ════════════════════════════════════════════════════ */
function initDatePicker() {
  const picker = document.getElementById('date-picker')
  if (!picker) return

  flatpickr(picker, {
    locale: Italian,
    dateFormat: 'j F Y',
    enable: [
      '2026-03-20',
      '2026-03-21',
      '2026-04-05',
      '2026-04-12',
      '2026-04-19',
    ],
    onChange: (dates, dateStr, instance) => {
      const isoDate = dates[0]?.toISOString().split('T')[0]
      const hiddenInput = document.getElementById('hidden-date')
      if (hiddenInput) hiddenInput.value = dateStr

      // Sync with date pills
      document.querySelectorAll('.date-item').forEach(item => {
        item.classList.toggle('active', item.dataset.date === isoDate)
      })
    }
  })
}

/* ════════════════════════════════════════════════════
   DATE PILL SELECTOR
   ════════════════════════════════════════════════════ */
window.selectDate = function(pill) {
  document.querySelectorAll('.date-item').forEach(p => p.classList.remove('active'))
  pill.classList.add('active')

  const picker = document.getElementById('date-picker')
  if (picker?._flatpickr) {
    picker._flatpickr.setDate(pill.dataset.date)
  }
}

/* ════════════════════════════════════════════════════
   FORM SUBMIT (Formspree async)
   ════════════════════════════════════════════════════ */
function initForms() {
  async function submitForm(formId, successId) {
    const form = document.getElementById(formId)
    if (!form) return

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const btn = form.querySelector('button[type="submit"]')
      const successEl = document.getElementById(successId)
      const originalText = btn.textContent

      btn.textContent = 'Invio…'
      btn.disabled = true

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        })

        if (res.ok) {
          form.reset()
          if (successEl) successEl.style.display = 'block'
          btn.textContent = 'Inviato ✓'
        } else {
          btn.textContent = 'Errore – riprova'
          btn.disabled = false
        }
      } catch {
        btn.textContent = 'Errore – riprova'
        btn.disabled = false
      }

      // Reset button after 4s
      setTimeout(() => {
        if (btn.textContent !== 'Inviato ✓') return
        btn.textContent = originalText
        btn.disabled = false
      }, 4000)
    })
  }

  submitForm('booking-form', 'booking-success')
  submitForm('contact-form', 'contact-success')
}

/* ════════════════════════════════════════════════════
   GALLERY LIGHTBOX
   ════════════════════════════════════════════════════ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = document.getElementById('lightbox-img')

  window.openLightbox = function(el) {
    const img = el.querySelector('img')
    if (!img) return // no real photo yet
    lightboxImg.src = img.src
    lightboxImg.alt = img.alt
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  window.closeLightbox = function() {
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
    lightboxImg.src = ''
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeLightbox()
  })
}

/* ════════════════════════════════════════════════════
   ACTRESS MODAL
   ════════════════════════════════════════════════════ */
function initActressModal() {
  const modal = document.getElementById('actressModal')
  if (!modal) return

  function openActress(card) {
    document.getElementById('actressName').textContent = card.dataset.name || ''
    document.getElementById('actressRole').textContent = card.dataset.role || ''
    document.getElementById('actressImg').src          = card.dataset.img  || ''
    document.getElementById('actressImg').alt          = card.dataset.name || ''

    const toParas = str => (str || '')
      .replace(/\\n\\n/g, '\n\n')
      .split(/\n\n|(?<=\.)\s{2,}/)
      .map(s => s.trim()).filter(Boolean)
      .map(s => `<p>${s}${s.endsWith('.') ? '' : '.'}</p>`).join('')

    document.getElementById('actressFun').innerHTML = toParas(card.dataset.fun)
    document.getElementById('actressBio').innerHTML = toParas(card.dataset.bio)

    modal.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }

  function closeActress() {
    modal.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  document.querySelectorAll('.cast-card').forEach(card => {
    card.addEventListener('click', () => openActress(card))
  })

  modal.addEventListener('click', e => {
    if (e.target === modal) closeActress()
  })

  modal.querySelector('.actress-modal__close')
    ?.addEventListener('click', closeActress)

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeActress()
  })
}

/* ════════════════════════════════════════════════════
   ARTICLE MODAL
   ════════════════════════════════════════════════════ */
function initArticleModal() {
  const modal = document.getElementById('articleModal')
  if (!modal) return

  function openArticle(card) {
    document.getElementById('articleTitle').textContent = card.dataset.title || ''
    document.getElementById('articleTag').textContent   = card.dataset.tag   || ''
    document.getElementById('articleDate').textContent  = card.dataset.date  || ''
    document.getElementById('articleImg').src           = card.dataset.img   || ''
    document.getElementById('articleImg').alt           = card.dataset.title || ''

    document.getElementById('articleBody').innerHTML = (card.dataset.content || '')
      .split(/\\n\\n|\n\n/).map(p => `<p>${p.trim()}</p>`).filter(p => p !== '<p></p>').join('')

    modal.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }

  function closeArticle() {
    modal.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  document.querySelectorAll('.blog-card__link').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      openArticle(btn.closest('.blog-card'))
    })
  })

  modal.addEventListener('click', e => { if (e.target === modal) closeArticle() })
  modal.querySelector('.article-modal__close')?.addEventListener('click', closeArticle)

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeArticle()
  })
}

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   THEATRICAL SPOTLIGHT
   ════════════════════════════════════════════════════ */
function initSpotlight() {
  if (window.matchMedia('(pointer: coarse)').matches) return // skip touch devices

  const canvas = document.createElement('canvas')
  canvas.id = 'spotlight'
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:498;transition:opacity 0.4s;'
  document.body.appendChild(canvas)

  const btn = document.createElement('button')
  btn.id = 'spotlight-toggle'
  btn.title = 'Luce teatrale on/off'
  btn.innerHTML = '🔦'
  btn.style.cssText = `
    position:fixed;bottom:1.8rem;left:1.8rem;z-index:700;
    background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
    color:#fff;width:2.4rem;height:2.4rem;border-radius:50%;font-size:1rem;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.2s;backdrop-filter:blur(4px);
  `
  document.body.appendChild(btn)

  const ctx = canvas.getContext('2d')
  let cx = innerWidth / 2, cy = -300
  let tx = cx, ty = cy
  let on = true

  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight }
  resize()
  window.addEventListener('resize', resize)

  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY })

  btn.addEventListener('click', () => {
    on = !on
    canvas.style.opacity = on ? '1' : '0'
    btn.style.background = on ? 'rgba(255,255,255,0.07)' : 'rgba(200,50,50,0.2)'
  })

  const lerp = (a, b, t) => a + (b - a) * t

  function draw() {
    cx = lerp(cx, tx, 0.08)
    cy = lerp(cy, ty, 0.08)

    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // 1 · dark overlay
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, W, H)

    // 2 · cut out cone + spot
    ctx.globalCompositeOperation = 'destination-out'

    const hw = Math.max(cy * Math.tan(0.38), 55)

    // cone beam from top
    const cg = ctx.createLinearGradient(cx, 0, cx, cy)
    cg.addColorStop(0,   'rgba(0,0,0,0)')
    cg.addColorStop(0.3, 'rgba(0,0,0,0.25)')
    cg.addColorStop(1,   'rgba(0,0,0,0.92)')
    ctx.fillStyle = cg
    ctx.beginPath()
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx + hw,       cy + 60)
    ctx.lineTo(cx - hw,       cy + 60)
    ctx.closePath()
    ctx.fill()

    // soft ellipse at mouse
    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, hw)
    sg.addColorStop(0,    'rgba(0,0,0,1)')
    sg.addColorStop(0.55, 'rgba(0,0,0,0.8)')
    sg.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.ellipse(cx, cy, hw, hw * 0.58, 0, 0, Math.PI * 2)
    ctx.fill()

    // 3 · warm amber glow
    ctx.globalCompositeOperation = 'source-over'
    const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, hw * 1.2)
    ag.addColorStop(0,   'rgba(255,210,90,0.08)')
    ag.addColorStop(0.4, 'rgba(255,160,40,0.04)')
    ag.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = ag
    ctx.beginPath()
    ctx.ellipse(cx, cy, hw * 1.2, hw * 0.72, 0, 0, Math.PI * 2)
    ctx.fill()

    requestAnimationFrame(draw)
  }
  draw()
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar()
  initHero()
  initReveal()
  initDatePicker()
  initForms()
  initLightbox()
  initActressModal()
  initArticleModal()
  initSpotlight()
})
