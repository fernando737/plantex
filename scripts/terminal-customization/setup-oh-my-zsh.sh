#!/bin/bash

# Exit script on error
set -e

# Prevent running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Error: Do NOT run this script as root! Run it as a normal user."
    exit 1
fi

# Install Zsh if not installed
if ! command -v zsh &> /dev/null; then
    echo "📦 Installing Zsh..."
    sudo apt update && sudo apt install -y zsh
fi

# Change default shell to Zsh
if [ "$SHELL" != "$(which zsh)" ]; then
    echo "🔄 Changing default shell to Zsh..."
    chsh -s $(which zsh)
fi

# Install Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "🚀 Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Install Powerlevel10k theme
if [ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k" ]; then
    echo "🎨 Installing Powerlevel10k theme..."
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
fi

# Install Zsh plugins
echo "🔌 Installing Zsh plugins..."
PLUGINS_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins"

# Clone plugins if they do not exist
[ ! -d "$PLUGINS_DIR/zsh-autosuggestions" ] && git clone https://github.com/zsh-users/zsh-autosuggestions.git "$PLUGINS_DIR/zsh-autosuggestions"
[ ! -d "$PLUGINS_DIR/zsh-syntax-highlighting" ] && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$PLUGINS_DIR/zsh-syntax-highlighting"
[ ! -d "$PLUGINS_DIR/fast-syntax-highlighting" ] && git clone https://github.com/zdharma-continuum/fast-syntax-highlighting.git "$PLUGINS_DIR/fast-syntax-highlighting"
[ ! -d "$PLUGINS_DIR/zsh-completions" ] && git clone https://github.com/zsh-users/zsh-completions.git "$PLUGINS_DIR/zsh-completions"

# Install fzf (fuzzy finder)
if ! command -v fzf &> /dev/null; then
    echo "🔎 Installing fzf (fuzzy finder)..."
    sudo apt install -y fzf
fi

# Update .zshrc configuration
echo "⚙️ Updating .zshrc..."
sed -i 's/^ZSH_THEME=.*/ZSH_THEME="powerlevel10k\/powerlevel10k"/' $HOME/.zshrc

# Enable plugins in .zshrc
sed -i 's/^plugins=.*/plugins=(git zsh-autosuggestions zsh-syntax-highlighting fast-syntax-highlighting zsh-completions fzf)/' $HOME/.zshrc

# Source the updated configuration
echo "✅ Setup complete! Restart your terminal or run 'exec zsh' to apply changes."
exec zsh
