# CLAUDE.md

Astro 製のブログ。記事は AsciiDoc で書き（Markdown / MDX は使わない）、AsciiDoc 中の図は自前の Kroki サーバーで SVG にしてビルド時に埋め込む。

## コマンド

```sh
docker compose up --detach --wait  # Kroki を起動（dev / build の前提。devcontainer では起動時に自動実行）
```

## 構成

- `src/asciidoctor/` は astro-asciidoc の `extensions` に渡す Asciidoctor 拡張、`src/integrations/` は `astro.config.mjs` から登録する Astro 統合の置き場所。同じ機能の部品が両方にある場合は同名にする（例: `blog-images.js`）。
- `.claude/marketplace/`: このリポジトリ専用の Claude Code プラグインの marketplace。`lsp` プラグインは TypeScript / JavaScript / Astro の language server を `node_modules` から起動する（`npm ci` 済みであることが前提）。
- `src/asciidoctor/kroki.js`: asciidoctor-kroki を astro-asciidoc に登録するためのアダプター。図の取得に失敗したらビルドを失敗させる。インライン SVG の id が図どうしで衝突しないよう、図ごとに接頭辞（`kroki-<n>-`）を付けて書き換える（Kroki の Mermaid は id が `container` 固定のため）。

## 注意点

- GitHub Pages のプロジェクト サイト（`https://aetos382.github.io/astro-site/`）として公開しているので、`base` は `/astro-site`。サイト内のリンクは `src/url.ts` の `withBase()` で組み立てる（`/` 始まりの絶対パスを直書きしない）。main への push で CI（`.github/workflows/ci.yml`）の `deploy` ジョブが発行する。
- Kroki が動いていないと、図を含む記事で dev / build が失敗する。接続先は環境変数 `KROKI_SERVER_URL`（既定値 `http://localhost:8000`）。
- Kroki は devcontainer 内の docker-in-docker で動いている。devcontainer からは `kroki:8000` ではなく `localhost:8000` で参照する。VS Code の AsciiDoc プレビューは webview（ホスト側）で描画されるため、図は `kroki-default-options: inline` でコンテナ側から取得して埋め込んでいる。
- Asciidoctor の拡張は JavaScript で書く（TypeScript 不可）。`extensions` には絶対 URL で渡す（相対パスは astro-asciidoc のパッケージ内を基準に解決される）。
- 一時的なスクリプトに Python は使わない（コンテナに Python はない）。Node で書く（`node -e` か、`Temp/` に置いた `.mjs`）。プロジェクトの依存パッケージも使える。例: YAML の構文確認は `node -e "require('yaml').parse(require('fs').readFileSync('<file>','utf8'))"`（`yaml` は `@astrojs/check` 経由で入っている）。
- 依存関係の更新は Renovate（`renovate.json`）。`compose.yaml` と `.github/workflows/ci.yml` の `services` の Kroki イメージは同じグループで一緒に更新される。手でタグを変えるときも両方を揃える。
- `renovate.json` をコミットすると、pre-commit フックがステージされた内容を `renovate-config-validator --strict` で検証する。手で実行するときは、リポジトリ直下で `CODESPACES=false renovate-config-validator --strict < /dev/null` と引数なしで実行する（ファイル名を渡すと global config として検証される。Codespaces では `CODESPACES=false` がないとリポジトリ名の入力待ちで止まる）。
- 画像（jpg / png / webp など）は Git LFS で管理している（`.gitattributes` 参照）。git-lfs がないと画像がポインター ファイルのままになり、ビルドが失敗する。CI は `actions/checkout` の `lfs: true` で取得している。
- lock ファイル（`*-lock.json`）は直接編集しない。npm コマンドで更新する。
- main への直接コミットは pre-commit フック（Config-based hooks、`.gitconfig` で定義）で拒否される。ブランチを作ってからコミットする。
