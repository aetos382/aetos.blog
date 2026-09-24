#!/usr/bin/env bash
# Claude Code の Stop フック。src/ などに未コミットの変更があれば astro check を実行し、
# 失敗したら exit 2 で Claude に差し戻す。
#
# 同じ変更に対して何度も実行しないよう、成功したときの変更内容のハッシュを .git/ 内に保存し、
# 前回と同じなら実行しない。
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

paths=(src astro.config.mjs tsconfig.json)

# 差し戻し後の再チェックかどうか。jq はローカルの Windows にない可能性があるので node で読む。
stop_hook_active="$(node -e '
  let s = "";
  process.stdin.on("data", (c) => (s += c)).on("end", () => {
    process.stdout.write(String(JSON.parse(s).stop_hook_active === true));
  });
')"

untracked="$(git ls-files --others --exclude-standard -- "${paths[@]}")"
diff="$(git diff HEAD -- "${paths[@]}")"

if [ -z "$untracked" ] && [ -z "$diff" ]; then
  exit 0
fi

fingerprint="$(
  {
    printf '%s\n' "$diff" "$untracked"
    if [ -n "$untracked" ]; then
      printf '%s\n' "$untracked" | git hash-object --stdin-paths
    fi
  } | git hash-object --stdin
)"

state_file="$(git rev-parse --git-path claude-astro-check)"
if [ -f "$state_file" ] && [ "$(cat "$state_file")" = "$fingerprint" ]; then
  exit 0
fi

if output="$(npm run check 2>&1)"; then
  printf '%s\n' "$fingerprint" > "$state_file"
  exit 0
fi

if [ "$stop_hook_active" = 'true' ]; then
  # 差し戻しても直らなかった。これ以上差し戻すとループするので、ユーザーへの警告に留める。
  echo '{"systemMessage": "astro check が失敗したままです。npm run check で確認してください。"}'
  exit 0
fi

{
  echo 'astro check failed. Fix the errors below.'
  # 診断の表示は @volar/kit が TypeScript の formatDiagnosticsWithColorAndContext で作っており、
  # 環境変数では色を止められない。Claude に渡す前に色のエスケープ シーケンスを取り除く。
  printf '%s\n' "$output" | sed "s/$(printf '\033')\[[0-9;]*m//g"
} >&2
exit 2
