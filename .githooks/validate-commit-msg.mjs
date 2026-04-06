import { readFileSync } from 'node:fs';

const messageFile = process.argv[2];

if (!messageFile) {
  console.error('Commit message file path is required.');
  process.exit(1);
}

const firstLine = readFileSync(messageFile, 'utf8')
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/, 1)[0]
  .trim();

if (!firstLine) {
  console.error('Commit message is empty.');
  process.exit(1);
}

if (/^(Merge |Revert |fixup! |squash! )/.test(firstLine)) {
  process.exit(0);
}

const pattern =
  /^(✨|🐛|♻️|📝|🎨|✅|🔧|👷|🚀|📦|⚡|🔥) (feat|fix|refactor|docs|style|test|chore|ci|build|perf|remove)(\([^)]+\))?: .+/u;

if (pattern.test(firstLine)) {
  process.exit(0);
}

console.error(`Invalid commit message format.

Use:
  <emoji> <type>(optional-scope): summary

Examples:
  ✨ feat: 공유 기능 추가
  🐛 fix(auth): 로그인 취소 처리 수정
  ♻️ refactor: 히스토리 로딩 구조 정리
  👷 ci: 프론트 배포 워크플로우 수정

Allowed emojis/types:
  ✨ feat
  🐛 fix
  ♻️ refactor
  📝 docs
  🎨 style
  ✅ test
  🔧 chore
  👷 ci
  🚀 build
  📦 build
  ⚡ perf
  🔥 remove`);

process.exit(1);
