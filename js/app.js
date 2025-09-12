
        class AvinTerm {
            constructor(options = {}) {
                // Default configuration
                this.config = {
                    username: options.username || 'user',
                    hostname: options.hostname || 'avinterm',
                    welcomeMessage: options.welcomeMessage || 'Welcome to AvinTerm v1.0.0',
                    showOnLoad: options.showOnLoad !== undefined ? options.showOnLoad : false,
                    position: options.position || {
                        top: '50%',
                        right: '5%',
                        left: 'auto',
                        transform: 'translate(0, -50%)'
                    },
                    commands: options.commands || {}
                };
                
                // Add minimize state tracking
                this.isMinimized = false;
                this.virtualFileSystem = {
    'README.md': 'Welcome to AvinTerm! This terminal showcases my portfolio and projects.\n\nQuick Start:\n- Type "help" for basic commands\n- Type "commands" to see ALL available commands\n- Type "hints" for easter egg discovery tips\n- Type "explore" for command suggestions\n\n🎪 Hidden surprises await exploration!',
    
    'about.txt': 'Hi, I\'m Abhinav Gupta — a full-stack developer and automation enthusiast currently pursuing Information Science and Engineering at BMSIT, Bangalore. I specialize in AI, automation, microcontroller-based systems, cybersecurity, and large language models. I love building projects that integrate hardware and software in smart, useful ways.',

    'contact.txt': 'Email: avigupta2001ad@gmail.com\nPhone: +91 84341 06606\nLocation: Biratnagar, Nepal / Bangalore, India\nLinkedIn: linkedin.com/in/avinrique\nGitHub: github.com/avinrique',

    'projects.json': JSON.stringify({
        "projects": [
            {
                "name": "Prepzer0",
                "tech": "MERN Stack, AI, Proctoring, Face/Phone Detection",
                "description": "AI-proctored placement testing platform with secure exams and cheating detection."
            },
            {
                "name": "Talking Bot Assistant",
                "tech": "ESP32, Servos, OLED, Python, LLMs, TTS/STT",
                "description": "Portable assistant bot with facial expression and natural language communication."
            },
            {
                "name": "Aigle Air",
                "tech": "ESP32, DFRobot Sensors, CO2/O2/PM, OLED, Ads Display",
                "description": "A smart air-quality sensing device inspired by Liquid 3, integrated with an ad display."
            },
            {
                "name": "CustomisedPhoneCase",
                "tech": "JavaScript, MongoDB, Node.js, QR Payment, Admin Dashboard",
                "description": "E-commerce platform for phone cases, supports cart, wishlist, QR-based checkout."
            },
            {
                "name": "AI-Driven Linux OS",
                "tech": "Debian, Python, Shell Scripts, GenAI, Automation",
                "description": "A lightweight, custom OS to automate tasks via natural language and multi-display extensions."
            },
            {
                "name": "AutoCISGuard",
                "tech": "Electron, PowerShell, Bash, Python",
                "description": "Automated CIS benchmark auditing tool for Linux and Windows with GUI reports."
            },
            {
                "name": "Spacedesk-like Display App",
                "tech": "Linux, Networking, Python, Shell, GUI",
                "description": "Linux app to extend displays across devices wirelessly, inspired by Spacedesk."
            },
            {
                "name": "Satellite Project",
                "tech": "Arduino, NRF, Sensors, Web UI",
                "description": "Real-time sensor data transmission from satellite to ground with a supporting web dashboard."
            }
        ]
    }, null, 2),

    'skills.txt': 
`- Languages: Java, JavaScript, Python, Shell
- Frontend: React, TailwindCSS, HTML/CSS
- Backend: Node.js, Express, MongoDB
- DevOps: AWS, Azure, Docker, CI/CD
- OS & Tools: Linux, Electron.js, ngrok, VSCode
- Automation: Selenium, AI task delegation, Prompt engineering
- Microcontrollers: ESP32, Raspberry Pi, ATtiny85, Arduino
- AI: LLM integration (Gemini, GPT), TTS/STT, chatbot interfaces`,

    'notes.txt': `AvinTerm v1.0.0
Welcome to my digital workspace.

Explore my projects through this custom shell.
Type "help" to begin.

🔍 Discovery Tips:
- Type "commands" to see ALL 60+ commands
- Type "hints" for easter egg hunting tips
- Try typing emojis like 🚀 ☕ 🦄 🌙

Hint: Robotics, astronomy, and talking bots are my thing.`

};

                // Terminal state
                this.terminalVisible = false;
                this.originalPosition = { ...this.config.position };
                this.isPositionChanged = false;
                this.isExpanded = false;
                this.commandHistory = [];
                this.historyIndex = -1;
                this.currentSuggestion = '';
                this.availableCommands = [];

                // Initialize
                this.init();
            }

            init() {
                this.cacheDOM();
                this.setupResponsiveness();
                this.bindEvents();
                this.makeDraggable();
                this.updatePrompt();
                this.initializeCommands();
                this.hideTerminal();
                
                if (this.config.showOnLoad) {
                    setTimeout(() => {
                        this.showTerminal();
                        
                        // Add welcome message if configured
                        if (this.config.welcomeMessage) {
                            const welcomeMsg = document.createElement('div');
                            welcomeMsg.className = 'avin-terminal-line avin-terminal-success';
                            welcomeMsg.innerHTML = this.config.welcomeMessage;
                            this.terminalOutput.appendChild(welcomeMsg);
                            this.scrollToBottom();
                        }
                    }, 500);
                }
            }

            cacheDOM() {
                this.terminalContainer = document.getElementById('avin-terminal-container');
                this.floatingBtn = document.getElementById('avin-floating-console-btn');
                this.terminalInput = document.getElementById('avin-terminal-input');
                this.terminalOutput = document.getElementById('avin-terminal-output');
                this.closeBtn = document.getElementById('avin-terminal-close');
                this.minimizeBtn = document.getElementById('avin-terminal-minimize');
                this.expandBtn = document.getElementById('avin-terminal-expand');
                this.header = document.getElementById('avin-terminal-header');
                this.prompt = document.querySelector('.avin-terminal-prompt');
                this.terminalTitle = document.querySelector('.avin-terminal-title span');
            }

            setupResponsiveness() {
                // Set initial size based on viewport
                this.adjustSize();
                
                // Add resize event listener
                window.addEventListener('resize', () => {
                    this.adjustSize();
                });
                
                // Handle orientation change for mobile
                window.addEventListener('orientationchange', () => {
                    setTimeout(() => {
                        this.adjustSize();
                    }, 300);
                });
            }
            
            adjustSize() {
                // Only adjust if not in expanded mode and position hasn't been changed manually
                if (!this.isExpanded && !this.isPositionChanged) {
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    
                    // Reset styles - we'll apply them via CSS media queries
                    this.terminalContainer.style.width = '';
                    this.terminalContainer.style.height = '';
                    
                    // Handle edge cases for very small screens
                    if (width < 320) {
                        this.terminalContainer.style.width = '95%';
                        this.terminalContainer.style.left = '2.5%';
                        this.terminalContainer.style.right = 'auto';
                    }
                }
            }

            updatePrompt() {
                const promptText = `${this.config.username}@${this.config.hostname}:~$`;
                if (this.prompt) {
                    this.prompt.textContent = promptText;
                }
                if (this.terminalTitle) {
                    this.terminalTitle.textContent = `${this.config.username}@${this.config.hostname} : konsole — Konsole`;
                }
            }

            bindEvents() {

                    document.addEventListener('wheel', (e) => {
                    // Get terminal container bounds
                    const termRect = this.terminalContainer.getBoundingClientRect();
                    
                    // Check if the scroll event occurred inside the terminal content area
                    const terminalContent = this.terminalContainer.querySelector('.avin-terminal-content');
                    const contentRect = terminalContent ? terminalContent.getBoundingClientRect() : null;
                    
                    if (contentRect && 
                        e.clientX >= contentRect.left && e.clientX <= contentRect.right && 
                        e.clientY >= contentRect.top && e.clientY <= contentRect.bottom) {
                        // Inside terminal content area - allow scrolling but prevent page scrolling
                        e.stopPropagation();
                        // Do not call preventDefault() here to allow terminal's native scrolling
                    } else if (e.clientX < termRect.left || e.clientX > termRect.right || 
                            e.clientY < termRect.top || e.clientY > termRect.bottom) {
                        // Outside terminal - hide terminal and allow page to scroll normally
                        this.hideTerminal();
                    } else {
                        // Inside terminal but not in scrollable content area
                        e.preventDefault(); // Prevent page scrolling
                    }
                }, { passive: false });
                
                this.floatingBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Floating button clicked, terminal visible:', this.terminalVisible, 'minimized:', this.isMinimized);
                    
                    if (this.terminalVisible && !this.isMinimized) {
                        // Terminal is visible and not minimized, so hide it
                        this.hideTerminal();
                    } else if (this.isMinimized || !this.terminalVisible) {
                        // Terminal is minimized or hidden, so show it
                        this.resetPosition();
                        this.showTerminal();
                    }
                });
                
                this.terminalInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const command = this.terminalInput.value.trim();
                        if (command) {
                            // Add to command history
                            this.commandHistory.push(command);
                            if (this.commandHistory.length > 50) {
                                this.commandHistory.shift(); // Keep history at reasonable size
                            }
                            this.historyIndex = this.commandHistory.length;
                            
                            const commandLine = document.createElement('div');
                            commandLine.className = 'avin-terminal-line';
                            commandLine.innerHTML = `<span class="avin-terminal-command">${this.config.username}@${this.config.hostname}:~$</span> ${command}`;
                            this.terminalOutput.appendChild(commandLine);
                            
                            this.processCommand(command);
                            
                            this.terminalInput.value = '';
                            this.scrollToBottom();
                        }
                    } else if (e.key === 'ArrowUp') {
                        // Navigate command history - up
                        e.preventDefault();
                        if (this.historyIndex > 0) {
                            this.historyIndex--;
                            this.terminalInput.value = this.commandHistory[this.historyIndex];
                            
                            // Position cursor at end of input
                            setTimeout(() => {
                                this.terminalInput.selectionStart = this.terminalInput.value.length;
                                this.terminalInput.selectionEnd = this.terminalInput.value.length;
                            }, 0);
                        }
                    } else if (e.key === 'ArrowDown') {
                        // Navigate command history - down
                        e.preventDefault();
                        if (this.historyIndex < this.commandHistory.length - 1) {
                            this.historyIndex++;
                            this.terminalInput.value = this.commandHistory[this.historyIndex];
                        } else if (this.historyIndex === this.commandHistory.length - 1) {
                            this.historyIndex = this.commandHistory.length;
                            this.terminalInput.value = '';
                        }
                    } else if (e.key === 'Tab') {
                        // Tab completion
                        e.preventDefault();
                        this.handleTabCompletion();
                    } else {
                        // Clear current suggestion when user types
                        this.clearSuggestion();
                    }

             
                });
                
                // Add tooltips and improved functionality
                this.closeBtn.title = "Close Terminal";
                this.minimizeBtn.title = "Minimize Terminal";
                this.expandBtn.title = "Toggle Fullscreen";
                
                this.closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Add visual feedback
                    this.closeBtn.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        this.closeBtn.style.transform = '';
                        this.hideTerminal();
                    }, 100);
                });
                
                this.minimizeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Add visual feedback
                    this.minimizeBtn.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        this.minimizeBtn.style.transform = '';
                        this.minimizeTerminal();
                    }, 100);
                });
                
                this.expandBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Add visual feedback
                    this.expandBtn.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        this.expandBtn.style.transform = '';
                        this.toggleExpand();
                    }, 100);
                });
                
                this.terminalContainer.addEventListener('click', (e) => {
                    if (!e.target.closest('.avin-terminal-control')) {
                        this.terminalInput.focus();
                    }
                });
              
                // Handle touch events for mobile
                this.terminalContainer.addEventListener('touchstart', (e) => {
                    if (e.target === this.terminalInput) {
                        // Adjust terminal position when keyboard appears on mobile
                        if (window.innerHeight < 500) {
                            this.terminalContainer.style.top = '20%';
                            this.isPositionChanged = true;
                        }
                    }
                });
            }
            
            scrollToBottom() {
                const terminalContent = this.terminalContainer.querySelector('.avin-terminal-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
            
            resetPosition() {
                if (this.isPositionChanged) {
                    // Reset to CSS-defined position
                    this.terminalContainer.style.top = '';
                    this.terminalContainer.style.right = '';
                    this.terminalContainer.style.left = '';
                    this.terminalContainer.style.transform = '';
                    this.isPositionChanged = false;
                    this.adjustSize();
                }
            }
            
            showTerminal() {
                // Reset any minimize transforms
                this.terminalContainer.style.transform = '';
                this.terminalContainer.style.transition = '';
                this.terminalContainer.classList.remove('avin-terminal-hidden');
                
                this.terminalVisible = true;
                this.isMinimized = false;
                
                // Adjust position based on screen size
                this.adjustSize();
                
                setTimeout(() => {
                    this.terminalInput.focus();
                    this.scrollToBottom();
                }, 300);
            }
            
            hideTerminal() {
                this.terminalContainer.classList.add('avin-terminal-hidden');
                this.terminalVisible = false;
                this.isMinimized = false;
                // Reset any transforms from minimize
                this.terminalContainer.style.transform = '';
                this.terminalContainer.style.transition = '';
            }

        
// Replace the existing processCommand method with this updated version
processCommand(cmd) {
    const output = document.createElement('div');
    output.className = 'avin-terminal-line';
    
    // Command aliases mapping
    const aliases = {
        'll': 'ls',
        'dir': 'ls', 
        'cls': 'clear',
        'whoami': 'about',
        'pwd': 'echo /home/avinav',
        'cd': 'echo "Welcome to Avinav\'s portfolio! Use \'ls\' to explore."',
        'sudo': 'echo "Nice try! 😄 You don\'t need sudo powers here."',
        'rm': 'echo "Don\'t worry, nothing can be deleted in this safe space! 😊"',
        'mkdir': 'echo "Creating directories in cyberspace... Done! (Just kidding 😉)"',
        'chmod': 'echo "Permissions already set to \'awesome\' mode! ✨"',
        'ping': 'echo "Pong! 🏓 Terminal is responsive."',
        'nano': 'echo "No text editor needed - just explore with commands! 📝"',
        'vim': 'echo "Exiting vim... just kidding! Use \'help\' instead 😄"',
        'emacs': 'echo "Real programmers use the terminal! Try \'help\' 🤓"',
        'man': 'help',
        'info': 'help',
        'tree': 'ls',
        'find': 'echo "Everything you need to find is right here! Try \'ls\' or \'help\'"',
        'hack': 'hacker',
        'thematrix': 'matrix',
        '🚀': 'rocket',
        '☕': 'coffee',
        '🦄': 'unicorn',
        '🍕': 'pizza',
        '🌙': 'moon',
        'luna': 'moon',
        'lunar': 'moon',
        'certifications': 'certs',
        'certificates': 'certs',
        'awards': 'achievements',
        'wins': 'achievements',
        'tips': 'hints',
        'discover': 'explore',
        'shortcuts': 'aliases',
        'easter': 'hints',
        'apocalypse': 'destroy',
        'end': 'destroy',
        'terminate': 'destroy'
    };
    
    // Get the first word as the command
    let commandName = cmd.split(' ')[0].toLowerCase();
    let args = cmd.split(' ').slice(1);
    
    // Check for aliases first
    if (aliases[commandName]) {
        const aliasResult = aliases[commandName];
        if (aliasResult.includes('echo ')) {
            // Direct echo command
            const echoText = aliasResult.replace('echo ', '');
            cmd = `echo ${echoText}`;
            commandName = 'echo';
            args = [echoText];
        } else {
            // Redirect to another command
            cmd = aliasResult;
            commandName = aliasResult;
            args = [];
        }
    }
    
    // Check for custom command first
    if (this.config.commands && this.config.commands[commandName]) {
        try {
            const result = this.config.commands[commandName](args, cmd);
            if (result instanceof Promise) {
                output.innerHTML = 'Loading...';
                this.terminalOutput.appendChild(output);
                
                // Process the Promise result when it resolves
                result.then(asyncResult => {
                    if (asyncResult) {
                        output.innerHTML = asyncResult;
                    } else {
                        this.terminalOutput.removeChild(output);
                    }
                    this.scrollToBottom();
                }).catch(error => {
                    output.className = 'avin-terminal-line avin-terminal-error';
                    output.innerHTML = `Error: ${error.message}`;
                    this.scrollToBottom();
                });
                
                return; // Exit early as we've already handled the output
            }

            if (typeof result === 'string') {
                output.innerHTML = result;
            } else if (result === null || result === undefined) {
                return; // No output
            } else {
                output.innerHTML = JSON.stringify(result);
            }
        } catch (error) {
            output.className = 'avin-terminal-line avin-terminal-error';
            output.innerHTML = `Error executing command: ${error.message}`;
        }
    } else {
        // Default commands
        switch (commandName) {
            case 'clear':
                this.terminalOutput.innerHTML = '';
                return;
            case 'echo':
                output.innerHTML = cmd.substring(5);
                break;
            case 'cat':
                if (args.length === 0) {
                    output.className = 'avin-terminal-line avin-terminal-error';
                    output.innerHTML = 'Usage: cat [filename]';
                } else {
                    const filename = args[0];
                    const fileContents = this.virtualFileSystem[filename];
                    if (fileContents) {
                        output.innerHTML = fileContents;
                    } else {
                        output.className = 'avin-terminal-line avin-terminal-error';
                        output.innerHTML = `cat: ${filename}: No such file or directory`;
                    }
                }
                break;
            case 'ls':
                const files = Object.keys(this.virtualFileSystem).sort();
                output.innerHTML = files.join('&nbsp;&nbsp;&nbsp;');
                break;
            case 'help':
                output.innerHTML = `<strong>Core Commands:</strong><br>
                echo, clear, exit, help, version, cat, ls<br><br>
                <strong>Portfolio Commands:</strong><br>
                about, skills, experience, contact, resume<br><br>
                <strong>Project Commands:</strong><br>
                projects, project [name], github, demo [name], code [name]<br><br>
                <strong>System Commands:</strong><br>
                sysinfo, device, time, date<br><br>
                <strong>Camera Commands:</strong><br>
                takepic, takepic_rear, showpics, showpic [id], delpic [id], clearpics, camera_info<br><br>
                <strong>Utility Commands:</strong><br>
                hello, sum [numbers], weather [city]`;
                break;
            case 'exit':
                output.className = 'avin-terminal-line avin-terminal-success';
                output.innerHTML = 'Closing terminal session...';
                setTimeout(() => {
                    this.hideTerminal();
                }, 1000);
                break;
            case 'version':
                output.className = 'avin-terminal-line avin-terminal-info';
                output.innerHTML = 'AvinTerm v1.0.0';
                break;
            // Portfolio Commands
            case 'about':
    output.className = 'avin-terminal-line avin-terminal-info';
    output.innerHTML = `<div class="portfolio-section">
        <h3>About Me</h3>
        <p>Hi, I'm Abhinav Gupta — a full-stack developer and builder passionate about automation, AI, and robotics. 
        I'm currently pursuing Information Science and Engineering at BMSIT, Bangalore. 
        My projects combine hardware and software in creative ways, from natural language OS control to interactive talking bots.</p>
    </div>`;
    break;

case 'skills':
    output.className = 'avin-terminal-line avin-terminal-info';
    output.innerHTML = `<div class="portfolio-section">
        <h3>Technical Skills</h3>
        <ul>
            <li><strong>Languages:</strong> JavaScript, Python, Shell, Java, C++</li>
            <li><strong>Frontend:</strong> React, Tailwind, HTML/CSS, Vue.js</li>
            <li><strong>Backend:</strong> Node.js, Express, Django, MongoDB</li>
            <li><strong>DevOps:</strong> Docker, AWS, Azure, CI/CD, Git</li>
            <li><strong>Automation & AI:</strong> GenAI, Prompt Engineering, LLMs (Gemini, GPT), Selenium</li>
            <li><strong>Microcontrollers:</strong> ESP32, Raspberry Pi, ATtiny85, Arduino</li>
            <li><strong>Other:</strong> REST APIs, Electron.js, WebSockets, ngrok</li>
        </ul>
    </div>`;
    break;

case 'experience':
    output.className = 'avin-terminal-line avin-terminal-info';
    output.innerHTML = `<div class="portfolio-section">
        <h3>Work & Project Experience</h3>
        <div class="experience-item">
            <p><strong>Prepzer0</strong> – AI-proctored placement testing platform</p>
            <p>Built from scratch with MERN stack; detects cheating using face & phone detection</p>
        </div>
        <div class="experience-item">
            <p><strong>AI Linux OS (WIP)</strong> – Lightweight Debian-based OS</p>
            <p>Built using debootstrap + chroot to automate everyday tasks with natural language prompts</p>
        </div>
        <div class="experience-item">
            <p><strong>Bot Project</strong> – Talking & animated assistant</p>
            <p>ESP32-based human assistant using TTS, STT, OLED face, and servos with emotional interaction</p>
        </div>
        <div class="experience-item">
            <p><strong>Aigle Air</strong> – Liquid 3-inspired smart air monitor</p>
            <p>DFRobot CO2/O2/PM sensors with ad display integration</p>
        </div>
        <div class="experience-item">
            <p><strong>CustomisedPhoneCase</strong> – Client e-commerce site</p>
            <p>Includes cart, wishlist, QR payments, and admin dashboard</p>
        </div>
    </div>`;
    break;

case 'contact':
    output.className = 'avin-terminal-line avin-terminal-info';
    output.innerHTML = `<div class="portfolio-section">
        <h3>Contact Information</h3>
        <p><strong>Email:</strong> avigupta2001ad@gmail.com</p>
        <p><strong>LinkedIn:</strong> linkedin.com/in/avinrique</p>
        <p><strong>GitHub:</strong> github.com/avinrique</p>
        <p><strong>Phone:</strong> +91 84341 06606</p>
        <p><strong>Location:</strong> Biratnagar, Nepal / Bangalore, India</p>
    </div>`;
    break;

    case 'resume':
    output.className = 'avin-terminal-line avin-terminal-success';
    output.innerHTML = `<div class="portfolio-section">
        <h3>Resume</h3>
        <p>Generating downloadable resume...</p>
        <p><a href="Abhinav_Gupta_Resume.pdf" download="Abhinav_Gupta_Resume.pdf">Click here to download PDF version</a></p>
    </div>`;
    break;
            // Project Commands
            case 'projects':
    output.className = 'avin-terminal-line avin-terminal-info';
    output.innerHTML = `<div class="portfolio-section">
        <h3>My Projects</h3>
        <ul>
            <li><strong>Prepzer0</strong> – AI-proctored placement testing platform</li>
            <li><strong>AI Linux OS</strong> – Lightweight Debian-based GenAI OS</li>
            <li><strong>Bot Project</strong> – ESP32-based animated assistant bot</li>
            <li><strong>Aigle Air</strong> – Smart bio-sensor air monitoring system</li>
            <li><strong>CustomisedPhoneCase</strong> – E-commerce platform for personalized phone cases</li>
            <li><strong>Mad Application</strong> – SpaceDesk-like Linux display extension tool</li>
        </ul>
        <p>Use <code>project [name]</code> for more details about a specific project</p>
    </div>`;
    break;

    case 'project':
    if (args.length === 0) {
        output.className = 'avin-terminal-line avin-terminal-error';
        output.innerHTML = 'Usage: project [project_name]';
    } else {
        const projectName = args[0].toLowerCase();
        const projects = {
            'prepzer0': {
                name: 'Prepzer0',
                description: 'AI-powered placement test platform with cheating detection',
                tech: 'MERN Stack, Python, OpenCV',
                features: [
                    'AI-based proctoring (face & phone detection)',
                    'MCQ/Programming test support',
                    'Admin analytics dashboard',
                    'Live camera stream monitoring'
                ],
                demo: 'https://prepzer0.abhinav.live',
                github: 'https://github.com/avinrique/prepzer0'
            },
            'linuxos': {
                name: 'AI Linux OS',
                description: 'Debian-based lightweight OS with natural language control',
                tech: 'Debootstrap, Python, Shell, GenAI',
                features: [
                    'Execute tasks via natural language',
                    'Automation shell using LLMs',
                    'Built-in apps: file manager, AI assistant',
                    'Spacedesk-like display extension'
                ],
                demo: 'N/A',
                github: 'https://github.com/avinrique/ai-linux-os'
            },
            'bot': {
                name: 'Bot Project',
                description: 'ESP32-powered talking bot with emotions and OLED face',
                tech: 'ESP32, Python, Servos, OLED, Google TTS/STT',
                features: [
                    'Voice interaction & expressions',
                    'Animated face on OLED',
                    'ESP32-driven servo head',
                    'Human-size kiosk version for public use'
                ],
                demo: 'https://youtu.be/demo-bot-video',
                github: 'https://github.com/avinrique/talking-esp32-bot'
            },
            'aigleair': {
                name: 'Aigle Air',
                description: 'Smart air monitoring system with DFRobot sensors and ad display',
                tech: 'ESP32, DFRobot CO2/O2 sensors, Python, OLED',
                features: [
                    'Air quality monitoring (CO2, O2, PM)',
                    'Advertisement display',
                    'Mobile dashboard UI',
                    'Smart notification system'
                ],
                demo: 'https://aigleair.abhinav.live',
                github: 'https://github.com/avinrique/aigle-air'
            },
            'phonecase': {
                name: 'CustomisedPhoneCase',
                description: 'E-commerce platform for personalized phone case orders',
                tech: 'HTML, CSS, JS, PHP, MySQL',
                features: [
                    'Cart & Wishlist without login',
                    'QR code payments',
                    'Admin panel for orders',
                    'Image-based order system'
                ],
                demo: 'https://customcase.abhinav.live',
                github: 'https://github.com/avinrique/customised-phone-case'
            },
            'madapp': {
                name: 'adllinux Application',
                description: 'Linux app for extending/mirroring displays across devices (like SpaceDesk)',
                tech: 'Shell, Python, TCP Sockets, Electron',
                features: [
                    'Mirror or extend Linux desktop wirelessly',
                    'No external hardware required',
                    'Custom display resolution support',
                    'Cross-device compatibility'
                ],
                demo: 'N/A',
                github: 'https://github.com/avinrique/madapp'
            }
        };

                    const project = projects[projectName];
                    if (project) {
                        output.className = 'avin-terminal-line avin-terminal-info';
                        output.innerHTML = `<div class="portfolio-section">
                            <h3>${project.name}</h3>
                            <p><strong>Description:</strong> ${project.description}</p>
                            <p><strong>Technologies:</strong> ${project.tech}</p>
                            <p><strong>Key Features:</strong></p>
                            <ul>
                                ${project.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                            <p><strong>Demo:</strong> <a href="${project.demo}" target="_blank">${project.demo}</a></p>
                            <p><strong>GitHub:</strong> <a href="${project.github}" target="_blank">${project.github}</a></p>
                        </div>`;
                    } else {
                        output.className = 'avin-terminal-line avin-terminal-error';
                        output.innerHTML = `Project '${args[0]}' not found. Use 'projects' to see available projects.`;
                    }
                }
                break;
            case 'github':
                output.className = 'avin-terminal-line avin-terminal-success';
                output.innerHTML = `Opening GitHub profile: <a href="https://github.com/avinrique" target="_blank">https://github.com/avinrique</a>`;
                window.open('https://github.com/avinrique', '_blank');
                break;
                case 'demo':
    if (args.length === 0) {
        output.className = 'avin-terminal-line avin-terminal-error';
        output.innerHTML = 'Usage: demo [project_name]';
    } else {
        const projectName = args[0].toLowerCase();
        const demos = {
            'prepzer0': 'https://prepzer0.abhinav.live',
            'aigleair': 'https://aigleair.abhinav.live',
            'phonecase': 'https://customcase.abhinav.live',
            'bot': 'https://youtu.be/demo-bot-video' // Replace with real link if different
        };

        if (demos[projectName]) {
            output.className = 'avin-terminal-line avin-terminal-success';
            output.innerHTML = `Opening demo for ${args[0]}: <a href="${demos[projectName]}" target="_blank">${demos[projectName]}</a>`;
            window.open(demos[projectName], '_blank');
        } else {
            output.className = 'avin-terminal-line avin-terminal-error';
            output.innerHTML = `Demo for '${args[0]}' not found. Use 'projects' to see available projects.`;
        }
    }
    break;

    case 'code':
    if (args.length === 0) {
        output.className = 'avin-terminal-line avin-terminal-error';
        output.innerHTML = 'Usage: code [project_name]';
    } else {
        const projectName = args[0].toLowerCase();
        const repos = {
            'prepzer0': 'https://github.com/avinrique/prepzer0',
            'linuxos': 'https://github.com/avinrique/ai-linux-os',
            'bot': 'https://github.com/avinrique/talking-esp32-bot',
            'aigleair': 'https://github.com/avinrique/aigle-air',
            'phonecase': 'https://github.com/avinrique/customised-phone-case',
            'adlinuxapp': 'https://github.com/avinrique/madapp'
        };

        if (repos[projectName]) {
            output.className = 'avin-terminal-line avin-terminal-success';
            output.innerHTML = `Opening source code for ${args[0]}: <a href="${repos[projectName]}" target="_blank">${repos[projectName]}</a>`;
            window.open(repos[projectName], '_blank');
        } else {
            output.className = 'avin-terminal-line avin-terminal-error';
            output.innerHTML = `Repository for '${args[0]}' not found. Use 'projects' to see available projects.`;
        }
    }
    break;
    

            default:
                output.className = 'avin-terminal-line avin-terminal-error';
                output.innerHTML = `Command not found: ${commandName}`;
        }
    }
    
    this.terminalOutput.appendChild(output);
    this.scrollToBottom();
}
            makeDraggable() {
                let isDragging = false;
                let offsetX, offsetY;
                
                const handleMouseDown = (e) => {
                    if (e.target.closest('.avin-terminal-control')) return;
                    
                    isDragging = true;
                    offsetX = e.clientX - this.terminalContainer.getBoundingClientRect().left;
                    offsetY = e.clientY - this.terminalContainer.getBoundingClientRect().top;
                    
                    e.preventDefault();
                };
                
                const handleTouchStart = (e) => {
                    if (e.target.closest('.avin-terminal-control')) return;
                    
                    const touch = e.touches[0];
                    isDragging = true;
                    offsetX = touch.clientX - this.terminalContainer.getBoundingClientRect().left;
                    offsetY = touch.clientY - this.terminalContainer.getBoundingClientRect().top;
                };
                
                const handleMouseMove = (e) => {
                    if (isDragging) {
                        this.terminalContainer.style.transform = 'none';
                        this.terminalContainer.style.left = (e.clientX - offsetX) + 'px';
                        this.terminalContainer.style.top = (e.clientY - offsetY) + 'px';
                        this.terminalContainer.style.right = 'auto';
                        this.isPositionChanged = true;
                    }
                };
                
                const handleTouchMove = (e) => {
                    if (isDragging) {
                        const touch = e.touches[0];
                        this.terminalContainer.style.transform = 'none';
                        this.terminalContainer.style.left = (touch.clientX - offsetX) + 'px';
                        this.terminalContainer.style.top = (touch.clientY - offsetY) + 'px';
                        this.terminalContainer.style.right = 'auto';
                        this.isPositionChanged = true;
                        e.preventDefault(); // Prevent page scrolling while dragging
                    }
                };
                
                const handleDragEnd = () => {
                    isDragging = false;
                };
                
                // Mouse Events
                this.header.addEventListener('mousedown', handleMouseDown);
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleDragEnd);
                
                // Touch Events for mobile
                this.header.addEventListener('touchstart', handleTouchStart, { passive: false });
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleDragEnd);
                
                // Clean up event listeners when needed
                this.cleanupDraggable = () => {
                    this.header.removeEventListener('mousedown', handleMouseDown);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleDragEnd);
                    this.header.removeEventListener('touchstart', handleTouchStart);
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleDragEnd);
                };
            }
            
            minimizeTerminal() {
                this.terminalContainer.style.transition = 'all 0.3s ease';
                this.terminalContainer.style.transform = 'translateY(100%)';
                
                setTimeout(() => {
                    this.terminalContainer.classList.add('avin-terminal-hidden');
                    this.isMinimized = true;
                    // Keep terminalVisible as true so floating button can restore it
                }, 300);
            }
            
            toggleExpand() {
                if (this.isExpanded) {
                    // Return to normal size
                    this.terminalContainer.style.width = '';
                    this.terminalContainer.style.height = '';
                    this.terminalContainer.style.top = '';
                    this.terminalContainer.style.left = '';
                    this.terminalContainer.style.right = '';
                    this.terminalContainer.style.transform = '';
                    
                    // Adjust based on current screen size
                    this.adjustSize();
                    
                    this.isExpanded = false;
                } else {
                    // Expand to full screen with margins
                    const isMobile = window.innerWidth <= 768;
                    
                    this.terminalContainer.style.width = isMobile ? '95vw' : '90vw';
                    this.terminalContainer.style.height = isMobile ? '80vh' : '85vh';
                    this.terminalContainer.style.top = isMobile ? '10vh' : '7.5vh';
                    this.terminalContainer.style.left = isMobile ? '2.5vw' : '5vw';
                    this.terminalContainer.style.right = 'auto';
                    this.terminalContainer.style.transform = 'none';
                    this.isExpanded = true;
                    this.expandBtn.querySelector('i').className = 'fas fa-compress';
                    this.isPositionChanged = true;
                }
      
                setTimeout(() => {
                    this.scrollToBottom();
                }, 300);
            }

            // Public methods
            setUsername(username) {
                this.config.username = username;
                this.updatePrompt();
            }

            setHostname(hostname) {
                this.config.hostname = hostname;
                this.updatePrompt();
            }

            appendOutput(text, className = '') {
                const output = document.createElement('div');
                output.className = 'avin-terminal-line' + (className ? ' ' + className : '');
                output.innerHTML = text;
                this.terminalOutput.appendChild(output);
                this.scrollToBottom();
            }

            clearOutput() {
                this.terminalOutput.innerHTML = '';
            }

            initializeCommands() {
                // Build list of available commands for tab completion
                this.availableCommands = [
                    // Core commands
                    'help', 'clear', 'echo', 'cat', 'ls', 'exit', 'version',
                    // Portfolio commands  
                    'about', 'skills', 'experience', 'contact', 'resume',
                    // Project commands
                    'projects', 'project', 'github', 'demo', 'code',
                    // Camera commands
                    'takepic', 'takepic_rear', 'showpics', 'showpic', 'delpic', 'clearpics', 'camera_info',
                    // System commands
                    'sysinfo', 'device', 'time', 'date',
                    // Utility commands
                    'weather', 'sum', 'hello', 'news'
                ];
            }
            
            handleTabCompletion() {
                const currentInput = this.terminalInput.value;
                const words = currentInput.split(' ');
                const currentWord = words[words.length - 1];
                
                if (words.length === 1) {
                    // Complete command names
                    const matches = this.availableCommands.filter(cmd => 
                        cmd.startsWith(currentWord.toLowerCase())
                    );
                    
                    if (matches.length === 1) {
                        // Single match - complete it
                        this.terminalInput.value = matches[0];
                        this.showCompletionFeedback(matches[0]);
                    } else if (matches.length > 1) {
                        // Multiple matches - show suggestions
                        this.showCommandSuggestions(matches, currentWord);
                    }
                } else {
                    // Handle argument completion (files, project names, etc.)
                    const command = words[0].toLowerCase();
                    this.handleArgumentCompletion(command, currentWord, words);
                }
            }
            
            showCommandSuggestions(matches, partial) {
                const output = document.createElement('div');
                output.className = 'avin-terminal-line avin-terminal-suggestion';
                
                const commonPrefix = this.findCommonPrefix(matches);
                if (commonPrefix.length > partial.length) {
                    // Auto-complete to common prefix
                    this.terminalInput.value = commonPrefix;
                }
                
                output.innerHTML = `<span class="avin-terminal-info">Available commands:</span><br>${matches.join('  ')}`;
                this.terminalOutput.appendChild(output);
                this.scrollToBottom();
                
                // Re-show the prompt
                this.showCurrentPrompt();
            }
            
            handleArgumentCompletion(command, currentWord, words) {
                let suggestions = [];
                
                switch(command) {
                    case 'project':
                    case 'demo':
                    case 'code':
                        suggestions = ['portfolio-website', 'ai-chatbot', 'data-analyzer', 'mobile-app'];
                        break;
                    case 'weather':
                        suggestions = ['london', 'new-york', 'tokyo', 'paris', 'mumbai'];
                        break;
                    case 'cat':
                        suggestions = ['readme.txt', 'about.md', 'skills.json', 'projects.yml'];
                        break;
                    case 'showpic':
                    case 'delpic':
                        suggestions = ['1', '2', '3', '4', '5'];
                        break;
                    case 'news':
                        suggestions = ['tech', 'world', 'business', 'science', 'sports'];
                        break;
                }
                
                if (suggestions.length > 0) {
                    const matches = suggestions.filter(item => 
                        item.toLowerCase().startsWith(currentWord.toLowerCase())
                    );
                    
                    if (matches.length === 1) {
                        words[words.length - 1] = matches[0];
                        this.terminalInput.value = words.join(' ');
                        this.showCompletionFeedback(matches[0]);
                    } else if (matches.length > 1) {
                        this.showArgumentSuggestions(matches, currentWord);
                    }
                }
            }
            
            showArgumentSuggestions(matches, partial) {
                const output = document.createElement('div');
                output.className = 'avin-terminal-line avin-terminal-suggestion';
                output.innerHTML = `<span class="avin-terminal-info">Available options:</span><br>${matches.join('  ')}`;
                this.terminalOutput.appendChild(output);
                this.scrollToBottom();
                this.showCurrentPrompt();
            }
            
            showCompletionFeedback(completed) {
                // Brief visual feedback for successful completion
                this.terminalInput.style.backgroundColor = 'rgba(0, 232, 223, 0.1)';
                setTimeout(() => {
                    this.terminalInput.style.backgroundColor = '';
                }, 200);
            }
            
            showCurrentPrompt() {
                // Show current prompt after suggestions
                const promptLine = document.createElement('div');
                promptLine.className = 'avin-terminal-line';
                promptLine.innerHTML = `<span class="avin-terminal-command">${this.config.username}@${this.config.hostname}:~$</span> <span class="avin-terminal-input-preview">${this.terminalInput.value}</span>`;
                this.terminalOutput.appendChild(promptLine);
            }
            
            findCommonPrefix(strings) {
                if (strings.length === 0) return '';
                if (strings.length === 1) return strings[0];
                
                let prefix = strings[0];
                for (let i = 1; i < strings.length; i++) {
                    while (strings[i].indexOf(prefix) !== 0) {
                        prefix = prefix.substring(0, prefix.length - 1);
                        if (prefix === '') return '';
                    }
                }
                return prefix;
            }
            
            clearSuggestion() {
                this.currentSuggestion = '';
            }

            registerCommand(name, callback) {
                this.config.commands[name] = callback;
                // Add to available commands list for tab completion
                if (!this.availableCommands.includes(name)) {
                    this.availableCommands.push(name);
                }
            }
            
            // Handle cleanup
            destroy() {
                if (this.cleanupDraggable) {
                    this.cleanupDraggable();
                }
                
                window.removeEventListener('resize', this.adjustSize);
                window.removeEventListener('orientationchange', this.adjustSize);
                
                // Remove event listeners from buttons
                this.floatingBtn.removeEventListener('click', this.showTerminal);
                this.closeBtn.removeEventListener('click', this.hideTerminal);
                this.minimizeBtn.removeEventListener('click', this.hideTerminal);
                this.expandBtn.removeEventListener('click', this.toggleExpand);
            }
        }

        // 3D Earth Implementation
        class Earth3D {
            constructor(containerId) {
                this.container = document.getElementById(containerId);
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.earth = null;
                this.moon = null;
                this.satellites = [];
                this.moonOrbit = { angle: 0, radius: 200, speed: 0.015 };
                this.moonSpeed = 0.02; // Normal speed for real-time mode
                this.animationId = null;
                this.startTime = Date.now();
                
                this.init();
            }
            
            init() {
                if (!this.container) return;
                
                // Scene setup
                this.scene = new THREE.Scene();
                
                // Camera setup
                this.camera = new THREE.PerspectiveCamera(
                    75, 
                    this.container.offsetWidth / this.container.offsetHeight, 
                    0.1, 
                    1000
                );
                this.camera.position.z = 350;
                
                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({ 
                    canvas: document.getElementById('earth-canvas'),
                    alpha: true,
                    antialias: true 
                });
                this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
                this.renderer.setClearColor(0x000000, 0);
                
                this.createEarth();
                this.createMoon();
                this.createSatellites();
                this.addLights();
                this.animate();
                this.setupResize();
                this.setupScrollListener();
            }
            
            createEarth() {
                // Earth geometry
                const geometry = new THREE.SphereGeometry(110, 64, 64);
                
                // Create subtle transparent Earth material
                const material = new THREE.MeshPhongMaterial({
                    map: this.createEarthTexture(),
                    transparent: true,
                    opacity: 0.6,
                    emissive: 0x002a2a, // Subtle glow effect
                    shininess: 15
                });
                
                this.earth = new THREE.Mesh(geometry, material);
                this.scene.add(this.earth);
            }
            
            createMoon() {
                // Moon geometry (larger for better visibility)
                const moonGeometry = new THREE.SphereGeometry(30, 32, 32);
                
                // Create moon material with subtle texture
                const moonMaterial = new THREE.MeshPhongMaterial({
                    map: this.createMoonTexture(),
                    transparent: true,
                    opacity: 1.0, // Make fully opaque
                    emissive: 0x333333, // Brighter glow so it's more visible
                    shininess: 10
                });
                
                this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
                
                // Position moon initially
                this.updateMoonPosition();
                
                this.scene.add(this.moon);
            }
            
            createSatellites() {
                // Create 3 satellites with different orbits
                const satelliteCount = 3;
                
                for (let i = 0; i < satelliteCount; i++) {
                    const satellite = this.createSingleSatellite(i);
                    this.satellites.push(satellite);
                    this.scene.add(satellite.group);
                }
            }
            
            createSingleSatellite(index) {
                // Create satellite group to hold all parts
                const satelliteGroup = new THREE.Group();
                
                // Main satellite body (small box)
                const bodyGeometry = new THREE.BoxGeometry(3, 2, 4);
                const bodyMaterial = new THREE.MeshPhongMaterial({
                    color: 0x888888,
                    emissive: 0x222222
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                satelliteGroup.add(body);
                
                // Solar panels (flat rectangles)
                const panelGeometry = new THREE.PlaneGeometry(6, 2);
                const panelMaterial = new THREE.MeshPhongMaterial({
                    color: 0x1a1a2e,
                    emissive: 0x0f0f1f
                });
                
                const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
                leftPanel.position.set(-4.5, 0, 0);
                leftPanel.rotation.y = Math.PI / 2;
                satelliteGroup.add(leftPanel);
                
                const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
                rightPanel.position.set(4.5, 0, 0);
                rightPanel.rotation.y = Math.PI / 2;
                satelliteGroup.add(rightPanel);
                
                // Antenna (small cylinder)
                const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
                const antennaMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: 0x333333
                });
                const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
                antenna.position.set(0, 2, 0);
                satelliteGroup.add(antenna);
                
                // Blinking light (small sphere)
                const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                const lightMaterial = new THREE.MeshPhongMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    transparent: true,
                    opacity: 0.8
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(0, 1, 2);
                satelliteGroup.add(light);
                
                // Satellite orbital properties
                const orbitalRadius = 130 + (index * 15); // Different orbital distances
                const orbitalSpeed = 0.01 + (index * 0.003); // Different speeds
                const orbitalInclination = (index * 30) * (Math.PI / 180); // Different orbital planes
                
                return {
                    group: satelliteGroup,
                    body: body,
                    light: light,
                    lightMaterial: lightMaterial,
                    angle: Math.random() * Math.PI * 2, // Random starting position
                    radius: orbitalRadius,
                    speed: orbitalSpeed,
                    inclination: orbitalInclination,
                    blinkTimer: Math.random() * 1000, // Random blink timing
                    originalEmissive: 0xff0000
                };
            }
            
            createMoonTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                
                // Create moon surface (lighter gray/beige color)
                ctx.fillStyle = '#6b6b5a'; // More realistic moon color
                ctx.fillRect(0, 0, 256, 128);
                
                // Add maria (dark spots - lunar seas)
                ctx.fillStyle = '#4a4a3d';
                ctx.globalAlpha = 0.7;
                
                // Large maria spots
                ctx.beginPath();
                ctx.arc(80, 50, 25, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(180, 70, 20, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(120, 90, 18, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(200, 40, 15, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(40, 80, 12, 0, 2 * Math.PI);
                ctx.fill();
                
                // Large craters (darker than surface)
                ctx.fillStyle = '#555549';
                ctx.globalAlpha = 0.8;
                for (let i = 0; i < 12; i++) {
                    const x = Math.random() * 256;
                    const y = Math.random() * 128;
                    const radius = Math.random() * 10 + 4;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Add crater rim (lighter)
                    ctx.strokeStyle = '#757563';
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.6;
                    ctx.stroke();
                }
                
                // Medium craters
                ctx.fillStyle = '#4f4f43';
                ctx.globalAlpha = 0.6;
                for (let i = 0; i < 25; i++) {
                    const x = Math.random() * 256;
                    const y = Math.random() * 128;
                    const radius = Math.random() * 5 + 2;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                // Small craters
                ctx.fillStyle = '#3f3f35';
                ctx.globalAlpha = 0.5;
                for (let i = 0; i < 40; i++) {
                    const x = Math.random() * 256;
                    const y = Math.random() * 128;
                    const radius = Math.random() * 2 + 1;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                // Add highlands (lighter spots)
                ctx.fillStyle = '#7a7a67';
                ctx.globalAlpha = 0.4;
                for (let i = 0; i < 30; i++) {
                    const x = Math.random() * 256;
                    const y = Math.random() * 128;
                    const radius = Math.random() * 6 + 2;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                // Add some bright spots (recent impacts)
                ctx.fillStyle = '#8a8a75';
                ctx.globalAlpha = 0.3;
                for (let i = 0; i < 15; i++) {
                    const x = Math.random() * 256;
                    const y = Math.random() * 128;
                    const radius = Math.random() * 3 + 1;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                return texture;
            }
            
            updateMoonPosition() {
                if (this.moon) {
                    // Calculate moon position in diagonal orbit around Earth
                    const x = Math.cos(this.moonOrbit.angle) * this.moonOrbit.radius;
                    const z = Math.sin(this.moonOrbit.angle) * this.moonOrbit.radius * 0.8; // Flatten z for diagonal effect
                    const y = Math.sin(this.moonOrbit.angle * 0.5) * 50; // More pronounced diagonal movement
                    
                    this.moon.position.set(x, y, z);
                }
            }
            
            updateSatellitePositions() {
                const time = Date.now();
                
                this.satellites.forEach((satellite, index) => {
                    // Update orbital angle
                    satellite.angle += satellite.speed;
                    
                    // Calculate 3D orbital position with inclination
                    const x = Math.cos(satellite.angle) * satellite.radius;
                    const baseY = Math.sin(satellite.angle) * satellite.radius * Math.sin(satellite.inclination);
                    const z = Math.sin(satellite.angle) * satellite.radius * Math.cos(satellite.inclination);
                    
                    // Add slight vertical oscillation for more dynamic movement
                    const y = baseY + Math.sin(satellite.angle * 2) * 10;
                    
                    satellite.group.position.set(x, y, z);
                    
                    // Rotate satellite body slowly for realism
                    satellite.body.rotation.y += 0.002;
                    satellite.body.rotation.x += 0.001;
                    
                    // Update blinking light
                    satellite.blinkTimer += 16; // Roughly 60fps
                    const blinkCycle = 2000; // 2 second cycle
                    const blinkPhase = (satellite.blinkTimer % blinkCycle) / blinkCycle;
                    
                    if (blinkPhase < 0.1) { // Blink for 10% of cycle
                        satellite.lightMaterial.emissive.setHex(0xff0000); // Bright red
                        satellite.lightMaterial.opacity = 1.0;
                    } else if (blinkPhase < 0.2) { // Fade for next 10%
                        const fadeIntensity = (0.2 - blinkPhase) / 0.1;
                        const fadeColor = Math.floor(0xff * fadeIntensity);
                        satellite.lightMaterial.emissive.setHex((fadeColor << 16));
                        satellite.lightMaterial.opacity = 0.8 + (0.2 * fadeIntensity);
                    } else { // Off for remaining 80%
                        satellite.lightMaterial.emissive.setHex(0x330000); // Very dim red
                        satellite.lightMaterial.opacity = 0.3;
                    }
                });
            }
            
            createEarthTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                
                // Create darker but visible background (ocean)
                ctx.fillStyle = '#0a3a36';
                ctx.fillRect(0, 0, 512, 256);
                
                // Draw Asia continent in detail
                ctx.fillStyle = '#00e8df';
                ctx.globalAlpha = 0.4;
                
                // Draw all continents (smaller, more detailed, rough)
                this.drawContinents(ctx);
                
                // Draw visible but subtle grid lines over everything
                ctx.strokeStyle = '#00e8df';
                ctx.lineWidth = 0.6;
                ctx.globalAlpha = 0.25;
                
                // Vertical grid lines
                for (let x = 0; x <= 512; x += 30) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, 256);
                    ctx.stroke();
                }
                
                // Horizontal grid lines
                for (let y = 0; y <= 256; y += 30) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(512, y);
                    ctx.stroke();
                }
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                return texture;
            }
            
            drawContinents(ctx) {
                // Draw continents with improved geographic accuracy and better shapes
                
                // ASIA (improved shape and positioning)
                ctx.globalAlpha = 0.35;
                
                // Russia/Siberia (more accurate northern landmass)
                this.drawRoughShape(ctx, [
                    [320, 75], [350, 72], [380, 75], [410, 78], [435, 82], [455, 87], [470, 93],
                    [475, 100], [472, 107], [465, 112], [455, 115], [445, 117], [435, 118],
                    [425, 116], [420, 112], [415, 108], [410, 104], [405, 100], [400, 96],
                    [395, 93], [390, 91], [385, 89], [380, 87], [375, 86], [370, 85],
                    [365, 84], [360, 83], [355, 82], [350, 81], [345, 80], [340, 79],
                    [335, 78], [330, 77], [325, 76], [320, 75]
                ]);
                
                // China (more realistic eastern coastline)
                this.drawRoughShape(ctx, [
                    [390, 110], [400, 108], [410, 112], [415, 118], [418, 125], [420, 132],
                    [418, 140], [415, 147], [410, 152], [405, 155], [400, 157], [395, 158],
                    [390, 157], [385, 155], [382, 152], [380, 147], [382, 140], [385, 132],
                    [388, 125], [390, 118], [390, 110]
                ]);
                
                // India subcontinent (proper triangular peninsula)
                this.drawRoughShape(ctx, [
                    [350, 135], [355, 133], [360, 135], [365, 138], [370, 142], [373, 148],
                    [375, 155], [376, 162], [375, 170], [373, 177], [370, 183], [365, 188],
                    [360, 192], [355, 195], [350, 197], [345, 195], [340, 192], [335, 188],
                    [330, 183], [327, 177], [325, 170], [327, 162], [330, 155], [335, 148],
                    [340, 142], [345, 138], [350, 135]
                ]);
                
                // Central Asia connection
                this.drawRoughShape(ctx, [
                    [350, 100], [370, 98], [380, 102], [385, 108], [382, 115], [375, 120],
                    [368, 125], [360, 128], [355, 130], [350, 128], [345, 125], [342, 120],
                    [340, 115], [342, 108], [345, 102], [350, 100]
                ]);
                
                // Southeast Asia
                ctx.globalAlpha = 0.32;
                this.drawRoughShape(ctx, [[365, 175], [370, 173], [375, 176], [378, 180], [375, 184], [370, 186], [365, 184], [362, 180], [365, 175]]);
                
                // Japan islands (better positioned)
                this.drawRoughShape(ctx, [[435, 120], [438, 118], [440, 122], [438, 126], [435, 124]]); // Honshu
                this.drawRoughShape(ctx, [[437, 128], [440, 126], [442, 130], [440, 133], [437, 131]]); // Kyushu
                ctx.beginPath(); ctx.arc(434, 118, 1, 0, 2 * Math.PI); ctx.fill(); // Hokkaido
                ctx.beginPath(); ctx.arc(439, 124, 0.8, 0, 2 * Math.PI); ctx.fill(); // Shikoku
                
                // Korean Peninsula
                this.drawRoughShape(ctx, [
                    [425, 115], [427, 113], [429, 115], [430, 118], [431, 122], [430, 126],
                    [428, 128], [426, 126], [424, 122], [424, 118], [425, 115]
                ]);
                
                // Taiwan
                ctx.beginPath(); ctx.arc(415, 145, 0.8, 0, 2 * Math.PI); ctx.fill();
                
                // NORTH AMERICA (improved shape and positioning)
                ctx.globalAlpha = 0.33;
                this.drawRoughShape(ctx, [
                    // Alaska/Northern Canada
                    [25, 65], [40, 62], [55, 64], [70, 66], [85, 68], [100, 70], [115, 72],
                    [130, 74], [145, 76], [155, 80], [160, 85], [162, 92], [160, 98],
                    // Hudson Bay area
                    [157, 105], [154, 112], [150, 118], [146, 124], [142, 130], [138, 136],
                    // Eastern seaboard (more realistic)
                    [135, 142], [132, 148], [129, 154], [126, 160], [123, 166], [120, 172],
                    [117, 178], [114, 184], [110, 188],
                    // Gulf of Mexico
                    [105, 190], [100, 188], [95, 186], [90, 183], [85, 180], [80, 177],
                    [75, 174], [70, 170], [65, 166], [62, 162],
                    // California/Pacific coast
                    [60, 158], [58, 154], [56, 150], [54, 146], [52, 142], [50, 138],
                    [48, 134], [46, 130], [44, 126], [42, 122], [40, 118], [38, 114],
                    [36, 110], [34, 106], [32, 102], [30, 98], [28, 94], [27, 90],
                    [26, 86], [25, 82], [24, 78], [24, 74], [25, 70], [25, 65]
                ]);
                
                // Great Lakes (better positioned)
                ctx.globalAlpha = 0.2;
                ctx.beginPath(); ctx.arc(110, 105, 2, 0, 2 * Math.PI); ctx.fill(); // Superior
                ctx.beginPath(); ctx.arc(115, 107, 1.8, 0, 2 * Math.PI); ctx.fill(); // Michigan
                ctx.beginPath(); ctx.arc(118, 105, 1.5, 0, 2 * Math.PI); ctx.fill(); // Huron
                ctx.beginPath(); ctx.arc(120, 107, 1.2, 0, 2 * Math.PI); ctx.fill(); // Erie
                ctx.beginPath(); ctx.arc(122, 102, 1, 0, 2 * Math.PI); ctx.fill(); // Ontario
                
                // Florida (better shape)
                ctx.globalAlpha = 0.3;
                this.drawRoughShape(ctx, [
                    [115, 175], [117, 173], [119, 176], [120, 180], [119, 184], [118, 188],
                    [116, 192], [114, 195], [112, 192], [111, 188], [112, 184], [113, 180],
                    [114, 176], [115, 175]
                ]);
                
                // SOUTH AMERICA (much better shape)
                ctx.globalAlpha = 0.31;
                this.drawRoughShape(ctx, [
                    // Venezuela/Colombia/Guyana
                    [100, 200], [115, 198], [130, 200], [145, 202], [155, 205], [160, 210],
                    // Brazil's eastern bulge (more prominent)
                    [162, 215], [165, 220], [167, 225], [169, 230], [170, 235], [168, 240],
                    [165, 244], [160, 246], [155, 247], [150, 246], [145, 244],
                    // Southern cone (Chile/Argentina)
                    [142, 240], [140, 235], [138, 230], [136, 225], [134, 220], [132, 215],
                    [130, 210], [128, 205], [126, 201], [124, 197], [122, 194], [120, 192],
                    [115, 190], [110, 192], [105, 195], [102, 198], [100, 200]
                ]);
                
                // AFRICA (much more accurate shape)
                ctx.globalAlpha = 0.32;
                this.drawRoughShape(ctx, [
                    // North Africa (Mediterranean coast)
                    [210, 155], [225, 153], [240, 155], [255, 157], [270, 160], [280, 165],
                    [285, 170], [282, 175], [278, 180], [275, 185], [272, 190], [269, 195],
                    // Central Africa
                    [266, 200], [263, 205], [260, 210], [257, 215], [254, 220], [251, 224],
                    // Southern Africa (narrower)
                    [248, 227], [245, 229], [240, 230], [235, 229], [230, 227], [225, 224],
                    [220, 220], [217, 215], [214, 210], [211, 205], [208, 200], [205, 195],
                    [202, 190], [199, 185], [196, 180], [198, 175], [201, 170], [204, 165],
                    [207, 160], [210, 157], [210, 155]
                ]);
                
                // Madagascar
                ctx.beginPath(); ctx.arc(285, 215, 1.5, 0, 2 * Math.PI); ctx.fill();
                
                // EUROPE (better proportions)
                ctx.globalAlpha = 0.3;
                
                // Scandinavia (Norway, Sweden, Finland)
                this.drawRoughShape(ctx, [
                    [225, 70], [235, 68], [245, 70], [252, 74], [255, 80], [252, 86],
                    [245, 88], [235, 86], [225, 83], [222, 77], [225, 70]
                ]);
                
                // Main Europe
                this.drawRoughShape(ctx, [
                    [200, 90], [220, 88], [240, 90], [260, 92], [275, 95], [285, 100],
                    [288, 107], [285, 114], [280, 119], [275, 122], [270, 124], [265, 122],
                    [260, 119], [255, 116], [250, 114], [245, 112], [240, 110], [235, 108],
                    [230, 106], [225, 104], [220, 102], [215, 100], [210, 98], [205, 96],
                    [200, 94], [200, 90]
                ]);
                
                // UK and Ireland (better positioned)
                ctx.beginPath(); ctx.arc(190, 88, 1.8, 0, 2 * Math.PI); ctx.fill(); // Great Britain
                ctx.beginPath(); ctx.arc(185, 90, 1.2, 0, 2 * Math.PI); ctx.fill(); // Ireland
                
                // AUSTRALIA (better shape and position)
                ctx.globalAlpha = 0.3;
                this.drawRoughShape(ctx, [
                    [420, 220], [435, 218], [450, 220], [460, 225], [465, 230], [462, 235],
                    [458, 238], [450, 240], [440, 238], [430, 235], [425, 230], [422, 225],
                    [420, 220]
                ]);
                
                // New Zealand
                ctx.beginPath(); ctx.arc(475, 245, 1, 0, 2 * Math.PI); ctx.fill();
                ctx.beginPath(); ctx.arc(477, 248, 0.8, 0, 2 * Math.PI); ctx.fill();
                
                // ANTARCTICA (more realistic ice shelf)
                ctx.globalAlpha = 0.25;
                this.drawRoughShape(ctx, [
                    [20, 250], [120, 248], [220, 250], [320, 248], [420, 250], [480, 251],
                    [480, 256], [420, 256], [320, 256], [220, 256], [120, 256], [20, 256], [20, 250]
                ]);
                
                // Add realistic texture
                ctx.globalAlpha = 0.12;
                for (let i = 0; i < 100; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 256;
                    const size = Math.random() * 0.8 + 0.2;
                    
                    // More precise continent boundaries
                    if ((x > 20 && x < 165 && y > 60 && y < 200) || // North America
                        (x > 95 && x < 175 && y > 195 && y < 250) || // South America
                        (x > 180 && x < 290 && y > 65 && y < 130) || // Europe
                        (x > 195 && x < 290 && y > 150 && y < 235) || // Africa
                        (x > 315 && x < 480 && y > 70 && y < 200) || // Asia
                        (x > 415 && x < 470 && y > 215 && y < 245)) { // Australia
                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
            }
            
            drawRoughShape(ctx, points) {
                if (points.length < 3) return;
                
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                
                // Add roughness to edges
                for (let i = 1; i < points.length; i++) {
                    const [x, y] = points[i];
                    // Add small random variations for rough coastlines
                    const roughX = x + (Math.random() - 0.5) * 2;
                    const roughY = y + (Math.random() - 0.5) * 2;
                    ctx.lineTo(roughX, roughY);
                }
                
                ctx.closePath();
                ctx.fill();
            }
            
            addLights() {
                // Very subtle ambient lighting
                const ambientLight = new THREE.AmbientLight(0x00e8df, 0.2);
                this.scene.add(ambientLight);
                
                // Subtle directional light
                const directionalLight = new THREE.DirectionalLight(0x00e8df, 0.4);
                directionalLight.position.set(200, 200, 200);
                this.scene.add(directionalLight);
                
                // Very soft rim light for shape definition
                const rimLight = new THREE.DirectionalLight(0xffffff, 0.1);
                rimLight.position.set(-200, -200, -200);
                this.scene.add(rimLight);
            }
            
            animate() {
                this.animationId = requestAnimationFrame(() => this.animate());
                
                // Calculate realtime rotations based on current time
                this.updateRealtimeRotations();
                
                // Update satellites
                this.updateSatellitePositions();
                
                this.renderer.render(this.scene, this.camera);
            }
            
            updateRealtimeRotations() {
                const now = Date.now();
                const currentDate = new Date(now);
                
                if (this.earth) {
                    // Earth rotation: 24 hours = 1 full rotation
                    // Calculate current time in day as percentage
                    const hours = currentDate.getHours();
                    const minutes = currentDate.getMinutes();
                    const seconds = currentDate.getSeconds();
                    const milliseconds = currentDate.getMilliseconds();
                    
                    // Total time in day as fraction (0 to 1)
                    const timeInDay = (hours * 3600 + minutes * 60 + seconds + milliseconds / 1000) / 86400;
                    
                    // Earth rotates once per day, so rotation = timeInDay * 2π
                    // Adding π to account for longitude 0 being at Greenwich (roughly opposite side)
                    this.earth.rotation.y = (timeInDay * Math.PI * 2) + Math.PI;
                }
                
                if (this.moon) {
                    // Check if we have a manual moon speed override (for easter egg)
                    if (this.moonSpeed && this.moonSpeed !== 0.02) {
                        // Manual animation mode - increment angle based on moonSpeed
                        this.moonOrbit.angle += this.moonSpeed;
                        if (this.moonOrbit.angle > Math.PI * 2) {
                            this.moonOrbit.angle -= Math.PI * 2;
                        }
                    } else {
                        // Real-time mode based on actual lunar cycle
                        // Moon orbit: 29.5 days = 1 full orbit (lunar month)
                        // Moon rotation: 29.5 days = 1 full rotation (tidal locking)
                        
                        // Get days since January 1, 1970 (epoch)
                        const daysSinceEpoch = now / (1000 * 60 * 60 * 24);
                        
                        // Lunar cycle is approximately 29.530588853 days
                        const lunarCycleDays = 29.530588853;
                        
                        // Calculate position in lunar cycle (0 to 1)
                        const lunarCyclePosition = (daysSinceEpoch % lunarCycleDays) / lunarCycleDays;
                        
                        // Set moon orbital position
                        this.moonOrbit.angle = lunarCyclePosition * Math.PI * 2;
                    }
                    
                    this.updateMoonPosition();
                    
                    // Moon rotation matches orbit (tidal locking)
                    // Moon always shows same face to Earth
                    this.moon.rotation.y = -this.moonOrbit.angle;
                }
            }
            
            setupResize() {
                window.addEventListener('resize', () => {
                    if (this.container && this.camera && this.renderer) {
                        const width = this.container.offsetWidth;
                        const height = this.container.offsetHeight;
                        
                        this.camera.aspect = width / height;
                        this.camera.updateProjectionMatrix();
                        this.renderer.setSize(width, height);
                    }
                });
            }
            
            setupScrollListener() {
                let ticking = false;
                
                const updateEarthPosition = () => {
                    const scrollY = window.scrollY;
                    const threshold = 150; // Start shrinking after 150px scroll
                    const maxScroll = 300; // Complete transition by 300px
                    
                    if (scrollY > threshold) {
                        this.container.classList.add('scrolled');
                        
                        // Calculate scroll progress for contrast adjustment
                        const scrollProgress = Math.min((scrollY - threshold) / (maxScroll - threshold), 1);
                        this.adjustContrastForScroll(scrollProgress);
                    } else {
                        this.container.classList.remove('scrolled');
                        this.adjustContrastForScroll(0);
                    }
                    
                    ticking = false;
                };
                
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateEarthPosition);
                        ticking = true;
                    }
                });
            }
            
            adjustContrastForScroll(progress) {
                if (this.renderer) {
                    // Minimal brightness increase
                    const brightness = 1 + (progress * 0.15); // Very subtle brightness increase
                    
                    if (progress > 0) {
                        this.renderer.domElement.style.filter = `brightness(${brightness})`;
                    } else {
                        this.renderer.domElement.style.filter = 'none';
                    }
                }
                
                // Adjust Earth and Moon materials while preserving theme colors
                if (this.earth && this.moon) {
                    const earthMaterial = this.earth.material;
                    const moonMaterial = this.moon.material;
                    
                    if (progress > 0) {
                        // Moderate opacity increase for visibility
                        earthMaterial.opacity = Math.min(0.6 + (progress * 0.25), 0.85);
                        
                        // Keep exact theme color, just adjust intensity
                        // Original: #002a2a (dark cyan)
                        // Theme color: #00e8df (bright cyan)
                        const originalCyan = 0x002a2a;
                        const themeCyan = 0x00e8df;
                        
                        // Interpolate between original and theme color based on progress
                        const r1 = (originalCyan >> 16) & 0xff;
                        const g1 = (originalCyan >> 8) & 0xff;
                        const b1 = originalCyan & 0xff;
                        
                        const r2 = (themeCyan >> 16) & 0xff;
                        const g2 = (themeCyan >> 8) & 0xff;
                        const b2 = themeCyan & 0xff;
                        
                        const mixFactor = progress * 0.3; // Very subtle mixing
                        const finalR = Math.floor(r1 + (r2 - r1) * mixFactor);
                        const finalG = Math.floor(g1 + (g2 - g1) * mixFactor);
                        const finalB = Math.floor(b1 + (b2 - b1) * mixFactor);
                        
                        const finalColor = (finalR << 16) | (finalG << 8) | finalB;
                        earthMaterial.emissive.setHex(finalColor);
                        
                        moonMaterial.opacity = 1.0;
                        // Very subtle moon brightness increase
                        const brightGray = Math.floor(0x33 + (progress * 0x11)); // Smaller increase
                        const moonColor = (brightGray << 16) | (brightGray << 8) | brightGray;
                        moonMaterial.emissive.setHex(moonColor);
                        
                    } else {
                        // Original values for large view
                        earthMaterial.opacity = 0.6;
                        earthMaterial.emissive.setHex(0x002a2a); // Original dim cyan
                        
                        moonMaterial.opacity = 1.0;
                        moonMaterial.emissive.setHex(0x333333); // Original gray
                    }
                }
            }
            
            destroy() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
                if (this.renderer) {
                    this.renderer.dispose();
                }
            }
        }

        // Free News APIs - no authentication required
        const HACKER_NEWS_API = 'https://hacker-news.firebaseio.com/v0';
        const DEV_TO_API = 'https://dev.to/api/articles';
        const REDDIT_API = 'https://www.reddit.com/r';
        
        // News helper functions with real API integration
        async function fetchRealNews(category) {
            try {
                if (category === 'tech') {
                    return await fetchHackerNews();
                } else {
                    return await fetchRSSNews(category);
                }
            } catch (error) {
                console.error('News API Error:', error);
                throw new Error('Failed to fetch news from API');
            }
        }

        async function fetchHackerNews() {
            // Get top stories from Hacker News
            const topStoriesResponse = await fetch(`${HACKER_NEWS_API}/topstories.json`);
            const storyIds = await topStoriesResponse.json();
            
            // Get first 5 stories
            const stories = await Promise.all(
                storyIds.slice(0, 5).map(async id => {
                    const storyResponse = await fetch(`${HACKER_NEWS_API}/item/${id}.json`);
                    return storyResponse.json();
                })
            );
            
            return stories
                .filter(story => story && story.title && !story.deleted)
                .map(story => ({
                    title: story.title,
                    source: 'Hacker News',
                    time: formatPublishedTime(new Date(story.time * 1000).toISOString()),
                    description: `Score: ${story.score || 0} points | Comments: ${story.descendants || 0}`,
                    url: story.url || `https://news.ycombinator.com/item?id=${story.id}`
                }));
        }

        async function fetchRSSNews(category) {
            // Only use working APIs - no fake news
            if (category === 'tech') {
                return await fetchDevToNews();
            } else {
                throw new Error(`${category} news not available - only tech news supported currently`);
            }
        }

        async function fetchDevToNews() {
            try {
                const response = await fetch(`${DEV_TO_API}?per_page=5&top=1`);
                
                if (!response.ok) {
                    throw new Error(`Dev.to API Error: ${response.status}`);
                }
                
                const articles = await response.json();
                
                return articles.map(article => ({
                    title: article.title,
                    source: 'Dev.to',
                    time: formatPublishedTime(article.published_at),
                    description: `${article.positive_reactions_count} reactions | ${article.comments_count} comments`,
                    url: article.url
                }));
            } catch (error) {
                console.warn('Dev.to API failed:', error);
                throw error;
            }
        }

        
        function formatPublishedTime(publishedAt) {
            const publishedDate = new Date(publishedAt);
            const now = new Date();
            const diffMs = now - publishedDate;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));
            
            if (diffHours < 1) {
                return `${diffMins} minutes ago`;
            } else if (diffHours < 24) {
                return `${diffHours} hours ago`;
            } else {
                const diffDays = Math.floor(diffHours / 24);
                return `${diffDays} days ago`;
            }
        }
        
        
        function formatNewsOutput(newsData, category) {
            const categoryEmojis = {
                tech: '💻', world: '🌍', business: '💼',
                science: '🔬', sports: '⚽', general: '📰'
            };
            
            const emoji = categoryEmojis[category] || '📰';
            const header = `<span class="avin-terminal-info">${emoji} ${category.toUpperCase()} NEWS</span>`;
            const separator = '<span style="color: #666;">'.padEnd(60, '─') + '</span>';
            
            let output = header + '<br>' + separator + '<br><br>';
            
            newsData.forEach((article, index) => {
                output += `<span class="avin-terminal-success">[${index + 1}]</span> `;
                output += `<span style="color: #fff; font-weight: bold;">${article.title}</span><br>`;
                output += `<span style="color: #888;">    📅 ${article.time} • 📄 ${article.source}</span><br><br>`;
            });
            
            output += `<span style="color: #666;">${separator}</span><br>`;
            output += `<span class="avin-terminal-info">💡 Usage: news [category] - Available: tech, world, business, science, sports</span>`;
            
            return output;
        }

        // Initialize 3D Earth and Terminal
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize 3D Earth
            const earth = new Earth3D('earth-container');
            window.earth3D = earth;
            window.terminalImageStorage = window.terminalImageStorage || [];
            const customCommands = {
    hello: () => 'Hello, World!',
    date: () => new Date().toString(),
    sum: (args) => {
        const numbers = args.map(Number);
        if (numbers.some(isNaN)) {
            return 'Error: All arguments must be numbers';
        }
        return `Sum: ${numbers.reduce((a, b) => a + b, 0)}`;
    },
    news: async (args) => {
        const category = args[0] || 'general';
        const loadingMsg = `<span class="avin-terminal-info">📰 Fetching ${category} news...</span>`;
        
        // Show loading message immediately
        setTimeout(() => {
            const output = document.querySelector('.avin-terminal-output .avin-terminal-line:last-child');
            if (output) output.innerHTML = loadingMsg;
        }, 100);
        
        try {
            // Fetch real news from NewsAPI
            const newsData = await fetchRealNews(category);
            return formatNewsOutput(newsData, category);
        } catch (error) {
            return `<span class="avin-terminal-error">Error fetching news: ${error.message}</span>`;
        }
    },
    takepic: async () => {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    facingMode: 'user' // Use front camera by default
                } 
            });
            
            // Create video element to capture frame
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
            
            // Wait a moment for the camera to adjust
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create canvas to capture the frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0);
            
            // Convert to data URL
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            // Stop the camera stream
            stream.getTracks().forEach(track => track.stop());
            
            // Store image with timestamp
            const timestamp = new Date().toISOString();
            const imageData = {
                id: Date.now(),
                dataURL: dataURL,
                timestamp: timestamp,
                filename: `pic_${Date.now()}.jpg`
            };
            
            window.terminalImageStorage.push(imageData);
            
            return `📸 Picture captured successfully!
Filename: ${imageData.filename}
Timestamp: ${timestamp}
Total images stored: ${window.terminalImageStorage.length}
Use 'showpics' to view all images or 'showpic ${imageData.id}' to view this specific image.`;
            
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                return '❌ Camera access denied. Please allow camera permissions and try again.';
            } else if (error.name === 'NotFoundError') {
                return '❌ No camera found on this device.';
            } else if (error.name === 'NotSupportedError') {
                return '❌ Camera not supported in this browser.';
            } else {
                return `❌ Error taking picture: ${error.message}`;
            }
        }
    },
    takepic_rear: async () => {
        try {
            // Request rear camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    facingMode: 'environment' // Use rear camera
                } 
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            ctx.drawImage(video, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            stream.getTracks().forEach(track => track.stop());
            
            const timestamp = new Date().toISOString();
            const imageData = {
                id: Date.now(),
                dataURL: dataURL,
                timestamp: timestamp,
                filename: `pic_rear_${Date.now()}.jpg`
            };
            
            window.terminalImageStorage.push(imageData);
            
            return `📸 Rear camera picture captured successfully!
Filename: ${imageData.filename}
Timestamp: ${timestamp}
Total images stored: ${window.terminalImageStorage.length}`;
            
        } catch (error) {
            return `❌ Error taking rear camera picture: ${error.message}`;
        }
    },
    showpics: () => {
        if (!window.terminalImageStorage || window.terminalImageStorage.length === 0) {
            return '📁 No images stored. Use "takepic" to capture your first image!';
        }
        
        let output = `<div class="portfolio-section">
<h3>📸 Stored Images (${window.terminalImageStorage.length})</h3>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">`;
        
        window.terminalImageStorage.forEach((image, index) => {
            output += `
<div style="border: 1px solid #00e8df; border-radius: 8px; padding: 10px; background: rgba(0, 232, 223, 0.1);">
    <div style="text-align: center; margin-bottom: 8px;">
        <img src="${image.dataURL}" alt="${image.filename}" 
             style="width: 100%; max-width: 180px; height: auto; border-radius: 4px; cursor: pointer;"
             onclick="window.open('${image.dataURL}', '_blank')">
    </div>
    <div style="font-size: 11px; color: #a0a0a0;">
        <div><strong>ID:</strong> ${image.id}</div>
        <div><strong>File:</strong> ${image.filename}</div>
        <div><strong>Time:</strong> ${new Date(image.timestamp).toLocaleString()}</div>
    </div>
    <div style="margin-top: 8px; text-align: center;">
        <button onclick="navigator.clipboard.writeText('${image.dataURL}')" 
                style="background: rgba(0, 232, 223, 0.2); border: 1px solid #00e8df; color: #00e8df; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">
            Copy URL
        </button>
        <button onclick="window.terminalImageStorage = window.terminalImageStorage.filter(img => img.id !== ${image.id}); window.terminal.appendOutput('🗑️ Image ${image.id} deleted', 'avin-terminal-success');" 
                style="background: rgba(255, 95, 86, 0.2); border: 1px solid #ff5f56; color: #ff5f56; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; margin-left: 4px;">
            Delete
        </button>
    </div>
</div>`;
        });
        
        output += `</div>
<div style="margin-top: 15px; font-size: 12px; color: #a0a0a0;">
💡 <strong>Tips:</strong><br>
• Click on any image to view full size<br>
• Use "showpic [id]" to view a specific image<br>
• Use "delpic [id]" to delete a specific image<br>
• Use "clearpics" to delete all images<br>
• Images are stored in memory and will be lost when page refreshes
</div>
</div>`;
        
        return output;
    },
    showpic: (args) => {
        if (args.length === 0) {
            return '❌ Usage: showpic [image_id]';
        }
        
        const imageId = parseInt(args[0]);
        const image = window.terminalImageStorage.find(img => img.id === imageId);
        
        if (!image) {
            return `❌ Image with ID ${imageId} not found. Use "showpics" to see all available images.`;
        }
        
        return `<div class="portfolio-section">
<h3>📸 Image Details</h3>
<div style="text-align: center; margin: 15px 0;">
    <img src="${image.dataURL}" alt="${image.filename}" 
         style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #00e8df;"
         onclick="window.open('${image.dataURL}', '_blank')">
</div>
<div style="background: rgba(0, 232, 223, 0.1); padding: 10px; border-radius: 8px;">
    <p><strong>ID:</strong> ${image.id}</p>
    <p><strong>Filename:</strong> ${image.filename}</p>
    <p><strong>Timestamp:</strong> ${new Date(image.timestamp).toLocaleString()}</p>
    <p><strong>Size:</strong> ${(image.dataURL.length * 0.75 / 1024).toFixed(2)} KB (estimated)</p>
</div>
<div style="margin-top: 10px; text-align: center;">
    <button onclick="navigator.clipboard.writeText('${image.dataURL}')" 
            style="background: rgba(0, 232, 223, 0.2); border: 1px solid #00e8df; color: #00e8df; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 0 5px;">
        📋 Copy Image URL
    </button>
    <button onclick="const a = document.createElement('a'); a.href = '${image.dataURL}'; a.download = '${image.filename}'; a.click();" 
            style="background: rgba(0, 232, 223, 0.2); border: 1px solid #00e8df; color: #00e8df; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 0 5px;">
        💾 Download
    </button>
</div>
</div>`;
    },
    delpic: (args) => {
        if (args.length === 0) {
            return '❌ Usage: delpic [image_id]';
        }
        
        const imageId = parseInt(args[0]);
        const imageIndex = window.terminalImageStorage.findIndex(img => img.id === imageId);
        
        if (imageIndex === -1) {
            return `❌ Image with ID ${imageId} not found.`;
        }
        
        const deletedImage = window.terminalImageStorage.splice(imageIndex, 1)[0];
        return `🗑️ Image deleted successfully!
Filename: ${deletedImage.filename}
Remaining images: ${window.terminalImageStorage.length}`;
    },
    clearpics: () => {
        const count = window.terminalImageStorage.length;
        window.terminalImageStorage = [];
        return `🗑️ All images cleared! Deleted ${count} image(s).`;
    },
    camera_info: async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length === 0) {
                return '❌ No camera devices found on this system.';
            }
            
            let output = `<div class="portfolio-section">
<h3>📹 Camera Information</h3>
<p><strong>Available cameras:</strong> ${videoDevices.length}</p>
<ul>`;
            
            videoDevices.forEach((device, index) => {
                output += `<li><strong>Camera ${index + 1}:</strong> ${device.label || 'Unknown Camera'} (ID: ${device.deviceId.substring(0, 20)}...)</li>`;
            });
            
            output += `</ul>
<p><strong>Commands:</strong></p>
<ul>
    <li><code>takepic</code> - Take picture with front camera</li>
    <li><code>takepic_rear</code> - Take picture with rear camera</li>
    <li><code>showpics</code> - View all stored images</li>
    <li><code>showpic [id]</code> - View specific image</li>
    <li><code>delpic [id]</code> - Delete specific image</li>
    <li><code>clearpics</code> - Delete all images</li>
</ul>
</div>`;
            
            return output;
        } catch (error) {
            return `❌ Error getting camera info: ${error.message}`;
        }
    },
    weather: async (args) => {
        try {
            // Using the public OpenWeatherMap API with a location
            const city = args.length > 0 ? args.join(' ') : 'Bengaluru';
           
        // Using the public OpenWeatherMap API with the specified location
             const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=9416df0ba5bd1c598d17705d1df296f4`);
       

            
            const data = await response.json(); 
          
            const temp = Math.round(data.main.temp);
            const conditions = data.weather[0].main;
            const humidity = data.main.humidity;
            const wind = Math.round(data.wind.speed);
            
            // Weather icon mapping
            const weatherIcons = {
                'Clear': '☀️',
                'Clouds': '☁️',
                'Rain': '🌧️',
                'Drizzle': '🌦️',
                'Thunderstorm': '⛈️',
                'Snow': '❄️',
                'Mist': '🌫️',
                'Fog': '🌫️'
            };
            
            const icon = weatherIcons[conditions] || '🌡️';
            
            return `Current weather in ${data.name}: ${icon} ${temp}°C - ${conditions}
Humidity: ${humidity}%
Wind: ${wind} km/h`;
        } catch (error) {
            console.error('Weather API error:', error);
            return 'Weather service currently unavailable. Please try again later.';
        }
    },
  device: () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const orientation = width > height ? 'landscape' : 'portrait';
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        return `Screen: ${width}x${height}
Orientation: ${orientation}
Device type: ${isMobile ? 'Mobile' : 'Desktop'}
User agent: ${userAgent}`;
    },
    sysinfo: () => {
        // Get comprehensive system information
        const nav = navigator;
        const screen = window.screen;
        const perf = performance;
        
        // Device Detection
        const userAgent = nav.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android.*Tablet|Windows.*Touch/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        // Browser Detection
        const isChrome = /Chrome/i.test(userAgent) && /Google Inc/i.test(nav.vendor);
        const isFirefox = /Firefox/i.test(userAgent);
        const isSafari = /Safari/i.test(userAgent) && /Apple Computer/i.test(nav.vendor);
        const isEdge = /Edg/i.test(userAgent);
        
        // Operating System Detection
        let os = 'Unknown';
        if (/Windows NT 10.0/i.test(userAgent)) os = 'Windows 10/11';
        else if (/Windows NT 6.3/i.test(userAgent)) os = 'Windows 8.1';
        else if (/Windows NT 6.2/i.test(userAgent)) os = 'Windows 8';
        else if (/Windows NT 6.1/i.test(userAgent)) os = 'Windows 7';
        else if (/Windows/i.test(userAgent)) os = 'Windows';
        else if (/Mac OS X 10[._](\d+)/i.test(userAgent)) {
            const version = userAgent.match(/Mac OS X 10[._](\d+)/i)[1];
            os = `macOS 10.${version}`;
        }
        else if (/Mac/i.test(userAgent)) os = 'macOS';
        else if (/X11/i.test(userAgent)) os = 'UNIX';
        else if (/Linux/i.test(userAgent)) os = 'Linux';
        else if (/Android/i.test(userAgent)) os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
        
        // Screen Information
        const screenInfo = {
            resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait',
            devicePixelRatio: window.devicePixelRatio || 1
        };
        
        // Connection Information
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        let connectionInfo = 'Unknown';
        if (connection) {
            connectionInfo = `${connection.effectiveType || 'Unknown'} (${connection.downlink || 'Unknown'}Mbps)`;
        }
        
        // Memory Information (if available)
        let memoryInfo = 'Not available';
        if (nav.deviceMemory) {
            memoryInfo = `${nav.deviceMemory} GB`;
        }
        
        // CPU Information (if available)
        let cpuInfo = 'Not available';
        if (nav.hardwareConcurrency) {
            cpuInfo = `${nav.hardwareConcurrency} cores`;
        }
        
        // Battery Information (if available)
        let batteryInfo = 'Not available';
        if (nav.getBattery) {
            nav.getBattery().then(battery => {
                batteryInfo = `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Not charging'})`;
            });
        }
        
        // Language and Locale
        const language = nav.language || nav.userLanguage;
        const languages = nav.languages ? nav.languages.join(', ') : language;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Browser Features
        const features = {
            cookies: nav.cookieEnabled,
            javaEnabled: nav.javaEnabled ? nav.javaEnabled() : false,
            onLine: nav.onLine,
            doNotTrack: nav.doNotTrack,
            webGL: !!window.WebGLRenderingContext,
            localStorage: typeof Storage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            indexedDB: !!window.indexedDB,
            webWorkers: typeof Worker !== 'undefined',
            serviceWorkers: 'serviceWorker' in nav,
            geolocation: 'geolocation' in nav,
            notifications: 'Notification' in window,
            webRTC: !!(nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia)
        };
        
        // Performance Information
        const now = Date.now();
        const loadTime = perf.timing ? Math.round(perf.timing.loadEventEnd - perf.timing.navigationStart) : 'Unknown';
        const uptime = Math.round((now - perf.timing.navigationStart) / 1000);
        
        // GPU Information (basic)
        let gpuInfo = 'Not available';
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (e) {
            // GPU info not available
        }
        
        return `<div class="portfolio-section">
<h3>🖥️ System Information</h3>

<strong>📱 Device Information:</strong>
• Type: ${isMobile ? '📱 Mobile' : isTablet ? '📱 Tablet' : '🖥️ Desktop'}
• Operating System: ${os}
• User Agent: ${userAgent}

<strong>🌐 Browser Information:</strong>
• Browser: ${isChrome ? 'Google Chrome' : isFirefox ? 'Mozilla Firefox' : isSafari ? 'Safari' : isEdge ? 'Microsoft Edge' : 'Unknown'}
• Version: ${nav.appVersion}
• Platform: ${nav.platform}
• Vendor: ${nav.vendor || 'Unknown'}

<strong>📺 Display Information:</strong>
• Screen Resolution: ${screenInfo.resolution}
• Viewport Size: ${screenInfo.viewport}
• Orientation: ${screenInfo.orientation}
• Color Depth: ${screenInfo.colorDepth} bit
• Pixel Depth: ${screenInfo.pixelDepth} bit
• Device Pixel Ratio: ${screenInfo.devicePixelRatio}x

<strong>⚡ Hardware Information:</strong>
• CPU Cores: ${cpuInfo}
• Device Memory: ${memoryInfo}
• GPU: ${gpuInfo}
• Battery: ${batteryInfo}

<strong>🌍 Locale & Network:</strong>
• Language: ${language}
• Languages: ${languages}
• Timezone: ${timezone}
• Online Status: ${nav.onLine ? '🟢 Online' : '🔴 Offline'}
• Connection: ${connectionInfo}

<strong>🔧 Browser Features:</strong>
• Cookies Enabled: ${features.cookies ? '✅' : '❌'}
• Java Enabled: ${features.javaEnabled ? '✅' : '❌'}
• Do Not Track: ${features.doNotTrack ? '✅' : '❌'}
• WebGL Support: ${features.webGL ? '✅' : '❌'}
• Local Storage: ${features.localStorage ? '✅' : '❌'}
• Session Storage: ${features.sessionStorage ? '✅' : '❌'}
• IndexedDB: ${features.indexedDB ? '✅' : '❌'}
• Web Workers: ${features.webWorkers ? '✅' : '❌'}
• Service Workers: ${features.serviceWorkers ? '✅' : '❌'}
• Geolocation: ${features.geolocation ? '✅' : '❌'}
• Notifications: ${features.notifications ? '✅' : '❌'}
• WebRTC: ${features.webRTC ? '✅' : '❌'}

<strong>⏱️ Performance:</strong>
• Page Load Time: ${loadTime}ms
• Session Uptime: ${uptime}s
• Current Time: ${new Date().toLocaleString()}

<strong>💾 Storage Information:</strong>
• Local Storage: ${features.localStorage ? 'Available' : 'Not Available'}
• Session Storage: ${features.sessionStorage ? 'Available' : 'Not Available'}
• IndexedDB: ${features.indexedDB ? 'Available' : 'Not Available'}

</div>`;
    },
    time: () => {
        const now = new Date();
        return `Current time: ${now.toLocaleTimeString()}`;
    },
    
    // Easter Egg Commands 🥚
    matrix: () => {
        setTimeout(() => {
            const terminalContainer = document.querySelector('.avin-terminal-container');
            terminalContainer.classList.add('matrix-effect');
            setTimeout(() => {
                terminalContainer.classList.remove('matrix-effect');
            }, 5000);
        }, 100);
        return `<span class="avin-terminal-success">Welcome to the Matrix... 🔴💊</span>`;
    },
    
    konami: () => {
        return `<span class="avin-terminal-success">🎮 ↑↑↓↓←→←→BA - 30 Lives! (Classic cheat code activated)</span>`;
    },
    
    hacker: () => {
        setTimeout(() => {
            const lines = [
                'ACCESSING MAINFRAME...',
                'BYPASSING FIREWALL...',
                'DECRYPTING DATA...',
                'HACK SUCCESSFUL! 😎'
            ];
            let i = 0;
            const interval = setInterval(() => {
                if (i < lines.length) {
                    const output = document.createElement('div');
                    output.className = 'avin-terminal-line';
                    output.innerHTML = `<span style="color: #00ff00;">${lines[i]}</span>`;
                    document.querySelector('.avin-terminal-output').appendChild(output);
                    document.querySelector('.avin-terminal-content').scrollTop = 
                        document.querySelector('.avin-terminal-content').scrollHeight;
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 800);
        }, 100);
        return `<span class="avin-terminal-info">Initiating hacker sequence... 💻</span>`;
    },
    
    dance: () => {
        const danceEmojis = ['💃', '🕺', '🎶', '✨', '🌟', '🎉'];
        let danceText = '';
        for (let i = 0; i < 20; i++) {
            danceText += danceEmojis[Math.floor(Math.random() * danceEmojis.length)] + ' ';
        }
        setTimeout(() => {
            document.body.style.animation = 'rainbow-bg 3s infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 3000);
        }, 100);
        return `<span class="avin-terminal-success">🎵 ${danceText} 🎵</span>`;
    },
    
    rocket: () => {
        setTimeout(() => {
            const rocket = document.createElement('div');
            rocket.style.cssText = `
                position: fixed;
                bottom: -50px;
                left: 50%;
                font-size: 30px;
                z-index: 10000;
                transition: all 3s ease-out;
                transform: translateX(-50%);
            `;
            rocket.innerHTML = '🚀';
            document.body.appendChild(rocket);
            
            setTimeout(() => {
                rocket.style.bottom = '110%';
                rocket.style.transform = 'translateX(-50%) rotate(45deg)';
            }, 100);
            
            setTimeout(() => {
                document.body.removeChild(rocket);
            }, 3100);
        }, 100);
        return `<span class="avin-terminal-success">🚀 Launching rocket to space! Watch the sky!</span>`;
    },
    
    coffee: () => {
        const coffeeArt = `
        <pre style="color: #8B4513; font-family: monospace;">
        (  )   (   )  )
         ) (   )  (  (
         ( )  (    ) )
         _____________
        <_____________> ___
        |             |/ _ \\
        |    COFFEE   | | |  ☕
        |_____________|\\___/
        </pre>`;
        return `<span class="avin-terminal-info">Brewing the perfect cup... ☕</span>${coffeeArt}`;
    },
    
    unicorn: () => {
        return `<span class="avin-terminal-success">🦄✨🌈 A wild unicorn appears! 🌈✨🦄</span><br>
                <span style="color: #ff69b4;">    /|   /|  </span><br>
                <span style="color: #ff69b4;">   (  :v:  ) </span><br>
                <span style="color: #ff69b4;">    |(_)|  </span><br>
                <span style="color: #ff69b4;">     ^^^   </span>`;
    },
    
    pizza: () => {
        return `<span class="avin-terminal-success">🍕 Pizza delivery! That'll be $12.99 in cryptocurrency please 😄</span>`;
    },
    
    fortune: () => {
        const fortunes = [
            "🔮 You will write amazing code today!",
            "✨ A great opportunity awaits in your future!",
            "🌟 Your debugging skills will save the day!",
            "💫 A perfect solution will come to you in a dream!",
            "🎯 You will find the bug on the first try!",
            "🍀 Your next commit will be legendary!",
            "⭐ Stack Overflow will have exactly what you need!",
            "🎪 Your code will run perfectly in production!"
        ];
        return `<span class="avin-terminal-info">${fortunes[Math.floor(Math.random() * fortunes.length)]}</span>`;
    },
    
    secret: () => {
        return `<span class="avin-terminal-success">🤫 You found the secret command! Here's your prize: 🏆</span><br>
                <span class="avin-terminal-info">🎁 Achievement Unlocked: "Explorer" - You like to discover hidden features!</span>`;
    },
    
    moon: () => {
        setTimeout(() => {
            // Access the 3D Earth instance and trigger moon revolution
            if (window.earth3D && window.earth3D.moon) {
                // Speed up moon revolution to a nice, smooth pace
                const originalMoonSpeed = window.earth3D.moonSpeed || 0.02;
                window.earth3D.moonSpeed = 0.08; // Smooth, elegant revolution speed
                
                // Show notification using existing system
                showNotification('Lunar System', '🌙 Moon revolution activated! Watch the elegant orbital dance around Earth.', 30000);
                
                // Reset moon speed after one complete revolution (about 78 seconds at 0.08 speed)
                // But let's make it shorter for better UX - 30 seconds for partial revolution
                setTimeout(() => {
                    if (window.earth3D) {
                        window.earth3D.moonSpeed = originalMoonSpeed;
                    }
                }, 30000);
                
            } else {
                // Fallback message if 3D Earth isn't available
                const fallbackMsg = document.createElement('div');
                fallbackMsg.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 48px;
                    z-index: 10000;
                    animation: moonOrbit 3s ease-in-out;
                `;
                fallbackMsg.innerHTML = '🌙🌍';
                document.body.appendChild(fallbackMsg);
                
                setTimeout(() => {
                    document.body.removeChild(fallbackMsg);
                }, 3000);
            }
        }, 100);
        return `<span class="avin-terminal-success">🌙 Initiating elegant lunar orbit! Watch the moon gracefully revolve around Earth 🌍✨</span>`;
    },
    
    // Achievement and Certification Commands
    certs: async () => {
        try {
            const response = await fetch('./docs/achievements.json');
            const data = await response.json();
            
            if (!data.certifications || data.certifications.length === 0) {
                return `<span class="avin-terminal-info">📜 No certifications found. Add your certificates to docs/achievements.json</span>`;
            }
            
            let output = `<span class="avin-terminal-success">🎓 CERTIFICATIONS</span>\n`;
            output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n\n`;
            
            data.certifications.forEach((cert, index) => {
                if (cert.title && cert.title.trim()) {
                    output += `<span class="avin-terminal-success">[${index + 1}]</span> `;
                    output += `<span style="color: #fff; font-weight: bold;">${cert.title}</span>\n`;
                    output += `<span style="color: #888;">    🏢 ${cert.issuer} | 📅 ${cert.date}</span>\n`;
                    if (cert.credentialId) {
                        output += `<span style="color: #888;">    🆔 ${cert.credentialId}</span>\n`;
                    }
                    output += '\n';
                }
            });
            
            output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n`;
            output += `<span class="avin-terminal-info">💡 Use 'cert [number]' for details or 'viewcert [number]' to see certificate image</span>`;
            
            return output;
        } catch (error) {
            return `<span class="avin-terminal-error">Error loading certifications: ${error.message}</span>`;
        }
    },
    
    achievements: async () => {
        try {
            const response = await fetch('./docs/achievements.json');
            const data = await response.json();
            
            if (!data.competitions || data.competitions.length === 0) {
                return `<span class="avin-terminal-info">🏆 No achievements found. Add your competition wins to docs/achievements.json</span>`;
            }
            
            let output = `<span class="avin-terminal-success">🏆 ACHIEVEMENTS & COMPETITIONS</span>\n`;
            output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n\n`;
            
            data.competitions.forEach((comp, index) => {
                if (comp.title && comp.title.trim()) {
                    output += `<span class="avin-terminal-success">[${index + 1}]</span> `;
                    output += `<span style="color: #fff; font-weight: bold;">${comp.title}</span>\n`;
                    output += `<span style="color: #888;">    🏢 ${comp.organizer} | 📅 ${comp.date}</span>\n`;
                    if (comp.position) {
                        output += `<span style="color: #888;">    🥇 Position: ${comp.position}</span>\n`;
                    }
                    if (comp.prize) {
                        output += `<span style="color: #888;">    💰 Prize: ${comp.prize}</span>\n`;
                    }
                    output += '\n';
                }
            });
            
            return output;
        } catch (error) {
            return `<span class="avin-terminal-error">Error loading achievements: ${error.message}</span>`;
        }
    },
    
    courses: async () => {
        try {
            const response = await fetch('./docs/achievements.json');
            const data = await response.json();
            
            if (!data.courses || data.courses.length === 0) {
                return `<span class="avin-terminal-info">📚 No courses found. Add your completed courses to docs/achievements.json</span>`;
            }
            
            let output = `<span class="avin-terminal-success">📚 COMPLETED COURSES</span>\n`;
            output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n\n`;
            
            data.courses.forEach((course, index) => {
                if (course.title && course.title.trim()) {
                    output += `<span class="avin-terminal-success">[${index + 1}]</span> `;
                    output += `<span style="color: #fff; font-weight: bold;">${course.title}</span>\n`;
                    output += `<span style="color: #888;">    🏢 ${course.provider} | 📅 ${course.completionDate}</span>\n`;
                    if (course.grade) {
                        output += `<span style="color: #888;">    📊 Grade: ${course.grade}</span>\n`;
                    }
                    if (course.duration) {
                        output += `<span style="color: #888;">    ⏱️ Duration: ${course.duration}</span>\n`;
                    }
                    output += '\n';
                }
            });
            
            return output;
        } catch (error) {
            return `<span class="avin-terminal-error">Error loading courses: ${error.message}</span>`;
        }
    },
    
    cert: async (args) => {
        if (!args[0]) {
            return `<span class="avin-terminal-error">Usage: cert [number] - Show detailed certificate information</span>`;
        }
        
        try {
            const response = await fetch('./docs/achievements.json');
            const data = await response.json();
            const index = parseInt(args[0]) - 1;
            
            if (!data.certifications || !data.certifications[index]) {
                return `<span class="avin-terminal-error">Certificate ${args[0]} not found</span>`;
            }
            
            const cert = data.certifications[index];
            if (!cert.title || !cert.title.trim()) {
                return `<span class="avin-terminal-error">Certificate ${args[0]} is empty</span>`;
            }
            
            let output = `<span class="avin-terminal-success">🎓 ${cert.title}</span>\n`;
            output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n\n`;
            output += `<span style="color: #4caf50;">Issuer:</span> ${cert.issuer}\n`;
            output += `<span style="color: #4caf50;">Date:</span> ${cert.date}\n`;
            if (cert.credentialId) {
                output += `<span style="color: #4caf50;">Credential ID:</span> ${cert.credentialId}\n`;
            }
            if (cert.description) {
                output += `<span style="color: #4caf50;">Description:</span> ${cert.description}\n`;
            }
            if (cert.skills && cert.skills.length > 0) {
                output += `<span style="color: #4caf50;">Skills:</span> ${cert.skills.join(', ')}\n`;
            }
            if (cert.verificationUrl) {
                output += `<span style="color: #4caf50;">Verify:</span> <a href="${cert.verificationUrl}" target="_blank">${cert.verificationUrl}</a>\n`;
            }
            
            return output;
        } catch (error) {
            return `<span class="avin-terminal-error">Error loading certificate: ${error.message}</span>`;
        }
    },
    
    viewcert: async (args) => {
        if (!args[0]) {
            return `<span class="avin-terminal-error">Usage: viewcert [number] - Display certificate image</span>`;
        }
        
        try {
            const response = await fetch('./docs/achievements.json');
            const data = await response.json();
            const index = parseInt(args[0]) - 1;
            
            if (!data.certifications || !data.certifications[index]) {
                return `<span class="avin-terminal-error">Certificate ${args[0]} not found</span>`;
            }
            
            const cert = data.certifications[index];
            if (!cert.image) {
                return `<span class="avin-terminal-error">No image available for certificate ${args[0]}</span>`;
            }
            
            const imagePath = `./assets/images/certificates/${cert.image}`;
            return `<div style="margin: 10px 0;">
                        <span class="avin-terminal-success">📜 ${cert.title}</span><br>
                        <img src="${imagePath}" alt="${cert.title}" style="max-width: 100%; height: auto; margin-top: 10px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                    </div>`;
        } catch (error) {
            return `<span class="avin-terminal-error">Error loading certificate image: ${error.message}</span>`;
        }
    },
    
    // Discovery and Help Commands
    commands: () => {
        let output = `<span class="avin-terminal-success">📋 ALL AVAILABLE COMMANDS</span>\n`;
        output += `<span style="color: #666;">${'─'.repeat(60)}</span>\n\n`;
        
        output += `<span class="avin-terminal-info">🔧 CORE COMMANDS</span>\n`;
        output += `help, clear, echo, cat, ls, exit, version, pwd, cd\n\n`;
        
        output += `<span class="avin-terminal-info">👤 PORTFOLIO COMMANDS</span>\n`;
        output += `about, skills, experience, contact, resume\n\n`;
        
        output += `<span class="avin-terminal-info">💼 PROJECT COMMANDS</span>\n`;
        output += `projects, project [name], github, demo [name], code [name]\n\n`;
        
        output += `<span class="avin-terminal-info">🎓 CERTIFICATION COMMANDS</span>\n`;
        output += `certs, achievements, courses, cert [number], viewcert [number]\n\n`;
        
        output += `<span class="avin-terminal-info">📸 CAMERA COMMANDS</span>\n`;
        output += `takepic, takepic_rear, showpics, showpic [id], delpic [id], clearpics, camera_info\n\n`;
        
        output += `<span class="avin-terminal-info">💻 SYSTEM COMMANDS</span>\n`;
        output += `sysinfo, device, time, date, weather [city]\n\n`;
        
        output += `<span class="avin-terminal-info">📰 NEWS COMMANDS</span>\n`;
        output += `news [category] - Categories: tech\n\n`;
        
        output += `<span class="avin-terminal-info">🎮 EASTER EGG COMMANDS</span>\n`;
        output += `matrix, hacker, dance, rocket, coffee, unicorn, pizza, fortune, konami, secret, moon\n\n`;
        
        output += `<span class="avin-terminal-error">💀 DESTRUCTIVE COMMANDS (USE AT YOUR OWN RISK!)</span>\n`;
        output += `destroy, destruct, nuke, boom, kaboom, apocalypse, end, terminate\n\n`;
        
        output += `<span style="color: #666;">${'─'.repeat(60)}</span>\n`;
        output += `<span class="avin-terminal-info">💡 Type 'hints' for discovery tips or 'aliases' for command shortcuts!</span>`;
        
        return output;
    },
    
    hints: () => {
        const tips = [
            "🎯 Try typing common Unix commands like 'sudo', 'vim', or 'nano' for surprises!",
            "🌙 Some commands are hidden behind emoji shortcuts - try typing emojis!",
            "🎮 Classic gaming references might work as commands...",
            "☕ Food and drink commands might brew up something interesting!",
            "🚀 Space-related commands could launch something amazing!",
            "🦄 Mythical creatures might be hiding in the command system!",
            "🎪 Try typing 'thematrix' or other movie references!",
            "🔍 Some aliases use different names - 'luna' instead of 'moon'!",
            "🎲 Random words sometimes work - experiment with fun commands!",
            "✨ The best easter eggs are discovered by accident - keep exploring!"
        ];
        
        let output = `<span class="avin-terminal-success">💡 DISCOVERY HINTS & TIPS</span>\n`;
        output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n\n`;
        
        tips.forEach((tip, index) => {
            output += `<span class="avin-terminal-info">[${index + 1}]</span> ${tip}\n`;
        });
        
        output += `\n<span style="color: #666;">${'─'.repeat(50)}</span>\n`;
        output += `<span class="avin-terminal-success">🎪 Keep experimenting! There are more secrets to find!</span>`;
        
        return output;
    },
    
    aliases: () => {
        let output = `<span class="avin-terminal-success">🔗 COMMAND ALIASES & SHORTCUTS</span>\n`;
        output += `<span style="color: #666;">${'─'.repeat(60)}</span>\n\n`;
        
        output += `<span class="avin-terminal-info">📂 COMMON UNIX ALIASES</span>\n`;
        output += `ll, dir → ls | cls → clear | whoami → about\n`;
        output += `man, info → help | tree → ls | find → help message\n\n`;
        
        output += `<span class="avin-terminal-info">🎮 FUN ALIASES</span>\n`;
        output += `hack → hacker | thematrix → matrix\n`;
        output += `luna, lunar → moon | certifications → certs\n\n`;
        
        output += `<span class="avin-terminal-info">🎭 EMOJI SHORTCUTS</span>\n`;
        output += `🚀 → rocket | ☕ → coffee | 🦄 → unicorn\n`;
        output += `🍕 → pizza | 🌙 → moon\n\n`;
        
        output += `<span class="avin-terminal-info">💻 DEVELOPER COMMANDS</span>\n`;
        output += `sudo, vim, nano, emacs → Humorous responses\n`;
        output += `rm, mkdir, chmod → Safe joke responses\n\n`;
        
        output += `<span style="color: #666;">${'─'.repeat(60)}</span>\n`;
        output += `<span class="avin-terminal-success">✨ Try these shortcuts to discover hidden features!</span>`;
        
        return output;
    },
    
    explore: () => {
        const suggestions = [
            "🎲 Try: matrix, hacker, dance, rocket",
            "☕ Try: coffee, pizza, unicorn, fortune", 
            "🌙 Try: moon, luna, secret, konami",
            "💻 Try: sudo, vim, hack, thematrix",
            "🎮 Try: ☕, 🚀, 🦄, 🍕, 🌙"
        ];
        
        let output = `<span class="avin-terminal-success">🗺️ EXPLORATION SUGGESTIONS</span>\n`;
        output += `<span style="color: #666;">${'─'.repeat(50)}</span>\n\n`;
        
        suggestions.forEach((suggestion, index) => {
            output += `<span class="avin-terminal-info">[${index + 1}]</span> ${suggestion}\n`;
        });
        
        output += `\n<span class="avin-terminal-success">🎪 Each command has its own surprise - happy exploring!</span>`;
        
        return output;
    },
    
    // Override the built-in help command
    help: () => {
        let output = `<span class="avin-terminal-success">🚀 AvinTerm v1.0.0 - Interactive Portfolio Terminal</span>\n`;
        output += `<span style="color: #666;">${'─'.repeat(60)}</span>\n\n`;
        
        output += `<span class="avin-terminal-info">📋 ESSENTIAL COMMANDS</span>\n`;
        output += `help           Show this help message\n`;
        output += `about          Learn about Avinav\n`;
        output += `projects       View my projects\n`;
        output += `skills         Technical skills overview\n`;
        output += `certs          View certifications & courses\n`;
        output += `contact        Get in touch\n`;
        output += `clear          Clear terminal\n\n`;
        
        output += `<span class="avin-terminal-info">🔍 DISCOVERY COMMANDS</span>\n`;
        output += `commands       📋 Show ALL available commands (60+ commands!)\n`;
        output += `hints          💡 Tips for discovering easter eggs\n`;
        output += `aliases        🔗 Command shortcuts and alternatives\n`;
        output += `explore        🗺️  Suggestions for fun commands to try\n\n`;
        
        output += `<span class="avin-terminal-info">📂 FILE SYSTEM</span>\n`;
        output += `ls             List available files\n`;
        output += `cat [file]     Read file contents\n`;
        output += `echo [text]    Display text\n\n`;
        
        output += `<span style="color: #666;">${'─'.repeat(60)}</span>\n`;
        output += `<span class="avin-terminal-success">🚀 Want to explore more? Type 'commands' to see ALL available features!</span>\n`;
        output += `<span class="avin-terminal-info">🎪 Includes 60+ commands, easter eggs, and hidden surprises!</span>\n`;
        output += `<span class="avin-terminal-info">💡 Pro tip: Try 'hints' to discover secret commands!</span>`;
        
        return output;
    },
    
    // EPIC DESTRUCTION EASTER EGG
    destroy: () => {
        setTimeout(() => {
            // Step 1: Close terminal with dramatic message
            showNotification('System Alert', '⚠️ DESTRUCTION SEQUENCE INITIATED! EVACUATE IMMEDIATELY!', 3000);
            
            setTimeout(() => {
                // Hide terminal
                if (window.terminal) {
                    window.terminal.hideTerminal();
                }
                
                // Step 2: Asteroid animation
                createAsteroidAttack();
                
            }, 2000);
            
        }, 500);
        
        return `<span class="avin-terminal-error">💀 INITIATING PLANETARY DESTRUCTION SEQUENCE...</span><br>
                <span class="avin-terminal-error">🚨 WARNING: ASTEROID INCOMING!</span><br>
                <span class="avin-terminal-info">📡 Closing all communications...</span>`;
    },
    
    // Aliases for destroy command
    destruct: () => commands.destroy(),
    nuke: () => commands.destroy(),
    boom: () => commands.destroy(),
    kaboom: () => commands.destroy()
};

// Asteroid destruction sequence  
function createAsteroidAttack() {
    // Create MOON-SIZED asteroid coming from LEFT
    const asteroid = document.createElement('div');
    asteroid.style.cssText = `
        position: fixed;
        top: 15%;
        left: -200px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, #444 10%, #666 30%, #888 50%, #aaa 80%);
        border-radius: 50%;
        z-index: 100000;
        transition: all 3s ease-in;
        box-shadow: 
            inset -20px -20px 0px rgba(0,0,0,0.4),
            0 0 80px rgba(255, 69, 0, 0.8);
        border: 2px solid #999;
    `;
    
    // Add crater details to make it look like a moon/asteroid
    asteroid.innerHTML = `
        <div style="
            position: absolute;
            top: 30%;
            left: 20%;
            width: 30px;
            height: 30px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
        "></div>
        <div style="
            position: absolute;
            top: 60%;
            left: 60%;
            width: 20px;
            height: 20px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
        "></div>
        <div style="
            position: absolute;
            top: 20%;
            left: 70%;
            width: 15px;
            height: 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
        "></div>
    `;
    document.body.appendChild(asteroid);
    
    // Animate moon-sized asteroid towards Earth
    setTimeout(() => {
        const earthContainer = document.querySelector('.earth-container');
        const earthRect = earthContainer ? earthContainer.getBoundingClientRect() : 
                         { left: window.innerWidth * 0.8, top: window.innerHeight * 0.3 };
        
        // Direct collision course with Earth
        asteroid.style.left = (earthRect.left - 50) + 'px';
        asteroid.style.top = (earthRect.top - 50) + 'px';
        asteroid.style.transform = 'rotate(720deg) scale(1.2)';
    }, 100);
    
    // DIRECT IMPACT
    setTimeout(() => {
        // Remove asteroid
        document.body.removeChild(asteroid);
        
        // Earth explosion effect
        if (window.earth3D) {
            const earthContainer = document.querySelector('.earth-container');
            if (earthContainer) {
                earthContainer.style.animation = 'explode 1s ease-out';
            }
        }
        
        // KABOOM explosion
        setTimeout(() => {
            createKaboomExplosion();
        }, 500);
        
        // Start broken TV effect  
        setTimeout(() => {
            startBrokenTVEffect();
        }, 1000);
        
    }, 3100);
}

function createKaboomExplosion() {
    // Simple KABOOM explosion
    const explosion = document.createElement('div');
    explosion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 200px;
        z-index: 100001;
        color: #ff4444;
        text-shadow: 0 0 50px #ff0000;
        animation: explosionGrow 1s ease-out;
    `;
    explosion.innerHTML = '💥';
    document.body.appendChild(explosion);
    
    // Change to KABOOM text
    setTimeout(() => {
        explosion.innerHTML = 'KABOOM!';
        explosion.style.fontSize = '120px';
        explosion.style.fontWeight = 'bold';
        explosion.style.fontFamily = 'Impact, Arial Black, sans-serif';
    }, 500);
    
    // Remove explosion after animation
    setTimeout(() => {
        document.body.removeChild(explosion);
    }, 1500);
}

function startBrokenTVEffect() {
    // Create broken TV overlay
    const brokenTV = document.createElement('div');
    brokenTV.className = 'broken-tv-overlay';
    brokenTV.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
        );
        z-index: 99999;
        animation: tvStatic 0.1s infinite, tvFlicker 0.3s infinite;
        pointer-events: none;
    `;
    document.body.appendChild(brokenTV);
    
    // Make all text glitchy
    document.body.style.animation = 'textGlitch 0.2s infinite';
    
    // After 3 seconds of broken TV, shutdown completely
    setTimeout(() => {
        // Complete shutdown - no refresh option
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #ff0000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Courier New', monospace;
                font-size: 4rem;
                text-align: center;
                animation: fadeIn 2s ease-in;
            ">
                💀 SYSTEM DESTROYED 💀<br>
                <div style="font-size: 2rem; margin-top: 2rem; color: #333;">
                    Connection terminated.
                </div>
            </div>
        `;
        
        // Try to close the window/tab after showing destruction message
        setTimeout(() => {
            window.close();
        }, 3000);
        
    }, 3000);
}
            // Initialize terminal
            window.terminal = new AvinTerm({
                username: 'user',
                hostname: 'avinterm',
                welcomeMessage: 'Welcome to AvinTerm v1.0.0! Type "help" to start or "commands" to explore more.',
                showOnLoad: false,
                commands: customCommands
            });
        });


