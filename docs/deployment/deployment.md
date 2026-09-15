# Deployment Guide

## 1. Prerequisites
Before deploying the Bill Archive Platform to a production environment, ensure you have the following credentials and services provisioned:
- **Supabase Project**: An active Supabase database and authentication instance.
- **Node.js Environment**: A hosting provider capable of running Next.js SSR (e.g., Vercel, Railway, AWS Amplify). Vercel is the recommended platform.

## 2. Environment Variables
Create a `.env.production` or configure your hosting provider's environment variables with the following keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...

# System Secrets
SUPABASE_SERVICE_ROLE_KEY=ey... # Required for admin/backend scripts
JWT_SECRET=your_secure_jwt_secret
```

## 3. Deployment to Vercel (Recommended)
Vercel offers the most seamless integration for Next.js App Router applications.

### Steps:
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log into [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
3. Import your Git repository.
4. Expand the **Environment Variables** section and paste your `.env` key-value pairs.
5. Click **Deploy**. Vercel will automatically detect the Next.js framework, build the application (`npm run build`), and execute it.

## 4. Database Migrations
Ensure that your Supabase instance reflects the correct database schema. 
- Run standard SQL scripts located in the project's repository (if provided) against your Supabase SQL Editor.
- Ensure the `org_configs`, `tasks`, and `projects` tables are correctly provisioned with Row Level Security (RLS) enabled.

## 5. Post-Deployment Verification
Once deployed, perform a sanity check:
- Navigate to the `/login` route. Ensure the authentication parallel route renders without a 404.
- Log in and verify that TanStack Query successfully fetches tasks without cross-origin resource sharing (CORS) errors.
- Test the "Copy Task" clipboard functionality in a secure context (HTTPS is required for modern clipboard API usage).
