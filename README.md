# Unpredictable Runner 🏃‍♂️💨

A high-octane 3D Endless Runner built with **Three.js** and **Vite**. Experience neon sci-fi visuals, dynamic speed scaling, and "smart" obstacles that actively try to block your path!

![Unpredictable Runner Banner](https://via.placeholder.com/1200x600/050510/00ffcc?text=Unpredictable+Runner)

## 🎮 Features

- **Endless Procedural World**: Auto-generating path with scrolling neon cityscape.
- **Smart Obstacles**: AI-driven walls and pillars that switch lanes to intercept you.
- **VFX & Aesthetics**: 
  - UnrealBloom for that premium neon glow.
  - Particle systems for speed lines and impact bursts.
  - Dynamic lighting loop.
- **Mobile Support**: Full swipe control support (Left/Right/Jump/Slide).
- **Arcade Mechanics**:
  - Score & Gems tracking.
  - Rewarded "Revive" mechanic (Ad simulation).
  - Progressive difficulty (Speed increases over time).

## 🕹 Controls

| Action | PC (Keyboard) | Mobile (Swipe) |
|--------|--------------|----------------|
| **Move Left** | `A` or `Left Arrow` | Swipe Left |
| **Move Right** | `D` or `Right Arrow` | Swipe Right |
| **Jump** | `W`, `Space` or `Up Arrow` | Swipe Up |
| **Slide** | `S` or `Down Arrow` | Swipe Down |

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harshal-gav/unpredictable.git
   cd unpredictable
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## 📱 Build for Android

This project uses **Capacitor** to wrap the web app for Android.

1. Build the web assets:
   ```bash
   npm run build
   ```

2. Sync with Android project:
   ```bash
   npx cap sync android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

## 🛠 Tech Stack

- **Three.js**: 3D Rendering Engine.
- **Vite**: Build tool & Dev server.
- **TypeScript**: Type safety.
- **Capacitor**: Cross-platform mobile runtime.

## 📄 License

This project is licensed under the MIT License.
