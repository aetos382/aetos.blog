#!/usr/bin/env bash
set -euo pipefail

git lfs install

bundle config set --global path ${HOME}/.bundle
bundle config set --global bin ${PWD}/src/bin

(cd src && bundle install && bundle binstubs asciidoctor --force)
(cd src && npm ci)

curl -fqsLS https://claude.ai/install.sh | bash

pwsh -NoProfile -NonInteractive -Command - <<'EOS'
$profilePath = $profile.CurrentUserAllHosts
$profileDirectory = $profilePath | Split-Path -Parent

New-Item -ItemType Directory -Force -Path $profileDirectory > $null

$completionPath = $profileDirectory | Join-Path -ChildPath hugo-completions.ps1

hugo completion powershell > $completionPath
". ${completionPath}" >> $profilePath
EOS
