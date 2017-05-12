#!/bin/sh

# script/setup: Set up application for the first time after cloning, or set it
#               back to the initial first unused state.

set -e

cd "$(dirname "$0")/.."

echo "Installing virtualenv..."
pip install virtualenv
echo "Creating a virtualenv..."
virtualenv env --python=python2.7
source env/bin/activate

scripts/bootstrap.sh

