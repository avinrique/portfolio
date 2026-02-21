# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-page interactive portfolio website built with vanilla HTML, CSS, and JavaScript. The primary interface is a custom terminal emulator (AvinTerm) with 60+ interactive commands. No frameworks, no build step, no tests, no linting.

## Development Commands

```bash
# Serve locally (required for portfolio.json fetch to work)
python3 -m http.server 8000

# Or open directly (some features like portfolio.json loading may not work via file://)
open index.html
```

## Architecture

Three files contain essentially all the code:

- **`index.html`** — HTML structure, portfolio data loader script (synchronous XHR fetches `portfolio.json` into `window.portfolioData`), and DOM population logic
- **`js/app.js`** (~3700 lines) — The `AvinTerm` class, command handlers, utility functions, Three.js earth/asteroid effects
- **`css/app.css`** — All styling: CSS variables for theming, glassmorphism effects, responsive breakpoints (479px, 768px, 1024px, 1441px, 1921px)

### Data Flow

```
portfolio.json ──(sync XHR in index.html)──> window.portfolioData
    │
    ├──> index.html DOMContentLoaded handler populates all HTML sections
    │
    └──> AvinTerm constructor reads window.portfolioData to build:
         ├── virtualFileSystem (README.md, about.txt, contact.txt, etc.)
         └── command output (about, skills, experience, contact, projects)
```

### AvinTerm Command System (`js/app.js`)

Commands are split across two mechanisms:

1. **Built-in commands** — Hardcoded in the `processCommand()` switch statement (~line 454). Handles: `clear`, `echo`, `cat`, `ls`, `help`, `exit`, `version`, `about`, `skills`, `experience`, `contact`, `resume`, `projects`, `project`, `github`, `demo`, `code`.

2. **Custom commands** — Defined in the `customCommands` object (~line 1883), passed to the AvinTerm constructor via `commands` option. Handles: camera, system info, weather, news, certifications, easter eggs, destructive animations, and discovery commands.

**Command resolution order**: aliases map → custom commands → built-in switch → "command not found"

**To add a new command:**
- Add the handler function to the `customCommands` object (before the `new AvinTerm()` call at ~line 3217)
- Add the command name to `this.availableCommands` array in `initializeCommands()` (~line 806) for tab completion
- Handlers receive `(args, fullCmd)` and return a string (HTML), a Promise, or null

### Key Globals

- `window.portfolioData` — All portfolio content from `portfolio.json`
- `window.terminal` — The AvinTerm instance (created at ~line 3217)
- `window.terminalImageStorage` — Array of captured camera photos
- `window.earth3D` — Three.js earth scene reference

### Utility Functions (outside AvinTerm class)

- `showNotification()` / `shouldShowNotification()` — Toast notifications with localStorage throttling
- `createAsteroidAttack()` — Three.js asteroid animation sequence
- `startBrokenTVEffect()` — Visual glitch effect
- `fetchTechNews()` / `fetchAlternativeTechNews()` — Hacker News + RSS2JSON fallback

## Data-Driven Content

**`portfolio.json`** (root) — All portfolio content. To customize for a different person, edit this single file:
- Personal info: `name`, `alias`, `tagline`, `avatarUrl`, `resumeFile`
- About: `about` (short), `aboutParagraphs` (array), `stats` (array of `{number, title}`)
- Contact: `email`, `phone`, `location`, social links (each with `url` and `label`)
- Skills: `skills` object (terminal display) and `skillCategories` array (HTML page grid)
- Projects: keyed `projects` object (terminal commands) and `projectCards` array (HTML cards, each with `image`, `title`, `description`, `tags`, `codeUrl`, `demoUrl`)
- Terminal config: `username`, `hostname`, `welcomeMessage`

**`docs/achievements.json`** — Certifications, competitions, and courses. Referenced by the `certs`/`achievements` terminal commands.

## Customization

- **Theme**: Modify CSS variables in `:root` selector in `css/app.css`
- **New commands**: Add to `customCommands` object + `availableCommands` array in `js/app.js`
- **Content**: Edit `portfolio.json` — no need to touch JS or HTML
- **Images**: Add to `assets/images/` and reference in `portfolio.json` projectCards

## External Dependencies

Loaded via CDN in `index.html` (no npm/package.json):
- Font Awesome 6.4.0 (icons)
- Three.js r128 (3D earth globe in hero section)
