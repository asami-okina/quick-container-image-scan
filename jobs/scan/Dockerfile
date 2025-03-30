ARG USER=scanner
FROM node:21-alpine
ARG USER

RUN apk add --no-cache curl \
    && npm install -g pnpm typescript \
    && curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.61.0

WORKDIR /app

RUN addgroup -S -g 1001 ${USER} && \
    adduser -S -u 1001 -G ${USER} ${USER}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma/ ./prisma/
RUN pnpm prisma generate

COPY jobs/ ./jobs/
COPY lib/ ./lib/

RUN cd jobs/scan && \
    pnpm build

USER ${USER}

ENTRYPOINT ["/usr/local/bin/node", "--enable-source-maps", "/app/jobs/scan/js/jobs/scan/ts/main.js"]
