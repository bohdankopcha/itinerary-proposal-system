import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, relative } from "node:path";

const input = JSON.parse(
  await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data || "{}"));
  }),
);

const file = input.tool_input?.file_path;
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
if (!file || !existsSync(file)) process.exit(0);

const rel = relative(root, file);
const skip = /^(node_modules|\.next|src\/generated|prisma\/migrations)\//;
if (rel.startsWith("..") || skip.test(rel)) process.exit(0);

const run = (args) =>
  spawnSync("npx", ["--no-install", ...args], { cwd: root, encoding: "utf8" });

run(["prettier", "--write", "--ignore-unknown", rel]);

if (/^\.(ts|tsx|js|jsx|mjs|cjs)$/.test(extname(rel))) {
  const lint = run(["eslint", "--fix", rel]);
  if (lint.status !== 0) {
    process.stderr.write(
      `ESLint errors remain in ${rel}:\n${lint.stdout}${lint.stderr}`,
    );
    process.exit(2);
  }
}