document.querySelector('.contact-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const subject = this.querySelector('input[type="text"]:nth-of-type(2)').value;
    const message = this.querySelector('textarea').value;
    
    // Validate form (simple validation)
    if (!name || !email || !message) {
        showNotification('Form Error', 'Please fill out all required fields.');
        return;
    }
    
    // Show success message (in a real app, you would send data to a server)
    showNotification('Message Sent', `Thank you ${name}! Your message has been received.`);
    
    // Clear form
    this.reset();
});
let lastScrollY = window.scrollY;
let isNearTop = false;

window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    const scrollThreshold = 100; // Show terminal when within 100px of top
    
    // Check if we're near the top
    if (currentScrollY <= scrollThreshold && !isNearTop) {
        isNearTop = true;
        if (!window.terminal.terminalVisible) {
            window.terminal.resetPosition();
            window.terminal.showTerminal();
        }
    } else if (currentScrollY > scrollThreshold) {
        isNearTop = false;
    }
    
    lastScrollY = currentScrollY;
});
        // Loading Screen
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.querySelector('.loading-screen').style.opacity = '0';
                document.querySelector('.loading-screen').style.visibility = 'hidden';
                setTimeout(() => {
                window.terminal.showTerminal();
            }, 300);
            }, 3000);
            
        });
        // Make project links functional
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const projectTitle = this.closest('.project-card').querySelector('.project-title').textContent;
        const isCode = this.textContent.includes('Code');
        
        if (isCode) {
            showNotification('Repository', `Redirecting to ${projectTitle} repository...`);
        } else {
            showNotification('Live Demo', `Loading ${projectTitle} demo...`);
        }
    });
});

