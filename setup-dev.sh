#!/bin/bash

# Exit script if any command fails
set -e

# Prevent script from running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Error: Do NOT run this script as root! Run it as a normal user."
    exit 1
fi

echo "✅ Running as a normal user: $(whoami)"


# Define Node.js version to use
NODE_VERSION="18.18.2"

# Function to install nvm (Node Version Manager)
install_nvm() {
    echo "Installing nvm..."
    if ! command -v nvm &> /dev/null; then
        curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    else
        echo "nvm is already installed."
    fi
}

# Function to install and use Node.js via nvm
install_node() {
    echo "Installing Node.js version $NODE_VERSION..."
    install_nvm

    # Load nvm (since it's installed in a separate script)
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Install and use the specific Node.js version
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    nvm alias default $NODE_VERSION
    echo "Node.js version $(node -v) installed and activated."
}

# Check and install Python and Node.js dependencies
echo "Updating and installing prerequisites..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get update
    sudo apt-get install -y python3-pip python3-venv
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Install Homebrew if not installed
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install python3
else
    echo "Unsupported OS"
    exit 1
fi

# Create and activate a Python virtual environment for Django backend development
echo "Creating a Python virtual environment for Django development..."
python3 -m venv env
source env/bin/activate

# Install Python dependencies with pre-commit and Python linters/formatters
echo "Installing Django, pre-commit, and Python tools..."
pip install django pre-commit flake8 black isort

# Install and use Node.js via nvm
install_node

# Install JavaScript development tools for React (ESLint, Prettier)
echo "Installing JavaScript tools..."
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-prettier

echo "Setting up pre-commit hooks..."
pre-commit install

echo "Development environment setup complete."
echo "Run 'source env/bin/activate' to activate the Python virtual environment."
echo "Run 'nvm use $NODE_VERSION' to activate the correct Node.js version."
