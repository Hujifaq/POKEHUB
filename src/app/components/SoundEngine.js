"use client"

// Web Audio API Procedural Sound Synthesizer for PokerHub SFX
class SoundEngineClass {
  constructor() {
    this.ctx = null
    this.isMuted = false
    this.noiseBuffer = null
    this.listeners = new Set()
    this._unlockBound = false

    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('pokehub_sfx_muted')
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true'
        }
      } catch (e) {}

      this._setupGlobalUnlock()
    }
  }

  _setupGlobalUnlock() {
    if (typeof window === 'undefined' || this._unlockBound) return
    this._unlockBound = true

    const unlockEvents = [
      'pointerdown',
      'mousedown',
      'touchstart',
      'touchend',
      'click',
      'keydown',
      'wheel',
      'scroll'
    ]

    const unlockAudio = () => {
      this.init()
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        this.ctx.resume().then(() => {
          if (this.ctx && this.ctx.state === 'running') {
            try {
              // Play a silent 1-sample buffer to permanently unlock hardware audio thread
              const buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate || 44100)
              const source = this.ctx.createBufferSource()
              source.buffer = buffer
              source.connect(this.ctx.destination)
              source.start(0)
            } catch (e) {}

            unlockEvents.forEach((ev) => {
              window.removeEventListener(ev, unlockAudio, true)
              document.removeEventListener(ev, unlockAudio, true)
            })
          }
        }).catch(() => {})
      }
    }

    unlockEvents.forEach((ev) => {
      window.addEventListener(ev, unlockAudio, { capture: true, passive: true })
      document.addEventListener(ev, unlockAudio, { capture: true, passive: true })
    })
  }

  _initNoiseBuffer() {
    if (!this.ctx || this.noiseBuffer) return
    try {
      const length = Math.floor(this.ctx.sampleRate * 2) // 2s noise buffer
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate)
      const data = this.noiseBuffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } catch (e) {
      this.noiseBuffer = null
    }
  }

  init() {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    if (!this.ctx) {
      try {
        this.ctx = new AudioContextClass()
      } catch (e) {}
    }
    if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
      this.ctx.resume().catch(() => {})
    }
    if (this.ctx && !this.noiseBuffer) {
      this._initNoiseBuffer()
    }
    if (!this._unlockBound) {
      this._setupGlobalUnlock()
    }
  }

  /**
   * Helper that guarantees execution only when AudioContext is running.
   * If AudioContext is currently suspended, it resumes it and executes the callback once running.
   */
  _withContext(fn) {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      this.ctx.resume().then(() => {
        if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
          try {
            fn(this.ctx.currentTime)
          } catch (e) {}
        }
      }).catch(() => {})
      return
    }

    if (this.ctx.state === 'running') {
      try {
        fn(this.ctx.currentTime)
      } catch (e) {}
    }
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback)
      return () => this.listeners.delete(callback)
    }
    return () => {}
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.isMuted)
      } catch (e) {}
    })
  }

  getMuted() {
    return this.isMuted
  }

  setMuted(muted) {
    this.isMuted = !!muted
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pokehub_sfx_muted', this.isMuted ? 'true' : 'false')
      }
    } catch (e) {}
    this.notify()
    if (!this.isMuted) {
      this.init()
      if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
        this.ctx.resume().then(() => {
          this.playClick()
        }).catch(() => {})
      } else {
        this.playClick()
      }
    }
  }

  toggleMute() {
    const next = !this.isMuted
    this.setMuted(next)
    return next
  }

  setSfxMuted(muted) {
    this.setMuted(muted)
  }

  toggleAmbient() {
    return false
  }

  // ========================================================
  // SOOTHING ASMR MESSAGE BOX & STEP TRANSITION SOUND
  // ========================================================
  playMessageFlip(opts = {}) {
    this._withContext((now) => {
      let intensity = 1.0
      if (typeof opts === 'number') intensity = Math.max(0.2, opts)
      else if (typeof opts === 'object' && opts !== null && Number.isFinite(opts.intensity)) intensity = opts.intensity

      const duration = 0.16
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(0.38 * intensity, now)
      masterGain.connect(this.ctx.destination)

      // 1. Soft Velvet Paper Flutter
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 1.8)
      }

      const paperSrc = this.ctx.createBufferSource()
      paperSrc.buffer = noiseBuffer

      const paperFilter = this.ctx.createBiquadFilter()
      paperFilter.type = 'bandpass'
      paperFilter.frequency.setValueAtTime(950, now)
      paperFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.05)
      paperFilter.frequency.exponentialRampToValueAtTime(650, now + duration)
      paperFilter.Q.setValueAtTime(1.1, now)

      const paperGain = this.ctx.createGain()
      paperGain.gain.setValueAtTime(0.01, now)
      paperGain.gain.exponentialRampToValueAtTime(0.75, now + 0.04)
      paperGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      paperSrc.connect(paperFilter)
      paperFilter.connect(paperGain)
      paperGain.connect(masterGain)
      paperSrc.start(now)
      paperSrc.stop(now + duration + 0.01)

      // 2. Warm Felt Body Thud
      const warmThud = this.ctx.createOscillator()
      const thudGain = this.ctx.createGain()
      warmThud.type = 'sine'
      warmThud.frequency.setValueAtTime(130, now)
      warmThud.frequency.exponentialRampToValueAtTime(75, now + 0.05)

      thudGain.gain.setValueAtTime(0.28, now)
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      warmThud.connect(thudGain)
      thudGain.connect(masterGain)
      warmThud.start(now)
      warmThud.stop(now + 0.07)
    })
  }

  // Card swoosh / air slicing glide sound
  playCardSwoosh(opts = {}) {
    this._withContext((now) => {
      let intensity = 1.0
      if (typeof opts === 'number') intensity = Math.max(0.2, opts)
      else if (typeof opts === 'object' && opts !== null && Number.isFinite(opts.intensity)) intensity = opts.intensity

      const duration = 0.20
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 1.6)
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(650, now)
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.08)
      filter.frequency.exponentialRampToValueAtTime(450, now + duration)
      filter.Q.setValueAtTime(1.6, now)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.01, now)
      gain.gain.exponentialRampToValueAtTime(0.42 * intensity, now + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start(now)
      noise.stop(now + duration + 0.01)
    })
  }

  // Smooth card slide across felt sound
  playCardSlide(opts = {}) {
    this._withContext((now) => {
      let intensity = 1.0
      if (typeof opts === 'number') intensity = Math.max(0.2, opts)
      else if (typeof opts === 'object' && opts !== null && Number.isFinite(opts.intensity)) intensity = opts.intensity

      const duration = 0.18
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 1.8)
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(550, now)
      filter.frequency.exponentialRampToValueAtTime(1650, now + 0.06)
      filter.frequency.exponentialRampToValueAtTime(360, now + duration)
      filter.Q.setValueAtTime(1.4, now)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.01, now)
      gain.gain.exponentialRampToValueAtTime(0.40 * intensity, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start(now)
      noise.stop(now + duration + 0.01)
    })
  }

  // Full Aerodynamic Paper Card Dealing Sound
  playCardDeal(opts = {}) {
    this._withContext((now) => {
      let intensity = 1.0
      if (typeof opts === 'number') intensity = Math.max(0.2, opts)
      else if (typeof opts === 'object' && opts !== null && Number.isFinite(opts.intensity)) intensity = opts.intensity

      const duration = 0.18
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(0.48 * intensity, now)
      masterGain.connect(this.ctx.destination)

      // 1. Aerodynamic Paper Wind Whoosh
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 1.4)
      }

      const windSrc = this.ctx.createBufferSource()
      windSrc.buffer = noiseBuffer

      const windFilter = this.ctx.createBiquadFilter()
      windFilter.type = 'bandpass'
      windFilter.frequency.setValueAtTime(550, now)
      windFilter.frequency.exponentialRampToValueAtTime(2200, now + 0.06)
      windFilter.frequency.exponentialRampToValueAtTime(450, now + duration)
      windFilter.Q.setValueAtTime(1.4, now)

      const windGain = this.ctx.createGain()
      windGain.gain.setValueAtTime(0.01, now)
      windGain.gain.exponentialRampToValueAtTime(0.80, now + 0.05)
      windGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      windSrc.connect(windFilter)
      windFilter.connect(windGain)
      windGain.connect(masterGain)
      windSrc.start(now)
      windSrc.stop(now + duration + 0.01)

      // 2. Warm Felt Landing Tap
      const warmThud = this.ctx.createOscillator()
      const thudGain = this.ctx.createGain()
      warmThud.type = 'sine'
      warmThud.frequency.setValueAtTime(140, now + 0.03)
      warmThud.frequency.exponentialRampToValueAtTime(80, now + 0.08)

      thudGain.gain.setValueAtTime(0.001, now)
      thudGain.gain.setValueAtTime(0.24, now + 0.03)
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      warmThud.connect(thudGain)
      thudGain.connect(masterGain)
      warmThud.start(now + 0.03)
      warmThud.stop(now + 0.10)

      // 3. High-frequency Air Cushion Rustle
      const airSrc = this.ctx.createBufferSource()
      airSrc.buffer = noiseBuffer
      const airFilter = this.ctx.createBiquadFilter()
      airFilter.type = 'highpass'
      airFilter.frequency.setValueAtTime(3200, now)
      airFilter.Q.setValueAtTime(0.7, now)

      const airGain = this.ctx.createGain()
      airGain.gain.setValueAtTime(0.001, now)
      airGain.gain.exponentialRampToValueAtTime(0.28, now + 0.04)
      airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)

      airSrc.connect(airFilter)
      airFilter.connect(airGain)
      airGain.connect(masterGain)
      airSrc.start(now)
      airSrc.stop(now + 0.15)
    })
  }

  // Snappy card flip sound
  playCardFlip(opts = {}) {
    this._withContext((now) => {
      let intensity = 1.0
      if (typeof opts === 'number') intensity = Math.max(0.2, opts)
      else if (typeof opts === 'object' && opts !== null && Number.isFinite(opts.intensity)) intensity = opts.intensity

      const duration = 0.15
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(0.48 * intensity, now)
      masterGain.connect(this.ctx.destination)

      // 1. Soft Paper Wind Slicing Whoosh
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI)
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = noiseBuffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(750, now)
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.04)
      filter.frequency.exponentialRampToValueAtTime(500, now + duration)
      filter.Q.setValueAtTime(1.5, now)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.01, now)
      gain.gain.exponentialRampToValueAtTime(0.60, now + 0.035)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(masterGain)

      noise.start(now)
      noise.stop(now + duration + 0.01)

      // 2. Warm felt cushion landing tap
      const warmThud = this.ctx.createOscillator()
      const thudGain = this.ctx.createGain()
      warmThud.type = 'sine'
      warmThud.frequency.setValueAtTime(150, now)
      warmThud.frequency.exponentialRampToValueAtTime(85, now + 0.04)

      thudGain.gain.setValueAtTime(0.26, now)
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

      warmThud.connect(thudGain)
      thudGain.connect(masterGain)
      warmThud.start(now)
      warmThud.stop(now + 0.06)
    })
  }

  // 3D Hero card rotation sound
  playHeroCardRotate(opts = {}) {
    this._withContext((now) => {
      let velocity = 1.0
      let intensity = 1.0
      let mode = 'rotate'

      if (typeof opts === 'number') {
        velocity = Math.max(0.2, Math.min(3.0, opts))
      } else if (typeof opts === 'object' && opts !== null) {
        if (Number.isFinite(opts.velocity)) velocity = Math.max(0.2, Math.min(3.0, opts.velocity))
        if (Number.isFinite(opts.intensity)) intensity = Math.max(0.1, Math.min(2.0, opts.intensity))
        if (opts.mode) mode = opts.mode
      }

      const isMicro = mode === 'micro' || velocity < 0.45
      const duration = isMicro ? 0.09 : Math.max(0.11, Math.min(0.22, 0.15 * (1.1 / Math.sqrt(velocity))))
      const masterVol = isMicro ? 0.18 * intensity : Math.min(0.4, 0.26 * intensity * Math.min(1.4, Math.max(0.5, velocity)))

      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(masterVol, now)
      masterGain.connect(this.ctx.destination)

      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize
        const env = Math.sin(progress * Math.PI)
        data[i] = (Math.random() * 2 - 1) * env
      }

      const windSource = this.ctx.createBufferSource()
      windSource.buffer = noiseBuffer

      const windFilter = this.ctx.createBiquadFilter()
      windFilter.type = 'bandpass'
      const startF = 350 * Math.min(1.25, velocity)
      const peakF = Math.min(2200, (isMicro ? 1000 : 1550) * Math.min(1.35, velocity))
      const endF = 380

      windFilter.frequency.setValueAtTime(startF, now)
      windFilter.frequency.exponentialRampToValueAtTime(peakF, now + duration * 0.42)
      windFilter.frequency.exponentialRampToValueAtTime(endF, now + duration * 0.95)
      windFilter.Q.setValueAtTime(1.3, now)

      const windGain = this.ctx.createGain()
      windGain.gain.setValueAtTime(0.001, now)
      windGain.gain.exponentialRampToValueAtTime(0.85, now + duration * 0.38)
      windGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      windSource.connect(windFilter)
      windFilter.connect(windGain)
      windGain.connect(masterGain)

      windSource.start(now)
      windSource.stop(now + duration + 0.01)

      if (!isMicro) {
        const airSource = this.ctx.createBufferSource()
        airSource.buffer = noiseBuffer

        const airFilter = this.ctx.createBiquadFilter()
        airFilter.type = 'highpass'
        const airCutoff = Math.min(5000, Math.max(2000, 2600 * Math.min(1.25, velocity)))
        airFilter.frequency.setValueAtTime(airCutoff, now)
        airFilter.Q.setValueAtTime(0.7, now)

        const airGain = this.ctx.createGain()
        airGain.gain.setValueAtTime(0.001, now)
        airGain.gain.exponentialRampToValueAtTime(0.24, now + duration * 0.35)
        airGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85)

        airSource.connect(airFilter)
        airFilter.connect(airGain)
        airGain.connect(masterGain)

        airSource.start(now)
        airSource.stop(now + duration + 0.01)
      }
    })
  }

  // Climax Portal Zoom-Through
  playHeroCardPortalWarp() {
    this._withContext((now) => {
      const duration = 0.55
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(0.38, now)
      masterGain.connect(this.ctx.destination)

      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * duration))
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI)
      }

      // 1. Deep rushing wind vortex
      const vortexSource = this.ctx.createBufferSource()
      vortexSource.buffer = noiseBuffer

      const vortexFilter = this.ctx.createBiquadFilter()
      vortexFilter.type = 'bandpass'
      vortexFilter.frequency.setValueAtTime(220, now)
      vortexFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.25)
      vortexFilter.frequency.exponentialRampToValueAtTime(300, now + 0.52)
      vortexFilter.Q.setValueAtTime(1.5, now)

      const vortexGain = this.ctx.createGain()
      vortexGain.gain.setValueAtTime(0.01, now)
      vortexGain.gain.exponentialRampToValueAtTime(0.85, now + 0.22)
      vortexGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.53)

      vortexSource.connect(vortexFilter)
      vortexFilter.connect(vortexGain)
      vortexGain.connect(masterGain)

      vortexSource.start(now)
      vortexSource.stop(now + 0.55)

      // 2. High aerodynamic air slipstream
      const slipSource = this.ctx.createBufferSource()
      slipSource.buffer = noiseBuffer

      const slipFilter = this.ctx.createBiquadFilter()
      slipFilter.type = 'highpass'
      slipFilter.frequency.setValueAtTime(2200, now)
      slipFilter.Q.setValueAtTime(0.7, now)

      const slipGain = this.ctx.createGain()
      slipGain.gain.setValueAtTime(0.01, now)
      slipGain.gain.exponentialRampToValueAtTime(0.3, now + 0.2)
      slipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48)

      slipSource.connect(slipFilter)
      slipFilter.connect(slipGain)
      slipGain.connect(masterGain)

      slipSource.start(now)
      slipSource.stop(now + 0.55)
    })
  }

  // Authentic Riffle Shuffle ASMR Card Snap
  playRiffleCardSnap(opts = {}) {
    this._withContext((now) => {
      let cardIndex = 0
      let side = 'center' // 'left', 'right', 'center'
      let velocity = 1.0
      let intensity = 1.0

      if (typeof opts === 'number') {
        cardIndex = Math.max(0, Math.floor(opts))
      } else if (typeof opts === 'object' && opts !== null) {
        if (Number.isFinite(opts.cardIndex)) cardIndex = Math.max(0, Math.floor(opts.cardIndex))
        if (opts.side) side = opts.side
        if (Number.isFinite(opts.velocity)) velocity = Math.max(0.2, Math.min(3.0, opts.velocity))
        if (Number.isFinite(opts.intensity)) intensity = Math.max(0.1, Math.min(2.0, opts.intensity))
      }

      const duration = 0.038 // ~38ms organic paper flick

      const masterGain = this.ctx.createGain()
      const vol = Math.min(0.5, Math.max(0.12, 0.32 * intensity * Math.min(1.4, Math.max(0.6, velocity))))
      masterGain.gain.setValueAtTime(vol, now)

      if (this.ctx.createStereoPanner) {
        try {
          const panner = this.ctx.createStereoPanner()
          const panVal = side === 'left' ? -0.3 : side === 'right' ? 0.3 : 0
          panner.pan.setValueAtTime(panVal, now)
          masterGain.connect(panner)
          panner.connect(this.ctx.destination)
        } catch (e) {
          masterGain.connect(this.ctx.destination)
        }
      } else {
        masterGain.connect(this.ctx.destination)
      }

      // 1. Crisp Paper Edge Flick
      const flickLen = Math.max(128, Math.floor(this.ctx.sampleRate * duration))
      const flickBuffer = this.ctx.createBuffer(1, flickLen, this.ctx.sampleRate)
      const flickData = flickBuffer.getChannelData(0)
      for (let i = 0; i < flickLen; i++) {
        const p = i / flickLen
        flickData[i] = (Math.random() * 2 - 1) * Math.exp(-p * 8.0)
      }

      const flickSource = this.ctx.createBufferSource()
      flickSource.buffer = flickBuffer

      const flickFilter = this.ctx.createBiquadFilter()
      flickFilter.type = 'bandpass'
      const cardPitchMod = ((cardIndex * 37) % 200) - 100
      const flickFreq = Math.min(4200, Math.max(1800, 2600 + cardPitchMod + (side === 'left' ? -50 : 50)))
      flickFilter.frequency.setValueAtTime(flickFreq, now)
      flickFilter.Q.setValueAtTime(1.8, now)

      const flickGain = this.ctx.createGain()
      flickGain.gain.setValueAtTime(0.65, now)
      flickGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.75)

      flickSource.connect(flickFilter)
      flickFilter.connect(flickGain)
      flickGain.connect(masterGain)

      flickSource.start(now)
      flickSource.stop(now + duration)

      // 2. Warm Organic Felt Tap
      const bodyOsc = this.ctx.createOscillator()
      const bodyGain = this.ctx.createGain()
      bodyOsc.type = 'sine'

      const bodyStartF = Math.min(180, 130 + ((cardIndex * 7) % 35))
      bodyOsc.frequency.setValueAtTime(bodyStartF, now)
      bodyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.02)

      bodyGain.gain.setValueAtTime(0.22, now)
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024)

      bodyOsc.connect(bodyGain)
      bodyGain.connect(masterGain)
      bodyOsc.start(now)
      bodyOsc.stop(now + 0.028)

      // 3. Micro Air Cushion Flutter
      const airSource = this.ctx.createBufferSource()
      airSource.buffer = flickBuffer

      const airFilter = this.ctx.createBiquadFilter()
      airFilter.type = 'highpass'
      airFilter.frequency.setValueAtTime(3600, now)
      airFilter.Q.setValueAtTime(0.9, now)

      const airGain = this.ctx.createGain()
      airGain.gain.setValueAtTime(0.22, now)
      airGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6)

      airSource.connect(airFilter)
      airFilter.connect(airGain)
      airGain.connect(masterGain)

      airSource.start(now)
      airSource.stop(now + duration)
    })
  }

  // Waterfall Flutter
  playWaterfallFlutter(velocity = 1.0) {
    this._withContext((now) => {
      const normVel = Math.min(2.5, Math.max(0.4, velocity || 1.0))
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(0.42 * Math.min(1.3, normVel), now)
      masterGain.connect(this.ctx.destination)

      for (let i = 0; i < 8; i++) {
        const t = now + i * 0.018
        const bufLen = Math.floor(this.ctx.sampleRate * 0.02)
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let j = 0; j < bufLen; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufLen * 0.35))
        }

        const src = this.ctx.createBufferSource()
        src.buffer = buf

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(3600 + (i * 120) + (Math.random() - 0.5) * 200, t)
        filter.Q.setValueAtTime(3.0, t)

        const gain = this.ctx.createGain()
        gain.gain.setValueAtTime(0.35 + (i % 2 === 0 ? 0.08 : 0), t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.016)

        src.connect(filter)
        filter.connect(gain)
        gain.connect(masterGain)
        src.start(t)
        src.stop(t + 0.02)
      }
    })
  }

  // Final Paper Deck Square-Up
  playRiffleDeckSquare(velocity = 1.0) {
    this._withContext((now) => {
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(0.48, now)
      masterGain.connect(this.ctx.destination)

      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.014
        const bufLen = Math.floor(this.ctx.sampleRate * 0.025)
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let j = 0; j < bufLen; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufLen * 0.4))
        }

        const src = this.ctx.createBufferSource()
        src.buffer = buf
        const f = this.ctx.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.setValueAtTime(3200 - i * 350, t)
        f.Q.setValueAtTime(2.0, t)

        const g = this.ctx.createGain()
        g.gain.setValueAtTime(0.32 - i * 0.05, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.022)

        src.connect(f)
        f.connect(g)
        g.connect(masterGain)
        src.start(t)
        src.stop(t + 0.025)
      }

      const thud = this.ctx.createOscillator()
      const thudG = this.ctx.createGain()
      thud.type = 'triangle'
      thud.frequency.setValueAtTime(240, now)
      thud.frequency.exponentialRampToValueAtTime(70, now + 0.04)
      thudG.gain.setValueAtTime(0.45, now)
      thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)
      thud.connect(thudG)
      thudG.connect(masterGain)
      thud.start(now)
      thud.stop(now + 0.05)
    })
  }

  // ========================================================
  // ULTRA-PREMIUM 14G WEIGHTED CERAMIC CASINO CHIP SYNTHESIS
  // ========================================================
  _synthesizeChipSound(opts = {}) {
    this._withContext((now) => {
      let pitch = 1.0
      let volume = 0.42
      let decay = 0.055
      let brightness = 1.15
      let isFelt = false
      let clickAmount = 1.2

      if (typeof opts === 'number') {
        volume = Number.isFinite(opts) ? Math.max(0.01, Math.min(1.0, opts)) : 0.42
      } else if (typeof opts === 'object' && opts !== null) {
        if (Number.isFinite(opts.pitch) && opts.pitch > 0) pitch = opts.pitch
        if (Number.isFinite(opts.volume) && opts.volume >= 0) volume = opts.volume
        if (Number.isFinite(opts.decay) && opts.decay > 0) decay = opts.decay
        if (Number.isFinite(opts.brightness) && opts.brightness > 0) brightness = opts.brightness
        if (Number.isFinite(opts.clickAmount) && opts.clickAmount >= 0) clickAmount = opts.clickAmount
        isFelt = !!opts.isFelt
      }

      const safeVolume = Math.max(0.001, Math.min(1.0, volume))
      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(safeVolume, now)
      masterGain.connect(this.ctx.destination)

      // 1. Ceramic-on-Ceramic Micro Transient
      if (this.noiseBuffer && clickAmount > 0.05) {
        try {
          const noiseSource = this.ctx.createBufferSource()
          noiseSource.buffer = this.noiseBuffer

          const noiseFilter = this.ctx.createBiquadFilter()
          noiseFilter.type = isFelt ? 'bandpass' : 'highpass'
          const safeCutoff = Math.max(300, Math.min(18000, (isFelt ? 2800 : 5200) * brightness))
          noiseFilter.frequency.setValueAtTime(safeCutoff, now)
          noiseFilter.Q.setValueAtTime(isFelt ? 2.5 : 6.0, now)

          const noiseGain = this.ctx.createGain()
          const clickVol = Math.max(0.001, 0.48 * clickAmount)
          noiseGain.gain.setValueAtTime(clickVol, now)
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005)

          noiseSource.connect(noiseFilter)
          noiseFilter.connect(noiseGain)
          noiseGain.connect(masterGain)

          noiseSource.start(now)
          noiseSource.stop(now + 0.008)
        } catch (e) {}
      }

      // Fast Ceramic Chirp Impulse
      if (clickAmount > 0.2) {
        try {
          const snapOsc = this.ctx.createOscillator()
          const snapGain = this.ctx.createGain()

          snapOsc.type = 'triangle'
          const startSnapF = Math.max(400, Math.min(18000, 8400 * pitch * brightness))
          const endSnapF = Math.max(100, Math.min(8000, 2100 * pitch))
          snapOsc.frequency.setValueAtTime(startSnapF, now)
          snapOsc.frequency.exponentialRampToValueAtTime(endSnapF, now + 0.0035)

          const snapVol = Math.max(0.001, 0.35 * clickAmount)
          snapGain.gain.setValueAtTime(snapVol, now)
          snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.0045)

          snapOsc.connect(snapGain)
          snapGain.connect(masterGain)

          snapOsc.start(now)
          snapOsc.stop(now + 0.0055)
        } catch (e) {}
      }

      // 2. Inharmonic Ceramic Resonators
      const baseFreq = Math.max(500, Math.min(8000, (2380 + (Math.random() - 0.5) * 140) * pitch))
      const safeDecay = Math.max(0.015, Math.min(0.5, decay))

      const modes = [
        { f: baseFreq * 1.00, gain: 0.30, d: safeDecay * 1.00, type: 'sine' },
        { f: baseFreq * 1.62 * (1 + (Math.random() - 0.5) * 0.02), gain: 0.22, d: safeDecay * 0.82, type: 'triangle' },
        { f: baseFreq * 2.31 * (1 + (Math.random() - 0.5) * 0.03), gain: 0.16, d: safeDecay * 0.65, type: 'sine' },
        { f: baseFreq * 3.12 * (1 + (Math.random() - 0.5) * 0.03), gain: 0.11, d: safeDecay * 0.48, type: 'sine' },
        { f: baseFreq * 4.05 * (1 + (Math.random() - 0.5) * 0.04), gain: 0.07, d: safeDecay * 0.32, type: 'sine' }
      ]

      modes.forEach((mode) => {
        try {
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()

          osc.type = mode.type
          const startF = Math.max(100, Math.min(18000, mode.f * brightness))
          osc.frequency.setValueAtTime(startF, now)
          osc.frequency.exponentialRampToValueAtTime(Math.max(80, startF * 0.985), now + mode.d)

          gain.gain.setValueAtTime(mode.gain * (isFelt ? 0.75 : 1.0), now)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.008, mode.d))

          osc.connect(gain)
          gain.connect(masterGain)

          osc.start(now)
          osc.stop(now + mode.d + 0.01)
        } catch (e) {}
      })

      // 3. Weighted Body Thud
      try {
        const bodyOsc = this.ctx.createOscillator()
        const bodyGain = this.ctx.createGain()

        bodyOsc.type = 'sine'
        const bodyFreq = Math.max(100, Math.min(1200, (320 + (Math.random() - 0.5) * 35) * pitch))
        bodyOsc.frequency.setValueAtTime(bodyFreq, now)
        bodyOsc.frequency.exponentialRampToValueAtTime(95, now + (isFelt ? 0.032 : 0.022))

        bodyGain.gain.setValueAtTime(isFelt ? 0.38 : 0.28, now)
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + (isFelt ? 0.036 : 0.025))

        bodyOsc.connect(bodyGain)
        bodyGain.connect(masterGain)

        bodyOsc.start(now)
        bodyOsc.stop(now + 0.04)
      } catch (e) {}
    })
  }

  playChipToss() {
    this._withContext((now) => {
      if (this.noiseBuffer) {
        try {
          const swooshSource = this.ctx.createBufferSource()
          swooshSource.buffer = this.noiseBuffer

          const swooshFilter = this.ctx.createBiquadFilter()
          swooshFilter.type = 'bandpass'
          swooshFilter.frequency.setValueAtTime(1800, now)
          swooshFilter.frequency.exponentialRampToValueAtTime(4200, now + 0.03)
          swooshFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.055)
          swooshFilter.Q.setValueAtTime(2.2, now)

          const swooshGain = this.ctx.createGain()
          swooshGain.gain.setValueAtTime(0.18, now)
          swooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055)

          swooshSource.connect(swooshFilter)
          swooshFilter.connect(swooshGain)
          swooshGain.connect(this.ctx.destination)

          swooshSource.start(now)
          swooshSource.stop(now + 0.06)
        } catch (e) {}
      }

      const tossPitch = 0.98 + (Math.random() - 0.5) * 0.06
      this._synthesizeChipSound({
        pitch: tossPitch,
        volume: 0.48,
        decay: 0.06,
        brightness: 1.2,
        clickAmount: 1.25
      })

      setTimeout(() => {
        if (this.isMuted) return
        this._synthesizeChipSound({
          pitch: tossPitch * (1.14 + Math.random() * 0.08),
          volume: 0.28,
          decay: 0.038,
          brightness: 1.3,
          clickAmount: 0.95
        })
      }, 16)
    })
  }

  playChipClink(opts = 1.0) {
    if (typeof opts === 'object' && opts !== null) {
      const pitch = Number.isFinite(opts.pitch) && opts.pitch > 0 ? opts.pitch : 0.97 + Math.random() * 0.08
      const volume = Number.isFinite(opts.volume) && opts.volume >= 0 ? opts.volume : 0.44
      const brightness = Number.isFinite(opts.brightness) && opts.brightness > 0 ? opts.brightness : 1.15
      const decay = Number.isFinite(opts.decay) && opts.decay > 0 ? opts.decay : 0.055
      this._synthesizeChipSound({
        pitch,
        volume,
        decay,
        brightness,
        clickAmount: 1.15,
        isFelt: !!opts.isFelt
      })
    } else {
      const intensity = typeof opts === 'number' && Number.isFinite(opts) ? opts : 1.0
      const pitch = 0.97 + Math.random() * 0.08
      this._synthesizeChipSound({
        pitch,
        volume: Math.min(0.55, Math.max(0.05, 0.44 * intensity)),
        decay: 0.055,
        brightness: 1.15,
        clickAmount: 1.15
      })
    }
  }

  playChipBounce(velocity = 1.0) {
    const rawVel = typeof velocity === 'number' && Number.isFinite(velocity) ? velocity : 1.0
    const normVel = Math.min(1.5, Math.max(0.2, rawVel))
    const pitch = 0.95 + Math.random() * 0.12
    this._synthesizeChipSound({
      pitch,
      volume: Math.min(0.48, 0.32 * normVel),
      decay: 0.042 * (1 + normVel * 0.12),
      brightness: 1.05 + normVel * 0.18,
      isFelt: true,
      clickAmount: 0.9 * normVel
    })
  }

  playChipsStack(count = 4) {
    const safeCount = typeof count === 'number' && Number.isFinite(count) ? Math.min(8, Math.max(1, count)) : 4
    for (let i = 0; i < safeCount; i++) {
      setTimeout(() => {
        const pitch = 0.94 + (i * 0.035) + (Math.random() - 0.5) * 0.05
        this._synthesizeChipSound({
          pitch,
          volume: Math.max(0.12, 0.38 - i * 0.025),
          decay: 0.048,
          brightness: 1.18,
          clickAmount: 1.05
        })
      }, i * 28 + Math.random() * 8)
    }
  }

  playChipsRiffle() {
    if (this.isMuted) return
    const ticks = 7
    for (let i = 0; i < ticks; i++) {
      setTimeout(() => {
        this._synthesizeChipSound({
          pitch: 1.0 + (i * 0.04) + (Math.random() - 0.5) * 0.06,
          volume: 0.22 + (i % 2 === 0 ? 0.08 : 0),
          decay: 0.035,
          brightness: 1.25,
          clickAmount: 1.0
        })
      }, i * 18 + Math.random() * 5)
    }
  }

  // UI micro-click
  playClick() {
    this._withContext((now) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    })
  }

  // Victory / Jackpot chime
  playJackpot() {
    this._withContext((now) => {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]

      notes.forEach((freq, idx) => {
        try {
          const startTime = now + idx * 0.09
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()

          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, startTime)

          gain.gain.setValueAtTime(0.25, startTime)
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)

          osc.connect(gain)
          gain.connect(this.ctx.destination)

          osc.start(startTime)
          osc.stop(startTime + 0.65)
        } catch (e) {}
      })
    })
  }

  // 1. OBSIDIAN FOIL
  playObsidianFoilHover() {
    this._withContext((now) => {
      // A. Deep sub-bass pulse
      const subOsc = this.ctx.createOscillator()
      const subGain = this.ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(72, now)
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.32)
      subGain.gain.setValueAtTime(0.38, now)
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
      subOsc.connect(subGain)
      subGain.connect(this.ctx.destination)
      subOsc.start(now)
      subOsc.stop(now + 0.36)

      // B. Resonant dark void filter sweep
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource()
        noise.buffer = this.noiseBuffer
        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(2800, now)
        filter.frequency.exponentialRampToValueAtTime(260, now + 0.28)
        filter.Q.setValueAtTime(4.5, now)

        const noiseGain = this.ctx.createGain()
        noiseGain.gain.setValueAtTime(0.22, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

        noise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(this.ctx.destination)
        noise.start(now)
        noise.stop(now + 0.32)
      }

      // C. High obsidian crystal chime
      const crystalOsc = this.ctx.createOscillator()
      const crystalGain = this.ctx.createGain()
      crystalOsc.type = 'sine'
      crystalOsc.frequency.setValueAtTime(1760, now)
      crystalOsc.frequency.exponentialRampToValueAtTime(1320, now + 0.18)
      crystalGain.gain.setValueAtTime(0.12, now)
      crystalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
      crystalOsc.connect(crystalGain)
      crystalGain.connect(this.ctx.destination)
      crystalOsc.start(now)
      crystalOsc.stop(now + 0.22)
    })
  }

  // 2. IVORY GOLD
  playIvoryGoldHover() {
    this._withContext((now) => {
      const goldFrequencies = [1046.5, 1318.5, 1567.98, 2093.0]
      goldFrequencies.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.015)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.995, now + 0.45)

        const startVol = (0.22 / (idx + 1)) * 1.2
        gain.gain.setValueAtTime(startVol, now + idx * 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + idx * 0.05)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + idx * 0.015)
        osc.stop(now + 0.65)
      })

      this._synthesizeChipSound({ pitch: 1.6, volume: 0.25, brightness: 1.5, decay: 0.06 })
    })
  }

  // 3. CYBER NEON
  playCyberNeonHover() {
    this._withContext((now) => {
      const cyberNotes = [880, 1320, 1760]
      cyberNotes.forEach((freq, idx) => {
        const t = now + idx * 0.022
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.04)

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(3200, t)
        filter.Q.setValueAtTime(4.0, t)

        gain.gain.setValueAtTime(0.18, t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(t)
        osc.stop(t + 0.09)
      })

      const laserOsc = this.ctx.createOscillator()
      const laserGain = this.ctx.createGain()
      laserOsc.type = 'sine'
      laserOsc.frequency.setValueAtTime(3600, now)
      laserOsc.frequency.exponentialRampToValueAtTime(620, now + 0.18)
      laserGain.gain.setValueAtTime(0.15, now)
      laserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
      laserOsc.connect(laserGain)
      laserGain.connect(this.ctx.destination)
      laserOsc.start(now)
      laserOsc.stop(now + 0.22)
    })
  }

  // 4. EMERALD SUITE
  playEmeraldSuiteHover() {
    this._withContext((now) => {
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource()
        noise.buffer = this.noiseBuffer

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(750, now)
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.08)
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.22)
        filter.Q.setValueAtTime(2.2, now)

        const gain = this.ctx.createGain()
        gain.gain.setValueAtTime(0.28, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(this.ctx.destination)
        noise.start(now)
        noise.stop(now + 0.25)
      }

      const snapOsc = this.ctx.createOscillator()
      const snapGain = this.ctx.createGain()
      snapOsc.type = 'triangle'
      snapOsc.frequency.setValueAtTime(480, now)
      snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05)
      snapGain.gain.setValueAtTime(0.3, now)
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
      snapOsc.connect(snapGain)
      snapGain.connect(this.ctx.destination)
      snapOsc.start(now)
      snapOsc.stop(now + 0.07)
    })
  }

  // 5. SAKURA RUBY
  playSakuraRubyHover() {
    this._withContext((now) => {
      const sakuraScale = [987.77, 1174.66, 1318.51, 1479.98, 1975.53]
      sakuraScale.forEach((freq, idx) => {
        const t = now + idx * 0.032
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 0.15)
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.35)

        gain.gain.setValueAtTime(0.18, t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(t)
        osc.stop(t + 0.45)
      })
    })
  }

  // 6. RETRO 8-BIT
  playRetro8BitHover() {
    this._withContext((now) => {
      const arpHertz = [329.63, 440.0, 659.25, 880.0, 1108.7]
      arpHertz.forEach((freq, idx) => {
        const t = now + idx * 0.024
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, t)

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(3200, t)

        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(t)
        osc.stop(t + 0.09)
      })
    })
  }

  // Master helper: Dispatches the corresponding themed hover sound
  playThemeCardHover(theme) {
    if (this.isMuted) return
    const key = (theme || '').toLowerCase()
    if (key.includes('obsidian')) return this.playObsidianFoilHover()
    if (key.includes('gold')) return this.playIvoryGoldHover()
    if (key.includes('cyber')) return this.playCyberNeonHover()
    if (key.includes('emerald')) return this.playEmeraldSuiteHover()
    if (key.includes('sakura')) return this.playSakuraRubyHover()
    if (key.includes('retro')) return this.playRetro8BitHover()
    return this.playCardFlip()
  }
}

export const SoundEngine = new SoundEngineClass()
