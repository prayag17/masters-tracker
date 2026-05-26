import { defineConfig } from "prisma/config"

function getRequiredEnv(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

// DATABASE_URL is injected by dotenv-cli before this file runs
export default defineConfig({
	datasource: {
		url: getRequiredEnv("DATABASE_URL"),
	},
});
