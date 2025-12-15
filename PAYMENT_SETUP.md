# Payment Integration Setup Guide

TabEcho uses **PayPal** for international customers and **Razorpay** for Indian customers.

## Overview

- 🌍 **PayPal**: International customers (USD pricing)
- 🇮🇳 **Razorpay**: Indian customers (INR pricing)
- 🔄 **Automatic Detection**: Extension detects user location
- 💰 **Pricing**: $4.99/month or $49/year (USD) | ₹399/month or ₹3999/year (INR)

---

## Part 1: PayPal Setup (International Customers)

### Step 1: Create PayPal Business Account

1. Go to https://www.paypal.com/bizsignup
2. Select "Business Account"
3. Complete registration and verification
4. Start in **Sandbox Mode** for testing

### Step 2: Create PayPal App

1. Go to https://developer.paypal.com/dashboard/applications
2. Click **"Create App"**
3. Choose **"Merchant"** type
4. Name it: "TabEcho Pro"
5. Copy the **Client ID** and **Secret**

### Step 3: Create Subscription Plans

1. Go to https://www.paypal.com/billing/plans
2. Click **"Create Plan"**

**Monthly Plan:**
- **Name**: TabEcho Pro Monthly
- **Description**: Monthly subscription to TabEcho Pro features
- **Pricing**: $4.99/month
- **Billing cycle**: Monthly
- **Trial period**: Optional (7 days)
- Click **"Create"**
- Copy the **Plan ID** (starts with `P-...`)

**Yearly Plan:**
- **Name**: TabEcho Pro Yearly
- **Description**: Yearly subscription to TabEcho Pro (save 17%)
- **Pricing**: $49/year
- **Billing cycle**: Yearly
- Click **"Create"**
- Copy the **Plan ID** (starts with `P-...`)

### Step 4: Configure Webhooks

1. Go to https://developer.paypal.com/dashboard/webhooks
2. Click **"Add Webhook"**
3. **Webhook URL**: `https://YOUR_PROJECT.vercel.app/api/paypal-webhook`
4. **Event types** - Select:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `PAYMENT.SALE.COMPLETED`
5. Click **"Save"**

---

## Part 2: Razorpay Setup (Indian Customers)

### Step 1: Create Razorpay Account

1. Go to https://dashboard.razorpay.com/signup
2. Complete registration
3. Verify your business details
4. Start in **Test Mode**

### Step 2: Get API Keys

1. Go to https://dashboard.razorpay.com/app/keys
2. You'll see:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (click "Generate" if not visible)
3. Copy both keys

### Step 3: Create Subscription Plans

1. Go to https://dashboard.razorpay.com/app/subscriptions/plans
2. Click **"Create New Plan"**

**Monthly Plan:**
- **Plan Name**: TabEcho Pro Monthly
- **Description**: Monthly subscription to TabEcho Pro
- **Billing Amount**: ₹399
- **Billing Interval**: Monthly (every 1 month)
- **Plan Type**: Regular
- Click **"Create Plan"**
- Copy the **Plan ID** (starts with `plan_...`)

**Yearly Plan:**
- **Plan Name**: TabEcho Pro Yearly
- **Description**: 
- **Billing Amount**: ₹3999
- **Billing Interval**: Yearly (every 12 months)
- **Plan Type**: Regular
- Click **"Create Plan"**
- Copy the **Plan ID** (starts with `plan_...`)

### Step 4: Configure Webhooks

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click **"Create New Webhook"**
3. **Webhook URL**: `https://YOUR_PROJECT.vercel.app/api/razorpay-webhook`
4. **Active Events** - Select:
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.charged`
   - `subscription.halted`
   - `subscription.expired`
5. Copy the **Webhook Secret**
6. Click **"Create Webhook"**

---

## Part 3: Vercel Backend Setup

### Step 1: Push Code to GitHub

```bash
# If not already done
git add .
git commit -m "Add Vercel backend"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Connect your GitHub account if needed
4. Select repository: **`YOUR_USERNAME/tabecho-extension`**
5. Click **"Import"**

### Step 3: Configure Project Settings

**Project Name**: `tabecho-backend` (or your choice)

**Framework Preset**: Other

**Root Directory**:
- Click **"Edit"**
- Enter: `backend/vercel`
- Check: ✓ **"Include source files outside of the Root Directory"**

**Build Settings**: Leave empty (using serverless functions)

### Step 4: Add Environment Variables

In Vercel dashboard, add these environment variables:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_SECRET
PAYPAL_MODE=sandbox

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### Step 5: Deploy

Click **"Deploy"** and wait for deployment to complete (~1-2 minutes)

You'll get a URL like: `https://your-project.vercel.app`

Your API endpoints will be:
- `https://your-project.vercel.app/api/paypal-webhook`
- `https://your-project.vercel.app/api/razorpay-webhook`
- `https://your-project.vercel.app/api/check-subscription`
- `https://your-project.vercel.app/api/create-razorpay-subscription`
- `https://your-project.vercel.app/api/cancel-subscription`

### Step 6: Update Webhook URLs

Go back to PayPal and Razorpay dashboards and update webhook URLs with your Vercel deployment URL.

---

## Part 4: Extension Configuration

### Step 1: Create .env File

```bash
cp .env.example .env
```

