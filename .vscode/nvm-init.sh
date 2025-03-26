#!/usr/bin/env bash
# filepath: /Users/anlu/Projects/Work/web-ui/.vscode/nvm-init.sh

# Load NVM
source "$HOME/.nvm/nvm.sh"

# Try using the version specified in .nvmrc
nvm use >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "The version in .nvmrc is not installed."
    read -r -p "Would you like to install it? (Y/n) " ans
    case "$ans" in
        [yY][eE][sS]|[yY]|"")
            # Install and use the version from .nvmrc
            nvm install
            nvm use
            ;;
        *)
            echo "Falling back to the last installed Node version."
            # Example fallback: just run 'nvm use node' to use the system default
            nvm use node
            ;;
    esac
fi

# Launch Zsh with the updated PATH
NODE_BIN="$(nvm which current)"
export PATH="$(dirname "$NODE_BIN"):$PATH"
echo "Terminal using $(node -v)"
exec zsh