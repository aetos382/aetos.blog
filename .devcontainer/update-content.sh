#!/usr/bin/env bash
# 開発ツールと依存パッケージの導入。
# - Renovate: pre-commit hook で renovate.json を renovate-config-validator で検証するのに使う。
# - gh-actions-lock: actions.lock の更新と、pre-commit hook での検証に使う。
# - node_modules: dev / build のほか、Claude Code の lsp プラグインと、astro check を実行する Stop フックが使う。
# postCreateCommand ではなく updateContentCommand で入れるのは、Codespaces の
# prebuild にこの結果を含めるため。
set -euo pipefail

# shellcheck source=SCRIPTDIR/versions.sh
source "$(dirname "$0")/versions.sh"

npm install -g "renovate@${RENOVATE_VERSION}"
renovate --version

# github-cli feature の extensions オプションではバージョンを固定できないので、ここで入れる。
# 別のバージョンが入っているときは、外してから入れ直す。導入済みの拡張機能に対して install は
# --pin を見ないため。--force を付けると最新版に上げて固定も外し、付けないと何もしない。
installed="$(gh extension list | awk -F'\t' '$2 == "github/gh-actions-lock" { print $3 }')"
if [ "${installed}" != "${GH_ACTIONS_LOCK_VERSION}" ]; then
  if [ -n "${installed}" ]; then
    gh extension remove 'actions-lock'
  fi
  gh extension install 'github/gh-actions-lock' --pin "${GH_ACTIONS_LOCK_VERSION}"
fi
# 導入できたことになっていても実行できない場合があるので、起動できることも作成時に確かめる。
if ! gh actions-lock --help >/dev/null 2>&1; then
  echo "update-content: gh actions-lock does not run after installing gh-actions-lock ${GH_ACTIONS_LOCK_VERSION}." >&2
  exit 1
fi

# このスクリプトが実行されるのは、コンテナーの作成時と prebuild の更新時で、どちらも
# lock ファイルが変わっている可能性があるので、node_modules が既にあっても入れ直す。
npm ci --prefix "$(dirname "$0")/.."
