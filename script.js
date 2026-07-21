class CincoOS {
    constructor() {
        this.display = new DisplayManager();
        this.terminal = new TerminalManager(this.display);
        this.ui = new UIManager(this.terminal, this.display);
        this.terminal.log("System Ready. Awaiting sequence.");
    }
}

class DisplayManager {
    constructor() {
        this.container = document.getElementById('display-area');
        this.image = document.getElementById('sequence-image');
        this.placeholder = document.getElementById('placeholder-text');
        this.printout = document.getElementById('printout');
        this.warning = document.getElementById('nude-tayne-warning');
        
        this.currentSequence = null;
        this.activeEffects = new Set();
    }

    setSequence(name, src) {
        this.clearEffects();
        this.currentSequence = name;
        this.placeholder.style.display = 'none';
        this.image.src = src;
        this.image.style.display = 'block';
        
        // Reset animations by cloning
        const newImg = this.image.cloneNode(true);
        this.image.parentNode.replaceChild(newImg, this.image);
        this.image = newImg;
    }

    addEffect(effectClass, duration = 0) {
        if (!this.currentSequence) return false;
        
        this.image.classList.add(effectClass);
        this.activeEffects.add(effectClass);
        
        if (duration > 0) {
            setTimeout(() => {
                this.removeEffect(effectClass);
            }, duration);
        }
        return true;
    }

    removeEffect(effectClass) {
        this.image.classList.remove(effectClass);
        this.activeEffects.delete(effectClass);
    }

    clearEffects() {
        this.activeEffects.forEach(effectClass => {
            this.image.classList.remove(effectClass);
        });
        this.activeEffects.clear();
        this.image.className = '';
    }

    print() {
        this.printout.style.display = 'block';
        this.printout.classList.remove('print-anim');
        void this.printout.offsetWidth; // trigger reflow
        this.printout.classList.add('print-anim');
        setTimeout(() => {
            this.printout.style.display = 'none';
        }, 4000);
    }

    showWarning() {
        this.warning.style.display = 'flex';
        setTimeout(() => {
            this.warning.style.display = 'none';
        }, 3000);
    }
}

class TerminalManager {
    constructor(displayManager) {
        this.display = displayManager;
        this.logEl = document.getElementById('output-log');
        
        this.commandMap = {
            'celery_man': { action: () => this.display.setSequence('celery_man', 'images/celery_man.jpg'), msg: 'Loaded sequence: Celery Man' },
            'oyster': { action: () => this.display.setSequence('oyster', 'images/oyster.jpg'), msg: 'Loaded sequence: Oyster' },
            'tayne': { action: () => this.display.setSequence('tayne', 'images/tayne.jpg'), msg: 'Loaded sequence: Tayne' },
            '4d3d3d3': { action: () => this.display.addEffect('effect-4d3d3d3'), msg: '4d3d3d3 initiated.' },
            'hat_wobble': { action: () => this.display.addEffect('effect-hat-wobble', 2000), msg: 'Hat wobble sequence engaged.' },
            'flarhgunnstow': { action: () => this.display.addEffect('effect-flarhgunnstow', 3000), msg: 'Flarhgunnstow initiated.' },
            'print': { action: () => this.display.print(), msg: 'Printing Oyster Smiling...' },
            'nude_tayne': { action: () => this.display.showWarning(), msg: 'WARNING: INVALID REQUEST.' }
        };
        
        this.fuzzyMap = {
            'celery man': 'celery_man',
            'oyster smiling': 'oyster',
            'tayne': 'tayne',
            '4d3d3d3': '4d3d3d3',
            'hat wobble': 'hat_wobble',
            'flarhgunnstow': 'flarhgunnstow',
            'printout': 'print',
            'print': 'print',
            'nude': 'nude_tayne'
        };
    }

    log(message, isInput = false) {
        const p = document.createElement('p');
        p.textContent = (isInput ? '> ' : '') + message;
        if (message.includes('WARNING')) {
            p.classList.add('error-text');
        }
        this.logEl.appendChild(p);
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    execute(cmdKey) {
        if (this.commandMap[cmdKey]) {
            const result = this.commandMap[cmdKey].action();
            if (result === false) {
                this.log('Error: No sequence loaded to apply effect to.');
            } else {
                this.log(this.commandMap[cmdKey].msg);
            }
        }
    }

    parseInput(text) {
        const lower = text.toLowerCase();
        let matchedKey = null;
        for (const [key, val] of Object.entries(this.fuzzyMap)) {
            if (lower.includes(key)) {
                matchedKey = val;
                break;
            }
        }
        
        this.log(text, true);
        if (matchedKey) {
            this.execute(matchedKey);
        } else {
            this.log('Unrecognized command.');
        }
    }
}

class UIManager {
    constructor(terminalManager, displayManager) {
        this.terminal = terminalManager;
        this.display = displayManager;
        
        this.bindEvents();
        this.initDraggableWindow();
    }

    bindEvents() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = e.target.dataset.command;
                this.terminal.log(e.target.textContent, true);
                this.terminal.execute(cmd);
            });
        });

        const input = document.getElementById('cli-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                this.terminal.parseInput(input.value);
                input.value = '';
            }
        });
    }

    initDraggableWindow() {
        const win = document.getElementById('cinco-window');
        const titlebar = document.getElementById('window-titlebar');
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        titlebar.addEventListener('mousedown', (e) => {
            if(e.target.classList.contains('win-btn')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const style = window.getComputedStyle(win);
            const matrix = new DOMMatrixReadOnly(style.transform);
            initialX = matrix.m41;
            initialY = matrix.m42;
            
            if (initialX === 0 && initialY === 0 && win.style.position !== 'absolute') {
               initialX = win.offsetLeft;
               initialY = win.offsetTop;
               win.style.position = 'absolute';
               win.style.margin = '0';
               win.style.left = '0';
               win.style.top = '0';
               
               // Readjust based on absolute positioning
               win.style.transform = `translate(${initialX}px, ${initialY}px)`;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            win.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cincoOS = new CincoOS();
});
