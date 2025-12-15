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
3. **Webhook URL**: `https://YOUR_PROJECT.cloudfunctions.net/razorpayWebhook`
4. **Active Events** - Select:
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.charged`
   - `subscription.halted`
   - `subscription.expired`
5. Copy the **Webhook Secret**
6. Click **"Create Webhook"**

---

## Part 3: Firebase Backend Setup

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it: **"tabecho-pro"**
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 3: Initialize Firebase Functions

```bash
cd backend/firebase
firebase init functions

# Select:
# - Use existing project → select "tabecho-pro"
# - Language: JavaScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### Step 4: Install Dependencies

```bash
cd functions
npm install
```

### Step 5: Configure Environment Variables

```bash
# PayPal Configuration
firebase functions:config:set paypal.client_id="YOUR_PAYPAL_CLIENT_ID"
firebase functions:config:set paypal.secret="YOUR_PAYPAL_SECRET"
firebase functions:config:set paypal.mode="sandbox"  # or "live" for production

# Razorpay Configuration
firebase functions:config:set razorpay.key_id="rzp_test_YOUR_KEY_ID"
firebase functions:config:set razorpay.key_secret="YOUR_RAZORPAY_SECRET"
firebase functions:config:set razorpay.webhook_secret="YOUR_WEBHOOK_SECRET"
```

### Step 6: Deploy Functions

```bash
firebase deploy --only functions
```

You'll get URLs like:
- `https://YOUR_PROJECT.cloudfunctions.net/verifyPayPalSubscription`
- `https://YOUR_PROJECT.cloudfunctions.net/paypalWebhook`
- `https://YOUR_PROJECT.cloudfunctions.net/createRazorpaySubscription`
- `https://YOUR_PROJECT.cloudfunctions.net/razorpayWebhook`
- `https://YOUR_PROJECT.cloudfunctions.net/checkSubscription`
- `https://YOUR_PROJECT.cloudfunctions.net/cancelSubscription`

### Step 7: Update Webhook URLs

Go back to PayPal and Razorpay dashboards and update webhook URLs with your deployed function URLs.

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
VITE_API_URL=https://YOUR_PROJECT.cloudfunctions.net
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
4. Check Firebase Firestore for user subscription data

---

## Part 6: Going Live

### PayPal - Switch to Live

1. Go to PayPal Business Account
2. Complete account verification
3. Add bank account for payouts
4. Switch from Sandbox to Live mode
5. Create **Live** subscription plans
6. Update `.env` with **Live** Client ID and Plan IDs
7. Update Firebase config:
   ```bash
   firebase functions:config:set paypal.mode="live"
   firebase functions:config:set paypal.client_id="LIVE_CLIENT_ID"
   firebase functions:config:set paypal.secret="LIVE_SECRET"
   ```

### Razorpay - Switch to Live

1. Complete KYC verification in Razorpay Dashboard
2. Get Live Mode API keys
3. Create **Live** subscription plans
4. Update `.env` with **Live** Key ID and Plan IDs
5. Update Firebase config:
   ```bash
   firebase functions:config:set razorpay.key_id="rzp_live_YOUR_KEY"
   firebase functions:config:set razorpay.key_secret="LIVE_SECRET"
   ```

### Redeploy

```bash
# Rebuild extension
npm run build

# Redeploy Firebase Functions
cd backend/firebase
firebase deploy --only functions
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

### Firebase Costs

**Free Tier (Spark Plan):**
- 125K function invocations/month
- Free for most small extensions

**Paid (Blaze Plan):**
- With 100 subscribers: ~$0-5/month
- With 1,000 subscribers: ~$25-50/month

---

## Troubleshooting

### PayPal Issues

**"Failed to load PayPal SDK"**
- Check console for errors
- Verify `VITE_PAYPAL_CLIENT_ID` is correct
- Check CORS settings

**Subscription not activating**
- Check Firebase Functions logs: `firebase functions:log`
- Verify webhook is configured correctly
- Check Firestore for user document

### Razorpay Issues

**"Failed to load Razorpay SDK"**
- Check internet connection
- Verify Key ID is correct
- Check browser console

**Payment verification failed**
- Check webhook secret matches
- Verify signature generation logic
- Check Firebase logs

### General Issues

**Subscription status not updating**
- Check webhooks are configured correctly
- Verify Firebase Functions are deployed
- Check Firestore security rules
- Monitor Firebase Functions logs

---

## Security Checklist

Before going live:

- [ ] PayPal Client Secret never exposed in frontend
- [ ] Razorpay Key Secret never exposed in frontend
- [ ] Webhook signatures verified properly
- [ ] All API endpoints use HTTPS
- [ ] Firestore security rules configured
- [ ] Test mode keys replaced with live keys
- [ ] Webhook URLs use deployed functions (not localhost)

---

## Support Resources

- **PayPal Documentation**: https://developer.paypal.com/docs/subscriptions/
- **Razorpay Documentation**: https://razorpay.com/docs/payments/subscriptions/
- **Firebase Documentation**: https://firebase.google.com/docs/functions

---

## Next Steps

After payments are working:

1. **Test thoroughly** with both providers
2. **Monitor transactions** in dashboards
3. **Handle edge cases** (failed payments, refunds)
4. **Add email notifications** for subscription events
5. **Implement analytics** to track conversions

---

**Need help?** Check Firebase Functions logs with `firebase functions:log`
