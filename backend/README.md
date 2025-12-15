# TabEcho Backend API

This folder contains the Vercel serverless backend for TabEcho's payment integration.

## Why You Need a Backend

Chrome extensions can't directly handle payment webhooks or securely manage API secrets. You need a backend to:

1. **Handle Webhooks** - Receive notifications when subscriptions change (PayPal & Razorpay)
2. **Verify Subscriptions** - Check if a user has an active subscription
3. **Create Subscriptions** - Securely create Razorpay subscriptions
4. **Store Subscription Data** - Keep track of which extension users are subscribed
5. **Cancel Subscriptions** - Handle subscription cancellations

## Backend Architecture

**Platform:** Vercel Serverless Functions
**Payment Providers:**
- **PayPal** - International customers (USD)
- **Razorpay** - Indian customers (INR)

**API Endpoints:**
- `/api/paypal-webhook` - Handle PayPal subscription events
- `/api/razorpay-webhook` - Handle Razorpay subscription events
- `/api/check-subscription` - Verify user subscription status
- `/api/create-razorpay-subscription` - Create new Razorpay subscription
- `/api/cancel-subscription` - Cancel user subscription

## Quick Start

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Vercel backend"
git push origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Connect GitHub and select your repository
4. Click **"Import"**

### 3. Configure Project

- **Project Name**: `tabecho-backend`
- **Framework Preset**: Other
- **Root Directory**: `backend/vercel`
- **Build Settings**: Leave empty

### 4. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox  # or "live" for production

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Deploy

Click **"Deploy"** and wait for completion (~1-2 minutes)

Your backend will be live at: `https://your-project.vercel.app`

### 6. Configure Webhooks

**PayPal:**
1. Go to https://developer.paypal.com/dashboard/webhooks
2. Add webhook: `https://your-project.vercel.app/api/paypal-webhook`
3. Select events: `BILLING.SUBSCRIPTION.*`, `PAYMENT.SALE.COMPLETED`

**Razorpay:**
1. Go to https://dashboard.razorpay.com/app/webhooks
2. Add webhook: `https://your-project.vercel.app/api/razorpay-webhook`
3. Select events: `subscription.*`
4. Copy webhook secret and add to Vercel environment variables

### 7. Update Extension

Update your extension's `.env` file:

```env
VITE_API_URL=https://your-project.vercel.app
```

## Cost Estimates

### Vercel Costs

**Hobby Plan (Free):**
- 100GB bandwidth/month
- 100 function executions/day
- Perfect for small to medium extensions

**Pro Plan ($20/month):**
- 1TB bandwidth/month
- Unlimited function executions
- Recommended for 500+ active subscribers

### Payment Provider Fees

**PayPal:**
- 2.9% + $0.30 per transaction
- Monthly ($4.99): ~$0.44 fee
- Yearly ($49): ~$1.72 fee

**Razorpay:**
- 2% per transaction
- Monthly (₹399): ~₹8 fee
- Yearly (₹3999): ~₹80 fee

## Data Storage

The current implementation uses **in-memory storage** (Map) for simplicity. For production, upgrade to:

### Recommended: Vercel KV (Redis)

**Pros:**
- Serverless Redis
- Free tier: 30MB storage
- Seamless Vercel integration
- No cold starts

**Setup:**
1. Go to Vercel Dashboard → Storage → Create Database → KV
2. Link to your project
3. Vercel will auto-inject `KV_*` environment variables
4. Update API functions to use KV instead of Map

**Example:**
```javascript
import { kv } from '@vercel/kv';

// Instead of: subscriptions.set(userId, data)
await kv.set(`subscription:${userId}`, data);

// Instead of: subscriptions.get(userId)
const data = await kv.get(`subscription:${userId}`);
```

### Alternative: Upstash Redis

**Pros:**
- Free tier: 10,000 requests/day
- Works with any platform
- Simple REST API

**Setup:**
1. Create account at https://upstash.com
2. Create Redis database
3. Add `UPSTASH_REDIS_URL` to Vercel environment variables

## Security Checklist

Before going live:

- [ ] PayPal Client Secret never exposed in frontend
- [ ] Razorpay Key Secret never exposed in frontend
- [ ] Webhook signatures verified properly
- [ ] All API endpoints use HTTPS
- [ ] Environment variables stored securely in Vercel
- [ ] Test mode keys replaced with live keys
- [ ] Webhook URLs use production deployment

## Testing

### Local Testing

```bash
cd backend/vercel
npm install
vercel dev
```

Your API will be available at `http://localhost:3000/api/*`

### Test PayPal Webhook

Use PayPal Sandbox:
1. Create test subscription
2. Monitor Vercel logs for webhook events
3. Verify subscription status updates

### Test Razorpay Webhook

Use Razorpay Test Mode:
1. Create test subscription with test card
2. Check Vercel logs for webhook delivery
3. Verify subscription activation

## Monitoring

**View Logs:**
- Vercel Dashboard → Project → Logs
- Filter by function name
- Real-time log streaming

**Monitor Performance:**
- Vercel Analytics (Pro plan)
- Function execution time
- Error rates

## Deployment

**Automatic Deployments:**
- Push to `main` → Auto-deploy to production
- Push to feature branch → Preview deployment
- Pull requests → Preview deployment with URL

**Manual Deployment:**
```bash
cd backend/vercel
vercel --prod
```

## Troubleshooting

**Webhooks not received:**
- Check Vercel logs for errors
- Verify webhook URL is correct
- Test webhook in PayPal/Razorpay dashboard

**Subscription not updating:**
- Check webhook signature verification
- Verify environment variables
- Monitor Vercel function logs

**Function errors:**
- Check Vercel deployment logs
- Verify all dependencies installed
- Test locally with `vercel dev`

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **PayPal Developer Docs**: https://developer.paypal.com/docs
- **Razorpay Documentation**: https://razorpay.com/docs

## GitHub Integration

Once connected to GitHub:
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs
- ✅ Rollback to previous deployments
- ✅ Environment variables per branch

---

**For detailed payment setup, see [PAYMENT_SETUP.md](../PAYMENT_SETUP.md)**
