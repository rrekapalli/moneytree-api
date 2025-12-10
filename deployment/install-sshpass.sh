#!/bin/bash
# Helper script to install sshpass for automated deployments

echo "Installing sshpass for automated deployment..."
echo "This requires sudo privileges."

if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y sshpass
elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y sshpass
elif command -v brew >/dev/null 2>&1; then
    brew install hudochenkov/sshpass/sshpass
else
    echo "Package manager not found. Please install sshpass manually."
    exit 1
fi

if command -v sshpass >/dev/null 2>&1; then
    echo "✓ sshpass installed successfully!"
else
    echo "✗ sshpass installation failed"
    exit 1
fi
