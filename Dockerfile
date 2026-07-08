FROM node:20-alpine AS runtime
WORKDIR /app
COPY package.json ./
COPY backend ./backend
COPY frontend ./frontend
COPY shared ./shared
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "backend/src/server.js"]
