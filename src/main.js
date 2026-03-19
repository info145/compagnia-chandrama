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
   CUSTOM CURSOR
   ════════════════════════════════════════════════════ */
function initCursor() {
  // Only on pointer-fine devices (desktop/mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return

  const dot  = document.getElementById('cursor')
  const ring = document.getElementById('cursor-ring')
  if (!dot || !ring) return

  let mouseX = 0, mouseY = 0
  let ringX  = 0, ringY  = 0

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.left = mouseX + 'px'
    dot.style.top  = mouseY + 'px'
  })

  // Ring follows with lerp (lag)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12
    ringY += (mouseY - ringY) * 0.12
    ring.style.left = ringX + 'px'
    ring.style.top  = ringY + 'px'
    requestAnimationFrame(animateRing)
  }
  animateRing()

  // Hover state on interactive elements
  const hoverTargets = 'a, button, .cast-card, .gallery__item, .blog-card, .streaming__card, .date-item, .timeline-card'
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor--hover')
      ring.classList.add('cursor--hover')
    })
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor--hover')
      ring.classList.remove('cursor--hover')
    })
  })

  // Click ripple
  document.addEventListener('mousedown', () => {
    dot.classList.add('cursor--click')
    ring.classList.add('cursor--click')
  })
  document.addEventListener('mouseup', () => {
    dot.classList.remove('cursor--click')
    ring.classList.remove('cursor--click')
  })

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.classList.add('cursor--hidden')
    ring.classList.add('cursor--hidden')
  })
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('cursor--hidden')
    ring.classList.remove('cursor--hidden')
  })
}


/* ════════════════════════════════════════════════════
   SPLIT-TEXT TITLES
   ════════════════════════════════════════════════════ */
function initSplitTitles() {
  const titles = document.querySelectorAll('.section__title')
  titles.forEach(title => {
    const words = title.textContent.trim().split(/\s+/)
    title.innerHTML = words.map((word, i) =>
      `<span class="split-word" style="--i:${i}">` +
        `<span class="split-word__inner">${word}</span>` +
      `</span>`
    ).join(' ')
    title.classList.add('split-title')
  })

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const wordEls = entry.target.querySelectorAll('.split-word')
      wordEls.forEach((w, i) => {
        // Cascade delay: 80ms per word
        setTimeout(() => w.classList.add('visible'), i * 80)
      })
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.3 })

  titles.forEach(title => observer.observe(title))
}


/* ════════════════════════════════════════════════════
   ANIMATED COUNTERS
   ════════════════════════════════════════════════════ */
function initCounters() {
  const stats = document.querySelectorAll('.stat__num')
  if (!stats.length) return

  function animateCounter(el) {
    const raw    = el.textContent.trim()
    const suffix = raw.replace(/[\d]/g, '')    // e.g. "+"
    const target = parseInt(raw.replace(/\D/g, ''), 10)
    const duration = target > 100 ? 1800 : 1000
    const start = performance.now()

    function tick(now) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * target)
      el.textContent = current + suffix
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      animateCounter(entry.target)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.6 })

  stats.forEach(el => observer.observe(el))
}


/* ════════════════════════════════════════════════════
   PROGRESS BAR — SOSTIENICI
   ════════════════════════════════════════════════════ */
function initSosteniamo() {
  const fill    = document.querySelector('.sostienici__progress-fill')
  const raised  = document.querySelector('.sostienici__progress-raised')
  const supporters = document.querySelector('.sostienici__progress-supporters')
  if (!fill) return

  const targetPct   = parseFloat(fill.dataset.target) || 100
  const raisedTarget = parseInt(raised?.dataset.target || '500', 10)
  const suppTarget   = parseInt(supporters?.dataset.target || '11', 10)
  const raisedPre    = raised?.dataset.prefix || '€ '
  const raisedSuf    = raised?.dataset.suffix || ' raccolti'
  const suppSuf      = supporters?.dataset.suffix || ' sostenitori'

  let animated = false

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || animated) return
      animated = true
      observer.disconnect()

      const duration = 1600
      const start = performance.now()

      function tick(now) {
        const elapsed  = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        fill.style.width = (eased * targetPct) + '%'
        if (raised)     raised.textContent     = raisedPre + Math.round(eased * raisedTarget) + raisedSuf
        if (supporters) supporters.textContent = Math.round(eased * suppTarget) + suppSuf

        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }, { threshold: 0.4 })

  observer.observe(fill.closest('.sostienici__progress') || fill)
}


/* ════════════════════════════════════════════════════
   SCROLL REVEAL  (with stagger for card groups)
   ════════════════════════════════════════════════════ */
