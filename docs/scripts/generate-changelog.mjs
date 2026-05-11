#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(__dirname, "..");
const repoRoot = join(docsRoot, "..");
const outputDir = join(docsRoot, "content", "changelog");

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const positional = args.filter(
  (arg) => arg !== "--force" && arg !== "--dry-run",
);
const [tag, previousTag] = positional;

if (!tag) {
  console.error(
    "Usage: pnpm --filter docs changelog:new <tag> [previous-tag] [--force] [--dry-run]",
  );
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function toGithubUrl(remote) {
  if (remote.startsWith("git@github.com:")) {
    return `https://github.com/${remote
      .replace("git@github.com:", "")
      .replace(/\.git$/, "")}`;
  }

  return remote.replace(/\.git$/, "");
}

function displayVersion(ref) {
  const match = ref.match(/v?(\d+\.\d+\.\d+)$/);
  return match ? match[1] : ref.replace(/^v/, "");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/^v/, "v")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSubject(subject) {
  const stripped = subject
    .replace(/^(feat|fix|docs|chore|refactor|perf|test)(\([^)]+\))?:\s*/i, "")
    .replace(/^release packages$/i, "Release packages");

  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function tagsFromFiles(files) {
  const tags = new Set();

  for (const file of files) {
    if (file.startsWith("packages/react/")) tags.add("React SDK");
    if (file.startsWith("adapters/postgres/")) tags.add("Postgres");
    if (file.startsWith("docs/")) tags.add("Docs");
    if (file.startsWith("demo/")) tags.add("Demo");
    if (
      ["auth.go", "handlers.go", "middleware.go", "type.go", "store.go"].some(
        (prefix) => file.startsWith(prefix),
      )
    ) {
      tags.add("Core");
    }
  }

  if (tags.size === 0) tags.add("Release");

  return [...tags];
}

const remote = git(["config", "--get", "remote.origin.url"]);
const repoUrl = toGithubUrl(remote);
const date = git(["show", "-s", "--format=%cs", tag]);
const subject = git(["show", "-s", "--format=%s", tag]);
const version = displayVersion(tag);
const filename = `${date}-v${slugify(version)}.mdx`;
const filepath = join(outputDir, filename);

if (existsSync(filepath) && !force && !dryRun) {
  console.error(
    `${filename} already exists. Re-run with --force to replace it.`,
  );
  process.exit(1);
}

const range = previousTag ? `${previousTag}..${tag}` : tag;
const logLines = git(["log", "--format=%s", range]).split("\n").filter(Boolean);
const changedFiles = (
  previousTag
    ? git(["diff", "--name-only", previousTag, tag])
    : git(["diff-tree", "--no-commit-id", "--name-only", "-r", tag])
)
  .split("\n")
  .filter(Boolean);
const tags = tagsFromFiles(changedFiles);
const logUrl = previousTag
  ? `${repoUrl}/compare/${encodeURIComponent(previousTag)}...${encodeURIComponent(tag)}`
  : `${repoUrl}/commit/${git(["rev-parse", "--short", `${tag}^{commit}`])}`;

const bullets = (logLines.length > 0 ? logLines : [subject])
  .map((line) => `- ${titleFromSubject(line)}.`)
  .join("\n");

const content = `---
title: ${titleFromSubject(subject)}
description: Replace this draft summary with the user-facing release impact.
date: "${date}"
version: "${version}"
logUrl: "${logUrl}"
tags:
${tags.map((tagName) => `  - ${tagName}`).join("\n")}
---

### Changed

${bullets}
`;

await mkdir(outputDir, { recursive: true });

if (dryRun) {
  console.log(content);
} else {
  writeFileSync(filepath, content);
  console.log(`Created ${filepath}`);
}
