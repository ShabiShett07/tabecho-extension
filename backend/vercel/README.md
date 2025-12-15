# TabEcho Vercel Backend

This is the Vercel serverless backend for TabEcho payment integration with PayPal and Razorpay.

## Features

- PayPal webhook handler
- Razorpay webhook handler
- Subscription verification
- Create Razorpay subscriptions
- Cancel subscriptions (both providers)

## API Endpoints

Once deployed, you'll have these endpoints:

```
https://YOUR_PROJECT.vercel.app/api/paypal-webhook
https://YOUR_PROJECT.vercel.app/api/razorpay-webhook
https://YOUR_PROJECT.vercel.app/api/check-subscription
https://YOUR_PROJECT.vercel.app/api/create-razorpay-subscription
https://YOUR_PROJECT.vercel.app/api/cancel-subscription
```

## Quick Start

### 1. Install Dependencies

```bash
cd backend/vercel
npm install
```

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Login to Vercel

```bash
vercel login
```

### 4. Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your personal account
- **Link to existing project?** No
- **Project name:** tabecho-backend (or your choice)
- **Directory:** `./` (current directory)
- **Override settings?** No

### 5. Add Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

**PayPal:**
- `PAYPAL_CLIENT_ID` - Your PayPal Client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal Client Secret
- `PAYPAL_MODE` - `sandbox` or `live`

**Razorpay:**
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
- `RAZORPAY_WEBHOOK_SECRET` - Your Razorpay Webhook Secret

Or use CLI:

```bash
vercel env add PAYPAL_CLIENT_ID
vercel env add PAYPAL_CLIENT_SECRET
vercel env add PAYPAL_MODE
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add RAZORPAY_WEBHOOK_SECRET
```

### 6. Redeploy with Environment Variables

```bash
vercel --prod
```

### 7. Configure Webhooks

**PayPal:**
1. Go to https://developer.paypal.com/dashboard/webhooks
2. Add webhook URL: `https://YOUR_PROJECT.vercel.app/api/paypal-webhook`
3. Select events (see main PAYMENT_SETUP.md)

**Razorpay:**
1. Go to https://dashboard.razorpay.com/app/webhooks
2. Add webhook URL: `https://YOUR_PROJECT.vercel.app/api/razorpay-webhook`
3. Select events (see main PAYMENT_SETUP.md)

## Storage Notice

⚠️ **Important:** The current implementation uses in-memory storage which will reset on each deployment or cold start.

For production, you should use a persistent database:

### Option 1: Vercel KV (Recommended)

```bash
# Install Vercel KV
npm install @vercel/kv

# Add to Vercel project
vercel kv create
```

Update the webhook handlers to use KV instead of the Map.

### Option 2: Upstash Redis

1. Create account at https://upstash.com
2. Create Redis database
3. Add environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Option 3: Supabase PostgreSQL

1. Create account at https://supabase.com
2. Create project and database
3. Use Supabase client to store subscriptions

## Local Development

```bash
# Install dependencies
npm install

# Run locally
vercel dev
```

This will start a local server at `http://localhost:3000`

## Testing

### Test Webhook Locally

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

Then configure PayPal/Razorpay webhooks to use the ngrok URL.

### Test API Endpoints

```bash
# Check subscription
curl https://YOUR_PROJECT.vercel.app/api/check-subscription?userId=test123

# Create Razorpay subscription
curl -X POST https://YOUR_PROJECT.vercel.app/api/create-razorpay-subscription \
  -H "Content-Type: application/json" \
  -d '{"planId":"plan_xxx","userId":"test123"}'
```

## Troubleshooting

**Deployment fails:**
- Check that all files are in the correct directory structure
- Verify package.json is valid
- Check Vercel logs: `vercel logs`

**Webhooks not working:**
- Verify environment variables are set correctly
- Check Vercel function logs in dashboard
- Ensure webhook URLs are correct in PayPal/Razorpay

**Functions timing out:**
- Vercel serverless functions have 10s timeout on free tier
- Optimize your code or upgrade to Pro plan

## Cost

Vercel free tier includes:
- 100 GB bandwidth
- 100GB-hrs serverless function execution
- Unlimited API requests

For TabEcho with moderate usage, this should be completely free.

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
