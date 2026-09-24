# CLAUDE.md

Astro 製のブログ。記事は AsciiDoc で書き（Markdown / MDX は使わない）、AsciiDoc 中の図は自前の Kroki サーバーで SVG にしてビルド時に埋め込む。

## コマンド

```sh
docker compose up --detach --wait  # Kroki を起動（dev / build の前提。devcontainer では起動時に自動実行）
npm run dev                        # 開発サーバー
npm run check                      # 型チェック（astro check）
npm run build                      # ビルド（./dist/）
```

## 構成

- `src/asciidoctor/` は astro-asciidoc の `extensions` に渡す Asciidoctor 拡張、`src/integrations/` は `astro.config.mjs` から登録する Astro 統合の置き場所。同じ機能の部品が両方にある場合は同名にする（例: `blog-images.js`）。
- `astro.config.mjs`: astro-asciidoc の設定。Asciidoctor の属性（Kroki の設定を含む）と拡張の登録。
- `src/content.config.ts`: ブログのコンテンツ コレクション。`flattenAsciiDoc` で AsciiDoc のドキュメント属性を schema の形に変換してから schema で検証する。
- `src/asciidoctor/kroki.js`: asciidoctor-kroki を astro-asciidoc に登録するためのアダプター。図の取得に失敗したらビルドを失敗させる。インライン SVG の id が図どうしで衝突しないよう、図ごとに接頭辞（`kroki-<n>-`）を付けて書き換える（Kroki の Mermaid は id が `container` 固定のため）。
- `src/asciidoctor/blog-images.js`: AsciiDoc の記事の `imagesdir` を、画像の配信 URL（`/blog/<記事のフォルダー>/images`）に書き換える Asciidoctor 拡張。
- `src/integrations/blog-images.js`: `src/content/blog/` 以下の画像ファイルを、同じ相対パスで `/blog/` 以下に配信する Astro 統合（dev はミドルウェア、build は出力へのコピー）。画像の拡張子のファイルだけを対象にする。
- `compose.yaml`: Kroki（本体と Mermaid 用コンテナ）。

## AsciiDoc の記事

- メタデータは YAML フロントマターではなくドキュメント ヘッダーに書く（astro-asciidoc はフロントマターを読まない）。
- schema との対応: `title` ← ドキュメント タイトル、`description` ← `:description:`、`pubDate` ← リビジョン行の日付（`:revdate:`）、`updatedDate` ← `:updated-date:`、`heroImage` ← `:hero-image:`（記事ファイルからの相対パス）。
- 記事は `src/content/blog/<slug>/index.adoc`、本文の画像は `src/content/blog/<slug>/images/` に置き、`image::foo.jpg[]` と書く（`imagesdir` の既定値は `images`）。本文の画像は Astro の最適化を通らないので、事前に適切なサイズにしておく。ヒーロー画像は schema の `image()` を通るので最適化される。
- `src/content/blog/` の `.adoc` には `:layout:` は効かない（`src/pages/` 専用）。記事のレイアウトは `src/pages/blog/[...slug].astro` で `BlogPost.astro` を適用している。

## 注意点

- Kroki が動いていないと、図を含む記事で dev / build が失敗する。接続先は環境変数 `KROKI_SERVER_URL`（既定値 `http://localhost:8000`）。
- Kroki は devcontainer 内の docker-in-docker で動いている。devcontainer からは `kroki:8000` ではなく `localhost:8000` で参照する。VS Code の AsciiDoc プレビューは webview（ホスト側）で描画されるため、図は `kroki-default-options: inline` でコンテナ側から取得して埋め込んでいる。
- Asciidoctor.js 4 / asciidoctor-kroki 1.x の API は、context7 で見つからないか内容が古い場合、`node_modules/@asciidoctor/core/src/extensions.js` や `node_modules/asciidoctor-kroki/src/` のソースで確認する。
- 拡張で文書の場所が必要なときは `doc.getBaseDir()` を使う（safe モード `server` では `docfile` / `docdir` 属性が絶対パスにならない）。ブロックの画像は解析時に `imagesdir` を自分の属性にコピーするので、tree processor で文書の `imagesdir` を変えただけでは効かない。
- Asciidoctor の拡張は JavaScript で書く（TypeScript 不可）。`extensions` には絶対 URL で渡す（相対パスは astro-asciidoc のパッケージ内を基準に解決される）。
- 一時的なスクリプトに Python は使わない（コンテナに Python はない）。Node で書く（`node -e` か、`Temp/` に置いた `.mjs`）。プロジェクトの依存パッケージも使える。例: YAML の構文確認は `node -e "require('yaml').parse(require('fs').readFileSync('<file>','utf8'))"`（`yaml` は `@astrojs/check` 経由で入っている）。
- `.github/workflows/ci.yml` の `services` の Kroki イメージは Dependabot の更新対象外。`compose.yaml` のタグを変えたら手で合わせる。
- 画像（jpg / png / webp など）は Git LFS で管理している（`.gitattributes` 参照）。git-lfs がないと画像がポインター ファイルのままになり、ビルドが失敗する。CI は `actions/checkout` の `lfs: true` で取得している。
- lock ファイル（`*-lock.json`）は直接編集しない。npm コマンドで更新する。
- main への直接コミットは pre-commit フック（Config-based hooks、`.gitconfig` で定義）で拒否される。ブランチを作ってからコミットする。
