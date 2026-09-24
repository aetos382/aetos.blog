---
name: new-post
description: ブログ記事の雛形を src/content/blog/<slug>/index.adoc に作成する。日本語のタイトルから英語の slug を作る。
disable-model-invocation: true
argument-hint: "<タイトル> [-- <description>]"
allowed-tools: Edit(src/content/blog/**), Bash(date *), Bash(ls *), Bash(git config get *)
---

# 新しい記事の雛形を作る

引数: `$ARGUMENTS`

- 今日の日付: !`date +%Y-%m-%d`
- 著者: !`git config get user.name`
- 既存の記事:

!`ls src/content/blog`

## 手順

ツール呼び出しは、同じ応答の中で並列に呼ぶ 2 回の Write だけで済ませる。ファイルを読んだり、確認のためにコマンドを実行したりしない。

1. 引数を解釈する。
   - 最初の `--` より前をタイトル、後を description とする。`--` がなければ全体をタイトルとし、description はなしとする。
   - タイトルと description の前後の空白は取り除く。タイトルは与えられたまま使う（翻訳しない）。
   - タイトルが空なら、何も書き込まずにタイトルを尋ねて終える。
2. タイトルの意味を英訳して slug を作る。
   - 小文字の kebab-case、英数字とハイフンのみ、2〜5 語程度。冠詞や前置詞など意味の薄い語は省く。
   - ローマ字にせず、意味を英訳する。製品名や固有名詞はその英語表記を使う（例: 「Kroki で図を描く」→ `drawing-diagrams-with-kroki`）。
   - 既存の記事と同じ slug になる場合は、語を変えて重複を避ける。
3. 次の 2 つの Write を同じ応答の中で並列に呼ぶ。
   - `src/content/blog/<slug>/index.adoc` に、下のテンプレートの `<...>` を埋めて Write する。
   - `src/content/blog/<slug>/images/.gitkeep` に次の一行（末尾に改行）を Write する。本文の画像の置き場所を Git で残すため。
     `Keeps this directory in Git. You can delete this file once you add images here.`
4. 作成したファイルのパスと slug だけを一行で報告する。description がない場合は、あとで `:description:` を追記できることを添える。

## テンプレート

astro-asciidoc はフロントマターを読まないため、メタデータはドキュメント ヘッダーに書く。ヘッダーの行の間に空行を入れない。

```asciidoc
= <タイトル>
<著者>
<今日の日付>
:description: <description>

```

- description がない場合は `:description:` の行ごと省く（description は省略可能）。
- タイトルと description に `{` が含まれる場合は、属性参照として置き換えられないよう `\{` にエスケープする。
