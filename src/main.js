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
window.openActress = function(card) {
  const modal = document.getElementById('actressModal')
  document.getElementById('actressName').textContent = card.dataset.name || ''
  document.getElementById('actressRole').textContent = card.dataset.role || ''
  document.getElementById('actressImg').src           = card.dataset.img  || ''
  document.getElementById('actressImg').alt           = card.dataset.name || ''

  const funEl = document.getElementById('actressFun')
  funEl.innerHTML = (card.dataset.fun || '')
    .split('. ')
    .filter(s => s.trim())
    .map(s => `<p>${s.trim()}${s.endsWith('.') ? '' : '.'}</p>`)
    .join('')

  const bioEl = document.getElementById('actressBio')
  const bio = card.dataset.bio || ''
  bioEl.innerHTML = bio
    ? bio.split('. ').filter(s => s.trim()).map(s => `<p>${s.trim()}${s.endsWith('.') ? '' : '.'}</p>`).join('')
    : ''

  modal.classList.add('is-open')
  document.body.style.overflow = 'hidden'
}

window.closeActress = function(e) {
  if (e && e.target !== document.getElementById('actressModal') && !e.target.classList.contains('actress-modal__close')) return
  document.getElementById('actressModal').classList.remove('is-open')
  document.body.style.overflow = ''
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const am = document.getElementById('actressModal')
    if (am?.classList.contains('is-open')) { am.classList.remove('is-open'); document.body.style.overflow = '' }
  }
})

/* ════════════════════════════════════════════════════
   ARTICLE MODAL
   ════════════════════════════════════════════════════ */
window.openArticle = function(card) {
  const modal   = document.getElementById('articleModal')
  const title   = card.dataset.title   || ''
  const tag     = card.dataset.tag     || ''
  const date    = card.dataset.date    || ''
  const img     = card.dataset.img     || ''
  const content = card.dataset.content || ''

  document.getElementById('articleTitle').textContent = title
  document.getElementById('articleTag').textContent   = tag
  document.getElementById('articleDate').textContent  = date
  document.getElementById('articleImg').src           = img
  document.getElementById('articleImg').alt           = title

  const bodyEl = document.getElementById('articleBody')
  bodyEl.innerHTML = content
    .split('\n\n')
    .map(p => `<p>${p.trim()}</p>`)
    .join('')

  modal.classList.add('is-open')
  document.body.style.overflow = 'hidden'
}

window.closeArticle = function(e) {
  if (e && e.target !== document.getElementById('articleModal') && !e.target.classList.contains('article-modal__close')) return
  const modal = document.getElementById('articleModal')
  modal.classList.remove('is-open')
  document.body.style.overflow = ''
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('articleModal')
    if (modal?.classList.contains('is-open')) {
      modal.classList.remove('is-open')
      document.body.style.overflow = ''
    }
  }
})

/* ════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar()
  initHero()
  initReveal()
  initDatePicker()
  initForms()
  initLightbox()
})
