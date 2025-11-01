# Data Scraping Application

A full-stack data scraping and lead management system with B2B and B2C contact management.

## Project Structure

- `ds-backend/` - Node.js/TypeScript backend API
- `ds-frontend/` - Next.js/TypeScript frontend application

## Features

### Contact Management
- **B2B Leads**: Scraped from Google Maps (structure ready, integration needed)
- **B2C Leads**: From provided list (with dummy data included)
- **Four-Phase System**:
  - `RAW` - Before validation
  - `CLEANED` - After validation
  - `DELIVERING` - When going to client
  - `DELIVERED` - After reached client
- **Automatic Reset**: Contacts in `DELIVERED` phase automatically move back to `CLEANED` after 3 months

### User Features
- Select B2B or B2C lead types
- Get random contacts from selected type
- Store contact records per user
- View stored records history
- Beautiful, modern UI with Tailwind CSS

## Getting Started

### Backend Setup

1. Navigate to backend directory:
```bash
cd ds-backend
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB is running locally or update the connection string.

4. Create `.env` file with MongoDB connection details:

**For MongoDB without authentication (local development):**
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/data-scraping
```

**For MongoDB with authentication:**
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin
```

**Or use individual components:**
```
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=data-scraping
```

5. Start the server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ds-frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Contacts

- `GET /api/contacts/random?type={B2B|B2C}&phase={RAW|CLEANED|DELIVERING|DELIVERED}` - Get random contact
- `POST /api/contacts` - Create new contact
- `GET /api/contacts?type={B2B|B2C}&phase={phase}&limit={limit}&offset={offset}` - Get contacts with filters
- `PUT /api/contacts/:id/phase` - Update contact phase

### Records

- `POST /api/contacts/records` - Store user record
  ```json
  {
    "userId": "user_123",
    "contactId": "contact_456",
    "phase": "DELIVERED"
  }
  ```
- `GET /api/contacts/records/user/:userId` - Get all records for a user

### Health Check

- `GET /health` - Server health check

## Database

The application uses MongoDB with Mongoose ODM for data persistence. The database connection is configured via the `MONGODB_URI` environment variable (default: `mongodb://localhost:27017/data-scraping`).

### Database Schema

**contacts**
- id (ObjectId), type (B2B/B2C), phase (RAW/CLEANED/DELIVERING/DELIVERED)
- name, email, phone, company, address, city, state, zipCode, country, website
- source, createdAt, updatedAt, deliveredAt

**user_records**
- id (ObjectId), userId, contactId (ObjectId reference), phase, deliveredAt, createdAt

## Background Jobs

A scheduled job runs daily at 2 AM to automatically move `DELIVERED` contacts back to `CLEANED` phase after 3 months.

## Technologies

### Backend
- Node.js
- TypeScript
- Express.js
- MongoDB with Mongoose ODM
- node-cron (for scheduled jobs)

### Frontend
- Next.js 14
- TypeScript
- React 18
- Tailwind CSS

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Type check without building

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. **B2B Google Maps Integration**: Implement actual Google Maps scraping for B2B leads
2. **Contact Validation**: Add validation logic to move contacts from RAW to CLEANED
3. **User Authentication**: Add user authentication if needed
4. **Advanced Filtering**: Add more filtering options in the frontend
5. **Export Functionality**: Allow users to export their records
