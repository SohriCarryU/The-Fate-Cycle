#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_ENV="$PROJECT_ROOT/backend/.env"
BACKEND_ENV_EXAMPLE="$PROJECT_ROOT/backend/.env.example"

usage() {
  cat <<'EOF'
Usage: ./run.sh <command>

Commands:
  backend   Start the FastAPI backend on HOST:PORT
  frontend  Serve the frontend directory with Python's static file server
  dev       Start the backend for local development
  test      Run backend tests and frontend layout checks
  help      Show this help

Environment:
  HOST             Backend host, default 127.0.0.1
  PORT             Backend port, default 8000
  FRONTEND_HOST    Frontend static server host, default 127.0.0.1
  FRONTEND_PORT    Frontend static server port, default 5173
  UVICORN_RELOAD   Set to true to enable backend reload
EOF
}

find_python() {
  if [ -x "$PROJECT_ROOT/backend/.venv/bin/python" ]; then
    printf '%s\n' "$PROJECT_ROOT/backend/.venv/bin/python"
    return 0
  fi
  if [ -x "$PROJECT_ROOT/.venv/bin/python" ]; then
    printf '%s\n' "$PROJECT_ROOT/.venv/bin/python"
    return 0
  fi
  return 1
}

require_python() {
  if ! PYTHON_BIN="$(find_python)"; then
    cat >&2 <<'EOF'
No project virtualenv Python found.

Create a virtual environment and install dependencies first, for example:
  python -m venv .venv
  . .venv/bin/activate
  python -m pip install -r backend/requirements.txt
EOF
    exit 1
  fi
  printf '%s\n' "$PYTHON_BIN"
}

check_backend_env() {
  if [ ! -f "$BACKEND_ENV" ]; then
    echo "backend/.env not found."
    if [ -f "$BACKEND_ENV_EXAMPLE" ]; then
      echo "Copy backend/.env.example to backend/.env and fill required values manually."
    else
      echo "Create backend/.env manually before starting the backend."
    fi
    exit 1
  fi
}

reload_flag() {
  case "${UVICORN_RELOAD:-}" in
    true|TRUE|True|1|yes|YES|Yes) printf '%s\n' "--reload" ;;
    *) printf '%s\n' "" ;;
  esac
}

run_backend() {
  check_backend_env
  python_bin="$(require_python)"
  host="${HOST:-127.0.0.1}"
  port="${PORT:-8000}"
  reload="$(reload_flag)"

  echo "Starting FastAPI backend at http://${host}:${port}"
  cd "$PROJECT_ROOT"
  if [ -n "$reload" ]; then
    "$python_bin" -m uvicorn backend.app.main:app --host "$host" --port "$port" "$reload"
  else
    "$python_bin" -m uvicorn backend.app.main:app --host "$host" --port "$port"
  fi
}

run_frontend() {
  python_bin="$(require_python)"
  host="${FRONTEND_HOST:-127.0.0.1}"
  port="${FRONTEND_PORT:-5173}"

  echo "Serving frontend at http://${host}:${port}"
  echo "For full API-backed gameplay, run './run.sh backend' and open that backend URL instead."
  cd "$PROJECT_ROOT/frontend"
  "$python_bin" -m http.server "$port" --bind "$host"
}

run_dev() {
  echo "Local dev starts the backend; FastAPI serves the frontend at the same URL."
  echo "Use UVICORN_RELOAD=true ./run.sh dev to enable reload."
  run_backend
}

run_tests() {
  python_bin="$(require_python)"
  cd "$PROJECT_ROOT"

  if "$python_bin" -c 'import pytest' >/dev/null 2>&1; then
    echo "Running backend tests..."
    "$python_bin" -m pytest backend/tests
  else
    echo "Skipping backend tests: pytest is not installed in the project virtualenv." >&2
    echo "Install test dependencies manually, then rerun ./run.sh test." >&2
  fi

  if command -v node >/dev/null 2>&1; then
    echo "Checking frontend JavaScript syntax..."
    node --check frontend/index.js
    node --check frontend/admin.js
    echo "Running frontend layout check..."
    node tests/frontend_layout_check.mjs
    echo "Running admin console check..."
    node tests/admin_console_check.mjs
  else
    echo "Skipping frontend checks: node is not available on PATH." >&2
  fi
}

command="${1:-help}"
case "$command" in
  backend) run_backend ;;
  frontend) run_frontend ;;
  dev) run_dev ;;
  test) run_tests ;;
  help|-h|--help) usage ;;
  *)
    echo "Unknown command: $command" >&2
    usage >&2
    exit 2
    ;;
esac
