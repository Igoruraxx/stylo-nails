#!/usr/bin/env bash
cd /Users/igor/stylo-nails
npx tsc --noEmit --pretty 2>&1 | head -50
