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

const allowedMappings = [
  ['\u2728', 'feat'],
  ['\u{1F41B}', 'fix'],
  ['\u267B\uFE0F', 'refactor'],
  ['\u{1F4DD}', 'docs'],
  ['\u{1F3A8}', 'style'],
  ['\u2705', 'test'],
  ['\u{1F527}', 'chore'],
  ['\u{1F477}', 'ci'],
  ['\u{1F4E6}', 'build'],
  ['\u{1F680}', 'deploy'],
  ['\u26A1', 'perf'],
  ['\u{1F525}', 'remove'],
];

const validPrefixes = allowedMappings.map(
  ([emoji, type]) => new RegExp(`^${emoji} ${type}(\\([^)]+\\))?: .+`, 'u')
);

if (validPrefixes.some((pattern) => pattern.test(firstLine))) {
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
  🚀 deploy: S3 배포 단계 조정

Allowed emojis/types:
  ✨ feat
  🐛 fix
  ♻️ refactor
  📝 docs
  🎨 style
  ✅ test
  🔧 chore
  👷 ci
  📦 build
  🚀 deploy
  ⚡ perf
  🔥 remove`);

process.exit(1);
