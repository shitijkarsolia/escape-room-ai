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

// ---------------------------------------------------------------------------
// CSRF token helper (Fix #3)
// ---------------------------------------------------------------------------
function getCSRFToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

function csrfHeaders(extra) {
    return Object.assign({
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
    }, extra || {});
}

// ---------------------------------------------------------------------------
// Reveal-blocks-submit state (Fix #2)
// ---------------------------------------------------------------------------
let answerRevealed = false;

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
// Theme Factoids — fun trivia shown during loading transitions
// ---------------------------------------------------------------------------
const THEME_FACTOIDS = {
    theoffice: [
        { emoji: '📎', text: "Dwight's desk has been encased in Jell-O at least 3 times." },
        { emoji: '🥨', text: "Stanley's pretzel day is based on a real office tradition the writers had." },
        { emoji: '☕', text: "Steve Carell improvised 'That\'s what she said' so often it became Michael's catchphrase." },
        { emoji: '🖨️', text: "The Dunder Mifflin paper company was so convincing, people actually tried to order paper from them." },
        { emoji: '🎸', text: "Creed Bratton's character is named after the real actor — who was in a 60s rock band." },
        { emoji: '🏆', text: "The Dundie Awards were inspired by real office award ceremonies the writers attended." },
        { emoji: '📋', text: "Rainn Wilson auditioned for the role of Michael Scott before being cast as Dwight." },
        { emoji: '🐻', text: "Bears. Beets. Battlestar Galactica. — Jim's most iconic Dwight impression." },
    ],
    friends: [
        { emoji: '☕', text: "The orange couch in Central Perk was found in the Warner Bros. studio basement." },
        { emoji: '🦞', text: "Phoebe's 'Smelly Cat' was almost a real single release." },
        { emoji: '🍕', text: "Joey's 'How you doin'?' was improvised by Matt LeBlanc during rehearsal." },
        { emoji: '🛋️', text: "The apartment numbers changed from 4 & 5 to 19 & 20 after the crew realized they lived too high up." },
        { emoji: '💍', text: "Monica and Chandler's relationship wasn't planned — the audience reaction made it happen." },
        { emoji: '🦃', text: "The Thanksgiving episodes became a tradition after the first one was a massive hit." },
        { emoji: '👏', text: "The iconic clapping intro was filmed at a fountain at Warner Bros. at 4 AM." },
        { emoji: '🧬', text: "Ross has been divorced three times — a running gag the writers loved." },
    ],
    got: [
        { emoji: '🐉', text: "Daenerys's dragons were named after her husband and brothers." },
        { emoji: '⚔️', text: "The Iron Throne in the books is described as much larger — over 200 swords." },
        { emoji: '🐺', text: "The Stark direwolves were played by Northern Inuit dogs." },
        { emoji: '👑', text: "George R.R. Martin has a cameo in the pilot's original unaired version." },
        { emoji: '🏰', text: "Dubrovnik, Croatia doubled as King's Landing for most of the series." },
        { emoji: '🔥', text: "Emilia Clarke actually ate a real heart-shaped cake for the horse heart scene." },
        { emoji: '❄️', text: "The Night's Watch oath was inspired by real medieval monastic vows." },
        { emoji: '🗡️', text: "Arya's sword Needle was named because Arya hated needlework." },
    ],
    parksandrec: [
        { emoji: '🧇', text: "Leslie Knope's love of waffles was inspired by Amy Poehler's real breakfast habits." },
        { emoji: '🐴', text: "Li'l Sebastian was played by a miniature horse named Gideon." },
        { emoji: '🌳', text: "Pawnee, Indiana is fictional, but the show used real Indiana town quirks." },
        { emoji: '🥩', text: "Ron Swanson's love of meat is real — Nick Offerman is an avid woodworker and carnivore." },
        { emoji: '🏛️', text: "The Parks Department set was built on the same stage as Cheers." },
        { emoji: '⭐', text: "Chris Pratt improvised the line about falling in the pit — it became a song." },
        { emoji: '📝', text: "Ben's accounting puns were written by a real accountant consultant." },
        { emoji: '🎉', text: "Treat Yo Self day (October 13th) is celebrated by fans worldwide." },
    ],
    bigbang: [
        { emoji: '⚛️', text: "A real UCLA physicist, David Saltzberg, reviewed every script for accuracy." },
        { emoji: '🚀', text: "Howard actually went to space — the ISS scenes used real NASA footage as reference." },
        { emoji: '🎮', text: "The apartment number 4A is a nod to the show being on at 8pm (4A in military time)." },
        { emoji: '🧪', text: "Sheldon's knock pattern (3 knocks) was Jim Parsons' improvisation that stuck." },
        { emoji: '🤓', text: "Mayim Bialik (Amy) has a real PhD in neuroscience." },
        { emoji: '🎸', text: "The theme song by Barenaked Ladies was written specifically for the show." },
        { emoji: '🔬', text: "The equations on the whiteboards are real and change every episode." },
        { emoji: '🏆', text: "Jim Parsons won 4 Emmy Awards for playing Sheldon Cooper." },
    ],
    breakingbad: [
        { emoji: '🧬', text: "Bryan Cranston actually learned to cook (fake) meth for authenticity." },
        { emoji: '💎', text: "The blue meth was actually blue rock candy made by a professional candy maker." },
        { emoji: '🏜️', text: "Albuquerque, NM gave the show tax incentives — making it a character itself." },
        { emoji: '🔵', text: "Walter White's name combines Walt Whitman and a play on 'white' for his double life." },
        { emoji: '💰', text: "Jesse Pinkman was supposed to die in Season 1 but Aaron Paul was too good." },
        { emoji: '🧪', text: "The show's chemical formulas are scientifically accurate (mostly)." },
        { emoji: '🚐', text: "The RV used for cooking was a 1986 Fleetwood Bounder." },
        { emoji: '🎩', text: "Heisenberg's hat was Bryan Cranston's idea to distinguish Walt's alter ego." },
    ],
    supernatural: [
        { emoji: '🚗', text: "The Impala (Baby) is a 1967 Chevrolet — the show used 9 different ones." },
        { emoji: '😈', text: "Mark Sheppard (Crowley) holds the record for most sci-fi/fantasy show appearances." },
        { emoji: '👼', text: "Castiel was only supposed to appear in 6 episodes but became a series regular." },
        { emoji: '🔥', text: "The show ran for 15 seasons — one of the longest-running sci-fi series ever." },
        { emoji: '🗡️', text: "Dean's love of pie is based on Jensen Ackles' real-life pie obsession." },
        { emoji: '⭐', text: "The anti-possession tattoos became one of the most popular fan tattoos." },
        { emoji: '📖', text: "John Winchester's journal was published as an actual book fans can buy." },
        { emoji: '🎵', text: "'Carry On Wayward Son' by Kansas became the unofficial show anthem." },
    ],
    custom: [
        { emoji: '🧠', text: "AI image recognition can identify over 10,000 distinct object categories." },
        { emoji: '🎨', text: "The human eye can distinguish about 10 million different colors." },
        { emoji: '📷', text: "The first digital photograph was taken in 1957 — it was a baby picture." },
        { emoji: '✨', text: "Your brain processes images in as little as 13 milliseconds." },
        { emoji: '🌟', text: "Escape rooms originated in Japan in 2007 and spread worldwide." },
        { emoji: '🔐', text: "The most popular escape room theme worldwide is 'prison break'." },
        { emoji: '💡', text: "The average escape room has a 30-40% success rate." },
        { emoji: '🧩', text: "The word 'puzzle' comes from the Middle English 'pusle' meaning to bewilder." },
    ],
};

