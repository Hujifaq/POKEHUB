"use client"

// Web Audio API Procedural Sound Synthesizer for PokerHub
class SoundEngineClass {
  constructor() {
    this.ctx = null
    this.isMuted = false
    this.ambientGain = null
    this.isAmbientPlaying = false
    this.ambientOscillators = []
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  setMuted(muted) {
    this.isMuted = muted
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : 0.08, this.ctx.currentTime, 0.2)
    }
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

  // Realistic ceramic casino chip clink
  playChipClink() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const frequencies = [2200 + Math.random() * 400, 3400 + Math.random() * 300, 4800 + Math.random() * 500]

    frequencies.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.08)

      const initialGain = 0.15 / (i + 1)
      gain.gain.setValueAtTime(initialGain, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08 + i * 0.02)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.12)
    })
  }

  // Multiple chips cascade sound
  playChipsStack() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playChipClink()
      }, i * 45 + Math.random() * 20)
    }
  }

  // UI micro-click
  playClick() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

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
  }

  // Victory / Jackpot chime (Pentatonic fanfare)
  playJackpot() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C5, E5, G5, C6, E6, G6
    const now = this.ctx.currentTime

    notes.forEach((freq, idx) => {
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
    })
  }

  // Subtle ambient casino lofi chords synthesizer
  toggleAmbient(forceState) {
    this.init()
    if (!this.ctx) return

    const target = forceState !== undefined ? forceState : !this.isAmbientPlaying

    if (!target) {
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5)
      }
      this.isAmbientPlaying = false
      return false
    }

    if (this.isAmbientPlaying) return true

    const now = this.ctx.currentTime
    this.ambientGain = this.ctx.createGain()
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, now)
    this.ambientGain.connect(this.ctx.destination)

    // Warm lush minor 9th / jazz chords frequencies
    const chordFrequencies = [130.81, 196.00, 246.94, 293.66, 392.00] // C3, G3, B3, D4, G4

    this.ambientOscillators = chordFrequencies.map((freq, i) => {
      const osc = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()

      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(450 + i * 50, now)

      osc.connect(filter)
      filter.connect(this.ambientGain)
      osc.start(now)
      return osc
    })

    this.isAmbientPlaying = true
    return true
  }
}

export const SoundEngine = new SoundEngineClass()
