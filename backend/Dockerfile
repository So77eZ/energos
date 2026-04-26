FROM python:3.14

WORKDIR /src

COPY . .

RUN pip install uv && uv sync

CMD ["sh", "-c", "uv run python -m src.migration_bootstrap && uv run uvicorn main:app --host 0.0.0.0 --port 8000"]