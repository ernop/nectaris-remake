#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
exec python3 -m http.server 8001 --bind 127.0.0.1
