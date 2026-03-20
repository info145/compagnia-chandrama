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
/* ════════════════════════════════════════════════════
   PLASMA SPHERE — ENTRY OVERLAY (Three.js)
   ════════════════════════════════════════════════════ */
async function initPlasmaSphere() {
  const overlay = document.getElementById('entry-overlay')
  if (!overlay) return

  // Lazy-load Three.js so it doesn't block the main bundle
  const THREE = await import('three')

  // ── Lunar palette ──────────────────────────────────
  const C = {
    deep:      0x04030d,   // near black with blue tint
    mid:       0x6b4e9e,   // lunar purple
    bright:    0xd4c8f0,   // silver lavender
    shell:     0xc0a070,   // gold
    shellBack: 0x1a0828,   // dark purple back glow
  }

  const W = () => overlay.offsetWidth  || window.innerWidth
  const H = () => overlay.offsetHeight || window.innerHeight

  // ── Scene ──────────────────────────────────────────
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const camera = new THREE.PerspectiveCamera(68, W() / H(), 0.1, 100)
  camera.position.z = 2.5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(W(), H())
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.85

  // Mount canvas as overlay background
  const cvs = renderer.domElement
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;'
  overlay.insertBefore(cvs, overlay.firstChild)

  // ── Rotation group ─────────────────────────────────
  const mainGroup = new THREE.Group()
  scene.add(mainGroup)

  // ── Light ──────────────────────────────────────────
  mainGroup.add(new THREE.PointLight(0xb090ff, 2.2, 10))

  // ── Noise GLSL ─────────────────────────────────────
  const noiseFunctions = `
    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1./6.,1./3.);
      const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy));
      vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);
      vec3 l=1.-g;
      vec3 i1=min(g.xyz,l.zxy);
      vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;
      vec3 x2=x0-i2+C.yyy;
      vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=0.142857142857;
      vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);
      vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy;
      vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);
      vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.;
      vec4 s1=floor(b1)*2.+1.;
      vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
      vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);
      vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z);
      vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
      m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    float fbm(vec3 p){
      float t=0.,a=.5,f=1.;
      for(int i=0;i<3;i++){t+=snoise(p*f)*a;a*=.5;f*=2.;}
      return t;
    }
  `

  // ── Shell ──────────────────────────────────────────
  const shellGeo = new THREE.SphereGeometry(1.0, 64, 64)
  const shellVS = `
    varying vec3 vNormal;varying vec3 vViewPosition;
    void main(){vNormal=normalize(normalMatrix*normal);
      vec4 mv=modelViewMatrix*vec4(position,1.);vViewPosition=-mv.xyz;gl_Position=projectionMatrix*mv;}
  `
  const shellFS = `
    varying vec3 vNormal;varying vec3 vViewPosition;
    uniform vec3 uColor;uniform float uOpacity;
    void main(){float f=pow(1.-dot(normalize(vNormal),normalize(vViewPosition)),2.5);
      gl_FragColor=vec4(uColor,f*uOpacity);}
  `
  const mkShell = (color, opacity, side) => new THREE.ShaderMaterial({
    vertexShader: shellVS, fragmentShader: shellFS,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
    transparent: true, blending: THREE.AdditiveBlending, side, depthWrite: false
  })
  mainGroup.add(new THREE.Mesh(shellGeo, mkShell(C.shellBack, 0.35, THREE.BackSide)))
  mainGroup.add(new THREE.Mesh(shellGeo, mkShell(C.shell, 0.38, THREE.FrontSide)))

  // ── Plasma ─────────────────────────────────────────
  const plasmaMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:        { value: 0 },
      uScale:       { value: 0.14 },
      uBrightness:  { value: 1.25 },
      uThreshold:   { value: 0.068 },
      uColorDeep:   { value: new THREE.Color(C.deep) },
      uColorMid:    { value: new THREE.Color(C.mid) },
      uColorBright: { value: new THREE.Color(C.bright) },
    },
    vertexShader: `
      varying vec3 vPosition;varying vec3 vNormal;varying vec3 vViewPosition;
      void main(){vPosition=position;vNormal=normalize(normalMatrix*normal);
        vec4 mv=modelViewMatrix*vec4(position,1.);vViewPosition=-mv.xyz;gl_Position=projectionMatrix*mv;}
    `,
    fragmentShader: `
      uniform float uTime,uScale,uBrightness,uThreshold;
      uniform vec3 uColorDeep,uColorMid,uColorBright;
      varying vec3 vPosition,vNormal,vViewPosition;
      ${noiseFunctions}
      void main(){
        vec3 p=vPosition*uScale;
        vec3 q=vec3(fbm(p+vec3(0.,uTime*.05,0.)),fbm(p+vec3(5.2,1.3,2.8)+uTime*.05),fbm(p+vec3(2.2,8.4,.5)-uTime*.02));
        float density=fbm(p+2.*q);
        float t=(density+.4)*.8;
        float alpha=smoothstep(uThreshold,.7,t);
        vec3 color=mix(uColorDeep,uColorMid,smoothstep(uThreshold,.5,t));
        color=mix(color,uColorBright,smoothstep(.5,.8,t));
        color=mix(color,vec3(1.),smoothstep(.8,1.,t));
        float facing=dot(normalize(vNormal),normalize(vViewPosition));
        float depth=(facing+1.)*.5;
        gl_FragColor=vec4(color*uBrightness,alpha*(.02+.98*depth));
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
  })
  const plasmaMesh = new THREE.Mesh(new THREE.SphereGeometry(0.998, 128, 128), plasmaMat)
  mainGroup.add(plasmaMesh)

  // ── Particles ──────────────────────────────────────
  const pCount = 500
  const pPos = new Float32Array(pCount * 3)
  const pSizes = new Float32Array(pCount)
  for (let i = 0; i < pCount; i++) {
    const r = 0.95 * Math.cbrt(Math.random())
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
    pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
    pPos[i*3+2] = r * Math.cos(phi)
    pSizes[i] = Math.random()
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSizes, 1))
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xffffff) } },
    vertexShader: `
      uniform float uTime;attribute float aSize;varying float vAlpha;
      void main(){vec3 pos=position;
        pos.y+=sin(uTime*.2+pos.x)*.02;pos.x+=cos(uTime*.15+pos.z)*.02;
        vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=(8.*aSize+4.)*(1./-mv.z);
        vAlpha=.8+.2*sin(uTime+aSize*10.);}
    `,
    fragmentShader: `
      uniform vec3 uColor;varying float vAlpha;
      void main(){vec2 uv=gl_PointCoord-vec2(.5);if(length(uv)>.5)discard;
        float g=pow(1.-length(uv)*2.,.8);gl_FragColor=vec4(uColor,g*vAlpha);}
    `,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  })
  mainGroup.add(new THREE.Points(pGeo, pMat))

  // ── Mouse → gentle rotation offset ────────────────
  let targetRotX = 0, targetRotY = 0
  overlay.addEventListener('mousemove', e => {
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.6
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.3
  }, { passive: true })

  // ── Resize ─────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = W() / H()
    camera.updateProjectionMatrix()
    renderer.setSize(W(), H())
  }, { passive: true })

  // ── Animate ────────────────────────────────────────
  let rafId, startTime = performance.now()
  function animate() {
    rafId = requestAnimationFrame(animate)
    const t = (performance.now() - startTime) / 1000

    plasmaMat.uniforms.uTime.value = t * 0.78
    pMat.uniforms.uTime.value = t

    plasmaMesh.rotation.y = t * 0.08
    mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.04
    mainGroup.rotation.y += (targetRotY + t * 0.005 - mainGroup.rotation.y) * 0.03

    renderer.render(scene, camera)
  }
  animate()

  // ── Stop when overlay dismissed ────────────────────
  overlay.addEventListener('click', () => {
    setTimeout(() => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
    }, 1400)
  }, { once: true })
}

function _initSanskritWave_unused() {
  const canvas  = document.getElementById('sanskrit-canvas')
  const overlay = document.getElementById('entry-overlay')
  if (!canvas || !overlay) return
  const ctx = canvas.getContext('2d')

  // Source text — repeated to fill rows
  const SOURCE_LINES = [
    'ॐ नमो भगवते सोमाय शशिने सुधाकराय च । क्षीराब्धिजन्मने शान्तचित्ताय विश्वप्रियाय च ॥',
    'चन्द्रमा यस्य किरणैः शीतलैः सर्वं जगत् सुखम् । स्निग्धं भवति सततं तं वन्दे शशिमौलिनम् ॥',
    'श्वेतं यस्य वपुः शुभ्रं दधिशङ्खनिभं शुभम् । कुमुदोत्पलपुण्ड्रेक्षु-चम्पकाम्भोजसन्निभम् ॥',
    'रोहिणीवल्लभं देवं कलानां निधिमुत्तमम् । कलाधरं कलापूर्णं कलाकलितविग्रहम् ॥',
    'अमृतं यस्य रूपेण विश्वं जीवति नित्यदा । सुधांशुं सुधासिन्धुं सुधानिधिमहं स्तुवे ॥',
    'निशाकरं निशानाथं निशान्ते यो विराजते । तारामण्डलमध्यस्थं चन्द्रं चन्द्रिकावृतम् ॥',
    'यस्य दर्शनमात्रेण मनः शान्तिं प्रयाति वै । क्रोधलोभभयादीनि नश्यन्ति सर्वदा नृणाम् ॥',
    'यस्य प्रसादात् कवयो गीतं कुर्वन्ति सुन्दरम् । रसिकाः प्रेमनिर्भराः भवन्ति चन्द्रदर्शनात् ॥',
    'ओषधयः सर्वकालं यस्य प्रभावेण वर्धन्ते । सोमं सुमनसं शान्तं सोमं सौम्यस्वभावकम् ॥',
    'सागराः पूर्णिमायां यस्य दृष्ट्या उन्नतिं गताः । चन्द्रं चन्द्रिकया युक्तं चन्द्रिकाप्रियदर्शनम् ॥',
    'कलानिधिं कलाधीशं कलाप्रियं कलावतम् । शशधरं शशाङ्कं च शशिनं शशिभूषणम् ॥',
    'ॐ चन्द्राय विद्महे सुधाकराय धीमहि । तन्नो सोमः प्रचोदयात् ॥',
  ]

  let W, H, fontSize, lineH, numRows, rafId
  // Mouse in pixels
  let mouseX = 0, mouseY = 0
  // Per-row horizontal scroll offset (each row scrolls at a different speed)
  let rowScrolls = []

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth
    H = canvas.height = canvas.offsetHeight || window.innerHeight
    fontSize = Math.max(12, Math.min(16, W / 52))
    lineH    = fontSize * 2.3
    numRows  = Math.ceil(H / lineH) + 3
    if (!rowScrolls.length) {
      rowScrolls = Array.from({ length: 40 }, (_, i) => ({
        x: Math.random() * -800,
        speed: 0.3 + (i % 5) * 0.15,  // different speed per row
      }))
    }
  }
  resize()
  window.addEventListener('resize', resize, { passive: true })

  // Mouse in px
  overlay.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect()
    mouseX = e.clientX - r.left
    mouseY = e.clientY - r.top
  }, { passive: true })
  overlay.addEventListener('touchmove', e => {
    const r = canvas.getBoundingClientRect()
    mouseX = e.touches[0].clientX - r.left
    mouseY = e.touches[0].clientY - r.top
  }, { passive: true })

  let time = 0

  // ── Constants ──────────────────────────────────────
  const WAVE_AMP   = 20    // base sinusoid amplitude (px)
  const WAVE_FREQ  = 0.009 // spatial frequency (radians/px)
  const WAVE_SPEED = 1.4   // time speed multiplier
  const MOUSE_AMP  = 40    // extra amplitude near mouse
  const MOUSE_RADIUS = 0.28 // fraction of screen height
  const SEG        = 5     // strip width (px) — smaller = smoother curve

  function draw() {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    ctx.font = `300 ${fontSize}px 'Noto Sans Devanagari', serif`

    for (let row = 0; row < numRows; row++) {
      const baseY    = row * lineH
      const rowPhase = row * 0.75   // phase offset between rows
      const sc       = rowScrolls[row % rowScrolls.length]

      // Advance horizontal scroll
      sc.x -= sc.speed

      const lineText  = SOURCE_LINES[row % SOURCE_LINES.length] + '   '
      const textWidth = ctx.measureText(lineText).width

      // Keep scroll in bounds (seamless loop)
      if (sc.x < -textWidth) sc.x += textWidth

      // Mouse influence on this row: Gaussian bell based on vertical distance
      const dy          = baseY - mouseY
      const rowMouseDist = Math.abs(dy) / H
      const mouseGain   = Math.max(0, 1 - rowMouseDist / MOUSE_RADIUS)

      // Draw row as vertical strips — each strip at its own Y = sinusoid(x)
      for (let sx = -SEG; sx <= W + SEG; sx += SEG) {
        // Base sinusoidal Y displacement at this x
        const baseWave = WAVE_AMP * Math.sin(sx * WAVE_FREQ + time * WAVE_SPEED + rowPhase)

        // Mouse distortion: horizontal Gaussian around mouseX on this row
        const dx        = sx - mouseX
        const hDist     = Math.abs(dx) / W
        const hGain     = Math.max(0, 1 - hDist * 3.5)
        const mouseWave = MOUSE_AMP * mouseGain * hGain *
                          Math.sin(sx * WAVE_FREQ * 1.8 + time * WAVE_SPEED * 1.6 + rowPhase)

        const y = baseY + baseWave + mouseWave

        // Brightness: rows+columns near mouse are brighter
        const proximity = mouseGain * hGain
        const alpha = 0.11 + proximity * 0.20

        ctx.save()
        ctx.beginPath()
        ctx.rect(sx, 0, SEG + 1, H)  // +1 avoids hairline gaps
        ctx.clip()
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
        // Draw enough repetitions to fill strip regardless of scroll
        ctx.fillText(lineText.repeat(4), sc.x, y)
        ctx.restore()
      }
    }

    time += 0.022
    rafId = requestAnimationFrame(draw)
  }

  document.fonts.ready.then(() => draw())

  // Stop animation after overlay fades out
  overlay.addEventListener('click', () => {
    setTimeout(() => cancelAnimationFrame(rafId), 1300)
  }, { once: true })
}


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
    let stepCount  = 0
    fadeTimer = setInterval(() => {
      stepCount++
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta))
      const done = stepCount >= steps ||
                   (delta > 0 ? audio.volume >= targetVol : audio.volume <= targetVol)
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
    setPlayingUI(false)
    fadeTo(0, 600, () => { audio.pause(); audio.volume = 0 })
    // Safari fallback: se il fade non completa entro 700ms, ferma comunque
    setTimeout(() => {
      if (!isPlaying) { audio.pause(); audio.volume = 0 }
    }, 700)
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
  initPlasmaSphere()
})
