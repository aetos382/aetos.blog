#!/usr/bin/env bash
# 開発ツールと依存パッケージの導入。
# - ShellCheck: シェル スクリプトの静的解析に使う。
# - Renovate: pre-commit hook で renovate.json を renovate-config-validator で検証するのに使う。
# - node_modules: dev / build のほか、Claude Code の lsp プラグインと、astro check を実行する Stop フックが使う。
# postCreateCommand ではなく updateContentCommand で入れるのは、Codespaces の
# prebuild にこの結果を含めるため。
set -euo pipefail

# renovate: datasource=npm depName=renovate
RENOVATE_VERSION='44.138.1'

bash "$(dirname "$0")/install-shellcheck.sh"

npm install -g "renovate@${RENOVATE_VERSION}"
renovate --version

# このスクリプトが実行されるのは、コンテナーの作成時と prebuild の更新時で、どちらも
# lock ファイルが変わっている可能性があるので、node_modules が既にあっても入れ直す。
npm ci --prefix "$(dirname "$0")/.."
