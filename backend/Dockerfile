# backend/Dockerfile
FROM node:20-alpine

# Створюємо робочу директорію
WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо пакети
RUN npm install

# Копіюємо весь інший код
COPY . .

# генеруємо Prisma client 
RUN npx prisma generate

# білдимо
RUN npm run build

# Відкриваємо порт NestJS
EXPOSE 3000

# Запускаємо сервер у режимі продакш
CMD ["node", "dist/main"]