---
paths:
  - renovate.json
  - .devcontainer/docker-compose.yaml
  - .github/workflows/**
---

# Renovate

- npm の `dependencies` も、patch と、1.0.0 以上の minor は automerge する（preset が automerge するのは `devDependencies` だけ）。発行するパッケージではなくサイトなので、`dependencies` と `devDependencies` に実質的な違いがなく、CI がサイト全体をビルドして確かめるためである。automerge されると、そのまま main からサイトが発行される。0.x の minor は互換性が壊れることがあるので、手でマージする。
- typescript は `allowedVersions` で 7.0.0 未満に制限している。`@astrojs/check` の peer dependency が TypeScript 7 に対応しておらず lock ファイルを作れないことと、代わりになる `@astrojs/ts-content-mapper` が TypeScript 7.1 を必要とすることが理由である。7.1 がリリースされたら、aetos382/aetos.blog#30 の手順で制限を外して移行する。
- `.devcontainer/docker-compose.yaml` と `.github/workflows/ci.yml` の `services` の Kroki イメージは同じグループで一緒に更新される。手でタグを変えるときも両方を揃える。
