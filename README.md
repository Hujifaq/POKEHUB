# 🃏 POKEHUB // High-Roller 3D Texas Hold'em & Elite Decks

<div align="center">

```
 ____   ___  _  _______ _   _ _   _ ____  
|  _ \ / _ \| |/ / ____| | | | | | | __ ) 
| |_) | | | | ' /|  _| | |_| | | | |  _ \ 
|  __/| |_| | . \| |___|  _  | |_| | |_) |
|_|    \___/|_|\_\_____|_| |_|\___/|____/ 
```

**Next-Gen Neo-Brutalist 3D Poker Arena • Procedural WebGL Cards • Realistic AI Engine • Pure Web Audio Synthesis**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Overview

**POKEHUB** is a high-octane, interactive poker platform combining **Neo-Brutalist design aesthetics**, **hardware-accelerated WebGL 3D graphics**, an autonomous **Texas Hold'em AI engine**, and **synthesized Web Audio**. 

Designed with high contrast, chunky shadows, pixel-matrix typography, and fluid kinetic physics, POKEHUB delivers a casino-grade digital poker duel right inside the browser.

---

## ✨ Key Features

### 🎴 1. 3D Procedural Playing Cards & Real-Time Physics
- **Holographic Foil & Dynamic Shaders**: Interactive 3D cards rendered with realistic lighting, specular reflections, dynamic foil sheens, and particle embers.
- **Mouse & Gyroscope Telemetry**: Cards track cursor position with Euler angles (Pitch, Yaw, Roll) and velocity-based wind physics.
- **3D Fan-out & Flip Modes**: Inspect authentic 8-bit pixel graffiti backs and procedural front motifs with interactive 3D transitions.

### 🌪️ 2. Physics-Driven 3D Riffle Shuffle Simulation
- Real-time 52-card cascade riffle shuffle built with Three.js.
- Dual-packet bending, thumb-release interweaving, and square-up bridge animations synchronized with synthesized card-swoosh audio.

### 🎥 3. Panoramic POV Poker Table & Street Orbit
- Cinematic player POV showcasing the **Pre-Flop blinds**, **The Flop dealing sequence**, **Turn & River cards**, and **Showdown reveals**.
- Adaptive FOV camera positioning for seamless landscape (desktop) and portrait (mobile) framing.

### 🤖 4. Autonomous 6-Max Texas Hold'em AI Duel Arena
- **Smart AI Bots**: Challenge 5 distinct bot personalities with individual risk profiles, pot odds awareness, and bluffing tendencies.
- **Official Poker Engine**:
  - Full game loop (`Pre-Flop` ➔ `Flop` ➔ `Turn` ➔ `River` ➔ `Showdown`).
  - Standard side-pot & main-pot split algorithms for multi-way all-in showdowns.
  - Complete 5-card kicker hand evaluator covering Royal Flushes down to High Card.
  - Real-time bankroll management, persistent storage, and automatic rebuy mechanisms.

