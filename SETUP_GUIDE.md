# Clerk Credentials Setup Guide

## Getting Your Clerk Credentials

1. **Go to Clerk Dashboard**: [dashboard.clerk.com](https://dashboard.clerk.com)

2. **Create or Select Application**: Choose or create an app for your SaaS Voice Chat platform

3. **Get API Keys**:
   - Go to **API Keys** in your Clerk dashboard
   - Copy the **Publishable Key** (starts with `pk_test_...`)
   - Copy the **Secret Key** (starts with `sk_test_...`)

4. **Update Your `.env.local`**:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
   ```

5. **Configure Social Providers** (optional):
   - In Clerk dashboard, go to **User & Authentication → Social Connections**
   - Enable Google, GitHub, or other providers as needed

## Convex Setup

Your Convex deployment is already configured. Make sure `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`.

## Test Your Setup

Once you've added the credentials:

```bash
npm run dev
```

Visit `http://localhost:9002/login` to test authentication!

## Troubleshooting

- **"Publishable key missing"**: Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- **Sign-in modal not appearing**: Check that the publishable key starts with `pk_test_` or `pk_live_`
- **Redirect loops**: Verify `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` is set to `/admin`
