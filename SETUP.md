# Quick Setup Guide

## Environment Files Setup

### Backend (.env)

1. Navigate to `ds-backend` directory
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and update MongoDB connection if needed:
   - If MongoDB requires authentication, uncomment and fill in credentials
   - Default: `mongodb://localhost:27017/data-scraping`

### Frontend (.env.local)

1. Navigate to `ds-frontend` directory
2. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
3. Edit `.env.local` if your backend runs on a different port (default: `http://localhost:3001`)

## MongoDB Authentication

If your MongoDB requires authentication, update the `.env` file in `ds-backend` with one of these:

**Option 1 - Full connection string:**
```
MONGODB_URI=mongodb://username:password@localhost:27017/data-scraping?authSource=admin
```

**Option 2 - Individual components:**
```
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=data-scraping
```

## Quick Start Commands

```bash
# Backend setup
cd ds-backend
npm install
cp .env.example .env  # Then edit .env with your MongoDB credentials
npm run dev

# Frontend setup (in a new terminal)
cd ds-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

