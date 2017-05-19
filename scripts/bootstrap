#!/bin/sh

# script/bootstrap: Resolve all dependencies that the application requires to
#                   run.

set -e

cd "$(dirname "$0")/.."

echo "Installing npm dependencies..."
npm install

echo "Installing python dependencies..."
pip install -r app-requirements.txt
echo "Dependencies installed"
