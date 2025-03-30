FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm typescript

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma/ ./prisma/
RUN pnpm prisma generate

COPY app/ ./app/
COPY lib/ ./lib/
COPY styles/ ./styles/
COPY next.config.mjs postcss.config.mjs tailwind.config.ts tsconfig.json ./

RUN pnpm run build

CMD ["pnpm", "start"]