// Make social links functional
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const platform = this.querySelector('i').className.split(' ')[1].split('-')[1];
        showNotification('Social Media', `Connecting to ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
        // Allow the default link behavior to continue (don't prevent navigation)
    });
});
        // Custom Cursor
        document.addEventListener('DOMContentLoaded', function() {
            const cursor = document.querySelector('.custom-cursor');
            const links = document.querySelectorAll('a, button');
            
            if (window.innerWidth > 768) {
                cursor.style.display = 'block';
                
                document.addEventListener('mousemove', function(e) {
                    cursor.style.left = e.clientX + 'px';
                    cursor.style.top = e.clientY + 'px';
                });
                
                links.forEach(link => {
                    link.addEventListener('mouseenter', function() {
                        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    });
                    
                    link.addEventListener('mouseleave', function() {
                        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    });
                });
            }
        });

        // Terminal Animation
        document.addEventListener('DOMContentLoaded', function() {
            const terminalContainer = document.querySelector('.terminal');
            
            for (let i = 0; i < 20; i++) {
                const line = document.createElement('div');
                line.classList.add('terminal-line');
                line.style.top = Math.random() * 100 + '%';
                line.style.left = Math.random() * 100 + '%';
                line.style.animationDelay = Math.random() * 5 + 's';
                
                const commands = [
                
                    'npm install --save-dev',
                    'git commit -m "Fix security vulnerability"',
                    'python3 train_model.py --epochs 100',
                    'docker-compose up -d',
                    'ssh root@server.example.com',
                    'for i in $(seq 1 10); do echo $i; done',
                    'curl -X POST https://api.example.com/data',
                    'npm run build && npm run deploy',
                    'ls -la | grep "config"',
                    'cat /var/log/system.log | grep "ERROR"',
                    'ping -c 4 8.8.8.8',
                    'wget https://example.com/latest.zip',
                    'tar -xzf archive.tar.gz',
                    'systemctl restart nginx',
                    'cd /var/www/html && git pull origin master',
                    'find . -name "*.js" -type f -delete',
                    'echo $PATH',
                    'netstat -tulpn | grep LISTEN',
                    'ps aux | grep node'
                ];
                
                line.textContent = commands[Math.floor(Math.random() * commands.length)];
                terminalContainer.appendChild(line);
            }
        });

        // Typed Text Animation
        document.addEventListener('DOMContentLoaded', function() {
            const typedText = document.querySelector('.typed-text');
            const text = typedText.textContent;
            typedText.textContent = '';
            
            let i = 0;
            function typeWriter() {
                if (i < text.length) {
                    typedText.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            }
            
            setTimeout(typeWriter, 1500);
        });



        
        // function showNotification(title, message) {
        //     const notification = document.createElement('div');
        //     notification.classList.add('notification');
    
        //     notification.innerHTML = `
        //         <div class="notification-title">
        //             <h4>${title}</h4>
        //             <i class="fas fa-times"></i>
        //         </div>
        //         <div class="notification-content">
        //             ${message}
        //         </div>
        //     `;
    
        //     document.body.appendChild(notification);
    
        //     notification.querySelector('.fa-times').addEventListener('click', function () {
        //         notification.style.opacity = '0';
        //         setTimeout(function () {
        //             notification.remove();
        //         }, 500);
        //     });
    
        //     setTimeout(function () {
        //         notification.style.opacity = '0';
        //         setTimeout(function () {
        //             notification.remove();
        //         }, 500);
        //     }, 5000);
        // }
        function showNotification(title, message, durationMs = 5000) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <div class="notification-title">
            <h4>${title}</h4>
            <i class="fas fa-times"></i>
        </div>
        <div class="notification-content">
            ${message}
        </div>
    `;

    document.body.appendChild(notification);

    notification.querySelector('.fa-times').addEventListener('click', function () {
        notification.style.opacity = '0';
        setTimeout(function () {
            notification.remove();
        }, 500);
    });

    setTimeout(function () {
        notification.style.opacity = '0';
        setTimeout(function () {
            notification.remove();
        }, 500);
    }, durationMs);
}

        function shouldShowNotification(key, intervalMinutes) {
            const lastShown = localStorage.getItem(key);
            const now = Date.now();
            if (!lastShown || now - parseInt(lastShown) > intervalMinutes * 60000) {
                localStorage.setItem(key, now);
                return true;
            }
            return false;
        }
    
        setTimeout(function () {
            // 1. Greeting - once per session
            setTimeout(function () {
                if (!sessionStorage.getItem('greetingShown')) {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';
                showNotification('Greetings', `${greeting} Welcome back to AvinTerm.`);
                sessionStorage.setItem('greetingShown', '1');
            }
                }, 5000);
           
    
            // 2. Battery Status - every 15 minutes
            if (shouldShowNotification('batteryLastShown', 15)) {
                if (navigator.getBattery) {
                    navigator.getBattery().then(battery => {
                        const level = Math.round(battery.level * 100);
                        showNotification('Battery Status', `Battery level is at ${level}%.`);
                    });
                }
            }
    
            // 3. Network Info - every 10 minutes
            if (shouldShowNotification('networkLastShown', 10)) {
                showNotification('Network Info', `You are currently ${navigator.onLine ? 'online' : 'offline'}.`);
            }
    
            // 4. Weather Info - every 60 minutes
            if (shouldShowNotification('weatherLastShown', 60)) {
                if (typeof customCommands !== 'undefined' && customCommands.weather) {
                    customCommands.weather().then(weather => {
                        showNotification('Weather Update', weather.replace(/\n/g, '<br>'));
                    });
                }
            }
    
        }, 8000);
    
        // Mobile Navigation
        const menuToggle = document.getElementById('menu-toggle');
        const navLinks = document.getElementById('nav-links');
        
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
        
        // Scroll-to-top terminal auto-show functionality
        let lastScrollTop = 0;
        let isAtTop = true;
        let scrollTimeout;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Clear previous timeout to avoid multiple triggers
            clearTimeout(scrollTimeout);
            
            // Check if we're at the very top of the page
            if (currentScroll <= 100) {
                if (!isAtTop && window.terminal && !window.terminal.terminalVisible) {
                    // Add a small delay to prevent accidental triggers
                    scrollTimeout = setTimeout(() => {
                        // Double check we're still at the top and terminal is still hidden
                        if (window.pageYOffset <= 100 && !window.terminal.terminalVisible) {
                            window.terminal.showTerminal();
                            // Add a welcome back message with typing effect
                            setTimeout(() => {
                                window.terminal.addOutput('═══════════════════════════════════════', 'avin-terminal-info');
                                window.terminal.addOutput('🎯 Welcome back to the top!', 'avin-terminal-success');
                                window.terminal.addOutput('Type "help" to start or "commands" to explore more!', 'avin-terminal-info');
                                window.terminal.addOutput('═══════════════════════════════════════', 'avin-terminal-info');
                            }, 500);
                        }
                    }, 500);
                }
                isAtTop = true;
            } else {
                // Only mark as not at top if we've scrolled significantly
                if (currentScroll > 200) {
                    isAtTop = false;
                }
            }
            
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        }, { passive: true });
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
    
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

    
    
        // Function to fetch tech news
        async function fetchTechNews() {
            try {
                // Using Hacker News API (completely free and public)
                const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
                const topStoryIds = await topStoriesResponse.json();
                
                // Get the top 3 stories
                const storyPromises = topStoryIds.slice(0, 3).map(id => 
                    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
                        .then(response => response.json())
                );
                
                const stories = await Promise.all(storyPromises);
                return stories;
            } catch (error) {
                console.error('Error fetching tech news:', error);
                return [];
            }
        }
    
        // Function to display tech news notification
        function showTechNewsNotification() {
    fetchTechNews().then(news => {
        if (news && news.length > 0) {
            let newsContent = '';
            
            news.forEach(item => {
                newsContent += `
                    <div class="news-item">
                        <div class="news-title">
                            <a href="${item.url || `https://news.ycombinator.com/item?id=${item.id}`}" target="_blank">
                                ${item.title}
                            </a>
                        </div>
                        <div class="news-source">
                            ${item.score} points • ${item.by} • ${new Date(item.time * 1000).toLocaleTimeString()}
                        </div>
                    </div>
                `;
            });
            
            showNotification('Latest Tech News', newsContent, 20000); // 20 seconds
        }
    });
}
        // Add tech news notification to your existing setTimeout
        setTimeout(function() {
            // Add this with your other notification checks
            if (shouldShowNotification('techNewsLastShown', 1)) { // Show every 30 minutes
                showTechNewsNotification();
            }
        }, 10000); // Slight delay after your other notifications
    
        // Add a function to manually refresh tech news
        window.refreshTechNews = function() {
            showTechNewsNotification();
        };
    
        // Alternative news source using RSS2JSON (free tier with limitations)
        async function fetchAlternativeTechNews() {
            try {
                const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.feedburner.com%2FTechCrunch&api_key=free');
                const data = await response.json();
                
                if (data.status === 'ok') {
                    return data.items.slice(0, 3);
                }
                return [];
            } catch (error) {
                console.error('Error fetching alternative tech news:', error);
                return [];
            }
        }
    
        // Function to display alternative tech news
        function showAlternativeTechNewsNotification() {
            fetchAlternativeTechNews().then(news => {
                if (news && news.length > 0) {
                    let newsContent = '';
                    
                    news.forEach(item => {
                        newsContent += `
                            <div class="news-item">
                                <div class="news-title">
                                    <a href="${item.link}" target="_blank">
                                        ${item.title}
                                    </a>
                                </div>
                                <div class="news-source">
                                    ${item.author} • ${new Date(item.pubDate).toLocaleString()}
                                </div>
                            </div>
                        `;
                    });
                    
                    showNotification('Tech News Feed', newsContent);
                }
            });
        }
    
        // Add this as another option
        window.refreshAlternativeTechNews = function() {
            showAlternativeTechNewsNotification();
        };
