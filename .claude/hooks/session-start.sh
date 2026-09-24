#!/usr/bin/env bash
# Claude Code の SessionStart フック。Claude Code on the web のコンテナは毎回まっさらなので、
# lsp プラグインの language server と Stop フックの astro check が動くよう node_modules を入れる。
# devcontainer / ローカルでは自分で npm ci する前提なので何もしない。
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# 出力は Claude のコンテキストに入るので、進捗表示や広告は抑える。
npm ci --no-audit --no-fund --loglevel=error >&2