function getRandomFactoid() {
    const theme = getCurrentTheme() || 'custom';
    const factoids = THEME_FACTOIDS[theme] || THEME_FACTOIDS.custom;
    return factoids[Math.floor(Math.random() * factoids.length)];
}

// ---------------------------------------------------------------------------
// Loading Overlay (between puzzles) — with dynamic factoids
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
    const factoid = getRandomFactoid();
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'puzzle-loading';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div class="puzzle-loading-content">
            <div class="puzzle-loading-spinner"></div>
            <p class="puzzle-loading-text">${LOADING_MESSAGES[0]}</p>
            <div class="puzzle-loading-dots"><span>.</span><span>.</span><span>.</span></div>
            <div class="factoid-card">
                <div class="factoid-emoji">${factoid.emoji}</div>
                <p class="factoid-label">Did you know?</p>
                <p class="factoid-text">${factoid.text}</p>
            </div>
        </div>`;
    overlay.classList.remove('hidden');

    // Cycle loading messages
    let msgIdx = 0;
    overlay._msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
        const txt = overlay.querySelector('.puzzle-loading-text');
        if (txt) txt.textContent = LOADING_MESSAGES[msgIdx];
    }, 2000);

    // Cycle factoids with crossfade
    overlay._factoidInterval = setInterval(() => {
        const card = overlay.querySelector('.factoid-card');
        if (!card) return;
        card.classList.add('factoid-exit');
        setTimeout(() => {
            const next = getRandomFactoid();
            card.querySelector('.factoid-emoji').textContent = next.emoji;
            card.querySelector('.factoid-text').textContent = next.text;
            card.classList.remove('factoid-exit');
            card.classList.add('factoid-enter');
            setTimeout(() => card.classList.remove('factoid-enter'), 500);
        }, 400);
    }, 4000);
}

function hidePuzzleLoading() {
    const overlay = document.getElementById('puzzle-loading');
    if (overlay) {
        clearInterval(overlay._msgInterval);
        clearInterval(overlay._factoidInterval);
        overlay.classList.add('hidden');
    }
}

// ---------------------------------------------------------------------------
// Full-page factoid interstitial (shown between puzzles)
// ---------------------------------------------------------------------------
let _factoidPageData = null;  // stash next-puzzle data to apply after factoid

function showFactoidPage(nextPuzzleData, duration) {
    _factoidPageData = nextPuzzleData;
    const ms = duration || 2800;

    // Remove any existing factoid page
    document.querySelectorAll('.factoid-page').forEach(el => el.remove());

    const factoid = getRandomFactoid();
    const theme = getCurrentTheme();
    const themeData = THEME_DATA[theme] || {};
    const nextNum = nextPuzzleData
        ? (nextPuzzleData.puzzle_number || (currentPuzzleNumber + 1))
        : currentPuzzleNumber + 1;

    const overlay = document.createElement('div');
    overlay.className = 'factoid-page';
    overlay.innerHTML = `
        <div class="factoid-page-inner">
            <div class="factoid-page-progress">
                <span class="factoid-page-badge">Puzzle ${nextNum} of ${TOTAL_PUZZLES}</span>
            </div>
            <div class="factoid-page-emoji">${factoid.emoji}</div>
            <p class="factoid-page-label">Did you know?</p>
            <p class="factoid-page-text">${factoid.text}</p>
            <div class="factoid-page-loader">
                <div class="factoid-page-loader-bar" style="animation-duration: ${ms}ms;"></div>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    // After duration, transition to next puzzle
    setTimeout(() => {
        overlay.classList.add('factoid-page-exit');
        setTimeout(() => {
            overlay.remove();
            if (_factoidPageData) {
                transitionToPuzzle(_factoidPageData);
                _factoidPageData = null;
            }
        }, 500);
    }, ms);
}

