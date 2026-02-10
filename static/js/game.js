/* ================================================================
   AI Escape Room — Game Client + Theme Effects
   ================================================================ */

// ---------------------------------------------------------------------------
// Theme data: character reactions, celebrations, emojis
// ---------------------------------------------------------------------------
const THEME_DATA = {
    theoffice: {
        wrongReactions: [
            { char: 'Dwight', msg: 'FALSE. That answer is incorrect. Idiot.' },
            { char: 'Michael', msg: "That's what she said! ...wait, no. That's wrong." },
            { char: 'Stanley', msg: 'Did I stutter? That. Is. Wrong.' },
            { char: 'Kevin', msg: "It's not... it's not right. Like my chili on the floor." },
            { char: 'Creed', msg: "I've been wrong before. I was in a cult once. Try again." },
            { char: 'Jim', msg: '*looks at camera* ...Not quite.' },
        ],
        correctReactions: [
            { char: 'Michael', msg: "That's what I'm talking about! I am so proud of you!" },
            { char: 'Dwight', msg: 'Correct. You may have some Schrute beet juice as reward.' },
            { char: 'Jim', msg: '*smirks* Nice one.' },
        ],
        celebrationEmojis: ['🏆', '📎', '☕', '🥨', '📋', '🖨️'],
        victoryTitle: 'Dundie Award Winner!',
        victoryEmoji: '🏆',
    },
    friends: {
        wrongReactions: [
            { char: 'Chandler', msg: 'Could you BE any more wrong?' },
            { char: 'Ross', msg: "We were on a BREAK from correct answers, apparently." },
            { char: 'Joey', msg: "Joey doesn't share food, and he doesn't share wrong answers either." },
            { char: 'Phoebe', msg: "My grandmother's dead cat could answer better. And he's dead." },
            { char: 'Monica', msg: "No no no no NO! That's not even CLOSE to organized correctly!" },
            { char: 'Rachel', msg: "Oh honey... no." },
        ],
        correctReactions: [
            { char: 'Joey', msg: 'How YOU doin\'! That was correct!' },
            { char: 'Chandler', msg: 'Could that answer BE any more correct?' },
            { char: 'Monica', msg: 'I KNOW! Isn\'t it the best?!' },
        ],
        celebrationEmojis: ['☕', '🛋️', '🍕', '🦞', '🎸', '👏'],
        victoryTitle: "The One Where You Escaped!",
        victoryEmoji: '☕',
    },
    got: {
        wrongReactions: [
            { char: 'Cersei', msg: 'When you play the game of puzzles, you win or you die. You are dying.' },
            { char: 'Tyrion', msg: 'I drink and I know things. You clearly do neither.' },
            { char: 'Arya', msg: 'A wrong answer has no name.' },
            { char: 'Jon Snow', msg: "You know nothing." },
            { char: 'The Hound', msg: "That answer is shit." },
            { char: 'Olenna', msg: "Oh, you poor thing. That's not it at all." },
        ],
        correctReactions: [
            { char: 'Tyrion', msg: 'A mind needs puzzles like a sword needs a whetstone. Well done.' },
            { char: 'Daenerys', msg: 'You have proven yourself worthy. Dracarys... of celebration.' },
            { char: 'Jon Snow', msg: "You know something after all." },
        ],
        celebrationEmojis: ['⚔️', '🐉', '👑', '🏰', '🐺', '🔥'],
        victoryTitle: 'You Win the Iron Throne!',
        victoryEmoji: '👑',
    },
    parksandrec: {
        wrongReactions: [
            { char: 'Ron', msg: "Wrong. I know more than you." },
            { char: 'Leslie', msg: 'Oh no! But I believe in you! You are a beautiful, talented puzzle-solver!' },
            { char: 'Andy', msg: "I don't even know what the question was but that seems wrong." },
            { char: 'Tom', msg: 'That answer is NOT baller. That answer is... un-baller.' },
            { char: 'April', msg: "That answer is dead to me. Like everything else." },
            { char: 'Jerry/Larry/Gary', msg: "Oh geez, that's wrong? Classic me— wait, you said it." },
        ],
        correctReactions: [
            { char: 'Leslie', msg: "YES! You beautiful tropical fish! You did it!" },
            { char: 'Ron', msg: "*nods silently in approval*" },
            { char: 'Tom', msg: "TREAT YO SELF to that correct answer!" },
        ],
        celebrationEmojis: ['🧇', '🌳', '🐴', '🏛️', '⭐', '🎉'],
        victoryTitle: 'Treat Yo Self — You Escaped!',
        victoryEmoji: '🧇',
        correctSpecial: 'waffleRain',
    },
    bigbang: {
        wrongReactions: [
            { char: 'Sheldon', msg: '*knock knock knock* Wrong answer. *knock knock knock* Wrong answer. *knock knock knock* Wrong answer.' },
            { char: 'Howard', msg: 'Even my mother could answer that, and she thinks the internet is a series of tubes.' },
            { char: 'Raj', msg: '...I can\'t even talk to women, but I could answer that correctly.' },
            { char: 'Amy', msg: 'Statistically speaking, that was a poor hypothesis.' },
            { char: 'Leonard', msg: 'That\'s... not how science works.' },
            { char: 'Sheldon', msg: 'BAZINGA! Just kidding. You\'re actually wrong.' },
        ],
        correctReactions: [
            { char: 'Sheldon', msg: 'I\'ll allow it. Your answer meets the minimum threshold of adequacy.' },
            { char: 'Howard', msg: 'Engineering-grade precision on that answer!' },
            { char: 'Raj', msg: 'That was beautiful... like the stars aligning.' },
        ],
        celebrationEmojis: ['🧪', '🔬', '⚛️', '🚀', '🎮', '🤓'],
        victoryTitle: 'Bazinga! You Escaped!',
        victoryEmoji: '⚛️',
    },
    breakingbad: {
        wrongReactions: [
            { char: 'Walter', msg: "I am the one who knocks. And you are the one who's wrong." },
            { char: 'Jesse', msg: "Yeah, SCIENCE! ...but that ain't it, bitch." },
            { char: 'Mike', msg: "No half measures, and no half-right answers." },
            { char: 'Saul', msg: "I once convinced a jury that black was white, but even I can't make that answer correct." },
            { char: 'Gus', msg: "I will not accept this. I suggest you try again. Carefully." },
            { char: 'Hank', msg: "Jesus, Marie, that's not even close." },
        ],
        correctReactions: [
            { char: 'Walter', msg: "You're goddamn right." },
            { char: 'Jesse', msg: "Yeah Mr. White! Yeah SCIENCE!" },
            { char: 'Saul', msg: "'S all good, man! That's the right answer!" },
        ],
        celebrationEmojis: ['🧬', '💎', '🔵', '🧪', '💰', '🏜️'],
        victoryTitle: 'Say My Name — You Escaped!',
        victoryEmoji: '🧬',
    },
    supernatural: {
        wrongReactions: [
            { char: 'Dean', msg: "Son of a bitch... that's wrong." },
            { char: 'Sam', msg: "I've read every lore book in the bunker. That's not it." },
            { char: 'Castiel', msg: "I am an angel of the Lord. And even I know that's incorrect." },
            { char: 'Crowley', msg: "Hello, boys. That answer is rubbish. Try again, moose." },
            { char: 'Bobby', msg: "Idjit! That ain't even close." },
            { char: 'Dean', msg: "Dude. No. That's worse than Sam's salads." },
        ],
        correctReactions: [
            { char: 'Dean', msg: "Hell yeah! Now that's what I'm talking about. Pie for everyone." },
            { char: 'Sam', msg: "Nice work. Dad would be proud." },
            { char: 'Castiel', msg: "You have done well. I have faith in you." },
        ],
        celebrationEmojis: ['🔥', '👼', '😈', '🚗', '⭐', '🗡️'],
        victoryTitle: 'Carry On — You Escaped!',
        victoryEmoji: '🔥',
    },
    custom: {
        wrongReactions: [
            { char: 'AI', msg: "Not quite! Look more carefully at the image." },
            { char: 'AI', msg: "Close, but not the answer I'm looking for." },
        ],
        correctReactions: [
            { char: 'AI', msg: "Excellent observation!" },
        ],
        celebrationEmojis: ['🎉', '✨', '🌟', '🎊', '🏆', '💫'],
        victoryTitle: 'You Escaped!',
        victoryEmoji: '🎉',
    },
};

