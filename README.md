# Sketch2App ✦ Full-Stack Next.js Studio

**Sketch a UI. A Gemini agent analyzes, plans, builds, and chats with you to refine it — live.**

Built for the Google I/O Hackathon 2026. Now upgraded to a full-stack Next.js and shadcn/ui architecture.

![demo](https://img.shields.io/badge/Gemini-2.0%20Flash-8b5cf6)
![tech](https://img.shields.io/badge/Next.js-15-black)
![ui](https://img.shields.io/badge/shadcn/ui-Zinc-neutral)

## What it does

A three-pane AI studio that transforms visual intent into working code:

1.  **Canvas** — Draw rough wireframes with a pen or eraser.
2.  **Agent Thread** — A multi-step pipeline powered by Gemini:
    - **① Analyze** — Uses Gemini Vision to extract intent into a structured JSON sitemap.
    - **② Build** — Composes the plan into a working **Multi-Page SPA** (Single Page Application).
    - **③ Refine** — Chat with the agent to patch the app. The agent sees your latest sketch strokes + chat instructions + current code.
    - **④ Voice** — Dictate refinements hands-free using the built-in microphone.
3.  **Live Preview** — The generated app runs in a sandboxed iframe with code/preview toggle.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Language**: TypeScript
- **AI**: Google Gemini 2.x API (Flash & Pro)
- **Voice**: Web Speech API

## Getting Started

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/gangsd92/sketch2app.git
    cd sketch2app
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Go to `http://localhost:3000`.

4.  **Configure API Key**:
    Paste your Gemini API key in the top right. Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Why it matters

Prompting is a writing skill; design is a visual skill. Sketch2App removes the friction between "idea" and "prototype" by letting the sketch be the prompt. It demonstrates **multimodal reasoning as a real-time creative tool**.

## Roadmap

- [x] **Full-Stack Rewrite**: Migrated from a single HTML file to Next.js + shadcn/ui.
- [x] **Multimodal Refinement**: Agent sees canvas annotations during chat.
- [x] **Voice Prompts**: Dictate UI changes via microphone.
- [x] **Multi-Page Generation**: Builds full sitemaps and SPA routing from sketches.
- [ ] **Export to Project**: Download the generated code as a standalone Next.js component.

## License

MIT
