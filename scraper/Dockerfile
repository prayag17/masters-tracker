FROM mcr.microsoft.com/playwright:v1.49.1-jammy

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Install Playwright browsers
RUN pnpm exec playwright install chromium --with-deps

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3001

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