function initReveal() {
  // Stagger groups: cast, blog, gallery, streaming
  const staggerGroups = [
    '.cast__grid .cast-card',
    '.blog__grid .blog-card',
    '#gallery .gallery__item',
    '.streaming__grid .streaming__card',
  ]

  staggerGroups.forEach(selector => {
    const els = document.querySelectorAll(selector)
    els.forEach((el, i) => {
      // Override the generic transition-delay with a progressive one
      el.style.transitionDelay = `${i * 0.08}s`
    })
  })

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

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
   BACKGROUND AUDIO
   ════════════════════════════════════════════════════ */
function initAudio() {
  const overlay   = document.getElementById('entry-overlay')
  const entryBtn  = document.getElementById('entry-btn')
  const audioBtn  = document.getElementById('audio-btn')
  const audio     = document.getElementById('bg-audio')
  const iconPlay  = document.getElementById('audio-icon-play')
  const iconPause = document.getElementById('audio-icon-pause')
  if (!audio) return

  let isPlaying = false
  let fadeTimer = null

  function fadeTo(targetVol, duration, onDone) {
    clearInterval(fadeTimer)
    const steps    = 40
    const interval = duration / steps
    const delta    = (targetVol - audio.volume) / steps
    fadeTimer = setInterval(() => {
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta))
      const done = delta > 0 ? audio.volume >= targetVol : audio.volume <= targetVol
      if (done) {
        audio.volume = targetVol
        clearInterval(fadeTimer)
        if (onDone) onDone()
      }
    }, interval)
  }

  function setPlayingUI(playing) {
    isPlaying = playing
    if (!audioBtn) return
    audioBtn.classList.toggle('playing', playing)
    if (iconPlay)  iconPlay.style.display  = playing ? 'none' : 'flex'
    if (iconPause) iconPause.style.display = playing ? 'flex' : 'none'
  }

  function startPlayback() {
    if (isPlaying) return
    audio.volume = 0.01
    audio.play()
      .then(() => { fadeTo(0.28, 1800); setPlayingUI(true) })
      .catch(() => {})
  }

  function stopPlayback() {
    fadeTo(0, 700, () => { audio.pause(); audio.volume = 0 })
    setPlayingUI(false)
  }

  // Bottone play/pause nel sito
  audioBtn?.addEventListener('click', () => {
    if (isPlaying) { stopPlayback() } else { startPlayback() }
  })

  // Entry overlay — tap per entrare e sbloccare audio (funziona su iOS)
  function dismissOverlay() {
    startPlayback()
    if (overlay) {
      overlay.classList.add('hidden')
      // Rimuovi dal DOM dopo la transizione per non bloccare interazioni
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true })
    }
  }

  if (overlay && entryBtn) {
    // Blocca lo scroll mentre l'overlay è aperto
    document.body.style.overflow = 'hidden'

    entryBtn.addEventListener('click', () => {
      document.body.style.overflow = ''
      dismissOverlay()
    })
    // Tap ovunque sull'overlay (non solo sul bottone) per comodità mobile
    overlay.addEventListener('click', () => {
      document.body.style.overflow = ''
      dismissOverlay()
    })
  } else {
    // Nessun overlay (es. pagina /watch) — tenta autoplay diretto
    audio.volume = 0.01
    audio.play()
      .then(() => { fadeTo(0.28, 1800); setPlayingUI(true) })
      .catch(() => {
        const unlock = () => {
          document.removeEventListener('click',    unlock, true)
          document.removeEventListener('touchend', unlock, true)
          startPlayback()
        }
        document.addEventListener('click',    unlock, { capture: true, once: true })
        document.addEventListener('touchend', unlock, { capture: true, once: true })
      })
  }
}


/* ════════════════════════════════════════════════════
   STREAMING — Stripe Checkout
   ════════════════════════════════════════════════════ */
function initStreaming() {
  document.querySelectorAll('.btn--stream').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.product
      const title = btn.dataset.title || 'Spettacolo'

      btn.disabled = true
      btn.textContent = 'Caricamento…'

      try {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })

        if (!res.ok) throw new Error('Errore server')
        const { url } = await res.json()
        window.location.href = url
      } catch (err) {
        console.error(err)
        btn.disabled = false
        btn.textContent = 'Riprova'
        alert('Si è verificato un errore. Riprova tra qualche istante.')
      }
    })
  })
}

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor()
  initNavbar()
  initHero()
  initSplitTitles()
  initReveal()
  initCounters()
  initSosteniamo()
  initDatePicker()
  initForms()
  initLightbox()
  initActressModal()
  initArticleModal()
  initStreaming()
  initAudio()
})
