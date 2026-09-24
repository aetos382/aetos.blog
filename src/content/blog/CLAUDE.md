# AsciiDoc の記事

- メタデータは YAML フロントマターではなくドキュメント ヘッダーに書く（astro-asciidoc はフロントマターを読まない）。
- schema との対応: `title` ← ドキュメント タイトル、`description` ← `:description:`、`pubDate` ← リビジョン行の日付（`:revdate:`）、`updatedDate` ← `:updated-date:`、`heroImage` ← `:hero-image:`（記事ファイルからの相対パス）。
- 記事は `src/content/blog/<slug>/index.adoc`、本文の画像は `src/content/blog/<slug>/images/` に置き、`image::foo.jpg[]` と書く（`imagesdir` の既定値は `images`）。本文の画像は Astro の最適化を通らないので、事前に適切なサイズにしておく。ヒーロー画像は schema の `image()` を通るので最適化される。
- `src/content/blog/` の `.adoc` には `:layout:` は効かない（`src/pages/` 専用）。記事のレイアウトは `src/pages/blog/[...slug].astro` で `BlogPost.astro` を適用している。
