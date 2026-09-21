import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");

if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    `DATABASE_URL=""\nDIRECT_URL=""\nAUTH_SECRET="digital-heroes-level-1-demo-secret"\n`
  );
  console.log(
    "Wrote .env. Set DATABASE_URL and DIRECT_URL to PostgreSQL (local or Supabase). SQLite is no longer supported."
  );
}

function loadDotEnv() {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: root, env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

loadDotEnv();
run("npx", ["prisma", "generate"]);

const databaseUrl = process.env.DATABASE_URL ?? "";
if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
  console.error(
    "DATABASE_URL must be a PostgreSQL URI. Local SQLite (file:./dev.db) no longer works.\n" +
      "Set DATABASE_URL and DIRECT_URL to a local Postgres database or your Supabase URIs, then:\n" +
      "  npx prisma migrate deploy && npx prisma db seed"
  );
  process.exit(1);
}

run("npx", ["prisma", "migrate", "deploy"]);
