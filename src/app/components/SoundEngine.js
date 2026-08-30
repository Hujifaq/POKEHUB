"use client"

// Web Audio API Procedural Sound Synthesizer for PokerHub SFX
class SoundEngineClass {
  constructor() {
    this.ctx = null
    this.isMuted = false
    this.noiseBuffer = null
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
        this._initNoiseBuffer()
      }
    }
    if (this.ctx && !this.noiseBuffer) {
      this._initNoiseBuffer()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  setSfxMuted(muted) {
    this.setMuted(muted)
  }

  toggleAmbient() {
    return false
  }

  // Card swoosh / glide sound (filtered noise + pitch bend)
  playCardSwoosh() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const bufferSize = this.ctx.sampleRate * 0.2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.08)
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.2)
    filter.Q.setValueAtTime(3.0, now)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start(now)
  }

  // Snappy card flip sound
  playCardFlip() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime

    // Crisp high snap click
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06)

    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.07)

    // Air swoosh accent
    this.playCardSwoosh()
  }

  _initNoiseBuffer() {
    if (!this.ctx || this.noiseBuffer) return
    try {
      const length = Math.floor(this.ctx.sampleRate * 0.1) // 100ms noise buffer
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate)
      const data = this.noiseBuffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } catch (e) {
      this.noiseBuffer = null
    }
  }

  // Internal high-end ceramic casino chip sound generator
  _synthesizeChipSound(opts = {}) {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    let pitch = 1.0
    let volume = 0.35
    let decay = 0.05
    let brightness = 1.0
    let isFelt = false
    let clickAmount = 1.0

    if (typeof opts === 'number') {
      volume = Number.isFinite(opts) ? Math.max(0.01, Math.min(1.0, opts)) : 0.35
    } else if (typeof opts === 'object' && opts !== null) {
      if (Number.isFinite(opts.pitch) && opts.pitch > 0) pitch = opts.pitch
      if (Number.isFinite(opts.volume) && opts.volume >= 0) volume = opts.volume
      if (Number.isFinite(opts.decay) && opts.decay > 0) decay = opts.decay
      if (Number.isFinite(opts.brightness) && opts.brightness > 0) brightness = opts.brightness
      if (Number.isFinite(opts.clickAmount) && opts.clickAmount >= 0) clickAmount = opts.clickAmount
      isFelt = !!opts.isFelt
    }

    try {
      const now = this.ctx.currentTime
      const safeVolume = Math.max(0.001, Math.min(1.0, volume))

      const masterGain = this.ctx.createGain()
      masterGain.gain.setValueAtTime(safeVolume, now)
      masterGain.connect(this.ctx.destination)

      // 1. High-frequency click transient
      if (this.noiseBuffer && clickAmount > 0.1) {
        try {
          const noiseSource = this.ctx.createBufferSource()
          noiseSource.buffer = this.noiseBuffer

          const noiseFilter = this.ctx.createBiquadFilter()
          noiseFilter.type = isFelt ? 'bandpass' : 'highpass'
          const safeCutoff = Math.max(200, Math.min(16000, (isFelt ? 2600 : 4200) * brightness))
          noiseFilter.frequency.setValueAtTime(safeCutoff, now)
          noiseFilter.Q.setValueAtTime(isFelt ? 3.0 : 5.5, now)

          const noiseGain = this.ctx.createGain()
          const clickVol = Math.max(0.001, 0.45 * clickAmount)
          noiseGain.gain.setValueAtTime(clickVol, now)
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.007)

          noiseSource.connect(noiseFilter)
          noiseFilter.connect(noiseGain)
          noiseGain.connect(masterGain)

          noiseSource.start(now)
          noiseSource.stop(now + 0.01)
        } catch (e) {}
      }

      // 1b. Fast pitch-drop snap chirp
      if (clickAmount > 0.25) {
        try {
          const snapOsc = this.ctx.createOscillator()
          const snapGain = this.ctx.createGain()

          snapOsc.type = 'triangle'
          const startSnapF = Math.max(300, Math.min(18000, 7200 * pitch * brightness))
          const endSnapF = Math.max(100, Math.min(8000, 1600 * pitch))
          snapOsc.frequency.setValueAtTime(startSnapF, now)
          snapOsc.frequency.exponentialRampToValueAtTime(endSnapF, now + 0.004)

          const snapVol = Math.max(0.001, 0.3 * clickAmount)
          snapGain.gain.setValueAtTime(snapVol, now)
          snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005)

          snapOsc.connect(snapGain)
          snapGain.connect(masterGain)

          snapOsc.start(now)
          snapOsc.stop(now + 0.006)
        } catch (e) {}
      }

      // 2. Inharmonic Ceramic / Clay Modal Resonators
      const baseFreq = Math.max(400, Math.min(8000, (2200 + (Math.random() - 0.5) * 160) * pitch))
      const safeDecay = Math.max(0.01, Math.min(0.5, decay))
      const modes = [
        { f: baseFreq * 1.0, gain: 0.26, d: safeDecay * 1.0, type: 'sine' },
        { f: baseFreq * 1.73 * (1 + (Math.random() - 0.5) * 0.03), gain: 0.20, d: safeDecay * 0.8, type: 'triangle' },
        { f: baseFreq * 2.58 * (1 + (Math.random() - 0.5) * 0.04), gain: 0.14, d: safeDecay * 0.6, type: 'sine' },
        { f: baseFreq * 3.82 * (1 + (Math.random() - 0.5) * 0.04), gain: 0.09, d: safeDecay * 0.4, type: 'sine' }
      ]

      modes.forEach(mode => {
        try {
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()

          osc.type = mode.type
          const startF = Math.max(100, Math.min(18000, mode.f * brightness))
          osc.frequency.setValueAtTime(startF, now)
          osc.frequency.exponentialRampToValueAtTime(Math.max(80, startF * 0.98), now + mode.d)

          gain.gain.setValueAtTime(mode.gain, now)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.008, mode.d))

          osc.connect(gain)
          gain.connect(masterGain)

          osc.start(now)
          osc.stop(now + mode.d + 0.01)
        } catch (e) {}
      })

      // 3. Low-Mid Weight Body Thud
      try {
        const bodyOsc = this.ctx.createOscillator()
        const bodyGain = this.ctx.createGain()

        bodyOsc.type = 'sine'
        const bodyFreq = Math.max(100, Math.min(1200, (460 + (Math.random() - 0.5) * 40) * pitch))
        bodyOsc.frequency.setValueAtTime(bodyFreq, now)
        bodyOsc.frequency.exponentialRampToValueAtTime(180, now + 0.016)

        bodyGain.gain.setValueAtTime(isFelt ? 0.32 : 0.20, now)
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + (isFelt ? 0.03 : 0.02))

        bodyOsc.connect(bodyGain)
        bodyGain.connect(masterGain)

        bodyOsc.start(now)
        bodyOsc.stop(now + 0.035)
      } catch (e) {}
    } catch (e) {}
  }

  // Premium, ultra-clicky casino chip toss sound
  playChipToss() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime

      if (this.noiseBuffer) {
        try {
          const swooshSource = this.ctx.createBufferSource()
          swooshSource.buffer = this.noiseBuffer

          const swooshFilter = this.ctx.createBiquadFilter()
          swooshFilter.type = 'bandpass'
          swooshFilter.frequency.setValueAtTime(2000, now)
          swooshFilter.frequency.exponentialRampToValueAtTime(4600, now + 0.035)
          swooshFilter.Q.setValueAtTime(2.5, now)

          const swooshGain = this.ctx.createGain()
          swooshGain.gain.setValueAtTime(0.16, now)
          swooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

          swooshSource.connect(swooshFilter)
          swooshFilter.connect(swooshGain)
          swooshGain.connect(this.ctx.destination)

          swooshSource.start(now)
          swooshSource.stop(now + 0.045)
        } catch (e) {}
      }

      const tossPitch = 0.96 + Math.random() * 0.08
      this._synthesizeChipSound({
        pitch: tossPitch,
        volume: 0.45,
        decay: 0.055,
        brightness: 1.15,
        clickAmount: 1.1
      })

      setTimeout(() => {
        if (this.isMuted || !this.ctx) return
        this._synthesizeChipSound({
          pitch: tossPitch * (1.1 + Math.random() * 0.08),
          volume: 0.24,
          decay: 0.035,
          brightness: 1.25,
          clickAmount: 0.85
        })
      }, 18)
    } catch (e) {}
  }

  // Realistic ceramic casino chip clink (accepts numeric intensity OR options object)
  playChipClink(opts = 1.0) {
    if (typeof opts === 'object' && opts !== null) {
      const pitch = Number.isFinite(opts.pitch) && opts.pitch > 0 ? opts.pitch : 0.95 + Math.random() * 0.1
      const volume = Number.isFinite(opts.volume) && opts.volume >= 0 ? opts.volume : 0.38
      const brightness = Number.isFinite(opts.brightness) && opts.brightness > 0 ? opts.brightness : 1.05
      const decay = Number.isFinite(opts.decay) && opts.decay > 0 ? opts.decay : 0.05
      this._synthesizeChipSound({
        pitch,
        volume,
        decay,
        brightness,
        clickAmount: 1.0,
        isFelt: !!opts.isFelt
      })
    } else {
      const intensity = typeof opts === 'number' && Number.isFinite(opts) ? opts : 1.0
      const pitch = 0.95 + Math.random() * 0.1
      this._synthesizeChipSound({
        pitch,
        volume: Math.min(0.5, Math.max(0.05, 0.38 * intensity)),
        decay: 0.05,
        brightness: 1.05,
        clickAmount: 1.0
      })
    }
  }

  // Felt table bounce clink
  playChipBounce(velocity = 1.0) {
    const rawVel = typeof velocity === 'number' && Number.isFinite(velocity) ? velocity : 1.0
    const normVel = Math.min(1.5, Math.max(0.2, rawVel))
    const pitch = 0.92 + Math.random() * 0.16
    this._synthesizeChipSound({
      pitch,
      volume: Math.min(0.42, 0.26 * normVel),
      decay: 0.038 * (1 + normVel * 0.15),
      brightness: 0.95 + normVel * 0.2,
      isFelt: true,
      clickAmount: 0.75 * normVel
    })
  }

  // Multiple chips cascade sound
  playChipsStack(count = 4) {
    const safeCount = typeof count === 'number' && Number.isFinite(count) ? Math.min(8, Math.max(1, count)) : 4
    for (let i = 0; i < safeCount; i++) {
      setTimeout(() => {
        const pitch = 0.92 + (i * 0.04) + (Math.random() - 0.5) * 0.06
        this._synthesizeChipSound({
          pitch,
          volume: Math.max(0.1, 0.34 - i * 0.03),
          decay: 0.045,
          brightness: 1.1,
          clickAmount: 0.95
        })
      }, i * 32 + Math.random() * 10)
    }
  }

  // UI micro-click
  playClick() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    } catch (e) {}
  }

  // Victory / Jackpot chime (Pentatonic fanfare)
  playJackpot() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]
      const now = this.ctx.currentTime

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
    } catch (e) {}
  }
}

export const SoundEngine = new SoundEngineClass()
