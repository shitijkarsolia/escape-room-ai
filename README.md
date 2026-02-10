# AI Escape Room

An immersive, AI-powered escape room game built with **Groq**. Every puzzle is uniquely generated at lightning speed using Groq's LPU Inference Engine. Solve riddles, logic puzzles, visual challenges, and ciphers to escape before time runs out.

## Features

- **3 Themed Rooms**: Ancient Temple, Space Station, Haunted Mansion — each with unique atmosphere and narrative
- **Dynamic Puzzle Generation**: Every puzzle is created on-the-fly by Groq — no two playthroughs are the same
- **Multimodal Puzzles**: Upload images and Groq creates visual puzzles from them
- **Adaptive Difficulty**: The AI calibrates puzzle difficulty based on your performance
- **Hint System**: Request hints when stuck (costs 60 seconds from your timer)
- **15-Minute Timer**: Race against the clock to solve all 5 puzzles

## Groq Integration

This app deeply integrates Groq's ultra-fast LPU inference in four key ways:

1. **Puzzle Generation** — Generates logically consistent, thematically appropriate puzzles with structured JSON output at ~1000 tokens/sec
2. **Answer Validation** — Flexible semantic matching (not just string comparison) so players aren't penalized for minor typos or rephrasing
3. **Multimodal Analysis** — Players can upload images that Llama 4 Scout analyzes to create visual puzzles tied into the room's narrative
4. **Adaptive Game Mastering** — Difficulty adjusts dynamically based on solve times and hint usage, maintaining an engaging challenge curve

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: Jinja2, Tailwind CSS, Vanilla JavaScript
- **AI**: Groq API (groq Python SDK)
- **Deployment**: AWS EC2 + Gunicorn

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd escape-room-ai

# Install dependencies (uv handles Python + venv automatically)
uv sync

# Set environment variables
export GROQ_API_KEY=your-api-key-here
export FLASK_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Run the app
uv run python app.py
```

Visit `http://localhost:5000` to play.

## Production Deployment

```bash
uv run gunicorn -w 2 -b 0.0.0.0:80 app:app
```

## How to Play

1. Choose a themed room from the lobby
2. Read each puzzle carefully and type your answer
3. Use hints if stuck (costs 60 seconds)
4. Upload images to create visual puzzles
5. Solve all 5 puzzles before the 15-minute timer runs out!
