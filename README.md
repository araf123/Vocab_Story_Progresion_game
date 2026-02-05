# VocabFlow - Interactive Narrative Learning Engine

VocabFlow is a minimalist, local-first platform designed to help users learn vocabulary through immersive, branching stories. It features a full-featured dashboard for players and a visual "Architect" portal for story creators.

## 🚀 Key Features

### For Players
- **Interactive Reading**: Discover hidden words in paragraphs to reveal their meanings and advance the plot.
- **Visual Progress**: Real-time tracking of vocabulary discovery in every story segment.
- **Branching Paths**: Your choices shape the narrative, but only after you've mastered the language of the current scene.
- **Monochrome Aesthetic**: A high-contrast, distraction-free dark mode UI.

### For Creators (Admin Portal)
- **Node-Based Architect**: Drag and drop nodes to build complex story trees.
- **Visual Linking**: Easy "click-to-connect" system to define story branches.
- **Smart Tagger**: Highlight text to quickly add vocabulary definitions.
- **Instant Publishing**: Publish your stories directly to your local library via `localStorage`.
- **Cover Art**: Support for direct image uploads for story thumbnails.

## 🛠 Technical Stack
- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+).
- **Libraries**: 
  - `Interact.js`: Powering the node dragging and canvas interactivity.
  - `Tailwind Animate`: For smooth UI transitions and modal entries.
- **Fonts**: `Inter` (UI/Sans) and `Lora` (Story/Serif).
- **Storage**: Local-first architecture using `localStorage` for story persistence.

## 📂 Project Structure
- `index.html`: The main player dashboard and story engine.
- `admin.html`: The visual story architecting tool.
- `script.js`: Core game logic, view management, and reading engine.
- `style.css`: Custom scrollbars and global UI refinements.
- `backups/`: Auto-generated backups of key files.
- `sessionlog.md`: Detailed history of development sessions.

## 🧪 How to Use
1. Open `index.html` to play the base story (Lexicon Academy).
2. Click the "Admin Portal" link at the bottom of the sidebar to create your own adventure.
3. In the Admin Portal, use "Add Node" to create story segments, link them, and click "Publish to Game" to see them on your dashboard.