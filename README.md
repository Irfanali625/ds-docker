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

`docker-compose.yml` is the development setup: it mounts `code/backend/src` and `code/frontend` into the containers and runs the dev servers, so code changes reload on save. Rebuild (`--build`) only after changing `package.json`. `docker-compose.prod.yml` builds production images with no mounts.

## Run without Docker

Start only the infrastructure with `docker compose up -d mongo seaweedfs`, then run `npm install && npm run dev` in `code/backend` and in `code/frontend`. Both apps read the root `.env`.

## Production (validnumbercheck.app)

```bash
cp deploy/nginx/vnc_proxy.conf /etc/nginx/
cp deploy/nginx/validnumbercheck.conf /etc/nginx/conf.d/
nginx -t && systemctl enable --now nginx
certbot --nginx --redirect -d validnumbercheck.app -d www.validnumbercheck.app -d api.validnumbercheck.app -d storage.validnumbercheck.app
docker compose -f docker-compose.prod.yml up -d --build
```
