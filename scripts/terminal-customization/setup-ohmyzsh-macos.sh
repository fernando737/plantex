#!/bin/bash

# Exit script on error
set -e

# Prevent running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Error: Do NOT run this script as root! Run it as a normal user."
    exit 1
fi

# Install Homebrew if not installed
if ! command -v brew &> /dev/null; then
    echo "🍺 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Zsh via Homebrew if not installed (only for older macOS versions)
if ! command -v zsh &> /dev/null; then
    echo "📦 Zsh is not installed. Installing via Homebrew..."
    brew install zsh
    # Add Homebrew zsh to /etc/shells
    if ! grep -q "/usr/local/bin/zsh" /etc/shells && [ -f "/usr/local/bin/zsh" ]; then
        echo "/usr/local/bin/zsh" | sudo tee -a /etc/shells
    elif ! grep -q "/opt/homebrew/bin/zsh" /etc/shells && [ -f "/opt/homebrew/bin/zsh" ]; then
        echo "/opt/homebrew/bin/zsh" | sudo tee -a /etc/shells
    fi
    # Change default shell to Homebrew Zsh
    echo "Changing default shell to Homebrew Zsh..."
    chsh -s $(which zsh)
fi

# Install Oh My Zsh if not already installed
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "🚀 Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Install Powerlevel10k theme
POWERLEVEL10K_PATH="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
if [ ! -d "$POWERLEVEL10K_PATH" ]; then
    echo "🎨 Installing Powerlevel10k theme..."
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git $POWERLEVEL10K_PATH
fi

# Plugin installation URLs
plugins=("zsh-autosuggestions" "zsh-syntax-highlighting" "fast-syntax-highlighting" "zsh-completions")
urls=("https://github.com/zsh-users/zsh-autosuggestions.git"
      "https://github.com/zsh-users/zsh-syntax-highlighting.git"
      "https://github.com/zdharma-continuum/fast-syntax-highlighting.git"
      "https://github.com/zsh-users/zsh-completions.git")

# Manage Zsh plugins
echo "🔌 Managing Zsh plugins..."
PLUGINS_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins"
for i in "${!plugins[@]}"; do
    PLUGIN_DIR="$PLUGINS_DIR/${plugins[$i]}"
    if [ ! -d "$PLUGIN_DIR" ]; then
        echo "🔌 Installing ${plugins[$i]}..."
        git clone "${urls[$i]}" "$PLUGIN_DIR"
    else
        echo "🔄 ${plugins[$i]} is already installed. Skipping installation."
    fi
done

# Install fzf if not already installed
if ! command -v fzf &> /dev/null; then
    echo "🔎 Installing fzf (fuzzy finder)..."
    brew install fzf
    # Setup fzf key bindings and fuzzy completion
    "$(brew --prefix)/opt/fzf/install" --all --no-update-rc
fi

# Update .zshrc configuration
echo "⚙️ Configuring .zshrc..."
sed -i '' 's/^ZSH_THEME=.*/ZSH_THEME="powerlevel10k\/powerlevel10k"/' $HOME/.zshrc
sed -i '' 's/^plugins=.*/plugins=(git zsh-autosuggestions zsh-syntax-highlighting fast-syntax-highlighting zsh-completions fzf)/' $HOME/.zshrc

# Source the updated configuration
echo "✅ Setup complete! Restart your terminal or run 'exec zsh' to apply changes."