### Step 2: Fill in .env

```env
# PayPal
VITE_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
VITE_PAYPAL_PLAN_MONTHLY=P-YOUR_MONTHLY_PLAN_ID
VITE_PAYPAL_PLAN_YEARLY=P-YOUR_YEARLY_PLAN_ID

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
VITE_RAZORPAY_PLAN_MONTHLY=plan_YOUR_MONTHLY_PLAN_ID
VITE_RAZORPAY_PLAN_YEARLY=plan_YOUR_YEARLY_PLAN_ID

# Backend API
VITE_API_URL=https://YOUR_PROJECT.vercel.app
```

### Step 3: Build Extension

```bash
npm run build
```

---

## Part 5: Testing

### Test PayPal (Sandbox Mode)

1. Load extension in Chrome
2. Go to Settings → Subscription
3. Select **🌍 International (PayPal)**
4. Click **"$4.99/month"** button
5. PayPal popup will appear
6. Use test credentials:
   - Email: `sb-test@business.example.com` (create in PayPal Sandbox)
   - Or use PayPal test account

### Test Razorpay (Test Mode)

1. Go to Settings → Subscription
2. Select **🇮🇳 India (Razorpay)**
3. Click **"₹399/month"** button
4. Razorpay checkout will appear
5. Use test card:
   - **Card**: `4111 1111 1111 1111`
   - **Expiry**: Any future date
   - **CVV**: Any 3 digits
   - **OTP**: `1234`

### Verify Subscription

1. After payment, wait 5-10 seconds
2. Extension should automatically detect Pro status
3. Verify Pro features are unlocked
4. Check Vercel logs for subscription data

---

## Part 6: Going Live

### PayPal - Switch to Live

1. Go to PayPal Business Account
2. Complete account verification
3. Add bank account for payouts
4. Switch from Sandbox to Live mode
5. Create **Live** subscription plans
6. Update `.env` with **Live** Client ID and Plan IDs
7. Update Vercel environment variables:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Update `PAYPAL_MODE` to `live`
   - Update `PAYPAL_CLIENT_ID` to live client ID
   - Update `PAYPAL_CLIENT_SECRET` to live secret
   - Redeploy will trigger automatically

### Razorpay - Switch to Live

1. Complete KYC verification in Razorpay Dashboard
2. Get Live Mode API keys
3. Create **Live** subscription plans
4. Update `.env` with **Live** Key ID and Plan IDs
5. Update Vercel environment variables:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Update `RAZORPAY_KEY_ID` to live key ID
   - Update `RAZORPAY_KEY_SECRET` to live secret
   - Redeploy will trigger automatically

### Redeploy

```bash
# Rebuild extension
npm run build

# Vercel redeploys automatically on git push
# Or manually redeploy from Vercel dashboard
```

---

## Cost Breakdown

### Transaction Fees

**PayPal:**
- Per transaction: 2.9% + $0.30
- Monthly ($4.99): ~$0.44 per subscription
- Yearly ($49): ~$1.72 per subscription

**Razorpay:**
- Per transaction: 2% (Tier 1)
- Monthly (₹399): ~₹8 per subscription
- Yearly (₹3999): ~₹80 per subscription

### Vercel Costs

**Free Tier (Hobby Plan):**
- 100GB bandwidth/month
- 100 serverless function executions/day
- **FREE** for most small extensions

**Pro Plan ($20/month):**
- 1TB bandwidth/month
- Unlimited serverless function executions
- Recommended for 500+ subscribers

---

## Troubleshooting

### PayPal Issues

**"Failed to load PayPal SDK"**
- Check console for errors
- Verify `VITE_PAYPAL_CLIENT_ID` is correct
- Check CORS settings

**Subscription not activating**
- Check Vercel function logs in dashboard
- Verify webhook is configured correctly
- Check Vercel deployment logs

### Razorpay Issues

**"Failed to load Razorpay SDK"**
- Check internet connection
- Verify Key ID is correct
- Check browser console

**Payment verification failed**
- Check webhook secret matches
- Verify signature generation logic
- Check Vercel logs

### General Issues

**Subscription status not updating**
- Check webhooks are configured correctly
- Verify Vercel deployment is live
- Check Vercel environment variables
- Monitor Vercel function logs in dashboard

---

## Security Checklist

Before going live:

- [ ] PayPal Client Secret never exposed in frontend
- [ ] Razorpay Key Secret never exposed in frontend
- [ ] Webhook signatures verified properly
- [ ] All API endpoints use HTTPS
- [ ] Vercel environment variables are secure
- [ ] Test mode keys replaced with live keys
- [ ] Webhook URLs use Vercel deployment (not localhost)

---

## Support Resources

- **PayPal Documentation**: https://developer.paypal.com/docs/subscriptions/
- **Razorpay Documentation**: https://razorpay.com/docs/payments/subscriptions/
- **Vercel Documentation**: https://vercel.com/docs/functions/serverless-functions

---

## Next Steps

After payments are working:

1. **Test thoroughly** with both providers
2. **Monitor transactions** in dashboards
3. **Handle edge cases** (failed payments, refunds)
4. **Add email notifications** for subscription events
5. **Implement analytics** to track conversions

---

**Need help?** Check Vercel function logs in the Vercel dashboard
