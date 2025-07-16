# Vercel Deployment Guide

This guide will help you deploy your Next.js application to Vercel.

## Prerequisites

- [Vercel CLI](https://vercel.com/cli) installed globally: `npm i -g vercel`
- A Vercel account
- Firebase project set up with Authentication enabled
- Google OAuth credentials configured

## Quick Deploy

### Method 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy to Vercel**

   ```bash
   # For preview deployment
   vercel

   # For production deployment
   vercel --prod
   ```

### Method 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Deploy

## Environment Variables Configuration

You need to set up the following environment variables in your Vercel project:

### Required Environment Variables

Navigate to your project settings in Vercel Dashboard → Environment Variables, and add:

```env
# Next.js Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin Configuration (Private)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
```

### Setting Environment Variables via CLI

```bash
# Set production environment variables
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Set public Firebase variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

# Set private Firebase admin variables
vercel env add FIREBASE_ADMIN_PROJECT_ID production
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
```

## Important Configuration Steps

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Authentication → Settings → Authorized domains
3. Add your Vercel domain: `your-project.vercel.app`

### 2. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/signin/google`

### 3. NextAuth Configuration

Ensure your `NEXTAUTH_URL` matches your Vercel domain:

- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch.vercel.app`

## Deployment Scripts

Use these npm scripts for deployment:

```bash
# Check if everything is ready for deployment
bun run deploy:check

# Deploy to preview
bun run vercel:preview

# Deploy to production
bun run vercel:deploy

# Build for Vercel
bun run vercel:build
```

## Project Structure for Vercel

Your project structure is optimized for Vercel:

```
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API routes
│   │   └── ...
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   └── ...
├── vercel.json        # Vercel configuration
├── next.config.ts     # Next.js configuration
└── package.json       # Dependencies and scripts
```

## Build Configuration

The `vercel.json` file configures:

- **Build Command**: `bun run build`
- **Install Command**: `bun install`
- **Runtime**: Node.js 20.x for API routes
- **Security Headers**: Added automatically
- **Regions**: Deployed to `iad1` (US East)

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript types are correct
   - Run `bun run deploy:check` locally

2. **Authentication Issues**
   - Verify `NEXTAUTH_URL` matches your domain
   - Check Firebase authorized domains
   - Ensure Google OAuth redirect URIs are correct

3. **Environment Variables**
   - Use Vercel Dashboard to verify all variables are set
   - Check that sensitive variables are marked as "Sensitive"
   - Ensure `NEXT_PUBLIC_` prefix for client-side variables

4. **Firebase Admin Issues**
   - Ensure `FIREBASE_ADMIN_PRIVATE_KEY` includes newlines
   - Check that service account has proper permissions
   - Verify project ID matches across all Firebase variables

### Debugging

1. **Check Vercel Logs**

   ```bash
   vercel logs your-project-url
   ```

2. **Local Testing**

   ```bash
   # Test build locally
   bun run build
   bun run start

   # Test with production environment
   vercel dev
   ```

3. **Inspect Environment Variables**
   ```bash
   vercel env ls
   ```

## Domain Configuration

### Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update environment variables to use your custom domain

### SSL Certificate

Vercel automatically provides SSL certificates for all deployments.

## Performance Optimization

The deployment includes:

- **Image Optimization**: WebP and AVIF formats
- **Bundle Optimization**: Package imports optimization
- **Security Headers**: XSS protection, content sniffing protection
- **Caching**: Automatic static asset caching

## Monitoring

1. **Vercel Analytics**: Available in the dashboard
2. **Function Logs**: Real-time logs for API routes
3. **Performance Metrics**: Core Web Vitals tracking

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Happy Deploying! 🚀**
