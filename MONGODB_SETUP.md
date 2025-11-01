# MongoDB Setup Guide

## Your MongoDB is Currently Requiring Authentication

You have two options:

## Option 1: Disable Authentication (Easiest for Local Development)

If you're running MongoDB locally for development, you can disable authentication:

1. **Stop MongoDB** (if running)
2. **Start MongoDB without authentication:**
   ```bash
   # On macOS with Homebrew
   mongod --noauth
   
   # Or modify your MongoDB config file to disable authentication
   ```

3. **Update your `.env` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/data-scraping
   ```

## Option 2: Create a MongoDB User (If You Want Authentication)

If you want to keep authentication enabled, create a MongoDB user:

1. **Connect to MongoDB as admin:**
   ```bash
   mongosh
   # or
   mongo
   ```

2. **Switch to admin database:**
   ```javascript
   use admin
   ```

3. **Create a user:**
   ```javascript
   db.createUser({
     user: "datascraping",
     pwd: "your_secure_password",
     roles: [
       { role: "readWrite", db: "data-scraping" }
     ]
   })
   ```

4. **Update your `.env` file:**
   ```env
   MONGODB_URI=mongodb://datascraping:your_secure_password@localhost:27017/data-scraping?authSource=admin
   ```

## Option 3: Use MongoDB Atlas (Cloud - Free Tier Available)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Update your `.env` file with the Atlas connection string

## Quick Test

After updating your `.env`, test the connection:

```bash
cd ds-backend
node check-env.js  # Check if .env is configured correctly
npm run dev        # Start the server
```

If you see "✅ MongoDB authentication verified and database access confirmed", you're all set!

