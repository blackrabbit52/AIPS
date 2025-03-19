#!/bin/bash

# Function to check OS type
get_os_type() {
    case "$(uname -s)" in
        Linux*)     echo "Linux";;
        Darwin*)    echo "Mac";;
        MINGW*)     echo "Windows";;
        CYGWIN*)    echo "Windows";;
        *)          echo "Unknown";;
    esac
}

# Function to set correct line endings
fix_line_endings() {
    if [ "$(get_os_type)" = "Windows" ]; then
        echo "Converting line endings for Windows..."
        find . -type f -name "*.sh" -exec dos2unix {} \;
    fi
}

# Function to create necessary directories
create_directories() {
    mkdir -p data/postgres/auth
    mkdir -p data/postgres/analysis
    mkdir -p data/postgres/recommendation
    mkdir -p data/elasticsearch
    mkdir -p data/redis
}

# Function to set correct permissions
set_permissions() {
    if [ "$(get_os_type)" != "Windows" ]; then
        echo "Setting correct permissions..."
        chmod +x scripts/*.sh
        sudo chown -R 1000:1000 data/
    fi
}

# Main setup
echo "Starting setup..."
fix_line_endings
create_directories
set_permissions
echo "Setup completed successfully!" 