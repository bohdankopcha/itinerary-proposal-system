import { spawnSync } from "node:child_process";

const input = JSON.parse(
  await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data || "{}"));
  }),
);

// Already continuing because of this hook: don't loop forever.
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const result = spawnSync("npx", ["--no-install", "tsc", "--noEmit"], {
  cwd: root,
  encoding: "utf8",
});

if (result.status !== 0) {
  process.stderr.write(
    `Type errors found, fix them before finishing:\n${result.stdout}${result.stderr}`,
  );
  process.exit(2);
}
