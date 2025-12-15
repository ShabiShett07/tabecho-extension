# Vercel Deployment Guide for TabEcho Backend

This guide walks you through deploying the TabEcho payment backend to Vercel.

## Prerequisites

- Node.js installed (v18 or higher)
- PayPal Business Account (with Client ID and Secret)
- Razorpay Account (with API keys)
- Vercel account (free tier is fine)

## Step-by-Step Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

This opens your browser to authenticate. Choose your preferred method:
- GitHub
- GitLab
- Bitbucket
- Email

### 3. Navigate to Backend Directory

```bash
cd backend/vercel
```

### 4. Install Dependencies

```bash
npm install
```

Expected output:
```
added 45 packages, and audited 46 packages in 3s
```

### 5. Deploy to Vercel (First Time)

```bash
vercel
```

**Interactive Prompts:**

```
? Set up and deploy "~/Developer/tabecho-extension/backend/vercel"? [Y/n]
> Y

? Which scope do you want to deploy to?
> Your Name (Personal Account)

? Link to existing project? [y/N]
> N

? What's your project's name?
> tabecho-backend

? In which directory is your code located?
> ./

? Want to modify these settings? [y/N]
> N
```

**Output:**
```
🔗  Deployed to production. Run `vercel --prod` to overwrite later.
📝  Preview: https://tabecho-backend-abc123.vercel.app
✅  Production: https://tabecho-backend.vercel.app
```

Copy your production URL - you'll need it!

### 6. Add Environment Variables

**Option A: Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click on your project (`tabecho-backend`)
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add each variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `PAYPAL_CLIENT_ID` | Your PayPal Client ID | Production |
| `PAYPAL_CLIENT_SECRET` | Your PayPal Secret | Production |
| `PAYPAL_MODE` | `sandbox` or `live` | Production |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID | Production |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Secret | Production |
| `RAZORPAY_WEBHOOK_SECRET` | Your Webhook Secret | Production |

**Option B: Vercel CLI**

```bash
# PayPal
vercel env add PAYPAL_CLIENT_ID production
# Paste your Client ID when prompted

vercel env add PAYPAL_CLIENT_SECRET production
# Paste your Client Secret when prompted

vercel env add PAYPAL_MODE production
# Type: sandbox (or live for production)

# Razorpay
vercel env add RAZORPAY_KEY_ID production
# Paste your Key ID when prompted

vercel env add RAZORPAY_KEY_SECRET production
# Paste your Key Secret when prompted

vercel env add RAZORPAY_WEBHOOK_SECRET production
# Paste your Webhook Secret when prompted
```

### 7. Redeploy with Environment Variables

```bash
vercel --prod
```

This redeploys your backend with the environment variables.

### 8. Test Your Endpoints

```bash
# Test check-subscription endpoint
curl https://YOUR_PROJECT.vercel.app/api/check-subscription?userId=test123
```

Expected response:
```json
{
  "isActive": false,
  "tier": "free",
  "message": "No subscription found"
}
```

### 9. Configure Webhooks

**PayPal Webhooks:**

1. Go to https://developer.paypal.com/dashboard/webhooks
2. Click **"Add Webhook"**
3. Enter URL: `https://YOUR_PROJECT.vercel.app/api/paypal-webhook`
4. Select events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `PAYMENT.SALE.COMPLETED`
5. Click **"Save"**

**Razorpay Webhooks:**

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click **"Create New Webhook"**
3. Enter URL: `https://YOUR_PROJECT.vercel.app/api/razorpay-webhook`
4. Select events:
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.charged`
   - `subscription.halted`
   - `subscription.expired`
5. Copy the **Webhook Secret**
6. Update your Vercel environment variable `RAZORPAY_WEBHOOK_SECRET`
7. Click **"Create Webhook"**

### 10. Update Extension Configuration

Create or update `.env` file in your extension root:

```env
# Backend API
VITE_API_URL=https://YOUR_PROJECT.vercel.app/api

