# TabEcho Backend API

This folder contains serverless functions needed for Stripe integration.

## Why You Need a Backend

Chrome extensions can't directly handle Stripe webhooks or securely manage API keys. You need a backend to:

1. **Create Checkout Sessions** - Securely create Stripe checkout URLs
2. **Handle Webhooks** - Receive notifications when subscriptions change
3. **Verify Subscriptions** - Check if a user has an active subscription
4. **Store Subscription Data** - Keep track of which extension users are subscribed

## Backend Options

### Option 1: Firebase Functions (Recommended)
- **Pros:** Easy setup, generous free tier, integrated database
- **Cons:** Requires Firebase project
- **Cost:** Free for most extensions, ~$5/month if you scale
- **Setup Time:** 15-30 minutes

### Option 2: Vercel Serverless Functions
- **Pros:** Very easy deployment, great DX, fast
- **Cons:** Need separate database
- **Cost:** Free for hobby projects
- **Setup Time:** 15-30 minutes

### Option 3: Railway / Render
- **Pros:** Simple, can run Node.js servers
- **Cons:** Less generous free tier
- **Cost:** $5-10/month minimum

## Quick Start with Firebase (Recommended)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase
```bash
cd backend/firebase
firebase init functions
```

### 3. Install Dependencies
```bash
cd functions
npm install stripe
```

### 4. Set Environment Variables
```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
```

### 5. Deploy
```bash
firebase deploy --only functions
```

### 6. Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://YOUR_PROJECT.cloudfunctions.net/webhook`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret and update config

### 7. Update Extension Config
Update `src/config/stripe.ts` with your deployed function URLs.

## Quick Start with Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
cd backend/vercel
vercel
```

### 3. Add Environment Variables
In Vercel Dashboard, add:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `UPSTASH_REDIS_URL` (for storing subscriptions)

### 4. Configure Stripe Webhook
Same as Firebase option above, but use your Vercel URL.

## Database for Storing Subscriptions

You need to store which extension users have active subscriptions.

### Option 1: Firestore (with Firebase Functions)
Already included in Firebase - no extra setup needed.

### Option 2: Upstash Redis (with Vercel)
- Free tier: 10,000 requests/day
- Setup: https://upstash.com/
- Just need the Redis URL

### Option 3: Supabase
- Free PostgreSQL database
- 500MB storage on free tier
- Setup: https://supabase.com/

## Cost Estimates

### Small Extension (< 1,000 users)
- Firebase: **Free** (within free tier)
- Vercel + Upstash: **Free**
- Stripe fees: 2.9% + 30¢ per transaction

### Medium Extension (1,000 - 10,000 users)
- Firebase: **$5-10/month**
- Vercel + Upstash: **Free** (still within limits)
- Stripe fees: 2.9% + 30¢ per transaction

### Large Extension (10,000+ users)
- Firebase: **$25-50/month**
- Vercel + Upstash: **$10-20/month**
- Stripe fees: 2.9% + 30¢ per transaction

## Security Checklist

- [ ] Never expose Stripe secret key in extension code
- [ ] Always verify webhook signatures
- [ ] Use HTTPS for all API endpoints
- [ ] Validate user inputs on backend
- [ ] Rate limit API endpoints
- [ ] Log all subscription events
- [ ] Handle failed payments gracefully

## Testing

1. Use Stripe test mode keys during development
2. Test checkout flow end-to-end
3. Test webhook delivery with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5001/PROJECT/us-central1/webhook
   stripe trigger customer.subscription.created
   ```
4. Test subscription verification
5. Test expired subscriptions

## Support

For issues with:
- **Stripe setup:** https://stripe.com/docs
- **Firebase:** https://firebase.google.com/support
- **Vercel:** https://vercel.com/support
