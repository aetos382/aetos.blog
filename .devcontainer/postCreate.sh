curl -fsSL https://claude.ai/install.sh | bash

bundle config set --global path ~/.bundle
bundle config set --global disable_shared_gems true
bundle config set --global bin ./bin

(cd src && bundle install && bundle binstubs asciidoctor)