function hideFactoidPage() {
    document.querySelectorAll('.factoid-page').forEach(el => {
        el.classList.add('factoid-page-exit');
        setTimeout(() => el.remove(), 500);
    });
    _factoidPageData = null;
}

// ---------------------------------------------------------------------------
// Retry puzzle generation
// ---------------------------------------------------------------------------
async function retryNextPuzzle(attempts) {
    const maxAttempts = attempts || 3;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const resp = await fetch('/next-puzzle', { method: 'POST', headers: csrfHeaders() });
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

    // Fix #2: Block submission if answer was revealed
    if (answerRevealed) {
        showFeedback(false, 'You already revealed the answer. Use Skip to move on.');
        shakeElement(document.getElementById('puzzle-card'));
        return;
    }

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
            headers: csrfHeaders(),
            body: JSON.stringify({ answer }),
        });
        const data = await resp.json();

        if (data.time_up) { window.location.href = data.redirect; return; }
        if (data.redirect) {
            showFeedback(true, data.feedback || 'Correct!');
            showCharacterReaction(true);
            showCorrectEffect();
            showScorePopup(data.score);
            fireConfetti();
            if (data.is_easter_egg) showEasterEggBonus();
            setTimeout(() => {
                showVictoryCelebration();
                fireConfetti();
                setTimeout(() => { window.location.href = data.redirect; }, 2000);
            }, 1000);
            return;
        }
        if (data.correct) {
            showFeedback(true, data.feedback || 'Correct!');
            showCharacterReaction(true);
            showCorrectEffect();
            showScorePopup(data.score);
            fireConfetti();
            incrementStreak();
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
                // Full-page factoid interstitial before next puzzle
                setTimeout(() => showFactoidPage(data, 2800), 800);
            }
        } else {
            showFeedback(false, data.feedback || 'Not quite. Try again!');
            showCharacterReaction(false);
            resetStreak();
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
        const resp = await fetch('/hint', { method: 'POST', headers: csrfHeaders() });
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
// Reveal Answer
// ---------------------------------------------------------------------------
async function revealAnswer() {
    const btn = document.getElementById('reveal-btn');
    const panel = document.getElementById('reveal-panel');

    // Toggle off if already visible
    if (!panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        return;
    }

    btn.disabled = true;
    try {
        const resp = await fetch('/reveal', { method: 'POST', headers: csrfHeaders() });
        const data = await resp.json();
        if (data.time_up) { window.location.href = data.redirect; return; }
        document.getElementById('reveal-answer-text').textContent = data.answer;
        panel.classList.remove('hidden');

        // Fix #2: Mark answer as revealed — disable submit
        answerRevealed = true;
        const submitBtn = document.getElementById('submit-btn');
        const answerInput = document.getElementById('answer-input');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.4'; }
        if (answerInput) { answerInput.disabled = true; answerInput.placeholder = 'Answer revealed — use Skip to continue'; }
    } catch (err) { console.error('Reveal error:', err); }
    finally { btn.disabled = false; }
}

// ---------------------------------------------------------------------------
// Skip Puzzle
// ---------------------------------------------------------------------------
async function skipPuzzle() {
    const btn = document.getElementById('skip-btn');
    btn.disabled = true;
    try {
        const resp = await fetch('/skip', { method: 'POST', headers: csrfHeaders() });
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
                if (data.puzzle) {
                    showFactoidPage(data, 2500);
                } else {
                    transitionToPuzzle(data);
                }
            }, 1500);
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

    // Clean up any lingering factoid
    hideInlineFactoid();

    // Fix #2: Reset revealed state for the new puzzle
    answerRevealed = false;
    const submitBtn = document.getElementById('submit-btn');
    const answerInput = document.getElementById('answer-input');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
    if (answerInput) { answerInput.disabled = false; answerInput.placeholder = 'Type your answer...'; }

    setTimeout(() => {
        currentPuzzleNumber = data.puzzle_number || (currentPuzzleNumber + 1);
        typeText(document.getElementById('puzzle-question'), data.puzzle.question);
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
        const revealPanel = document.getElementById('reveal-panel');
        if (revealPanel) revealPanel.classList.add('hidden');
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
            const resp = await fetch('/time-check', { method: 'POST', headers: csrfHeaders() });
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
// Typing Effect
// ---------------------------------------------------------------------------
let typeTimer = null;
function typeText(el, text, speed) {
    if (typeTimer) clearInterval(typeTimer);
    el.textContent = '';
    el.style.borderRight = '2px solid var(--accent, #3b82f6)';
    let i = 0;
    const s = speed || 18;
    typeTimer = setInterval(() => {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeTimer);
            typeTimer = null;
            el.style.borderRight = 'none';
        }
    }, s);
}

// ---------------------------------------------------------------------------
// Puzzle Card Tilt (parallax mouse effect)
// ---------------------------------------------------------------------------
function initCardTilt() {
    const card = document.getElementById('puzzle-card');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    });
}

