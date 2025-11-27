#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Angular development server on port 4200..."
ng serve --port 4200 --proxy-config proxy.conf.json

