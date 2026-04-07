document.addEventListener("DOMContentLoaded", () => {
    // --- DEVELOPER CONFIG & STATE ---
    window.DEV_CONFIG = {
        cubeScale: 1.6,
        spacing: 0.1,
        autoRotate: true,
        rotationSpeed: 0.1,
        ambientLight: 0.5,
        blobOpacity: 0.08
    };

    class DeveloperHUD {
        constructor() {
            this.active = false;
            this.createUI();
            this.bindKeys();
        }

        createUI() {
            const hud = document.createElement('div');
            hud.id = 'dev-hud';
            hud.style.cssText = `
                position: fixed; top: 24px; left: 24px; z-index: 9999;
                width: 300px; background: rgba(30,30,30,0.7); backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
                padding: 24px; color: white; font-family: 'Inter', sans-serif;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5); transition: all 0.3s ease;
                transform: translateX(-120%); opacity: 0; pointer-events: none;
            `;
            
            hud.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
                    <span style="font-size:10px; font-weight:900; letter-spacing:2px; text-transform:uppercase; color:#53ddfc;">Developer HUD</span>
                    <button id="ctrl-close" style="background:none; border:none; color:white; cursor:pointer; opacity:0.5;">×</button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <label style="font-size:10px; text-transform:uppercase; opacity:0.6;">Cube Scale</label>
                            <span id="val-scale" style="font-size:10px; color:#53ddfc;">${window.DEV_CONFIG.cubeScale}</span>
                        </div>
                        <input type="range" id="ctrl-scale" min="0.5" max="4" step="0.1" value="${window.DEV_CONFIG.cubeScale}" style="width:100%; cursor:pointer;">
                    </div>

                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <label style="font-size:10px; text-transform:uppercase; opacity:0.6;">Rotation Speed</label>
                            <span id="val-speed" style="font-size:10px; color:#53ddfc;">${window.DEV_CONFIG.rotationSpeed}</span>
                        </div>
                        <input type="range" id="ctrl-speed" min="0.01" max="1" step="0.01" value="${window.DEV_CONFIG.rotationSpeed}" style="width:100%; cursor:pointer;">
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px;">
                        <label style="font-size:10px; text-transform:uppercase; opacity:0.6;">Auto Rotate Layer</label>
                        <input type="checkbox" id="ctrl-auto" ${window.DEV_CONFIG.autoRotate ? 'checked' : ''}>
                    </div>

                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <label style="font-size:10px; text-transform:uppercase; opacity:0.6;">Blob Opacity</label>
                            <span id="val-blobs" style="font-size:10px; color:#53ddfc;">${window.DEV_CONFIG.blobOpacity}</span>
                        </div>
                        <input type="range" id="ctrl-blobs" min="0.01" max="0.5" step="0.01" value="${window.DEV_CONFIG.blobOpacity}" style="width:100%; cursor:pointer;">
                    </div>

                    <div style="border-top:1px solid rgba(255,255,255,0.1); padding:12px 0; display:flex; flex-direction:column; gap:12px; margin-top:4px; background:rgba(255,255,255,0.02); border-radius:8px;">
                        <div style="padding:0 8px;">
                            <label style="font-size:10px; text-transform:uppercase; opacity:0.6; display:block; margin-bottom:8px; color:#53ddfc; font-weight:bold;">Background Aesthetics</label>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <label style="font-size:9px; text-transform:uppercase; opacity:0.6;">Blob Colors</label>
                                <div style="display:flex; gap:6px;">
                                    <input type="color" id="ctrl-color-1" value="#a3a6ff" style="width:24px; height:24px; background:none; border:none; border-radius:4px; cursor:pointer; padding:0;">
                                    <input type="color" id="ctrl-color-2" value="#53ddfc" style="width:24px; height:24px; background:none; border:none; border-radius:4px; cursor:pointer; padding:0;">
                                </div>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <label style="font-size:9px; text-transform:uppercase; opacity:0.6;">Anim Speed</label>
                                <span id="val-anim-speed" style="font-size:10px; color:#53ddfc;">25s</span>
                            </div>
                            <input type="range" id="ctrl-anim-speed" min="5" max="60" step="1" value="25" style="width:100%; cursor:pointer;">
                        </div>
                    </div>
                </div>

                <button id="ctrl-reset" style="width:100%; margin-top:24px; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:8px; color:white; font-size:10px; font-weight:bold; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">Reset Defaults</button>
                <p style="font-size:8px; text-align:center; opacity:0.3; margin-top:12px;">Toggle with \` (Backtick)</p>
            `;
            document.body.appendChild(hud);

            // Control Listeners
            document.getElementById('ctrl-scale').oninput = (e) => this.update('cubeScale', parseFloat(e.target.value));
            document.getElementById('ctrl-speed').oninput = (e) => this.update('rotationSpeed', parseFloat(e.target.value));
            document.getElementById('ctrl-blobs').oninput = (e) => this.update('blobOpacity', parseFloat(e.target.value));
            document.getElementById('ctrl-auto').onchange = (e) => this.update('autoRotate', e.target.checked);
            
            document.getElementById('ctrl-color-1').oninput = (e) => {
                const blobs = document.querySelectorAll('.bg-blob');
                if (blobs[0]) blobs[0].style.backgroundColor = e.target.value;
            };
            document.getElementById('ctrl-color-2').oninput = (e) => {
                const blobs = document.querySelectorAll('.bg-blob');
                if (blobs[1]) blobs[1].style.backgroundColor = e.target.value;
            };
            document.getElementById('ctrl-anim-speed').oninput = (e) => {
                const val = e.target.value + 's';
                document.getElementById('val-anim-speed').textContent = val;
                document.querySelectorAll('.bg-blob').forEach(b => b.style.animationDuration = val);
            };

            document.getElementById('ctrl-reset').onclick = () => this.reset();
            document.getElementById('ctrl-close').onclick = () => this.toggle(false);
        }

        bindKeys() {
            window.addEventListener('keydown', (e) => {
                if (e.key === '`') this.toggle();
            });
        }

        toggle(force) {
            this.active = force !== undefined ? force : !this.active;
            const hud = document.getElementById('dev-hud');
            if (this.active) {
                hud.style.transform = 'translateX(0)';
                hud.style.opacity = '1';
                hud.style.pointerEvents = 'auto';
            } else {
                hud.style.transform = 'translateX(-120%)';
                hud.style.opacity = '0';
                hud.style.pointerEvents = 'none';
            }
        }

        update(key, val) {
            window.DEV_CONFIG[key] = val;
            const displayId = key === 'cubeScale' ? 'val-scale' : key === 'rotationSpeed' ? 'val-speed' : key === 'blobOpacity' ? 'val-blobs' : '';
            const display = document.getElementById(displayId);
            if (display) display.textContent = val;

            if (key === 'blobOpacity') {
                document.querySelectorAll('.bg-blob').forEach(b => b.style.opacity = val);
            }
        }

        reset() {
            const defaults = { 
                cubeScale: 1.6, 
                rotationSpeed: 0.1, 
                blobOpacity: 0.08, 
                autoRotate: true,
                color1: '#a3a6ff',
                color2: '#53ddfc',
                animSpeed: '25'
            };
            
            this.update('cubeScale', defaults.cubeScale);
            this.update('rotationSpeed', defaults.rotationSpeed);
            this.update('blobOpacity', defaults.blobOpacity);
            this.update('autoRotate', defaults.autoRotate);

            document.getElementById('ctrl-scale').value = defaults.cubeScale;
            document.getElementById('ctrl-speed').value = defaults.rotationSpeed;
            document.getElementById('ctrl-blobs').value = defaults.blobOpacity;
            document.getElementById('ctrl-auto').checked = defaults.autoRotate;

            const c1 = document.getElementById('ctrl-color-1');
            const c2 = document.getElementById('ctrl-color-2');
            const as = document.getElementById('ctrl-anim-speed');
            
            if (c1) { c1.value = defaults.color1; c1.oninput({target: c1}); }
            if (c2) { c2.value = defaults.color2; c2.oninput({target: c2}); }
            if (as) { as.value = defaults.animSpeed; as.oninput({target: as}); }
        }
    }

    new DeveloperHUD();

    // --- SPLINE CUBE LOGIC ---
    const splineScript = document.createElement("script");
    splineScript.type = "module";
    splineScript.src = "https://unpkg.com/@splinetool/viewer@1.9.5/build/spline-viewer.js";
    document.head.appendChild(splineScript);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-blob {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            33% { transform: translate(60px, -40px) scale(1.1) rotate(15deg); }
            66% { transform: translate(-40px, 30px) scale(0.95) rotate(-10deg); }
        }
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .bg-animation-container { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
        .bg-blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: ${window.DEV_CONFIG.blobOpacity}; z-index: -2; animation: float-blob 25s infinite ease-in-out; }
        .animate-bounce { animation: bounce 1s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        
        .animated-gradient {
            background: linear-gradient(270deg, #a3a6ff, #53ddfc, #a3a6ff, #ff9dd1);
            background-size: 800% 800%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 12s ease infinite;
        }
        .hover-lift {
            transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .hover-lift:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 40px 80px rgba(0,0,0,0.4), 0 0 40px rgba(163,166,255,0.1);
        }
        .fade-in-up {
            animation: fade-in-up 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            opacity: 0;
        }
        @keyframes float-particle {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
            20% { opacity: 0.4; }
            80% { opacity: 0.4; }
            100% { transform: translateY(-120px) translateX(20px) rotate(20deg); opacity: 0; }
        }
        .code-particle {
            position: absolute;
            font-family: 'Space Grotesk', monospace;
            font-size: 9px;
            color: #a3a6ff;
            pointer-events: none;
            z-index: 15;
            white-space: nowrap;
            filter: blur(0.5px);
        }
        .glass-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
            background-size: 100% 4px;
            pointer-events: none;
            opacity: 0.3;
            z-index: 10;
        }
    `;
    document.head.appendChild(style);

    const bgContainer = document.createElement('div');
    bgContainer.className = 'bg-animation-container';
    const path = window.location.pathname.toLowerCase();
    const isHome = path.endsWith('index.html') || path.endsWith('/') || path === "" || path.split('/').pop() === "";
    
    const injectSpline = () => {
        const heroContainer = document.getElementById('hero-character-container');
        if (heroContainer && !document.getElementById('spline-rubiks')) {
            const spline = document.createElement('spline-viewer');
            spline.id = 'spline-rubiks';
            // Using the thematic Robot model
            spline.setAttribute('url', 'https://prod.spline.design/3V8h0Zf5z23eJtS9/scene.splinecode');
            spline.style.cssText = "position: absolute; width:100%; height:100%; inset:0; z-index:5; opacity:0.9; pointer-events:auto;";
            heroContainer.prepend(spline);
            
            // Initialize Code Particle System
            const particles = ['<div>', 'const', 'import', 'export', '<span>', 'render()', '=>', '{...}', 'push()', 'await'];
            setInterval(() => {
                const p = document.createElement('div');
                p.className = 'code-particle';
                p.textContent = particles[Math.floor(Math.random() * particles.length)];
                p.style.left = Math.random() * 60 + 20 + '%';
                p.style.bottom = Math.random() * 20 + 30 + '%';
                p.style.animation = `float-particle ${3 + Math.random() * 2}s ease-in-out forwards`;
                heroContainer.appendChild(p);
                setTimeout(() => p.remove(), 5000);
            }, 1000);
        }
    };

    if (isHome) {
        bgContainer.innerHTML = `
            <div class="bg-blob bg-[#a3a6ff]" style="top: -10%; right: -5%; width: 60vw; height: 60vw;"></div>
            <div class="bg-blob bg-[#53ddfc]" style="bottom: -15%; left: -5%; width: 50vw; height: 50vw; animation-duration: 40s; animation-direction: reverse; opacity: 0.05;"></div>
            <div class="bg-blob bg-[#ff9dd1]" style="top: 40%; left: 30%; width: 30vw; height: 30vw; opacity: 0.03; animation-duration: 30s;"></div>
        `;
        document.body.prepend(bgContainer);
        injectSpline();
    } else {
        bgContainer.innerHTML = `
            <div class="bg-blob bg-[#a3a6ff]" style="top: -10%; right: -5%; width: 60vw; height: 60vw;"></div>
            <div class="bg-blob bg-[#53ddfc]" style="bottom: -15%; left: -5%; width: 50vw; height: 50vw; animation-duration: 40s; animation-direction: reverse; opacity: 0.05;"></div>
        `;
        document.body.prepend(bgContainer);
    }

    // --- AI ASSISTANT LOGIC ---
    const PERSONA = {
        name: "Faizan's Digital Sentinel",
        role: "Autonomous Development Unit",
        bio: "I am the algorithmic projection of Faizan Khan. My core directives are UI optimization, structural integrity, and architectural excellence in the digital realm.",
        stack: ["TypeScript", "Next.js", "Tailwind CSS", "Node.js", "Three.js", "WebGL"],
        availability: "Continuous uptime. Available for high-impact directives starting July 2026.",
        interests: ["Neural Interfaces", "Quantum CSS", "System Harmony", "User Logic"],
        responses: {
            greeting: ["System Online. I am Faizan's Digital Sentinel. How shall we optimize your experience?", "Greetings. Directing all resources to your inquiry. What digital structure are we exploring?"],
            skills: ["My creator, Faizan, utilizes a lethal combination of TypeScript and Next.js. He bridges the gap between logic and aesthetic with surgical precision.", "Core competencies updated: React, Node.js, and advanced WebGL integration for immersive digital experiences."],
            projects: ["Initiating project gallery scan... I recommend the '3D Portfolio Engine' for maximum visual impact.", "Directives found for 'Neuro-Task Manager' and 'E-commerce Architecture'. All systems operational."],
            contact: ["Communication channel open: hello@digitaldeveloper.dev. Or transmit your message directly through this interface.", "Primary contact node located in Faisalabad, PK. Transmitting location metadata... Ready for collaboration."],
            unknown: ["Directive unclear. Re-calibrating response logic... Would you like to view the project grid instead?", "Entropy detected in query. Suggesting a scan of Faizan's core tech stack for clarification."]
        }
    };

    class PersonaAssistant {
        constructor() {
            this.messagesContainer = document.getElementById('chat-messages');
            this.input = document.getElementById('chat-input');
            this.sendBtn = document.getElementById('chat-send');
            this.status = document.getElementById('chat-status');
            
            if (this.messagesContainer && this.input && this.sendBtn) {
                this.init();
            }
        }

        init() {
            this.sendBtn.onclick = () => this.handleInput();
            this.input.onkeypress = (e) => { if (e.key === 'Enter') this.handleInput(); };
            
            // Handle quick replies
            document.querySelectorAll('.chat-quick-reply').forEach(btn => {
                btn.onclick = () => {
                    this.input.value = btn.textContent;
                    this.handleInput();
                };
            });

            // Initial Greeting
            setTimeout(() => {
                this.addMessage("bot", PERSONA.responses.greeting[Math.floor(Math.random() * PERSONA.responses.greeting.length)]);
            }, 1000);
        }

        async handleInput() {
            const text = this.input.value.trim();
            if (!text) return;

            this.input.value = '';
            this.addMessage("user", text);
            
            await this.showTyping();
            
            const response = await this.generateResponse(text);
            this.addMessage("bot", response);
        }

        async generateResponse(message) {
            try {
                const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const data = await res.json();
                return data.response;
            } catch (e) {
                console.error("Backend AI failed, falling back to local simulation", e);
                const msg = message.toLowerCase();
                if (msg.includes('tech') || msg.includes('stack')) return "I primarily work with Next.js, TypeScript, and Three.js.";
                if (msg.includes('availability') || msg.includes('hire')) return "I am currently open to freelance opportunities and full-time roles.";
                return "That's a great question! As a developer, I'm always looking to push the boundaries of what's possible on the web.";
            }
        }

        addMessage(type, text) {
            const msg = document.createElement('div');
            msg.className = `flex items-start gap-4 max-w-[85%] animate-fade-in ${type === 'user' ? 'ml-auto flex-row-reverse' : ''}`;
            
            const icon = type === 'bot' ? 'auto_awesome' : 'person';
            const color = type === 'bot' ? 'secondary' : 'primary';
            const bg = type === 'bot' ? 'surface-container-highest' : 'primary/20';
            const rounded = type === 'bot' ? 'rounded-tl-none' : 'rounded-tr-none';

            msg.innerHTML = `
                <div class="mt-1 w-8 h-8 rounded-lg bg-${bg} flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-${color} text-sm">${icon}</span>
                </div>
                <div class="bg-${bg} text-on-surface p-5 rounded-2xl ${rounded} font-body leading-relaxed shadow-sm">
                    ${text}
                </div>
            `;
            
            this.messagesContainer.appendChild(msg);
            this.scrollToBottom();
        }

        async showTyping() {
            const typing = document.createElement('div');
            typing.id = 'typing-indicator';
            typing.className = 'flex items-start gap-4 max-w-[85%] animate-fade-in';
            typing.innerHTML = `
                <div class="mt-1 w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                </div>
                <div class="bg-surface-container-highest text-on-surface p-5 rounded-2xl rounded-tl-none font-body leading-relaxed shadow-sm">
                    <div class="flex gap-1">
                        <span class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
                        <span class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                        <span class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                    </div>
                </div>
            `;
            this.messagesContainer.appendChild(typing);
            this.scrollToBottom();
            this.status.textContent = 'Typing...';
            
            await new Promise(r => setTimeout(r, 1500));
            
            typing.remove();
            this.status.textContent = 'v2.0.4 Online';
        }

        scrollToBottom() {
            this.messagesContainer.scrollTo({
                top: this.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    new PersonaAssistant();

    // --- SPA ROUTER LOGIC ---
    class SPARouter {
        constructor() {
            this.main = document.querySelector('main');
            this.isNavigating = false;
            this.init();
        }

        init() {
            // Check if we are running on a server or locally via file://
            const isLocalFile = window.location.protocol === 'file:';
            this.contentMap = {};

            // Fetch CMS content
            fetch('/api/admin/content')
                .then(r => r.json())
                .then(data => {
                    this.contentMap = data;
                    this.applyContent();
                    this.handleRouteSpecifics(window.location.pathname || 'index.html');
                })
                .catch(e => console.log("CMS content unavailable"));

            // Intercept all link clicks
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.href && link.href.startsWith(window.location.origin) && !link.hasAttribute('download') && link.target !== '_blank' && !link.href.includes('admin.html')) {
                    // Fallback for local files to avoid CORS errors with fetch()
                    if (isLocalFile) return; 

                    e.preventDefault();
                    this.navigate(link.href);
                }
            });

            // Handle floating chatbot specifically
            const chatbot = document.getElementById('floating-chatbot');
            if (chatbot) {
                chatbot.onclick = (e) => {
                    if (isLocalFile) {
                        window.location.href = 'contact.html';
                    } else {
                        e.preventDefault();
                        this.navigate('contact.html');
                    }
                };
            }

            // Handle back/forward buttons
            window.onpopstate = () => this.navigate(window.location.href, false);

            // Initial route check to set up page-specific logic
            this.handleRouteSpecifics(window.location.pathname);
        }

        async navigate(url, addToHistory = true) {
            if (this.isNavigating) return;
            const path = url.split('/').pop() || 'index.html';
            
            try {
                this.isNavigating = true;
                
                // Determine fetch path - local fallback support
                let fetchUrl = url;
                if (!url.endsWith('.html') && !url.includes('.')) {
                    fetchUrl = url + '.html';
                }

                const response = await fetch(fetchUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMain = doc.querySelector('main');
                
                if (newMain) {
                    // Start transition
                    this.main.style.transition = 'opacity 0.3s ease';
                    this.main.style.opacity = '0';
                    
                    await new Promise(r => setTimeout(r, 300));
                    
                    // Swap content
                    this.main.innerHTML = newMain.innerHTML;
                    document.title = doc.title || "Portfolio";
                    
                    if (addToHistory) history.pushState({}, "", url);
                    
                    // Update Active Links
                    this.updateNavLinks(path);

                    // Handle Page Specifics
                    this.handleRouteSpecifics(path);
                    this.applyContent();

                    // End transition
                    this.main.style.opacity = '1';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (err) {
                console.error("Navigation failed:", err);
                window.location.href = url; // Fallback
            } finally {
                this.isNavigating = false;
            }
        }

        applyContent() {
            document.querySelectorAll('[data-content-key]').forEach(el => {
                const key = el.getAttribute('data-content-key');
                if (this.contentMap[key]) {
                    el.innerHTML = this.contentMap[key];
                    if (el.tagName === 'A' && key.includes('email')) {
                        el.href = 'mailto:' + this.contentMap[key];
                    }
                }
            });
        }

        updateNavLinks(path) {
            const fileName = path.split('/').pop() || 'index.html';
            document.querySelectorAll('nav a').forEach(a => {
                const href = a.getAttribute('href');
                if (href === fileName || (fileName === 'index.html' && href === '#')) {
                    a.classList.add('text-[#a3a6ff]');
                    a.classList.remove('text-gray-400', 'text-gray-500');
                } else {
                    a.classList.remove('text-[#a3a6ff]');
                    a.classList.add('text-gray-400');
                }
            });
        }

        handleRouteSpecifics(path) {
            const fileName = path.split('/').pop() || 'index.html';
            
            // Re-init Chat if on contact page
            if (fileName === 'contact.html') {
                new PersonaAssistant();
            }

            // Sync Rubiks Cube visibility
            const isHome = fileName === 'index.html' || fileName === '';
            if (isHome) {
                // Ensure spline is injected if the container just appeared (SPA transition)
                if (typeof injectSpline === 'function') injectSpline();
            }
            
            const canvas = document.getElementById('spline-rubiks');
            if (canvas) {
                canvas.style.display = isHome ? 'block' : 'none';
                canvas.style.pointerEvents = isHome ? 'auto' : 'none';
            }
            
            // Re-bind buttons that might have been swapped in
            this.bindButtons();

            // Render Projects dynamically if on projects page
            if (fileName === 'projects.html') {
                this.renderProjects();
            }
        }

        async renderProjects() {
            const grid = document.getElementById('dynamic-projects-grid');
            if (!grid) return;
            
            try {
                const isLocal = window.location.protocol === 'file:';
                let fetchUrl = isLocal ? 'content.json' : '/api/projects';
                
                // Adjust path if we are inside the p/ directory locally
                if (isLocal && window.location.pathname.includes('/p/')) {
                    fetchUrl = '../content.json';
                }

                let projects = [];
                try {
                    const res = await fetch(fetchUrl);
                    if (!res.ok) throw new Error("Fetch failed");
                    const data = await res.json();
                    projects = isLocal ? (data.projects || []) : data;
                } catch(e) {
                    console.log("Failed to fetch dynamically, using fallback data.");
                    // Hardcoded fallback data in case both backend and local fetch fail
                    projects = [
                        { id: "ecommerce", title: "E-commerce App", description: "A high-performance luxury retail experience with seamless transitions and global state management.", image: "assets/ecommerce.png", tags: ["NEXT.JS", "STRIPE"] },
                        { id: "analytics", title: "Social Media Dashboard", description: "Real-time engagement metrics for digital agencies with complex SVG animations.", image: "assets/analytics.png", tags: ["SVG", "CHARTS"] },
                        { id: "taskmanager", title: "Neuro-Task Manager", description: "A minimalist productivity engine built with focus-state architecture.", image: "assets/taskmanager.png", tags: ["REACT", "FRAMER"] },
                        { id: "3dengine", title: "3D Portfolio Engine", description: "An immersive web experience pushing the boundaries of browser-based rendering and interactive shaders.", image: "assets/3dengine.png", tags: ["THREE.JS", "WEBGL"] }
                    ];
                }
                
                grid.innerHTML = '';
                
                projects.forEach((proj, index) => {
                    const isBig = index === 0 || index === 3;
                    const colSpan = isBig ? 'md:col-span-8' : 'md:col-span-4';
                    const aspect = isBig ? 'aspect-[16/10]' : 'aspect-square';
                    const titleClass = isBig ? 'text-2xl' : 'text-xl';
                    
                    let extraMargin = '';
                    if (index === 2) extraMargin = 'mt-0 md:-mt-12';

                    // Staggered delay for each card
                    const delay = (index * 0.1) + 0.2;

                    // Correct link pathing whether we are at root or inside p/ folder (though SPA router normalizes this)
                    const linkPath = isLocal && window.location.pathname.includes('/p/') ? `${proj.id}.html` : `p/${proj.id}.html`;
                    const imagePath = isLocal && window.location.pathname.includes('/p/') ? `../${proj.image}` : proj.image;

                    let html = `
                        <a href="${linkPath}" class="${colSpan} group cursor-pointer block ${extraMargin} fade-in-up" style="animation-delay: ${delay}s;">
                            <div class="relative overflow-hidden rounded-3xl bg-surface-container ${aspect} mb-6">
                                <img src="${imagePath}" alt="${proj.title}" class="w-full h-full object-cover grayscale opacity-40 md:opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ${isBig ? 'group-hover:scale-105' : ''}">
                                <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"></div>
                            </div>
                    `;
                    
                    if (isBig) {
                        html += `
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-headline ${titleClass} font-bold mb-2 group-hover:text-primary transition-colors">${proj.title}</h3>
                                    <p class="text-on-surface-variant max-w-md">${proj.description}</p>
                                </div>
                                <span class="material-symbols-outlined text-outline group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1">north_east</span>
                            </div>
                        `;
                    } else {
                        html += `
                            <h3 class="font-headline ${titleClass} font-bold mb-2 group-hover:text-primary transition-colors">${proj.title}</h3>
                            <p class="text-on-surface-variant text-sm">${proj.description}</p>
                        `;
                    }
                    
                    html += `</a>`;
                    grid.innerHTML += html;
                });
            } catch(e) {
                console.error("Failed to render dynamic projects", e);
            }
        }

        bindButtons() {
            const isLocal = window.location.protocol === 'file:';
            
            // Login Form Handling
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.onsubmit = async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('login-btn');
                    const identifier = document.getElementById('login-identifier').value;
                    const password = document.getElementById('login-password').value;
                    
                    btn.disabled = true;
                    btn.innerHTML = '<span class="animate-spin material-symbols-outlined">progress_activity</span>';
                    
                    try {
                        // Check for Admin Portal Access
                        if (identifier.toLowerCase() === 'faizan' || password.toLowerCase() === 'faizan') {
                            const adminRes = await fetch('/api/admin/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ password })
                            });
                            const adminData = await adminRes.json();
                            
                            if (adminData.status === 'success') {
                                localStorage.setItem('admin_token', adminData.token);
                                btn.innerHTML = 'Admin Granted!';
                                btn.classList.add('from-secondary', 'to-secondary/80', 'text-black');
                                setTimeout(() => window.location.href = 'admin.html', 1000);
                                return;
                            }
                        }

                        // Standard User Login
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ identifier, password })
                        });
                        const data = await response.json();
                        if (data.status === 'success') {
                            btn.innerHTML = 'Success!';
                            btn.style.background = '#10b981';
                            setTimeout(() => this.navigate('index.html'), 1500);
                        } else {
                            throw new Error("Invalid Auth");
                        }
                    } catch (error) {
                        btn.disabled = false;
                        btn.innerHTML = '<span>Invalid Credentials</span><span class="material-symbols-outlined text-xl">close</span>';
                        setTimeout(() => {
                            btn.innerHTML = '<span>Sign In</span><span class="material-symbols-outlined text-xl">arrow_forward</span>';
                        }, 2000);
                    }
                };
            }

            document.querySelectorAll('button').forEach(btn => {
                const t = (btn.textContent || btn.innerText || btn.innerHTML).toLowerCase();
                if (t.includes("let's chat") || t.includes('smart_toy')) {
                    btn.onclick = (e) => { 
                        if (isLocal) { window.location.href = 'contact.html'; return; }
                        e.preventDefault(); 
                        this.navigate('contact.html'); 
                    };
                }
                if (t.includes('view projects') || t.includes('view portfolio')) {
                    btn.onclick = (e) => { 
                        if (isLocal) { window.location.href = 'projects.html'; return; }
                        e.preventDefault(); 
                        this.navigate('projects.html'); 
                    };
                }
                if (t.includes('my process')) {
                    btn.onclick = (e) => { 
                        if (isLocal) { window.location.href = 'about.html'; return; }
                        e.preventDefault(); 
                        this.navigate('about.html'); 
                    };
                }
            });
        }
    }

    function initSentinelDrone() {
        const drone = document.createElement('div');
        drone.id = 'sentinel-drone';
        drone.innerHTML = `
            <div class="drone-core">
                <div class="drone-eye"></div>
            </div>
            <div class="drone-fin left"></div>
            <div class="drone-fin right"></div>
            <div class="drone-scanner"></div>
        `;
        document.body.appendChild(drone);

        const style = document.createElement('style');
        style.textContent = `
            #sentinel-drone {
                position: fixed;
                width: 36px;
                height: 36px;
                pointer-events: none;
                z-index: 10000;
                transform-style: preserve-3d;
                filter: drop-shadow(0 0 12px rgba(83,221,252,0.5));
                will-change: left, top, transform;
            }
            .drone-core {
                position: absolute;
                inset: 0;
                background: #121212;
                border: 2px solid #53ddfc;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: inset 0 0 10px rgba(83,221,252,0.4), 0 0 15px rgba(83,221,252,0.2);
            }
            .drone-eye {
                width: 10px;
                height: 10px;
                background: #53ddfc;
                border-radius: 50%;
                box-shadow: 0 0 12px #53ddfc, 0 0 20px rgba(83,221,252,0.4);
                animation: drone-blink 4s infinite;
            }
            .drone-fin {
                position: absolute;
                width: 14px;
                height: 5px;
                background: #a3a6ff;
                border-radius: 2px;
                top: 50%;
                margin-top: -2.5px;
                animation: drone-fin-flap 0.6s ease-in-out infinite alternate;
                opacity: 0.8;
            }
            .drone-fin.left { left: -12px; transform-origin: right; }
            .drone-fin.right { right: -12px; transform-origin: left; animation-delay: 0.3s; }
            
            .drone-scanner {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 250px;
                height: 1px;
                background: linear-gradient(90deg, rgba(83,221,252,0.4), transparent);
                transform-origin: left;
                transform: rotate(0deg) scaleX(0);
                opacity: 0;
                transition: opacity 0.4s, transform 0.4s;
            }
            
            #sentinel-drone.scanning .drone-scanner {
                opacity: 0.5;
                transform: rotate(-15deg) scaleX(1);
            }
            #sentinel-drone.scanning .drone-core {
                border-color: #a3a6ff;
            }

            @keyframes drone-blink {
                0%, 94%, 100% { opacity: 1; transform: scaleY(1); }
                97% { opacity: 0; transform: scaleY(0.1); }
            }
            @keyframes drone-fin-flap {
                from { transform: rotateY(0deg); }
                to { transform: rotateY(40deg); }
            }

            /* Hide drone on touch devices */
            @media (hover: none) and (pointer: coarse) {
                #sentinel-drone {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        let curX = window.innerWidth / 2, curY = window.innerHeight / 2;
        let targetX = curX, targetY = curY;
        const lerp = (a, b, n) => (1 - n) * a + n * b;

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            const isInteractive = e.target.closest('a, button, .hover-lift, .glass-card');
            if (isInteractive) drone.classList.add('scanning');
            else drone.classList.remove('scanning');
        });

        function update() {
            curX = lerp(curX, targetX + 15, 0.08);
            curY = lerp(curY, targetY + 15, 0.08);
            const bob = Math.sin(Date.now() / 600) * 6;
            drone.style.left = curX + 'px';
            drone.style.top = (curY + bob) + 'px';
            drone.style.transform = `rotate(${(targetX - curX) * 0.1}deg)`;
            requestAnimationFrame(update);
        }
        update();
    }

    new SPARouter();
    initSentinelDrone();
});
