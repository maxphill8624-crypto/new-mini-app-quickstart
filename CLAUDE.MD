# Cubey - AI Ad Companion Mini App

## Project Overview

This is a Farcaster Mini App called "Cubey" - an AI Ad Companion built for the Base platform. The app is a waitlist sign-up application that can be published to the Base app and Farcaster ecosystem.

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **UI**: React 19 with TypeScript
- **Blockchain**: OnchainKit (Coinbase), Viem, Wagmi
- **Platform**: Farcaster Mini App SDK (@farcaster/miniapp-sdk)
- **State Management**: TanStack React Query
- **Deployment**: Vercel
- **Styling**: CSS Modules

## Project Structure

```
/app
  /api
    /auth/route.ts           # Authentication endpoint
  /.well-known
    /farcaster.json/route.ts # Farcaster manifest endpoint
  /success
    page.tsx                 # Success page after signup
  page.tsx                   # Main landing page
  layout.tsx                 # Root layout
  rootProvider.tsx           # Provider setup (React Query, Wagmi)
  globals.css               # Global styles

/public
  - Various images (icons, screenshots, hero images)
  - blue-icon.png           # App icon
  - blue-hero.png           # Hero/splash image
  - screenshot-portrait.png # App screenshot

/minikit.config.ts          # MiniApp manifest configuration
```

## Key Configuration Files

### minikit.config.ts
Defines the Farcaster MiniApp manifest including:
- App metadata (name: "Cubey", subtitle, description)
- Visual assets (icon, splash, screenshots)
- URLs (home, webhook)
- Category and tags
- Account association (for Farcaster verification)

### Environment Variables

Required environment variables (see .example.env):
- `NEXT_PUBLIC_PROJECT_NAME`: "Cubey" or your app name
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Coinbase Developer Platform API key
- `NEXT_PUBLIC_URL`: Deployment URL (optional for local dev)

## Development Workflow

1. **Local Development**:
   ```bash
   npm install
   npm run dev
   ```
   Runs on http://localhost:3000

2. **Build**:
   ```bash
   npm run build
   ```

3. **Lint**:
   ```bash
   npm run lint
   ```

## Deployment Process

### Vercel Deployment
1. Deploy: `vercel --prod`
2. Add environment variables to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_PROJECT_NAME production
   vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
   vercel env add NEXT_PUBLIC_URL production
   ```

### Account Association (Required for Publishing)
1. Navigate to https://farcaster.xyz/~/developers/mini-apps/manifest
2. Paste your domain
3. Generate and sign the account association
4. Copy the `accountAssociation` object to minikit.config.ts
5. Redeploy

### Testing
- Preview at https://base.dev/preview
- Validate account association, metadata, and embeds
- Test launch functionality

### Publishing
- Create a post in the Base app with your app's URL

## Key Dependencies

- `@farcaster/miniapp-sdk`: Farcaster Mini App integration
- `@coinbase/onchainkit`: Coinbase blockchain utilities
- `wagmi` & `viem`: Ethereum interaction
- `@tanstack/react-query`: Data fetching and state management

## Important Notes

- The app uses Next.js 15's App Router (not Pages Router)
- All pages are React Server Components by default unless marked with 'use client'
- The manifest is dynamically generated at `/.well-known/farcaster.json`
- Images should be optimized and placed in `/public`
- Account association must be completed before publishing to Farcaster

## App Features

This is a waitlist/signup Mini App that:
- Captures user interest for "Cubey" AI Ad Companion
- Integrates with Farcaster for authentication
- Can be launched from Base app and Farcaster
- Uses blockchain wallet integration via OnchainKit

## Development Tips

- Update manifest in `minikit.config.ts` to change app metadata
- Add custom images to `/public` and reference them in config
- The app is categorized as "social" with tags: marketing, ads, quickstart, waitlist
- Authentication flow goes through `/api/auth`
- Success state is handled at `/success`
