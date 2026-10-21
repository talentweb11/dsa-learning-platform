FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/schema.ts ./src/schema.ts
COPY src/content/problems.json ./src/content/problems.json
COPY server ./server
USER node
ENV PORT=8787
EXPOSE 8787
CMD ["node", "--import", "tsx", "server/index.ts"]
