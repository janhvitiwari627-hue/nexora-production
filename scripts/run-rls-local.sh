#!/usr/bin/env bash
set -euo pipefail

# Run the RLS test suite locally, loading credentials from a project-root .env file.
# If .env does not exist, this script seeds it from scripts/rls.env.example and
# prompts you to fill in the real values before re-running.

# Change to project root (this script lives in scripts/).
cd "$(dirname "$0")/.."

if [ ! -f ".env" ]; then
  echo "No .env found in project root. Creating one from scripts/rls.env.example..."
  cp scripts/rls.env.example .env
  echo ""
  echo "Please open .env and replace the placeholder values with your real credentials."
  echo "Then re-run:"
  echo "  bun run test:rls:local"
  exit 2
fi

echo "Loading environment from .env..."
set -a
source .env
set +a

echo "Running RLS tests..."
exec bun run test:rls
