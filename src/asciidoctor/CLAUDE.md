# Asciidoctor 拡張

- Asciidoctor.js 4 / asciidoctor-kroki 1.x の API は、context7 で見つからないか内容が古い場合、`node_modules/@asciidoctor/core/src/extensions.js` や `node_modules/asciidoctor-kroki/src/` のソースで確認する。
- 拡張で文書の場所が必要なときは `doc.getBaseDir()` を使う（safe モード `server` では `docfile` / `docdir` 属性が絶対パスにならない）。ブロックの画像は解析時に `imagesdir` を自分の属性にコピーするので、tree processor で文書の `imagesdir` を変えただけでは効かない。
