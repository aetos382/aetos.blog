# Asciidoctor 拡張

- `kroki.js`: asciidoctor-kroki を astro-asciidoc に登録するためのアダプター。図の取得に失敗したらビルドを失敗させる。インライン SVG の id が図どうしで衝突しないよう、図ごとに接頭辞（`kroki-<n>-`）を付けて書き換える（Kroki の Mermaid は id が `container` 固定のため）。
- `shiki.js`: ソース ブロックをビルド時に Shiki で色付けするハイライター。拡張ではなく astro-asciidoc の `highlighters` に渡し、`source-highlighter: shiki` 属性で選ぶ。Asciidoctor は `highlight()` を同期で呼ぶため、Shiki の全言語を起動時に読み込んでいる。未知の言語は警告を出して素のテキストにする。
- Asciidoctor.js 4 / asciidoctor-kroki 1.x の API は、context7 で見つからないか内容が古い場合、`node_modules/@asciidoctor/core/src/extensions.js` や `node_modules/asciidoctor-kroki/src/` のソースで確認する。
- 拡張で文書の場所が必要なときは `doc.getBaseDir()` を使う（safe モード `server` では `docfile` / `docdir` 属性が絶対パスにならない）。ブロックの画像は解析時に `imagesdir` を自分の属性にコピーするので、tree processor で文書の `imagesdir` を変えただけでは効かない。
