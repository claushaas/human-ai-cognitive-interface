FROM node:20-slim AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.32.0

# Copy package files
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN npm install -g pnpm@10.32.0

COPY --from=base /app/package.json /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps ./apps
COPY --from=base /app/node_modules ./node_modules

EXPOSE 8787

CMD ["pnpm", "--filter", "@haci/web", "run", "start"]
