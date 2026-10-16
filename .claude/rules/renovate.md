---
paths:
  - renovate.json
  - .devcontainer/docker-compose.yaml
  - .github/workflows/**
  - .devcontainer/*.sh
  - .github/dependabot.yml
  - .devcontainer/devcontainer.json
---

# Renovate

- 依存関係の更新は Renovate（`renovate.json`）。共通の設定は共有 preset（[aetos382/renovate-presets](https://github.com/aetos382/renovate-presets) の `default` と `devcontainer`）にあり、`renovate.json` にはこのリポジトリ固有のルールだけを書く。automerge を有効にするルールを足すときは `matchUpdateTypes` を必ず指定する（preset の「major は automerge しない」ルールより後に並ぶため）。
- npm の `dependencies` も、patch と、1.0.0 以上の minor は automerge する（preset が automerge するのは `devDependencies` だけ）。発行するパッケージではなくサイトなので、`dependencies` と `devDependencies` に実質的な違いがなく、CI がサイト全体をビルドして確かめるためである。automerge されると、そのまま main からサイトが発行される。0.x の minor は互換性が壊れることがあるので、手でマージする。
- typescript は `allowedVersions` で 7.0.0 未満に制限している。`@astrojs/check` の peer dependency が TypeScript 7 に対応しておらず lock ファイルを作れないことと、代わりになる `@astrojs/ts-content-mapper` が TypeScript 7.1 を必要とすることが理由である。7.1 がリリースされたら、aetos382/aetos.blog#30 の手順で制限を外して移行する。
- devcontainer の features だけは Dependabot（`.github/dependabot.yml`）で更新する。Renovate は `devcontainer-lock.json` を更新できないため（renovatebot/renovate#43169）。Renovate が対応したら Dependabot をやめて Renovate に一本化する。
- `.devcontainer/docker-compose.yaml` と `.github/workflows/ci.yml` の `services` の Kroki イメージは同じグループで一緒に更新される。手でタグを変えるときも両方を揃える。
- `renovate.json` は、CI の `renovate-config` ジョブが `renovate-config-validator --strict --no-global` で検証する。手元では検証しない。大きく組み替えたときは、`renovate/reconfigure` ブランチに push すると、Mend の Renovate が次の実行でそのブランチの設定を検証し、結果をブランチのステータスで返す。そのブランチから PR を開いていれば、エラーの内容を PR にもコメントする（[Config Validation](https://docs.renovatebot.com/config-validation/)）。毎回の手順にはしない。
- action のコミットは `.github/workflows/actions.lock` で固定している。それを作る gh の拡張機能 gh-actions-lock のバージョンは `.devcontainer/versions.sh` の `GH_ACTIONS_LOCK_VERSION` と `renovate.json` の `constraints.ghActionsLock` の 2 箇所にあり、同じ値にする。Renovate は共有 preset の `default` で両方を更新する。手で変えるときも両方を変える。後者は Renovate がロックファイルを作り直すときに使うバージョンである。
