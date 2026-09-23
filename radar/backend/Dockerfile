FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/secrets && chmod 700 /app/secrets

RUN useradd -r -u 1000 radar && chown -R radar:radar /app
USER radar

EXPOSE 8091
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8091", "--workers", "1", "--log-level", "info"]
