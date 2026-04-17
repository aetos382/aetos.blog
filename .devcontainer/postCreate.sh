#!/usr/bin/env bash
set -euo pipefail

bundle config set --global path ${HOME}/.bundle
bundle config set --global bin ${PWD}/src/bin

(cd src && bundle install && bundle binstubs asciidoctor --force)

curl -fqsLS https://claude.ai/install.sh | bash
