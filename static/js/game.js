/* ================================================================
   AI Escape Room — Game Client
   ================================================================ */

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
            remainingSeconds = 0;
            clearInterval(timerInterval);
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
            setTimeout(() => { window.location.href = data.redirect; }, 1500);
            return;
        }
        if (data.correct) {
            showFeedback(true, data.feedback || 'Correct!');
            showScorePopup(data.score);
            currentScore += (data.score || 0);
            document.getElementById('score').textContent = currentScore;
            setTimeout(() => { if (data.puzzle) transitionToPuzzle(data); }, 1500);
        } else {
            showFeedback(false, data.feedback || 'Not quite. Try again!');
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
// Image Upload
// ---------------------------------------------------------------------------
function toggleImageUpload() {
    document.getElementById('image-upload-panel').classList.toggle('hidden');
}

async function uploadClue() {
    const file = document.getElementById('image-input').files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const btn = document.querySelector('#image-upload-panel button');
    btn.disabled = true; btn.textContent = 'Analyzing...';
    try {
        const resp = await fetch('/upload-clue', { method: 'POST', body: formData });
        const data = await resp.json();
        if (data.success && data.puzzle) {
            document.getElementById('puzzle-question').textContent = data.puzzle.question;
            document.getElementById('puzzle-type').textContent = 'visual';
            if (data.narrative_log?.length) {
                document.getElementById('narrative-text').textContent = data.narrative_log[data.narrative_log.length - 1];
            }
            document.getElementById('image-upload-panel').classList.add('hidden');
            document.getElementById('hint-panel').classList.add('hidden');
            document.getElementById('answer-input').value = '';
            document.getElementById('answer-input').focus();
            animatePuzzleCard();
        } else { alert(data.error || 'Failed to analyze image'); }
    } catch (err) { alert('Upload failed. Please try again.'); }
    finally { btn.disabled = false; btn.textContent = 'Analyze'; }
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
        document.getElementById('image-upload-panel').classList.add('hidden');

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

function animatePuzzleCard() {
    const card = document.getElementById('puzzle-card');
    card.style.transition = 'none';
    card.style.transform = 'scale(0.97)';
    card.style.opacity = '0.5';
    setTimeout(() => {
        card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'scale(1)';
        card.style.opacity = '1';
    }, 50);
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
        p.style.width = size;
        p.style.height = size;
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
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    startTimer();
    startTimeCheck();
    const input = document.getElementById('answer-input');
    if (input) input.focus();
});
