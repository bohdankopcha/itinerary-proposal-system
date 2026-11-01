const input = JSON.parse(
  await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data || "{}"));
  }),
);

const command = input.tool_input?.command ?? "";

const rules = [
  {
    test: /\bgit\b[^;&|]*\bcommit\b[^;&|]*(--no-verify|\s-[a-zA-Z]*n[a-zA-Z]*\b)/,
    message:
      "git commit --no-verify is blocked: hooks must run. Fix the underlying failure instead.",
  },
  {
    test: /\bgit\b[^;&|]*\bpush\b[^;&|]*(--force(?!-with-lease)\b|\s-[a-zA-Z]*f[a-zA-Z]*\b)/,
    message:
      "git push --force is blocked. Use --force-with-lease only if the user explicitly asks.",
  },
];

for (const rule of rules) {
  if (rule.test.test(command)) {
    process.stderr.write(rule.message);
    process.exit(2);
  }
}
