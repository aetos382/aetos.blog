---
name: new-post
description: ブログ記事の雛形を src/content/blog/ に作成する。日本語のタイトルから英語の slug を作る。
disable-model-invocation: true
argument-hint: "<タイトル> [-- <description>]"
allowed-tools: Write(src/content/blog/**), Bash(date *), Bash(ls *), Bash(git config get *)
---

# 新しい記事の雛形を作る

引数: `$ARGUMENTS`

- 今日の日付: !`date +%Y-%m-%d`
- 著者: !`git config get user.name`
- 既存の記事:

!`ls src/content/blog`

## 手順

ツール呼び出しは Write の 1 回だけで済ませる。ファイルを読んだり、確認のためにコマンドを実行したりしない。

1. 引数を解釈する。
   - `--` より後があれば description とする。なければ空文字列とする。
   - 残りをタイトルとする。タイトルは与えられたまま使う（翻訳しない）。
2. タイトルの意味を英訳して slug を作る。
   - 小文字の kebab-case、英数字とハイフンのみ、2〜5 語程度。冠詞や前置詞など意味の薄い語は省く。
   - ローマ字にせず、意味を英訳する。製品名や固有名詞はその英語表記を使う（例: 「Kroki で図を描く」→ `drawing-diagrams-with-kroki`）。
   - 既存の記事と同じ slug になる場合は、語を変えて重複を避ける。
3. `src/content/blog/<slug>.adoc` に、下のテンプレートの `<...>` を埋めて Write する。
4. 作成したファイルのパスと slug だけを一行で報告する。

## テンプレート

astro-asciidoc はフロントマターを読まないため、メタデータはドキュメント ヘッダーに書く。ヘッダーの行の間に空行を入れない。

```asciidoc
= <タイトル>
<著者>
<今日の日付>
:description: <description>

```
