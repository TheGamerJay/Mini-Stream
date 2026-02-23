FROM python:3.11-slim

# Install Node.js 20
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install and build React frontend
COPY frontend/package*.json frontend/
RUN npm install --prefix frontend

COPY frontend/ frontend/
RUN npm run build --prefix frontend

# Copy backend
COPY backend/ backend/

EXPOSE 8080

CMD ["sh", "-c", "gunicorn --chdir backend wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]
