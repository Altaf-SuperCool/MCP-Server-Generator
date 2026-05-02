# Multi-stage build for my-mcp-server
# Stage 1: Build
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY src ./src

# Create non-root user
RUN useradd -m -u 1001 python && \
    chown -R python:python /app

# Switch to non-root user
USER python

# Add local bin to PATH
ENV PATH=/root/.local/bin:$PATH

# Expose port (if using HTTP transport)

# Health check

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Start the server
CMD ["python", "-m", "src.main"]

# Made with Bob
