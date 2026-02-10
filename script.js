const baseRows = document.querySelectorAll('.base-row');
const baseButtons = document.querySelectorAll('.base-btn');
const expressionDisplay = document.getElementById('expressionDisplay');
const binValue = document.getElementById('binValue');
const decValue = document.getElementById('decValue');
const octValue = document.getElementById('octValue');
const hexValue = document.getElementById('hexValue');
const keypad = document.querySelector('.keypad');
const celestialBody = document.querySelector('.celestial-body');
const duoTriggers = document.querySelectorAll('.duo-trigger');
const bgmToggle = document.getElementById('bgmToggle');

let currentBase = 10;
let input = "";

const allowedInputs = {
    2: ['0', '1', '.'],
    8: ['0','1','2','3','4','5','6','7', '.'],
    10: ['0','1','2','3','4','5','6','7','8','9', '.'],
    16: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F', '.']
};

function baseToDecimal(str, base) {
    if (!str.includes('.')) return parseInt(str, base) || 0;
    const [intPart, fracPart] = str.split('.');
    let dec = parseInt(intPart, base) || 0;
    for (let i = 0; i < fracPart.length; i++) {
        dec += parseInt(fracPart[i], base) / Math.pow(base, i + 1);
    }
    return dec;
}

function decimalToBase(num, base) {
    if (isNaN(num) || num === null) return "0";
    let intPart = Math.floor(Math.abs(num));
    let fracPart = Math.abs(num) - intPart;
    let res = (num < 0 ? "-" : "") + intPart.toString(base).toUpperCase();
    if (fracPart > 0) {
        res += ".";
        for (let i = 0; i < 8; i++) {
            fracPart *= base;
            let digit = Math.floor(fracPart);
            res += digit.toString(base).toUpperCase();
            fracPart -= digit;
            if (fracPart === 0) break;
        }
    }
    return res;
}

function updateDisplays() {
    const segments = input.split(/[+\-*/%]/);
    const lastSeg = segments[segments.length - 1];
    let decNum = (lastSeg && lastSeg !== "." && lastSeg !== "-") ? baseToDecimal(lastSeg, currentBase) : 0;
    binValue.textContent = decimalToBase(decNum, 2);
    decValue.textContent = decimalToBase(decNum, 10);
    octValue.textContent = decimalToBase(decNum, 8);
    hexValue.textContent = decimalToBase(decNum, 16);
    expressionDisplay.value = input || "0";
}

function highlightBase() {
    baseRows.forEach(r => r.classList.toggle('active', parseInt(r.dataset.base) === currentBase));
    baseButtons.forEach(b => b.classList.toggle('active', parseInt(b.dataset.base) === currentBase));
    document.querySelectorAll('.keypad button').forEach(btn => {
        const val = btn.getAttribute('data-num');
        if (val) btn.disabled = !allowedInputs[currentBase].includes(val);
    });
}

function handleInput(val, isOp) {
    const ops = ['+', '-', '*', '/', '%'];
    const lastChar = input.slice(-1);
    if (input === "" && (ops.includes(val) && val !== "-")) return;
    if (input === "" && val === ".") return;
    if (isOp && (ops.includes(lastChar) || lastChar === ".")) return;
    if (val === ".") {
        const segments = input.split(/[+\-*/%]/);
        if (segments[segments.length - 1].includes(".")) return;
    }
    input += val;
    updateDisplays();
}

keypad.addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.tagName !== 'BUTTON') return;
    const num = btn.getAttribute('data-num');
    const op = btn.getAttribute('data-op');

    if (num) handleInput(num, false);
    else if (op) handleInput(op, true);
    else if (btn.id === 'clear') { input = ""; updateDisplays(); }
    else if (btn.id === 'backspace') { input = input.slice(0, -1); updateDisplays(); }
    else if (btn.id === 'equals') {
        try {
            let evalStr = input.replace(/[0-9A-F.]+/g, m => baseToDecimal(m, currentBase));
            let result = eval(evalStr);
            input = decimalToBase(result, currentBase);
            updateDisplays();
        } catch {
            expressionDisplay.value = "Error";
            input = "";
        }
    }
    playSound();
});

baseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentBase = parseInt(btn.dataset.base);
        input = "";
        highlightBase();
        updateDisplays();
        playSound();
    });
});

function toggleTheme() {
    document.body.classList.toggle('light');
    playSound();
}

celestialBody.addEventListener('click', toggleTheme);
celestialBody.addEventListener('touchstart', (e) => { e.preventDefault(); toggleTheme(); }, { passive: false });
celestialBody.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') toggleTheme();
});

function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    playSound();
}

function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    playSound();
}

duoTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-modal');
        const modal = document.getElementById(id);
        if (modal) openModal(modal);
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        const close = e.target.closest('[data-close="true"]');
        if (close) closeModal(modal);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal.open').forEach(modal => closeModal(modal));
});

const audio = new Audio('https://freesound.org/data/previews/146/146726_2615117-lq.mp3');
function playSound() { audio.currentTime = 0; audio.play().catch(()=>{}); }

const bgm = new Audio('audio/terraria bgm.mp3'); 
bgm.loop = true;
bgm.volume = 0.25;

let bgmPlaying = false;

function updateBgmUI(){
    bgmToggle.classList.toggle('is-playing', bgmPlaying);
    bgmToggle.textContent = bgmPlaying ? '⏸' : '♫';
}

bgmToggle.addEventListener('click', () => {
    if (!bgmPlaying) {
        bgm.play().then(() => {
            bgmPlaying = true;
            updateBgmUI();
        }).catch(()=>{});
    } else {
        bgm.pause();
        bgmPlaying = false;
        updateBgmUI();
    }
    playSound();
});

updateBgmUI();

highlightBase();
updateDisplays();