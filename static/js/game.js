/* ================================================================
   AI Escape Room — Game Client Logic
   Timer, fetch API calls, UI updates, transitions
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
            handleTimeUp();
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

    // Urgency styling
    if (remainingSeconds <= 60) {
        timerEl.classList.add('text-red-400');
        timerEl.classList.add('animate-pulse');
    } else if (remainingSeconds <= 180) {
        timerEl.classList.add('text-amber-400');
        timerEl.classList.remove('text-red-400');
    }
}

function handleTimeUp() {
    window.location.href = '/result';
}

// ---------------------------------------------------------------------------
// Answer Submission
// ---------------------------------------------------------------------------
async function submitAnswer() {
    if (isSubmitting) return;

    const input = document.getElementById('answer-input');
    const answer = input.value.trim();
    if (!answer) {
        shakeElement(input);
        return;
    }

    isSubmitting = true;
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
        const resp = await fetch('/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer }),
        });
        const data = await resp.json();

        if (data.time_up) {
            window.location.href = data.redirect;
            return;
        }

        if (data.redirect) {
            // Game complete
            showFeedback(true, data.feedback || 'Correct!');
            setTimeout(() => { window.location.href = data.redirect; }, 1500);
            return;
        }

        if (data.correct) {
            showFeedback(true, data.feedback || 'Correct!');
            showScorePopup(data.score);

            // Update score
            currentScore += (data.score || 0);
            document.getElementById('score').textContent = currentScore;

            // Transition to next puzzle after brief delay
            setTimeout(() => {
                if (data.puzzle) {
                    transitionToPuzzle(data);
                }
            }, 1500);
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
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}

// ---------------------------------------------------------------------------
// Hint System
// ---------------------------------------------------------------------------
async function requestHint() {
    const hintBtn = document.getElementById('hint-btn');
    hintBtn.disabled = true;

    try {
        const resp = await fetch('/hint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await resp.json();

        if (data.time_up) {
            window.location.href = data.redirect;
            return;
        }

        // Show hint panel
        const hintPanel = document.getElementById('hint-panel');
        document.getElementById('hint-text').textContent = data.hint;
        document.getElementById('hint-encouragement').textContent = data.encouragement || '';
        hintPanel.classList.remove('hidden');

        // Update timer with new remaining time
        if (data.remaining_seconds !== undefined) {
            remainingSeconds = data.remaining_seconds;
            updateTimerDisplay();
        }

        // Flash timer red to show penalty
        const timerEl = document.getElementById('timer');
        timerEl.classList.add('text-red-400', 'animate-shake');
        setTimeout(() => {
            timerEl.classList.remove('animate-shake');
        }, 500);

    } catch (err) {
        console.error('Hint error:', err);
    } finally {
        hintBtn.disabled = false;
    }
}

// ---------------------------------------------------------------------------
// Image Upload
// ---------------------------------------------------------------------------
function toggleImageUpload() {
    const panel = document.getElementById('image-upload-panel');
    panel.classList.toggle('hidden');
}

async function uploadClue() {
    const fileInput = document.getElementById('image-input');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const uploadBtn = document.querySelector('#image-upload-panel button');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Analyzing...';

    try {
        const resp = await fetch('/upload-clue', {
            method: 'POST',
            body: formData,
        });
        const data = await resp.json();

        if (data.success && data.puzzle) {
            // Update puzzle display with image-based puzzle
            document.getElementById('puzzle-question').textContent = data.puzzle.question;
            document.getElementById('puzzle-type').textContent = 'visual';

            // Update narrative
            if (data.narrative_log && data.narrative_log.length > 0) {
                document.getElementById('narrative-text').textContent = data.narrative_log[data.narrative_log.length - 1];
            }

            // Hide upload panel
            document.getElementById('image-upload-panel').classList.add('hidden');
            // Hide hint panel since puzzle changed
            document.getElementById('hint-panel').classList.add('hidden');

            // Clear answer input
            document.getElementById('answer-input').value = '';
            document.getElementById('answer-input').focus();

            // Animate puzzle card
            animatePuzzleCard();
        } else {
            alert(data.error || 'Failed to analyze image');
        }
    } catch (err) {
        alert('Upload failed. Please try again.');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Analyze';
    }
}

// ---------------------------------------------------------------------------
// UI Transitions & Effects
// ---------------------------------------------------------------------------
function transitionToPuzzle(data) {
    const card = document.getElementById('puzzle-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    setTimeout(() => {
        // Update puzzle content
        currentPuzzleNumber = data.puzzle_number || (currentPuzzleNumber + 1);
        document.getElementById('puzzle-question').textContent = data.puzzle.question;
        document.getElementById('puzzle-type').textContent = data.puzzle.puzzle_type || data.puzzle.type || 'riddle';
        document.getElementById('puzzle-number-badge').textContent = currentPuzzleNumber;
        document.getElementById('puzzle-num').textContent = currentPuzzleNumber;

        // Update progress
        const pct = Math.round(((currentPuzzleNumber - 1) / TOTAL_PUZZLES) * 100);
        document.getElementById('progress-bar').style.width = pct + '%';
        document.getElementById('progress-pct').textContent = pct + '%';

        // Update narrative
        if (data.narrative_log && data.narrative_log.length > 0) {
            document.getElementById('narrative-text').textContent = data.narrative_log[data.narrative_log.length - 1];
        }

        // Update remaining time
        if (data.remaining_seconds !== undefined) {
            remainingSeconds = data.remaining_seconds;
            updateTimerDisplay();
        }

        // Clear inputs and panels
        document.getElementById('answer-input').value = '';
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('hint-panel').classList.add('hidden');
        document.getElementById('image-upload-panel').classList.add('hidden');

        // Animate in
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';

        document.getElementById('answer-input').focus();
    }, 300);
}

function showFeedback(isCorrect, message) {
    const fb = document.getElementById('feedback');
    fb.classList.remove('hidden', 'bg-green-900/50', 'border-green-700', 'text-green-300',
                         'bg-red-900/50', 'border-red-700', 'text-red-300');

    if (isCorrect) {
        fb.classList.add('bg-green-900/50', 'border', 'border-green-700', 'text-green-300');
        fb.textContent = '✅ ' + message;
    } else {
        fb.classList.add('bg-red-900/50', 'border', 'border-red-700', 'text-red-300');
        fb.textContent = '❌ ' + message;
    }
    fb.classList.remove('hidden');
}

function showScorePopup(score) {
    const popup = document.createElement('div');
    popup.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black z-50 pointer-events-none';
    popup.style.color = 'var(--accent-color)';
    popup.textContent = '+' + score;
    popup.style.transition = 'all 1s ease-out';
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -150%)';
    });

    setTimeout(() => popup.remove(), 1200);
}

function shakeElement(el) {
    el.classList.add('animate-shake');
    setTimeout(() => el.classList.remove('animate-shake'), 500);
}

function animatePuzzleCard() {
    const card = document.getElementById('puzzle-card');
    card.style.transition = 'none';
    card.style.transform = 'scale(0.95)';
    card.style.opacity = '0.5';
    setTimeout(() => {
        card.style.transition = 'all 0.4s ease-out';
        card.style.transform = 'scale(1)';
        card.style.opacity = '1';
    }, 50);
}

// ---------------------------------------------------------------------------
// Background Particles
// ---------------------------------------------------------------------------
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const count = 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        p.style.width = (2 + Math.random() * 3) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}

// ---------------------------------------------------------------------------
// Periodic Time Check (backup for server-side time tracking)
// ---------------------------------------------------------------------------
function startTimeCheck() {
    setInterval(async () => {
        try {
            const resp = await fetch('/time-check', { method: 'POST' });
            const data = await resp.json();
            if (data.time_up) {
                window.location.href = data.redirect;
            } else if (data.remaining_seconds !== undefined) {
                // Sync client timer with server
                const diff = Math.abs(remainingSeconds - data.remaining_seconds);
                if (diff > 5) {
                    remainingSeconds = data.remaining_seconds;
                    updateTimerDisplay();
                }
            }
        } catch (e) { /* ignore */ }
    }, 30000); // Every 30 seconds
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    startTimer();
    startTimeCheck();

    // Focus answer input
    const input = document.getElementById('answer-input');
    if (input) input.focus();
});
