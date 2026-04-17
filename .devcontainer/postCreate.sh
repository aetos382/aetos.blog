curl -fsSL https://claude.ai/install.sh | bash

bundle config set --global path "${HOME}/.bundle"
bundle config set --global disable_shared_gems true

(cd src && bundle install)
