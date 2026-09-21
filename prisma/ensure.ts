import { existsSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const dbPath = path.join(root, "prisma", "dev.db");

if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    `DATABASE_URL="file:./dev.db"\nAUTH_SECRET="digital-heroes-level-1-demo-secret"\n`
  );
  console.log("Wrote .env for local SQLite.");
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: root, env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const dbExisted = existsSync(dbPath);
run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push"]);
if (!dbExisted) {
  run("npx", ["tsx", "prisma/seed.ts"]);
}
