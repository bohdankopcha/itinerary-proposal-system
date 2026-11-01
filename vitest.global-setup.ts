import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

export default function setup() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    rmSync(`test.db${suffix}`, { force: true });
  }
  execSync("npx prisma migrate deploy && npx prisma db seed", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
  });
}
