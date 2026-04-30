# 💎 Gem Match: Rock Bottom Edition

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Gem Match** is a high-performance, visually stunning Match-3 puzzle game built entirely with modern web technologies and Retro saves. Experience sleek animations, powerful combos, and a premium dark-mode aesthetic.

---

## ✨ Features

- **Classic Match-3 Gameplay**: Swap gems to align three or more of the same type.
- **Dynamic Power-Ups & Combos**:
  - 💣 **Bomb (4-Match)**: Creates a blast that clears all surrounding gems.
  - 🌟 **Wildcard (5-Match)**: A powerful gem that clears every instance of a specific color when swapped.
  - 💥 **Board Clear (6+ Match)**: A massive explosion that destroys all gems on the screen for a massive bonus.
- **Obstacle Mechanics**: 
  - 🪨 **Rocks (Level 12+)**: Unmatchable gems that drop dynamically and can only be destroyed with power-ups.
- **Progressive Difficulty**: Levels increase in difficulty with higher score goals and strategic move limits.
- **Utility Features**:
  - 💾 **Retro Save System**: Generate and load string-based seed codes to save your exact score, moves, and level progress.
  - 💡 **Hint System**: Highlights an available match when you get stuck.
- **Premium Visuals**: 
  - Glassmorphic UI panels and dynamic pop-ups.
  - Smooth particle effects and gem animations.
  - Responsive Canvas-based rendering.
- **Mobile Optimized**: Fully responsive design with touch-friendly controls.

## 🚀 Technologies

- **Frontend**: HTML5, Vanilla JavaScript (ES6+).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for layout and custom CSS for high-performance animations.
- **Graphics**: [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) for game logic and rendering.
- **Typography**: Inter via Google Fonts.

## 🎮 How to Play

1. **Start**: Click "PLAY NOW" to begin Level 1.
2. **Match**: Drag gems horizontally or vertically to swap them. 
3. **Score**: Match 3 gems to score points. 
4. **Combos & Power-ups**:
   - Match **4 gems** to spawn a **Bomb**.
   - Match **5 gems** to spawn a **Wildcard**.
   - Match **6+ gems** to trigger a full **Board Clear**.
5. **Obstacles**: Starting at Level 12, **Rocks** will occasionally fall onto the board. They cannot be matched and must be destroyed by Bombs or Wildcards!
6. **Utility**: Use the **Hint** button if you can't find a match, or use the **Save/Load** buttons to generate a code and pause your play session.
7. **Win**: Reach the level's goal before you run out of moves!

## 🛠️ Installation & Usage

Since Gem Match is a static web application, no installation is required.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/WC3D/Gem-Match.git
   ```
2. **Open the game**:
   Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

## 📂 Project Structure

```text
Gem-Match/
├── index.html   # Main layout and UI layout
├── style.css    # Premium styling and animations
├── game.js      # Core game loop, rendering, and logic
├── LICENSE      # MIT License
└── README.md    # You are here!
```

## ⚖️ Legal Disclaimer

**Gem Match: Power Up Edition** is an independent, original implementation of the "Match-3" puzzle genre. 

- **Original Assets**: All visual assets (shapes, colors, UI), sound effects (if any), and source code were created from scratch or used under open licenses. This project does not utilize any proprietary graphics, audio, or codebase from third-party games (such as *Candy Crush Saga* or *Bejeweled*).
- **Game Mechanics**: This project utilizes standard industry game mechanics (swapping adjacent items to form matches). Under international copyright law, game mechanics and "rules of play" are generally not subject to copyright protection; only the specific *expression* of those ideas (art, music, story) is protected.
- **Fair Use & Independence**: This project is intended for educational and entertainment purposes and is not affiliated with, endorsed by, or sponsored by any other game developer or publisher.
- **Infringement Notices (DMCA)**: If you believe that any content in this project infringes upon your copyright, please open an issue in this repository with detailed information. We take such claims seriously and will act promptly to remove any infringing material.

For more information on the legal distinction between game mechanics and copyrightable expression, see: [Candy Crush Saga, Bejeweled, and why game clones are a thing](https://geeklawjournal.wordpress.com/2014/02/17/candy-crush-saga-bejeweled-and-why-game-clones-are-a-thing/).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for puzzle lovers.
