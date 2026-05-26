import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

if (existsSync(".env")) {
	dotenv.config({ path: ".env" });
}

const pnpmExecPath = process.env.npm_execpath;

if (!pnpmExecPath) {
	throw new Error("Missing npm_execpath; cannot run Prisma generation.");
}

const result = spawnSync(pnpmExecPath, ["exec", "prisma", "generate"], {
	stdio: "inherit",
	env: process.env,
});

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 0);