# PayPal
VITE_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
VITE_PAYPAL_PLAN_MONTHLY=P-YOUR_MONTHLY_PLAN_ID
VITE_PAYPAL_PLAN_YEARLY=P-YOUR_YEARLY_PLAN_ID

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
VITE_RAZORPAY_PLAN_MONTHLY=plan_YOUR_MONTHLY_PLAN_ID
VITE_RAZORPAY_PLAN_YEARLY=plan_YOUR_YEARLY_PLAN_ID
```

### 11. Rebuild Your Extension

```bash
cd ../..  # Go back to project root
npm run build
```

## Testing the Integration

### Test PayPal Subscription Flow

1. Load extension in Chrome
2. Go to Settings → Subscription
3. Select PayPal payment method
4. Click subscription button
5. Complete checkout with test account
6. Verify webhook received in Vercel logs

### Test Razorpay Subscription Flow

1. Select Razorpay payment method
2. Click subscription button
3. Complete checkout with test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: `123`
   - OTP: `1234`
4. Verify webhook received in Vercel logs

### Check Vercel Logs

**Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **"Logs"** tab
4. Watch for webhook events

**CLI:**
```bash
vercel logs
```

## Updating Your Backend

When you make changes to your backend code:

```bash
cd backend/vercel
vercel --prod
```

This deploys the latest version.

## Production Checklist

Before going live:

- [ ] Switch PayPal from sandbox to live mode
- [ ] Update `PAYPAL_MODE` to `live`
- [ ] Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` with live keys
- [ ] Switch Razorpay from test to live mode
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live keys
- [ ] Create live subscription plans in both PayPal and Razorpay
- [ ] Update webhook URLs to production URLs
- [ ] Test end-to-end with real payment methods
- [ ] Set up persistent storage (Vercel KV or database)
- [ ] Enable monitoring and alerts

## Persistent Storage Setup (Recommended)

The current implementation uses in-memory storage which resets on deployments. For production, use Vercel KV:

### Create Vercel KV Database

```bash
vercel kv create
```

Follow prompts:
- Database name: `tabecho-subscriptions`
- Region: Choose closest to your users

### Install Vercel KV Package

```bash
npm install @vercel/kv
```

### Update Your Code

Modify webhook handlers to use KV instead of Map:

```javascript
import { kv } from '@vercel/kv';

// Instead of: subscriptions.set(userId, data)
await kv.set(`subscription:${userId}`, data);

// Instead of: subscriptions.get(userId)
const data = await kv.get(`subscription:${userId}`);
```

### Redeploy

```bash
vercel --prod
```

## Troubleshooting

### Deployment Fails

**Error: Missing dependencies**
```bash
cd backend/vercel
npm install
vercel --prod
```

**Error: Invalid vercel.json**
- Check JSON syntax
- Ensure all paths are correct

### Webhooks Not Working

**Check webhook URL:**
```bash
curl -X POST https://YOUR_PROJECT.vercel.app/api/paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test"}'
```

Expected: `{"received":true}` or similar response

**Check environment variables:**
```bash
vercel env ls
```

**Check logs:**
```bash
vercel logs --follow
```

### Functions Timing Out

Vercel free tier has 10s timeout. If functions timeout:
- Optimize your code
- Reduce API calls
- Consider upgrading to Pro plan

### CORS Issues

If you get CORS errors, add CORS headers to your functions:

```javascript
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your function code...
}
```

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **PayPal Developer:** https://developer.paypal.com/support
- **Razorpay Support:** https://razorpay.com/support

## Next Steps

1. Set up persistent storage (Vercel KV)
2. Add error monitoring (Sentry)
3. Set up email notifications for subscription events
4. Implement analytics tracking
5. Add admin dashboard for managing subscriptions

---

**Congratulations!** Your backend is now deployed and ready to handle payments. 🎉
