# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page interactive portfolio website for Avinav Gupta, built entirely with vanilla HTML, CSS, and JavaScript. The portfolio features a custom terminal emulator as the primary interface, offering 40+ interactive commands for users to explore the developer's skills, projects, and information.

## Architecture

**Modular Structure**: The application uses a clean separation of concerns:
- `index.html` (24KB): Semantic HTML structure with portfolio content, navigation, and terminal interface
- `js/app.js` (77KB): Complete JavaScript logic including AvinTerm terminal emulator class, command system, camera integration, and API interactions
- `css/app.css` (extensive): Complete styling with CSS variables, glassmorphism effects, responsive design, terminal UI, and animations

**Core Components**:
- **AvinTerm Class** (`js/app.js`): Object-oriented terminal emulator with configurable options, virtual file system, and command processing
- **Command System**: Modular command handlers for portfolio navigation, system info, camera functions, and utilities
- **Virtual File System**: In-memory file system with portfolio data stored as files (`README.md`, `about.txt`, `projects.json`, etc.)
- **Responsive Design**: Mobile-first approach with specific breakpoints for different device sizes
- **API Integrations**: Weather data (OpenWeatherMap), camera access, geolocation, battery status, NewsAPI for real-time news

## Development Commands

**Local Development**:
```bash
# Serve the portfolio locally using Python
python3 -m http.server 8000

# Alternative with Node.js (if http-server is installed)
npx http-server . -p 8000

# Or simply open index.html directly in a browser
open index.html
```

**Available Tools**:
- Python 3.12.0 (available for local server)
- Node.js v24.2.0 (available for tooling)

## Terminal Commands

The portfolio includes 50+ interactive terminal commands organized into categories:

**Core Commands**: `help`, `clear`, `echo`, `cat`, `ls`, `exit`, `version`
**Portfolio Commands**: `about`, `skills`, `experience`, `contact`, `resume`
**Project Commands**: `projects`, `project [name]`, `github`, `demo [name]`, `code [name]`
**Camera Commands**: `takepic`, `takepic_rear`, `showpics`, `showpic [id]`, `delpic [id]`, `clearpics`, `camera_info`
**System Commands**: `sysinfo`, `device`, `time`, `date`
**News Commands**: `news [category]` - Real-time news from multiple sources

**Command Aliases**: 
- Common Unix aliases: `ll` → `ls`, `dir` → `ls`, `cls` → `clear`, `whoami` → `about`
- Developer shortcuts: `man` → `help`, `vim` → helpful message, `sudo` → humorous response
- Navigation: `pwd`, `cd`, `mkdir` → contextual responses

**Easter Egg Commands**: 🥚
- `matrix` - Matrix rain effect with green digital rain
- `hacker` - Animated hacking sequence with terminal output
- `dance` - Rainbow background animation with dancing emojis  
- `rocket` - Animated rocket launch across the screen
- `coffee` - ASCII art coffee cup with brewing animation
- `unicorn` - Magical unicorn ASCII art with sparkles
- `pizza` - Pizza delivery joke with cryptocurrency payment
- `fortune` - Random programming/developer fortune cookies
- `konami` - Classic cheat code reference
- `secret` - Hidden achievement for explorers
- `moon` - Makes the 3D moon perform an elegant, smooth revolution around Earth
- `destroy` - 💀 EPIC destruction sequence: asteroid attack, broken TV effects, KABOOM explosion, and webpage reconstruction screen

**Certification Commands**:
- `certs` - Display all certifications and courses
- `achievements` - Show competition wins and awards
- `courses` - List completed courses
- `cert [number]` - Show detailed certificate information
- `viewcert [number]` - Display certificate image in terminal

**Discovery Commands**:
- `commands` - Show ALL available commands (comprehensive list)
- `hints` - Tips for discovering easter eggs and hidden features
- `aliases` - Show command shortcuts and alternative names
- `explore` - Get suggestions for fun commands to try

**Utility Commands**: `weather [city]`, `sum [numbers]`, `hello`

## Key Features

**Terminal Emulator**:
- Custom-built with command history and autocomplete
- Responsive design adapting to different screen sizes
- Persistent command history across sessions
- Support for complex commands with parameters

**Camera Integration**:
- Front and rear camera access via WebRTC
- Photo capture and local storage management
- Gallery functionality with view/delete operations

**System Information**:
- Comprehensive device and browser diagnostics
- Battery status, network info, and performance metrics
- Real-time data updates

**Responsive Design**:
- Mobile-first approach with touch-friendly terminal
- Breakpoints: 479px, 768px, 1024px, 1441px, 1921px
- Adaptive command output for different screen sizes

## File Structure

```
portfolio/
├── index.html              # Main HTML file with portfolio content
├── css/
│   └── app.css            # Complete styling with glassmorphism effects
├── js/
│   └── app.js             # AvinTerm terminal emulator and JavaScript logic
├── assets/
│   ├── Abhinav_Gupta_Resume.pdf  # Resume file
│   └── images/
│       ├── aigleair.jpeg  # Project images
│       ├── bot.png
│       ├── image.jpg
│       ├── prep.png
│       └── sat.jpg
├── docs/
│   └── README.md          # Project documentation
└── CLAUDE.md              # Development documentation
```

## Development Notes

**Technology Stack**:
- Pure vanilla JavaScript (ES6+) - no frameworks or libraries
- CSS3 with modern features (Grid, Flexbox, CSS Variables, Backdrop Filter)
- HTML5 with semantic markup
- Font Awesome for icons
- Google Fonts for typography

**API Dependencies**:
- OpenWeatherMap API for weather data (requires API key configuration)
- Hacker News API for tech news and RSS2JSON for other categories (no API key required)
- Browser APIs: Camera, Geolocation, Battery, Device Orientation

**Browser Compatibility**:
- Modern browsers with WebRTC support required for camera features
- CSS backdrop-filter support needed for glassmorphism effects
- ES6+ JavaScript features used throughout

## API Configuration

**News Integration**:
- Tech news: Hacker News API + Dev.to API (no authentication required)
- World/Business/Science: Reddit API (no authentication required) 
- Sports/Health/Entertainment: Curated static content with real-time formatting
- No setup needed - works out of the box

**OpenWeatherMap Setup**: Requires API key for weather command functionality

## Customization

**Adding New Commands**: Extend the command system by adding handlers in `js/app.js`
**Styling Changes**: Modify CSS variables in the `:root` selector in `css/app.css` for theme customization
**Content Updates**: Update portfolio data within the JavaScript command handlers in `js/app.js`
**Image Assets**: Add new images to `assets/images/` and update references in HTML
**Responsive Breakpoints**: Adjust media queries in `css/app.css` for different device targeting

## Security Considerations

The application uses browser APIs that require user permissions (camera, location). All data is stored locally in the browser's localStorage. No external authentication or server-side data storage is implemented.