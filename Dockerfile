# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Kör som icke-root
RUN useradd -m appuser
USER appuser

EXPOSE 8080
CMD ["uvicorn","backend.app:app","--host","0.0.0.0","--port","8080"]
