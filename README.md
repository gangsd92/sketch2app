# Sketch2App

**Sketch a UI. A Gemini agent analyzes, plans, builds, and chats with you to refine it — live.**

Built for the Google I/O Hackathon 2026.

![demo](https://img.shields.io/badge/Gemini-2.5%20Flash%20%2F%20Pro-8b5cf6) ![agent](https://img.shields.io/badge/multi--step-agent-06b6d4) ![multimodal](https://img.shields.io/badge/multimodal-vision%20%E2%86%92%20code-10b981) ![zero install](https://img.shields.io/badge/zero-install-fafafa)

---

## What it does

A three-pane studio with a Gemini-powered agent in the middle:

1. **Sketch** — draw a rough wireframe on a canvas (left pane).
2. **Agent** — hit *Run agent*. A multi-step Gemini agent:
   - **① Analyze** — vision model reads the sketch and produces a **structured plan** (JSON-schema enforced): title, summary, components, theme, interactions.
   - **② Build** — composes the plan + sketch into a complete, self-contained **multi-page Single Page Application (SPA)** with internal routing.
   - **③ Refine** — chat box at the bottom of the agent pane. Type "make it dark mode", "add a sign-up link", "use a teal palette" — Gemini patches the live app. **You can even draw on the sketch to point at things or add new elements while you chat.**
   - **④ Voice** — hit the microphone icon to dictate your refinements hands-free.
3. **Live output** — the generated app runs in a sandboxed iframe on the right. Toggle to Code view, copy, or download.

Built with **Tailwind (shadcn-style aesthetic)**, vanilla JS, one HTML file, no backend.

## Why it matters

The fastest path from "idea in your head" to "working product on screen" is currently typing a 200-word prompt. That's a writing skill, not a design skill. Sketching is universal — kids, PMs, designers, founders all sketch. We let the sketch be the prompt.

This is **multimodal reasoning as a creative tool**: vision + voice in, working code out, no intermediate text representation.

## Demo (60 seconds)

1. Open `index.html` in a browser (or serve with `python3 -m http.server`).
2. Paste a Gemini API key — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
3. Sketch on the left canvas. Try:
   - A header bar with a logo box
   - A grid of product cards
   - A login form
4. Hit **Generate ✨** (or `Cmd/Ctrl+Enter`).
5. Watch a working app appear on the right. Toggle to **Code** view, **Copy**, or **Download** the HTML.

## How it works — the agent loop

```
   sketch (canvas PNG, base64)
            │
            ▼
   ┌──────────────────────────────────────┐
   │ ① ANALYZE                            │
   │  Gemini 2.5 with responseSchema      │  →  structured Plan JSON
   │  (vision + JSON-mode)                │      { title, components[], theme,
   └──────────────────────────────────────┘        interactions[], reasoning }
            │
            ▼
   ┌──────────────────────────────────────┐
   │ ② BUILD                              │
   │  Gemini 2.5 (plan + sketch + system) │  →  full self-contained HTML
   └──────────────────────────────────────┘
            │            ▲
            ▼            │ user message
   ┌──────────────────────────────────────┐
   │ ③ REFINE  (chat loop)                │
   │  Gemini 2.5 (current HTML + msg)     │  →  updated HTML, swap into <iframe>
   └──────────────────────────────────────┘
```

- **Structured output** — Phase 1 uses Gemini's `responseMimeType: application/json` with a `responseSchema`, so the plan is type-safe.
- **Frontend only.** `fetch` straight to `generativelanguage.googleapis.com` — no backend, no proxy.
- **Key stays local.** Stored in `localStorage`, never leaves your browser.
- **Sandboxed preview.** Generated HTML runs in `<iframe sandbox="allow-scripts allow-forms">`.

## Tech

- Tailwind (CDN) for the shadcn-style aesthetic — dark zinc theme, violet/cyan accents
- HTML5 Canvas + Pointer Events for drawing
- Gemini API (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash` selectable)
- Vanilla JS, no frameworks, no bundler, no dependencies

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — UI, canvas logic, Gemini call, preview iframe |
| `README.md` | This file |

## Roadmap

- [x] **Refine loop**: send the current generated HTML + new sketch back to Gemini for iteration
- [x] **Voice prompts**: dictate refinements using the microphone
- [x] **Multi-page**: generate a full sitemap and SPA from a sketched flow
- [x] **Component library mode**: uses "shadcn-style" design tokens for high-end aesthetic

## License

MIT