// ---------------------------------------------------------------------------
// Streak Counter
// ---------------------------------------------------------------------------
let currentStreak = 0;

function incrementStreak() {
    currentStreak++;
    if (currentStreak >= 2) showStreakBadge();
}

function resetStreak() {
    currentStreak = 0;
    hideStreakBadge();
}

function showStreakBadge() {
    let badge = document.getElementById('streak-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'streak-badge';
        badge.className = 'streak-badge';
        document.body.appendChild(badge);
    }
    badge.innerHTML = `<span class="streak-fire">🔥</span><span class="streak-count">${currentStreak}</span><span class="streak-label">STREAK</span>`;
    badge.classList.remove('hidden');
    badge.classList.add('streak-pop');
    setTimeout(() => badge.classList.remove('streak-pop'), 500);
}

function hideStreakBadge() {
    const badge = document.getElementById('streak-badge');
    if (badge) badge.classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Confetti Cannon
// ---------------------------------------------------------------------------
function fireConfetti() {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0'];
    const count = 60;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.left = (40 + Math.random() * 20) + '%';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.setProperty('--dx', (Math.random() - 0.5) * 600 + 'px');
            el.style.setProperty('--dy', -(200 + Math.random() * 300) + 'px');
            el.style.setProperty('--rot', Math.random() * 720 - 360 + 'deg');
            el.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
            if (Math.random() > 0.5) {
                el.style.width = '4px'; el.style.height = '12px';
            } else {
                el.style.width = '8px'; el.style.height = '8px'; el.style.borderRadius = '50%';
            }
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3500);
        }, i * 15);
    }
}

// ---------------------------------------------------------------------------
// Result page celebration on load
// ---------------------------------------------------------------------------
function initResultPage() {
    const resultEl = document.querySelector('[data-result-victory]');
    if (resultEl && resultEl.dataset.resultVictory === 'true') {
        showVictoryCelebration();
        fireConfetti();
    }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCardTilt();
    startTimer();
    startTimeCheck();
    initResultPage();

    // Type the initial puzzle question on first load
    const q = document.getElementById('puzzle-question');
    if (q && q.textContent.trim() && q.textContent.trim() !== 'Loading puzzle...') {
        const text = q.textContent;
        typeText(q, text, 15);
    }

    const input = document.getElementById('answer-input');
    if (input) input.focus();
});
