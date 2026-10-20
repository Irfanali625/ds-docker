# DS

```
code/backend    Express + TypeScript API (port 8000)
code/frontend   Next.js app (port 3000)
.env            the only env file — copy from .env.example
```

## Run with Docker

```bash
cp .env.example .env   # fill in secrets
docker compose up -d --build
```

Frontend http://localhost:3000 · API http://localhost:8000/health · SeaweedFS admin http://localhost:8334

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild the frontend after changing them.

## Run without Docker

Start only the infrastructure with `docker compose up -d mongo seaweedfs`, then run `npm install && npm run dev` in `code/backend` and in `code/frontend`. Both apps read the root `.env`.
