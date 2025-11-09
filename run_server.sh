#!/bin/bash
# Run Django server with Daphne for WebSocket support
cd "$(dirname "$0")"
source .venv/bin/activate
daphne -b 0.0.0.0 -p 8000 gyoji.asgi:application


