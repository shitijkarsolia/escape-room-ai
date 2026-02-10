#!/bin/bash
set -e

# Install uv (manages Python + packages)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Create app directory
mkdir -p /opt/escape-room-ai
cd /opt/escape-room-ai

echo "Server bootstrapped and ready for code deployment" > /tmp/bootstrap-done
