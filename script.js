document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('command-input');
    const output = document.getElementById('output');
    const displayImg = document.getElementById('display-image');
    const textDisplay = document.getElementById('text-display');
    const hintItems = document.querySelectorAll('.controls-hint li');

    const commands = {
        'load up celery man please': () => {
            showImage('images/celery_man.jpg');
        },
        'can i get a printout of oyster smiling': () => {
            showImage('images/oyster.jpg', 'printout-anim');
        },
        'could you kick up the 4d3d3d3': () => {
            if(displayImg.src) {
                displayImg.classList.add('effect-4d3d3d3');
                setTimeout(() => {
                    displayImg.classList.remove('effect-4d3d3d3');
                }, 3000);
                return "4d3d3d3 initiated.";
            }
            return "Error: No sequence loaded.";
        },
        'let\'s look at tayne': () => {
            showImage('images/tayne.jpg');
        },
        'can i see a nude tayne': () => {
            showImage('images/nude_tayne.jpg');
            return "WARNING: NOT COMPUTING. PLEASE COMPUTE.";
        }
    };

    function showImage(src, className = '') {
        displayImg.style.display = 'none';
        textDisplay.style.display = 'none';
        
        // Force reflow
        void displayImg.offsetWidth;
        
        displayImg.className = className;
        displayImg.src = src;
        displayImg.style.display = 'block';
    }

    function printOutput(text, isCommand = false) {
        const p = document.createElement('p');
        p.textContent = (isCommand ? '> ' : '') + text;
        if (text.includes('NOT COMPUTING')) {
            p.classList.add('alert-text');
        }
        output.appendChild(p);
        output.scrollTop = output.scrollHeight;
    }

    function processCommand(cmdText) {
        const cmd = cmdText.toLowerCase().trim();
        printOutput(cmdText, true);
        
        // Exact matching or fuzzy matching
        let matched = false;
        // Clean up commands for fuzzy match
        const sanitizedCmd = cmd.replace(/[^a-z0-9\s]/g, '');
        
        for (const [key, func] of Object.entries(commands)) {
            const sanitizedKey = key.replace(/[^a-z0-9\s]/g, '');
            if (sanitizedCmd.includes(sanitizedKey) || sanitizedKey.includes(sanitizedCmd)) {
                const response = func();
                if (response) {
                    printOutput(response);
                }
                matched = true;
                break;
            }
        }
        
        if (!matched && cmd.length > 0) {
            printOutput("Unrecognized command.");
        }
    }

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processCommand(input.value);
            input.value = '';
        }
    });

    hintItems.forEach(item => {
        item.addEventListener('click', () => {
            const cmd = item.querySelector('code').textContent;
            processCommand(cmd);
            input.focus();
        });
    });
    
    // Ensure input always keeps focus
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.controls-hint')) {
            input.focus();
        }
    });
});
