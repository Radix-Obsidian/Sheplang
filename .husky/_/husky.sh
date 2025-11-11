#!/bin/sh
# Minimal Husky shim for Windows + Git Bash environments
# Ensures node bin tools are on PATH when hooks run
export PATH="$PATH:./node_modules/.bin"
