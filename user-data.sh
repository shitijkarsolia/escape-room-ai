#!/bin/bash
set -e

# Install Python 3.11 and pip
yum update -y
yum install -y python3.11 python3.11-pip

# Create app directory
mkdir -p /opt/escape-room-ai
cd /opt/escape-room-ai

echo "Server bootstrapped and ready for code deployment" > /tmp/bootstrap-done
