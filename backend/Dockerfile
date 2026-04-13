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

# Відкриваємо порт NestJS
EXPOSE 3000

# Запускаємо сервер у режимі розробки
CMD ["npm", "run", "start:dev"]