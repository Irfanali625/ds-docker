# Production Setup Guide

This guide will help you deploy the Phone Validation application to your production server at `203.161.58.142`.

## Prerequisites

- Docker and Docker Compose installed on the server
- SSH access to the server
- Firewall ports opened: 3000, 8000, 27017

## Setup Instructions

### 1. Create Environment File

Create a `.env` file in the project root with your production secrets:

```bash
# MongoDB Configuration
MONGO_ROOT_PASSWORD=your-secure-mongodb-password-here

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Twilio Configuration (if using phone validation)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 2. Deploy to Server

SSH into your server and clone/upload the project:

```bash
ssh user@203.161.58.142
cd /path/to/project
```

### 3. Build and Start Services

Use the production docker-compose file:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 4. Access the Application

Once deployed, access the services:

- **Frontend**: http://203.161.58.142:3000
- **Backend API**: http://203.161.58.142:8000
- **MongoDB**: localhost:27017 (internal only)

### 5. Useful Commands

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Clean up (removes containers, networks, but keeps volumes)
docker-compose -f docker-compose.prod.yml down

# Full cleanup (removes everything including volumes)
docker-compose -f docker-compose.prod.yml down -v
```

## Security Recommendations

1. **Change all default passwords** in the environment file
2. **Use firewall rules** to restrict access to MongoDB (port 27017)
3. **Set up SSL/TLS** using a reverse proxy like Nginx
4. **Regular backups** of MongoDB data
5. **Monitor logs** regularly for security issues

## Nginx Reverse Proxy (Optional)

For production, consider using Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/data-scraping

server {
    listen 80;
    server_name 203.161.58.142;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Check service health
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Rebuild a specific service
```bash
docker-compose -f docker-compose.prod.yml up -d --build backend
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

### Access container shell
```bash
docker exec -it ds-backend-prod sh
docker exec -it ds-frontend-prod sh
```