// Get current theme from body class
function getCurrentTheme() {
    const body = document.querySelector('[class*="room-"]');
    if (!body) return null;
    const match = body.className.match(/room-(\w+)/);
    return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Timer
// ---------------------------------------------------------------------------
let timerInterval = null;

function startTimer() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    remainingSeconds = parseFloat(timerEl.dataset.remaining);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds <= 0) {
            remainingSeconds = 0; clearInterval(timerInterval);
            window.location.href = '/result';
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = Math.floor(remainingSeconds % 60);
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerEl.classList.remove('urgent', 'warning');
    if (remainingSeconds <= 60) timerEl.classList.add('urgent');
    else if (remainingSeconds <= 180) timerEl.classList.add('warning');
}

// ---------------------------------------------------------------------------
// Character Reactions
// ---------------------------------------------------------------------------
function showCharacterReaction(correct) {
    const theme = getCurrentTheme();
    const data = THEME_DATA[theme];
    if (!data) return;

    const pool = correct ? data.correctReactions : data.wrongReactions;
    const pick = pool[Math.floor(Math.random() * pool.length)];

    // Remove existing reaction
    document.querySelectorAll('.character-reaction').forEach(el => el.remove());

    const el = document.createElement('div');
    el.className = 'character-reaction';
    el.innerHTML = `<div class="char-name" style="color: var(--accent);">${pick.char}</div><div>${pick.msg}</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// ---------------------------------------------------------------------------
// Correct Answer Special Effects
// ---------------------------------------------------------------------------
function showCorrectEffect() {
    const theme = getCurrentTheme();
    const data = THEME_DATA[theme];
    if (!data) return;

    if (data.correctSpecial === 'waffleRain') {
        waffleRain();
    }

    // Mini celebration burst
    const emojis = data.celebrationEmojis;
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'waffle-particle';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = (15 + Math.random() * 70) + '%';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            el.style.animationDelay = (Math.random() * 0.3) + 's';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        }, i * 100);
    }
}

function waffleRain() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'waffle-particle';
            el.textContent = '🧇';
            el.style.left = Math.random() * 100 + '%';
            el.style.animationDuration = (2 + Math.random() * 3) + 's';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 5000);
        }, i * 150);
    }
}

// ---------------------------------------------------------------------------
// Victory Celebration
// ---------------------------------------------------------------------------
function showVictoryCelebration() {
    const theme = getCurrentTheme();
    const data = THEME_DATA[theme];
    if (!data) return;

    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    document.body.appendChild(overlay);

    const emojis = data.celebrationEmojis;
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'celebration-emoji';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = Math.random() * 100 + '%';
            el.style.animationDelay = (Math.random() * 0.5) + 's';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            overlay.appendChild(el);
        }, i * 100);
    }
    setTimeout(() => overlay.remove(), 5000);
}

// ---------------------------------------------------------------------------
// Loading Overlay (between puzzles)
// ---------------------------------------------------------------------------
const LOADING_MESSAGES = [
    'Generating next puzzle...',
    'The AI is thinking...',
    'Crafting your challenge...',
    'Almost there...',
    'Building something clever...',
];

function showPuzzleLoading() {
    let overlay = document.getElementById('puzzle-loading');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'puzzle-loading';
        overlay.innerHTML = `
            <div class="puzzle-loading-content">
                <div class="puzzle-loading-spinner"></div>
                <p class="puzzle-loading-text">${LOADING_MESSAGES[0]}</p>
                <div class="puzzle-loading-dots"><span>.</span><span>.</span><span>.</span></div>
            </div>`;
        document.body.appendChild(overlay);
    }
    overlay.classList.remove('hidden');
    // Cycle messages
    let idx = 0;
    overlay._msgInterval = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES.length;
        const txt = overlay.querySelector('.puzzle-loading-text');
        if (txt) txt.textContent = LOADING_MESSAGES[idx];
    }, 2000);
}

function hidePuzzleLoading() {
    const overlay = document.getElementById('puzzle-loading');
    if (overlay) {
        clearInterval(overlay._msgInterval);
        overlay.classList.add('hidden');
    }
}

// ---------------------------------------------------------------------------
// Retry puzzle generation
// ---------------------------------------------------------------------------
async function retryNextPuzzle(attempts) {
    const maxAttempts = attempts || 3;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const resp = await fetch('/next-puzzle', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const data = await resp.json();
            if (data.time_up) { window.location.href = data.redirect; return; }
            if (data.success && data.puzzle) {
                hidePuzzleLoading();
                transitionToPuzzle(data);
                return;
            }
            // Still failing — wait and retry
            const txt = document.querySelector('.puzzle-loading-text');
            if (txt) txt.textContent = `Retrying... (${i + 2}/${maxAttempts})`;
            await new Promise(r => setTimeout(r, 3000));
        } catch (e) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    // All retries failed — show manual retry button
    hidePuzzleLoading();
    showRetryButton();
}

function showRetryButton() {
    const fb = document.getElementById('feedback');
    fb.className = 'mt-5 p-5 rounded-xl text-sm border animate-fade-in feedback-correct';
    fb.innerHTML = `
        <div class="flex items-center justify-between">
            <span>✓ Correct! AI is warming up...</span>
            <button onclick="manualRetry()" class="px-4 py-2 rounded-lg font-display font-semibold text-sm text-[#09090b] hover:brightness-110 active:scale-95 transition-all" style="background: var(--accent);">
                Next Puzzle →
            </button>
        </div>`;
    fb.classList.remove('hidden');
}

async function manualRetry() {
    showPuzzleLoading();
    document.getElementById('feedback').classList.add('hidden');
    await retryNextPuzzle(3);
}

// ---------------------------------------------------------------------------
// Answer Submission
// ---------------------------------------------------------------------------
async function submitAnswer() {
    if (isSubmitting) return;
    const input = document.getElementById('answer-input');
    const answer = input.value.trim();
    if (!answer) { shakeElement(input); return; }

    isSubmitting = true;
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>';

    try {
        const resp = await fetch('/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer }),
        });
        const data = await resp.json();

        if (data.time_up) { window.location.href = data.redirect; return; }
        if (data.redirect) {
            showFeedback(true, data.feedback || 'Correct!');
            showCharacterReaction(true);
            showCorrectEffect();
            showScorePopup(data.score);
            if (data.is_easter_egg) showEasterEggBonus();
            setTimeout(() => {
                showVictoryCelebration();
                setTimeout(() => { window.location.href = data.redirect; }, 2000);
            }, 1000);
            return;
        }
        if (data.correct) {
            showFeedback(true, data.feedback || 'Correct!');
            showCharacterReaction(true);
            showCorrectEffect();
            showScorePopup(data.score);
            if (data.is_easter_egg) showEasterEggBonus();
            currentScore += (data.score || 0);
            document.getElementById('score').textContent = currentScore;

            if (data.needs_retry) {
                // Puzzle generation failed — show loading and auto-retry
                setTimeout(() => {
                    showPuzzleLoading();
                    retryNextPuzzle(4);
                }, 1500);
            } else if (data.puzzle) {
                setTimeout(() => transitionToPuzzle(data), 1800);
            }
        } else {
            showFeedback(false, data.feedback || 'Not quite. Try again!');
            showCharacterReaction(false);
            shakeElement(document.getElementById('puzzle-card'));
            input.value = '';
            input.focus();
        }
    } catch (err) {
        showFeedback(false, 'Connection error. Please try again.');
    } finally {
        isSubmitting = false;
        btn.disabled = false;
        btn.textContent = 'Submit';
    }
}

function showEasterEggBonus() {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.style.top = '60%';
    popup.style.fontSize = '1.5rem';
    popup.style.color = '#f59e0b';
    popup.textContent = '🥚 2x EASTER EGG BONUS!';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
}

// ---------------------------------------------------------------------------
// Hints
// ---------------------------------------------------------------------------
async function requestHint() {
    const btn = document.getElementById('hint-btn');
    btn.disabled = true;
    try {
        const resp = await fetch('/hint', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await resp.json();
        if (data.time_up) { window.location.href = data.redirect; return; }
        document.getElementById('hint-text').textContent = data.hint;
        document.getElementById('hint-encouragement').textContent = data.encouragement || '';
        document.getElementById('hint-panel').classList.remove('hidden');
        if (data.remaining_seconds !== undefined) {
            remainingSeconds = data.remaining_seconds;
            updateTimerDisplay();
        }
        const timerEl = document.getElementById('timer');
        timerEl.classList.add('urgent');
        setTimeout(() => { if (remainingSeconds > 60) timerEl.classList.remove('urgent'); }, 1000);
    } catch (err) { console.error('Hint error:', err); }
    finally { btn.disabled = false; }
}

// ---------------------------------------------------------------------------
// Skip Puzzle
// ---------------------------------------------------------------------------
async function skipPuzzle() {
    const btn = document.getElementById('skip-btn');
    btn.disabled = true;
    try {
        const resp = await fetch('/skip', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await resp.json();
        if (data.time_up) { window.location.href = data.redirect; return; }
        if (data.redirect) {
            const skipPanel = document.getElementById('skip-panel');
            document.getElementById('skip-answer').textContent = data.answer;
            skipPanel.classList.remove('hidden');
            setTimeout(() => { window.location.href = data.redirect; }, 2000);
            return;
        }
        if (data.skipped) {
            const skipPanel = document.getElementById('skip-panel');
            document.getElementById('skip-answer').textContent = data.answer;
            skipPanel.classList.remove('hidden');
            document.getElementById('hint-panel').classList.add('hidden');
            document.getElementById('feedback').classList.add('hidden');
            setTimeout(() => {
                skipPanel.classList.add('hidden');
                if (data.puzzle) transitionToPuzzle(data);
            }, 2000);
        }
    } catch (err) { console.error('Skip error:', err); }
    finally { btn.disabled = false; }
}

// ---------------------------------------------------------------------------
// UI Transitions
// ---------------------------------------------------------------------------
function transitionToPuzzle(data) {
    const card = document.getElementById('puzzle-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px) scale(0.98)';

    setTimeout(() => {
        currentPuzzleNumber = data.puzzle_number || (currentPuzzleNumber + 1);
        document.getElementById('puzzle-question').textContent = data.puzzle.question;
        document.getElementById('puzzle-type').textContent = data.puzzle.puzzle_type || data.puzzle.type || 'riddle';
        document.getElementById('puzzle-number-badge').textContent = currentPuzzleNumber;
        document.getElementById('puzzle-num').textContent = currentPuzzleNumber;

        // Easter egg badge
        const eggBadge = document.getElementById('easter-egg-badge');
        if (eggBadge) eggBadge.classList.toggle('hidden', !data.puzzle.is_easter_egg);

        const pct = Math.round(((currentPuzzleNumber - 1) / TOTAL_PUZZLES) * 100);
        document.getElementById('progress-bar').style.width = pct + '%';
        document.getElementById('progress-pct').textContent = pct + '%';
        if (data.narrative_log?.length) {
            document.getElementById('narrative-text').textContent = data.narrative_log[data.narrative_log.length - 1];
        }
        if (data.remaining_seconds !== undefined) {
            remainingSeconds = data.remaining_seconds;
            updateTimerDisplay();
        }
        document.getElementById('answer-input').value = '';
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('hint-panel').classList.add('hidden');
        const skipPanel = document.getElementById('skip-panel');
        if (skipPanel) skipPanel.classList.add('hidden');
        const imgPanel = document.getElementById('image-upload-panel');
        if (imgPanel) imgPanel.classList.add('hidden');

        card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        document.getElementById('answer-input').focus();
    }, 350);
}

function showFeedback(correct, message) {
    const fb = document.getElementById('feedback');
    fb.className = 'mt-5 p-4 rounded-xl text-sm border animate-fade-in ' + (correct ? 'feedback-correct' : 'feedback-wrong');
    fb.textContent = (correct ? '✓ ' : '✗ ') + message;
    fb.classList.remove('hidden');
}

function showScorePopup(score) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + score;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1300);
}

function shakeElement(el) {
    el.classList.add('animate-shake');
    setTimeout(() => el.classList.remove('animate-shake'), 500);
}

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = (100 + Math.random() * 20) + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (8 + Math.random() * 8) + 's';
        const size = (1 + Math.random() * 2) + 'px';
        p.style.width = size; p.style.height = size;
        container.appendChild(p);
    }
}

// ---------------------------------------------------------------------------
// Time sync
// ---------------------------------------------------------------------------
function startTimeCheck() {
    setInterval(async () => {
        try {
            const resp = await fetch('/time-check', { method: 'POST' });
            const data = await resp.json();
            if (data.time_up) window.location.href = data.redirect;
            else if (data.remaining_seconds !== undefined) {
                if (Math.abs(remainingSeconds - data.remaining_seconds) > 5) {
                    remainingSeconds = data.remaining_seconds;
                    updateTimerDisplay();
                }
            }
        } catch (e) {}
    }, 30000);
}

// ---------------------------------------------------------------------------
// Result page celebration on load
// ---------------------------------------------------------------------------
function initResultPage() {
    const resultEl = document.querySelector('[data-result-victory]');
    if (resultEl && resultEl.dataset.resultVictory === 'true') {
        showVictoryCelebration();
    }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    startTimer();
    startTimeCheck();
    initResultPage();
    const input = document.getElementById('answer-input');
    if (input) input.focus();
});
