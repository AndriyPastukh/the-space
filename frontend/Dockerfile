# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# білдимо
RUN npm run build

# Відкриваємо порт Vite
EXPOSE 5173

CMD ["npm", "run", "dev"]