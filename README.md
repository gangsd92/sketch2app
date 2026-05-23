# Sketch2App

**Sketch a UI on a canvas. Gemini multimodal turns it into a working web app — live, in seconds.**

Built for the Google I/O Hackathon 2026.

![demo](https://img.shields.io/badge/Gemini-2.5%20Flash%20%2F%20Pro-4f46e5) ![multimodal](https://img.shields.io/badge/multimodal-vision%20%E2%86%92%20code-06b6d4) ![zero install](https://img.shields.io/badge/zero-install-10b981)

---

## What it does

You draw a rough wireframe — boxes for buttons, lines for inputs, a scribbled heading. You hit **Generate**. Gemini's vision model reads the sketch, infers the user's intent, and produces a polished, interactive, **self-contained HTML page** in the right pane.

No build step. No backend. One HTML file.

## Why it matters

The fastest path from "idea in your head" to "working product on screen" is currently typing a 200-word prompt. That's a writing skill, not a design skill. Sketching is universal — kids, PMs, designers, founders all sketch. We let the sketch be the prompt.

This is **multimodal reasoning as a creative tool**: vision in, working code out, no intermediate text representation.

## Demo (60 seconds)

1. Open `index.html` in a browser (or serve with `python3 -m http.server`).
2. Paste a Gemini API key — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
3. Sketch on the left canvas. Try:
   - A header bar with a logo box
   - A grid of product cards
   - A login form
4. Hit **Generate ✨** (or `Cmd/Ctrl+Enter`).
5. Watch a working app appear on the right. Toggle to **Code** view, **Copy**, or **Download** the HTML.

## How it works

```
   sketch (canvas → PNG → base64)
              │
              ▼
   ┌─────────────────────────┐
   │  Gemini 2.5 Flash/Pro   │   ← multimodal: image + system prompt
   │  generateContent API    │
   └─────────────────────────┘
              │
              ▼
   full HTML document → <iframe srcdoc=...>
```

- **Frontend only.** Canvas API for drawing, `fetch` straight to `generativelanguage.googleapis.com`.
- **Key stays local.** Stored in `localStorage`, never leaves your browser.
- **Sandboxed preview.** Generated HTML runs in an `<iframe sandbox="allow-scripts allow-forms">`.

## Tech

- HTML5 Canvas + Pointer Events for drawing
- Gemini API (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash` selectable)
- Vanilla JS, no frameworks, no bundler, no dependencies

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — UI, canvas logic, Gemini call, preview iframe |
| `README.md` | This file |

## Roadmap

- **Refine loop**: send the current generated HTML + new sketch back to Gemini for iteration
- **Voice prompts** ("make it dark mode") layered over the sketch
- **Multi-page**: generate a small sitemap from a sketched flow
- **Component library mode**: paste your design tokens, get on-brand output

## License

MIT
