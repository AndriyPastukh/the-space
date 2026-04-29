Ось акуратно оформлений, короткий і “чистий” README у `.md` форматі 👇

# 🚀 TheSpace Backend

Backend API built with **NestJS + Prisma + PostgreSQL + Docker**.

It provides basic user registration with secure password hashing and database persistence.

---

# 📦 Tech Stack

- NestJS
- Prisma ORM (PostgreSQL)
- Docker / Docker Compose
- bcrypt (password hashing)
- class-validator (DTO validation)

---

# ⚙️ Setup

## 1. Clone project

```bash
git clone <repo-url>
cd project-the-space
```

---

## 2. Environment variables

Create `.env` file in the project root (same level as `docker-compose.yml`):

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/thespace
```

👉 This is used inside Docker containers
👉 `db` = name of PostgreSQL service in docker-compose

---

## 3. Run project

### Start everything (DB + backend + frontend)

```bash
docker compose up --build
```

---

## 4. Reset database (optional)

If you want a clean DB:

```bash
docker compose down -v
docker compose up --build
```

---

# 🧠 How it works

## Registration flow

`POST /auth/register`

### Request:

```json
{
  "email": "test@mail.com",
  "password": "123456"
}
```

### What happens internally:

1. Check if user exists (by email)
2. Hash password using bcrypt
3. Save user to database

---

## Database model

```prisma
model User {
  id           Int    @id @default(autoincrement())
  email        String @unique
  passwordHash String
}
```

---

## Response

### Success (201)

```json
{
  "message": "User created successfully"
}
```

### Error (409)

```json
{
  "message": "Email already exists"
}
```

---

# 🐳 Docker notes

- `db` → PostgreSQL container
- `backend` → NestJS API
- Prisma migrations run automatically on startup

---

# ⚡ Prisma commands (important)

Generate client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Apply migrations in Docker:

```bash
npx prisma migrate deploy
```

---

# 📌 Notes

- Prisma client is generated during Docker build
- Database schema is controlled via migrations
