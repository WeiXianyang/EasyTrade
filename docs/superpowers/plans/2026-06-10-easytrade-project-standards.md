# EasyTrade Project Standards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lightweight project governance files and verify them through existing tests and packaging tools.

**Architecture:** Keep standards as static Markdown/config files at the repository root and under `docs/`. Use `tests/project-standards.test.js` as the automated guardrail, and `tool/pack.cjs` as the course submission inclusion list.

**Tech Stack:** Vite, React, Node.js built-in test runner, CommonJS tooling scripts, Markdown documentation.

---

## File Structure

- Create `.editorconfig` to define editor-level formatting defaults.
- Create `CONTRIBUTING.md` to document installation, development, verification, and collaboration flow.
- Create `CHANGELOG.md` to record project changes.
- Create `docs/PROJECT_STANDARDS.md` to centralize source layout, code style, service boundaries, testing, and submission standards.
- Create `docs/ENVIRONMENT.md` to document `.env.example` variables and secret-handling rules.
- Modify `README.md` to link to the project standards documents.
- Modify `tests/project-standards.test.js` to test the standards files and packaging requirements.
- Modify `tool/pack.cjs` to include the standards files in course packages.

### Task 1: Write The Failing Standards Tests

**Files:**
- Modify: `tests/project-standards.test.js`

- [ ] **Step 1: Add tests for standards files**

Add assertions that read `.editorconfig`, `CONTRIBUTING.md`, `CHANGELOG.md`, `docs/PROJECT_STANDARDS.md`, `docs/ENVIRONMENT.md`, `README.md`, and `tool/pack.cjs`.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test`

Expected before implementation: FAIL because the new standards files and packaging entries do not exist yet.

### Task 2: Add Standards Documents

**Files:**
- Create: `.editorconfig`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`
- Create: `docs/PROJECT_STANDARDS.md`
- Create: `docs/ENVIRONMENT.md`

- [ ] **Step 1: Add `.editorconfig`**

Use LF line endings, UTF-8, two-space indentation by default, and Markdown trailing whitespace preservation.

- [ ] **Step 2: Add governance Markdown files**

Write concise Chinese documentation covering setup, scripts, code organization, localStorage/mock API boundaries, environment variables, testing, and submission preflight.

### Task 3: Wire Standards Into README And Packaging

**Files:**
- Modify: `README.md`
- Modify: `tool/pack.cjs`

- [ ] **Step 1: Update README**

Add a short “项目规范” section linking to `CONTRIBUTING.md`, `docs/PROJECT_STANDARDS.md`, `docs/ENVIRONMENT.md`, and `CHANGELOG.md`.

- [ ] **Step 2: Update packager**

Add the standards files to `PACK_FILES` so course packages include the governance docs.

### Task 4: Verify

**Files:**
- No new files.

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected after implementation: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected after implementation: PASS.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected after implementation: PASS.

- [ ] **Step 4: Run preflight**

Run: `npm run check`

Expected after implementation: PASS if metadata and report placeholders are already complete.
