import { defineConfig } from "prisma/config"

// DATABASE_URL is injected by dotenv-cli before this file runs
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
