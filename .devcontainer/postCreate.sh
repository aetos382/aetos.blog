#!/usr/bin/env bash
set -euo pipefail
. /etc/profile.d/ruby-gems.sh

bundle config set --global path.system true

(cd src && bundle install)

curl -fsSL https://claude.ai/install.sh | bash
