FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

EXPOSE 80

CMD ["uv", "run", "gunicorn", "-w", "2", "-b", "0.0.0.0:80", "--timeout", "120", "app:app"]