### 🎨 5. The 6 Elite Collectible Decks
Equip custom collectible card skins with unique colorways, particle auras, and graffiti art:
1. **Obsidian Void** (`#0D0D0D` // Holographic Void Fire)
2. **Gold Sovereign** (`#FFD700` // 24K Royal Gilded Sparkles)
3. **Cyber Neon** (`#00F5FF` // Cyan Cyberpunk Grid)
4. **Emerald Syndicate** (`#00FFA3` // High-Roller Mint Foil)
5. **Sakura Blossom** (`#FF70A6` // Radiant Neon Cherry)
6. **Retro Classic** (`#FFF8EE` // 8-Bit Pixel Vintage)

### 🔊 6. Zero-Asset Procedural Web Audio Engine
- Built entirely on the **HTML5 Web Audio API** with procedural sound synthesis—no heavy audio downloads.
- Synthesizes realistic card flips, chip clinks, table knocks, riffle shuffles, dealer calls, and victory chimes on the fly.

### 📱 7. Responsive Mobile First Experience
- **Touch-Swipe Deck Carousel**: Native momentum snapping on mobile screens without vertical scroll hijacking.
- **Dynamic 100dvh Safe-Area Action Dock**: Compact betting dock with quick presets (`MIN`, `1/2`, `POT`, `MAX`, `ALL-IN`) lifted comfortably above browser navigation bars.
- **Smart Device Optimization**: Auto-detects touch viewports to disable cursor-tracking overhead and conserve battery life.

---

## 🏛️ Project Architecture

```
POKEHUB/
├── src/
│   └── app/
│       ├── components/
│       │   ├── NeoBrutalistHero.js      # 3D Hero stage with cursor-tracking card
│       │   ├── RiffleShuffleSection.js  # 52-Card 3D cascade shuffle simulator
│       │   ├── PokerHandOrbitSection.js # 3D POV poker table & street dealing
│       │   ├── HorizontalShowcase.js    # 6 Elite Decks interactive showcase
│       │   ├── PokerDuelGame.js         # Full Texas Hold'em 3D Arena modal
│       │   ├── PokerScene.js            # Three.js R3F canvas wrapper & lighting
│       │   ├── ProceduralCard.js        # 3D procedural card shader & geometry
│       │   ├── Chips3D.js               # Physics-animated 3D casino chips
│       │   ├── PixelDeckAssets.js       # 8-bit integer pixel art matrices
│       │   ├── SoundEngine.js           # Procedural Web Audio synthesizer
│       │   ├── ControlDock.js           # Floating Controls.exe desktop widget
│       │   ├── HandRankingsModal.js     # Poker hand hierarchy & strategy tips
│       │   ├── TableThemeModal.js       # Table felt & arena theme switcher
│       │   └── VIPClubModal.js          # High roller VIP club modal
│       ├── utils/
│       │   └── pokerEngine.js           # Texas Hold'em core state machine & evaluator
│       ├── game/
│       │   └── page.js                  # Standalone /game 3D arena route
│       ├── about/
│       │   └── page.js                  # About & platform credits route
│       ├── page.js                      # Main landing page & section orchestrator
│       ├── layout.js                    # Root layout, metadata & custom fonts
│       └── globals.css                  # Neo-brutalist utility classes & animations
├── public/                              # Static public assets & favicons
├── package.json                         # Project dependencies & npm scripts
└── README.md                            # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pokehub.git
   cd pokehub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🕹️ Keyboard Shortcuts & Controls

POKEHUB includes quick-access hotkeys for seamless navigation:

| Key | Action | Description |
| :---: | :--- | :--- |
| <kbd>P</kbd> | **Play 3D Duel** | Opens the Texas Hold'em Matchmaking / Arena modal |
| <kbd>H</kbd> | **Hand Rankings** | Opens the Hand Rankings & Pro Strategy Guide |
| <kbd>V</kbd> | **VIP Club** | Opens the High-Roller VIP Club modal |
| <kbd>T</kbd> | **Change Theme** | Opens the Table Felt & Arena theme selector |
| <kbd>M</kbd> | **Toggle Audio** | Mutes or unmutes all synthesized sound effects |
| <kbd>Esc</kbd> | **Close Modal** | Closes any currently active modal or dialog |

---

## 📊 Official Hand Rankings & Reference Table

| Rank | Hand Name | Example | Probability | Payout |
| :---: | :--- | :---: | :---: | :---: |
| **1** | **Royal Flush** | `A♠ K♠ Q♠ J♠ 10♠` | 1 in 649,740 | **500 : 1** |
| **2** | **Straight Flush** | `9♥ 8♥ 7♥ 6♥ 5♥` | 1 in 72,193 | **100 : 1** |
| **3** | **Four of a Kind** | `K♠ K♥ K♦ K♣ 4♠` | 1 in 4,165 | **50 : 1** |
| **4** | **Full House** | `Q♠ Q♥ Q♦ 8♣ 8♠` | 1 in 694 | **20 : 1** |
| **5** | **Flush** | `A♦ J♦ 9♦ 6♦ 2♦` | 1 in 508 | **10 : 1** |
| **6** | **Straight** | `10♠ 9♥ 8♦ 7♣ 6♠` | 1 in 254 | **6 : 1** |
| **7** | **Three of a Kind** | `J♠ J♥ J♦ 8♣ 3♠` | 1 in 47 | **3 : 1** |
| **8** | **Two Pair** | `10♠ 10♥ 6♦ 6♣ A♠` | 1 in 21 | **2 : 1** |
| **9** | **One Pair** | `A♠ A♥ K♦ 9♣ 4♠` | 1 in 2.4 | **1 : 1** |
| **10** | **High Card** | `A♠ Q♥ 9♦ 6♣ 2♠` | 1 in 2 | **0 : 1** |

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **3D WebGL Rendering**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Scrollytelling & Motion**: [GSAP (GreenSock)](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/) + [Lenis](https://lenis.darkroom.engineering/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Audio**: Web Audio API (Additive Synthesis, Noise Oscillators, Biquad Filters)

---

## 📄 License

This project is open-source and distributed under the **MIT License**.

<div align="center">

**Built with ❤️ for High Rollers, Gamers, and Web Designers.**

</div>
