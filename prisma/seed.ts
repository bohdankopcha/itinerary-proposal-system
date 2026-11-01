// Idempotent seed: use upserts only, so it is safe to run repeatedly.
async function main() {
  // Nothing to seed yet.
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
