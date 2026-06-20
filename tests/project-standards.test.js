import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readProjectFile(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('gitignore excludes generated artifacts and local-only files', () => {
  const gitignore = readProjectFile('.gitignore');

  const requiredRules = [
    /node_modules\//,
    /dist\//,
    /\.vite\//,
    /\.env/,
    /\*\.log/,
    /coverage\//,
    /\*\.zip/,
  ];

  for (const rule of requiredRules) {
    assert.match(gitignore, rule);
  }
});

test('submission packager includes project governance files', () => {
  const packScript = readProjectFile('tool/pack.cjs');

  const requiredFiles = [
    '.gitattributes',
    '.gitignore',
    'README.md',
    'package-lock.json',
  ];

  for (const file of requiredFiles) {
    assert.match(packScript, new RegExp(`'${file.replace('.', '\\.')}'`));
  }
});

test('gitattributes normalizes source files and protects binary artifacts', () => {
  const gitattributes = readProjectFile('.gitattributes');

  assert.match(gitattributes, /\* text=auto eol=lf/);
  assert.match(gitattributes, /\*\.zip binary/);
  assert.match(gitattributes, /\*\.pdf binary/);
});

test('project exposes separate shop and admin browser entries for course demo', () => {
  const packageJson = readProjectFile('package.json');
  const viteConfig = readProjectFile('vite.config.js');
  const adminHtml = readProjectFile('admin.html');
  const adminMain = readProjectFile('src/admin-main.jsx');

  assert.match(packageJson, /"dev:shop"/);
  assert.match(packageJson, /"dev:admin"/);
  assert.match(viteConfig, /admin\.html/);
  assert.match(adminHtml, /src\/admin-main\.jsx/);
  assert.match(adminMain, /admin-router/);
});

test('project governance documents define collaboration and submission standards', () => {
  const editorconfig = readProjectFile('.editorconfig');
  const contributing = readProjectFile('CONTRIBUTING.md');
  const standards = readProjectFile('docs/PROJECT_STANDARDS.md');
  const environment = readProjectFile('docs/ENVIRONMENT.md');
  const changelog = readProjectFile('CHANGELOG.md');
  const readme = readProjectFile('README.md');

  assert.match(editorconfig, /root = true/);
  assert.match(editorconfig, /indent_size = 2/);
  assert.match(editorconfig, /end_of_line = lf/);

  assert.match(contributing, /npm install/);
  assert.match(contributing, /npm test/);
  assert.match(contributing, /npm run lint/);
  assert.match(contributing, /npm run build/);
  assert.match(contributing, /npm run check/);

  assert.match(standards, /src\/services/);
  assert.match(standards, /localStorage/);
  assert.match(standards, /Node 内置 test runner/);
  assert.match(standards, /课程提交/);

  assert.match(environment, /VITE_CUSTOM_HOST/);
  assert.match(environment, /VITE_CUSTOM_KEY/);
  assert.match(environment, /\.env\.local/);
  assert.match(environment, /不要提交/);

  assert.match(changelog, /Keep a Changelog/);
  assert.match(changelog, /2026-06-10/);

  assert.match(readme, /项目规范/);
  assert.match(readme, /CONTRIBUTING\.md/);
  assert.match(readme, /docs\/PROJECT_STANDARDS\.md/);
  assert.match(readme, /docs\/ENVIRONMENT\.md/);
  assert.match(readme, /CHANGELOG\.md/);
});

test('submission packager includes project standards files', () => {
  const packScript = readProjectFile('tool/pack.cjs');

  const standardsFiles = [
    '.editorconfig',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'docs/PROJECT_STANDARDS.md',
    'docs/ENVIRONMENT.md',
  ];

  for (const file of standardsFiles) {
    assert.match(packScript, new RegExp(`'${file.replaceAll('.', '\\.').replaceAll('/', '\\/')}'`));
  }
});

test('submission packager includes admin entry and backend source without build output', () => {
  const packScript = readProjectFile('tool/pack.cjs');

  assert.match(packScript, /'admin\.html'/);
  assert.match(packScript, /'\.env\.example'/);
  assert.match(packScript, /backend\/pom\.xml/);
  assert.match(packScript, /backend\/src/);
  assert.doesNotMatch(packScript, /backend\/target/);
});

test('bonus checklist is documented with concrete completion evidence', () => {
  const readme = readProjectFile('README.md');
  const report = readProjectFile('Report.md');

  const bonusItems = [
    '后端联动',
    '数据持久化',
    '表单验证',
    '分页/无限滚动',
    '支付模拟优化',
    '响应式布局',
    '性能优化',
    '单元测试',
    '部署上线',
  ];

  for (const item of bonusItems) {
    assert.match(readme, new RegExp(item));
    assert.match(report, new RegExp(item));
  }

  assert.match(readme, /https:\/\/www\.helvzn\.com\/easytrade\/?/);
  assert.match(readme, /React\.memo/);
  assert.match(readme, /useCallback/);
  assert.match(readme, /lazy \+ Suspense/);
  assert.match(report, /\[x\]\s+\*\*部署上线\*\*/);
});
