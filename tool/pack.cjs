/**
 * Course submission packager.
 *
 * Usage: node tool/pack.cjs
 *
 * Runs the preflight check, packages the source and verification scripts, and
 * emits a zip named with the course-required `{学号}-{姓名}-{作业名称}.zip`
 * convention.
 */

const fs      = require('fs');
const path    = require('path');
const archiver = require('archiver');

const ROOT         = path.resolve(__dirname, '..');
const METADATA_PATH = path.join(ROOT, 'metadata.json');

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

// Packaging should never proceed after missing identity data or a broken build.
const { execSync } = require('child_process');
console.log('\n🔍 先执行自检脚本 ...\n');
try {
  execSync('node tool/check.cjs', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('\n❌  自检未通过，请先修复上述问题后再打包！\n');
  process.exit(1);
}
console.log('');

// Read submission identity after preflight so the zip name matches metadata.
if (!fs.existsSync(METADATA_PATH)) {
  console.error('❌  找不到 metadata.json，请确认根目录中存在该文件。');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
const { studentName, studentId, assignmentName } = metadata;

if (!studentName || studentName.includes('请填写') ||
    !studentId   || studentId.includes('请填写')) {
  console.error('❌  请先在 metadata.json 中填写你的【姓名】和【学号】后再打包！');
  process.exit(1);
}

// Sanitize only filesystem-hostile characters; keep Chinese names intact.
const safeName = `${studentId}-${studentName}-${assignmentName}`.replace(/[/\\:*?"<>|]/g, '_');
const outputPath = path.join(ROOT, `${safeName}.zip`);

console.log(`\n📦 开始打包...`);
console.log(`   学生：${studentName}（${studentId}）`);
console.log(`   作业：${assignmentName}`);
console.log(`   输出：${outputPath}\n`);

// Stream the archive so large submissions do not need to be buffered in memory.
const output  = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  警告：', err.message);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  console.error('❌  打包失败：', err.message);
  process.exit(1);
});

output.on('close', () => {
  const size = archive.pointer();
  const sizeMB = (size / 1024 / 1024).toFixed(2);

  console.log(`✅  打包完成！`);
  console.log(`   文件：${path.basename(outputPath)}`);
  console.log(`   体积：${sizeMB} MB\n`);

  if (size > MAX_SIZE_BYTES) {
    console.warn('⚠️  警告：压缩包超过 8 MB！');
    console.warn('   请检查 src/assets/ 目录中的图片，');
    console.warn('   建议将图片压缩至合适尺寸后重新打包。');
    console.warn('   否则作业平台将无法接收此文件，提交会失败！\n');
  } else {
    console.log('🎉  体积检查通过，可以提交了！\n');
  }
});

archive.pipe(output);

// Include tests and tooling because package.json exposes those commands.
const PACK_DIRS = [
  { src: 'src',    dest: 'src' },
  { src: 'public', dest: 'public' },
  { src: 'tests',  dest: 'tests' },
  { src: 'tool',   dest: 'tool' },
];

const PACK_FILES = [
  '.gitattributes',
  '.gitignore',
  'README.md',
  'metadata.json',
  'package-lock.json',
  'package.json',
  'Report.md',
  'vite.config.js',
  'index.html',
  'eslint.config.js',
];

for (const { src, dest } of PACK_DIRS) {
  const dirPath = path.join(ROOT, src);
  if (fs.existsSync(dirPath)) {
    archive.directory(dirPath, dest);
  }
}

for (const file of PACK_FILES) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
  }
}

archive.finalize();
