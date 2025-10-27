# CAC-backend
Official backend for CAC websites

(Express + Postgres + JWT + Tests)
## Prereqs
- Node 18+
- PostgreSQL running locally with two DBs (example):
- my_api
- my_api_test


## Setup
```bash
cp .env.example .env
# edit .env with your credentials
npm i
npm run db:migrate
npm run dev