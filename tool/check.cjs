/**
 * Course submission preflight.
 *
 * Verifies identity metadata, report placeholders, and production build output
 * before packaging. The placeholder checks are intentionally stricter than the
 * template defaults, because names such as "待替换" or "00000000" can otherwise
 * pass a superficial non-empty check.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passCount = 0;
let failCount = 0;

/** Placeholder values that must never appear in final submission metadata. */
const placeholderPatterns = [
  '请填写',
  '待替换',
  '小明',
  '组员1姓名',
  '组员2姓名',
  '组员3姓名',
  '组员4姓名',
  '学号待填写',
];

const placeholderIds = new Set(['00000000', '00000001', '00000002', '00000003', '00000004', '23300000', '学号']);
const reportPlaceholderIds = new Set([...placeholderIds].filter((id) => id !== '学号'));

function isFilledText(value) {
  return typeof value === 'string' && value.trim() && !placeholderPatterns.some((pattern) => value.includes(pattern));
}

function isFilledStudentId(value) {
  return isFilledText(value) && !placeholderIds.has(value.trim());
}

function pass(msg) {
  console.log(`  ✅  ${msg}`);
  passCount++;
}

function fail(msg) {
  console.error(`  ❌  ${msg}`);
  failCount++;
}

// Metadata must contain real group identity information.
console.log('\n📋 检查 metadata.json ...');
const metaPath = path.join(ROOT, 'metadata.json');
if (fs.existsSync(metaPath)) {
  pass('metadata.json 文件存在');
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    if (isFilledText(meta.studentName)) {
      pass(`姓名已填写：${meta.studentName}`);
    } else {
      fail('请在 metadata.json 中填写你的真实姓名');
    }
    if (isFilledStudentId(meta.studentId)) {
      pass(`学号已填写：${meta.studentId}`);
    } else {
      fail('请在 metadata.json 中填写你的真实学号');
    }
    if (Array.isArray(meta.members) && meta.members.length > 0) {
      const filledMembers = meta.members.filter(m =>
        isFilledText(m.name) && isFilledStudentId(m.studentId)
      );
      if (filledMembers.length === meta.members.length) {
        pass(`已填写 ${filledMembers.length} 名组员信息：${filledMembers.map(m => m.name).join('、')}`);
      } else {
        fail('请在 metadata.json 的 members 数组中填写组员的真实姓名和学号');
      }
    } else {
      fail('metadata.json 中缺少 members 数组，请添加组员信息');
    }
  } catch (e) {
    fail('metadata.json 格式错误，请检查 JSON 语法');
  }
} else {
  fail('metadata.json 文件不存在，请确认根目录中存在该文件');
}

// The report is part of grading, so block known template placeholders.
console.log('\n📝 检查 Report.md ...');
const reportPath = path.join(ROOT, 'Report.md');
if (fs.existsSync(reportPath)) {
  pass('Report.md 文件存在');
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  if (reportContent.includes('___') || placeholderPatterns.some((pattern) => reportContent.includes(pattern)) || [...reportPlaceholderIds].some((id) => reportContent.includes(id))) {
    fail('Report.md 中仍有未填写的占位信息，请完善报告内容');
  } else {
    pass('Report.md 已填写');
  }
} else {
  fail('Report.md 文件不存在，请确认根目录中存在该文件');
}

// A successful build catches route imports and JSX errors before packaging.
console.log('\n🔨 检查 npm run build 是否能成功构建 ...');
const { execSync } = require('child_process');
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
  pass('npm run build 构建成功');
} catch (e) {
  fail('npm run build 构建失败，请检查代码错误');
  const output = (e.stderr || e.stdout || '').toString().trim();
  if (output) {
    console.error('  构建输出:\n' + output.split('\n').map(l => '    ' + l).join('\n'));
  }
}

// Exit non-zero so pack.cjs and CI-style runs stop on the first failed preflight.
console.log('\n─────────────────────────────────────────');
console.log(`📊 检查完成：${passCount} 项通过，${failCount} 项未通过\n`);
if (failCount === 0) {
  console.log('🎉 恭喜！所有检查项均通过，可以打包提交了。');
  console.log('   运行命令：node tool/pack.cjs\n');
} else {
  console.log('⚠️  请根据上方提示修改后，重新运行检查。\n');
  process.exit(1);
}
