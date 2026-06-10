# 🌊 River IQ Puzzle

**[▶️ Play it live on Vercel](https://river-iq-q31.vercel.app)**

A river-crossing brain teaser — solved by a human-written **BFS algorithm**, brought to life with **vibe-coding** in Cursor.

---

## 🧩 What’s the puzzle?

A farmer needs to ferry everyone across the river:

- 🐂 Bull  
- 🐯 Tiger  
- 🧀 Two blocks of cheese  
- 🌾 Hay  
- ☠️ Poison  

The boat fits **only the farmer + one item** at a time. Lots of combinations are deadly if you leave the wrong passengers alone on an island.

**Goal:** Get the bull, tiger, hay, and poison safely to **Island A**.

---

## 🧠 How it’s built

| Part | Who built it |
|------|----------------|
| **Solver** (`src/solver.js`) | Human-written BFS |
| **Visualizer** (React + animations) | Vibe-coded in Cursor, guided by a human |

The solver searches the state tree (2–4 branches per move). Brute force would be roughly **2²⁰ ≈ 1 million** paths. BFS finds the full **20-move solution in ~31 ms** when the app loads.

The **step list** on the right and the **current state** chips under the scene show how each island configuration is tracked move by move.

---

## ✨ Features

- 🎬 **Play / Pause / Next Step / Reset** — watch the solution unfold  
- 👆 **Click any step** to jump to that point  
- 🚤 **Animated boat crossings** with custom icons  
- 🏝️ **Three islands** over animated water  
- 🌙 **Dark mode** toggle  
- 📍 **Stable entity positions** — items don’t shuffle when neighbors move  

---

## 🚀 Run locally

```bash
npm install
npm run dev
```

Open the URL in your terminal (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
```

---

## 🖥️ Original CLI solver

Before the visualizer, the puzzle ran in the terminal:

```bash
node riveriq.js
```

---

## 🛠️ Stack

- **React** + **Vite**  
- **BFS** in plain JavaScript  
- Hosted on **[Vercel](https://river-iq-q31.vercel.app)**

---

Made with 🧀, ☕, and a lot of backtracking.
