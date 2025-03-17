FROM oven/bun:1.0.26

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY src/ ./src/
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["bun", "run", "start"]