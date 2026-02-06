FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (libstdc++ is included in python:3.11-slim)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY api/requirements.txt ./api/
RUN pip install --no-cache-dir -r api/requirements.txt

# Copy and install market_research
COPY market_research ./market_research/
RUN pip install -e market_research

# Copy the rest of the code
COPY . .

# Railway injects PORT env var
CMD uvicorn api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}

