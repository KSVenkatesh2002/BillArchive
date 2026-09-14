# Deployment Guide

## Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database instance
- Environment variables configured in `.env.local` or host dashboard

## Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/bill
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Production Build & Run
```bash
# Install dependencies
npm install

# Run database migrations / seed
npm run db:migrate

# Build production bundle
npm run build

# Start production server
npm start
```
