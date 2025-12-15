# TabEcho Chrome Extension - Setup Guide

## 🎉 Your TabEcho extension has been successfully built!

TabEcho is a Chrome extension that automatically archives idle tabs with visual thumbnails, helping you manage tab overload while never losing important content.

## 📦 What's Been Built

✅ **Core Features:**
- Automatic idle tab detection and archiving
- Visual timeline dashboard with search and filters
- IndexedDB storage for metadata and screenshots
- Tag and project organization
- Settings panel with customizable idle threshold
- Export/Import functionality (Pro feature)
- Free and Pro tier support (with demo upgrade)

✅ **Tech Stack:**
- React + TypeScript + Vite
- Chrome Extension Manifest V3
- IndexedDB for local storage
- Modern, responsive UI with CSS

## 🚀 Installation Steps

### 1. Create Extension Icons

The extension needs icon files. You can:

**Option A:** Create your own PNG icons (16x16, 32x32, 48x48, 128x128 pixels)
- Save them as `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png` in the `dist/` folder
- Use any image editor or online tool like Canva, Figma, or photopea.com

**Option B:** Use the provided script to generate simple placeholder icons:
```bash
npm run generate-icons
```

**Option C:** Temporarily remove icon references:
- Edit `dist/manifest.json` and remove the `icons` and `action.default_icon` sections

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The TabEcho extension should now appear in your extensions list!

### 3. Pin the Extension

- Click the puzzle piece icon in Chrome toolbar
- Find TabEcho and click the pin icon
- The extension icon will appear in your toolbar

### 4. Start Using TabEcho!

Click the extension icon to open the dashboard and explore:
- **Dashboard**: View all archived tabs in a visual timeline
- **Search**: Find tabs by title, URL, domain, or tags
- **Filters**: Filter by domain or project (Pro feature)
- **Settings**: Customize idle threshold, enable auto-archive, and more
- **Upgrade**: Try the Pro tier (demo mode - no payment required)

## 🎯 How It Works

1. **Idle Detection**: TabEcho monitors your tabs and detects when they've been idle for your configured threshold (default: 30 minutes)
2. **Auto-Archive**: When a tab becomes idle, it's automatically archived with metadata (URL, title, timestamp)
3. **Screenshots** (Pro): Pro users can capture visual thumbnails of tabs before archiving
4. **Visual Timeline**: Browse archived tabs in an organized timeline (Today, Yesterday, This Week, etc.)
5. **Restore Anytime**: Click the restore button to reopen any archived tab

## ⚙️ Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Preview production build
npm run preview
```

### Project Structure

```
tabecho-extension/
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.tsx # Main dashboard view
│   │   ├── TabCard.tsx   # Individual tab card
│   │   ├── SearchBar.tsx # Search functionality
│   │   ├── Filters.tsx   # Filter controls
│   │   └── Settings.tsx  # Settings panel
│   ├── storage/          # Storage layer
│   │   ├── db.ts         # IndexedDB wrapper
│   │   └── settings.ts   # Settings manager
│   ├── background.ts     # Background service worker
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── *.css            # Component styles
├── public/
│   └── manifest.json    # Extension manifest
├── dist/                # Built extension (load this in Chrome)
└── vite.config.ts       # Build configuration
```

## 🎨 Features by Tier

### Free Tier
- ✅ Idle tab detection and archiving
- ✅ Basic metadata storage (URL, title, timestamp)
- ✅ List-based dashboard view
- ✅ Simple search by title/URL
- ✅ Restore archived tabs
- ⚠️ Limited to 100 tabs or 7 days retention

### Pro Tier ($4.99/month or $49/year)
- ✅ **All Free features**
- ✅ Visual screenshot thumbnails
- ✅ Unlimited archive storage
- ✅ Advanced filters (domain, project, date range)
- ✅ Tag and project organization
- ✅ Export/Import data (JSON)
- ✅ Tab usage analytics
- ✅ Priority support

### Enterprise Tier ($14.99/month/user)
- ✅ **All Pro features**
- ✅ Cross-device cloud sync
- ✅ Multi-user / team shared projects
- ✅ Bulk automation rules
- ✅ Admin dashboard
- ✅ SLA & custom support

## 💳 Stripe Integration (Production Payment Setup)

The extension currently includes demo upgrade functionality. To implement real payments with Stripe, follow these detailed steps:

### Architecture Overview

```
Chrome Extension (Frontend)
    ↓
Your Backend API (Firebase/Supabase/Node.js)
    ↓
Stripe API (Payment Processing)
```

### Step 1: Create and Configure Stripe Account

1. **Sign up for Stripe**:
   - Go to https://stripe.com and create an account
   - Complete your business profile and verification

2. **Create subscription products**:
   - Navigate to Products in Stripe Dashboard
   - Create two products:
     - **TabEcho Pro**: $4.99/month or $49/year
     - **TabEcho Enterprise**: $14.99/month/user
   - Note down the Price IDs (they look like `price_xxxxx`)

3. **Get API keys**:
   - Go to Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)
   - Keep these secure - you'll need them later

### Step 2: Set Up Backend Server

Choose one of these backend options:

#### Option A: Firebase Functions (Recommended for beginners)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase in a new directory
firebase init functions

# Install dependencies in functions directory
cd functions
npm install stripe express cors
```

**Create `functions/index.js`**:
```javascript
const functions = require('firebase-functions');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const express = require('express');
const cors = require('cors')({ origin: true });

const app = express();
app.use(cors);

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { priceId, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'chrome-extension://YOUR_EXTENSION_ID/success.html',
      cancel_url: 'chrome-extension://YOUR_EXTENSION_ID/cancel.html',
      client_reference_id: userId,
      metadata: { userId }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify subscription status
app.post('/verify-subscription', async (req, res) => {
  const { userId } = req.body;

  try {
    // Query your database for user's subscription
    // Return subscription status
    res.json({
      isActive: true,
      tier: 'pro',
      expiresAt: '2025-12-31'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler for Stripe events
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'YOUR_WEBHOOK_SECRET';

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // User completed payment - activate subscription
        const session = event.data.object;
        // Update your database with subscription info
        break;

      case 'customer.subscription.updated':
        // Subscription changed (renewed, upgraded, etc.)
        break;

      case 'customer.subscription.deleted':
        // Subscription cancelled - deactivate Pro features
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

exports.api = functions.https.onRequest(app);
```

**Deploy**:
```bash
firebase deploy --only functions
```

#### Option B: Supabase Edge Functions

1. Create a Supabase project at https://supabase.com
2. Create Edge Functions for the same endpoints as above
3. Use Supabase Database to store user subscription data

#### Option C: Node.js/Express Server

Deploy your own Express server to platforms like Railway, Render, or Vercel.

### Step 3: Configure Stripe Webhooks

1. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Enter your backend URL: `https://YOUR_BACKEND_URL/webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

2. **Copy the webhook signing secret** (starts with `whsec_`)
3. **Add it to your backend environment variables**

### Step 4: Update Extension Code

1. **Add backend URL to extension**:

Create `src/config/stripe.ts`:
```typescript
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_YOUR_KEY',
  backendUrl: 'https://YOUR_BACKEND_URL',
  priceIds: {
    proMonthly: 'price_xxxxx',
    proYearly: 'price_xxxxx',
    enterprise: 'price_xxxxx'
  }
};
```

2. **Update Settings.tsx** to call real Stripe:

Find the upgrade button handler and replace demo code with:
```typescript
const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
  try {
    // Generate unique user ID if not exists
    const userId = await getUserId(); // Implement this function

    // Call your backend to create checkout session
    const response = await fetch(`${STRIPE_CONFIG.backendUrl}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: tier === 'pro' ? STRIPE_CONFIG.priceIds.proMonthly : STRIPE_CONFIG.priceIds.enterprise,
        userId
      })
    });

    const { url } = await response.json();

    // Open Stripe Checkout in new tab
    chrome.tabs.create({ url });
  } catch (error) {
    console.error('Upgrade error:', error);
    alert('Failed to start upgrade process. Please try again.');
  }
};
```

3. **Add subscription verification**:

Create `src/services/subscription.ts`:
```typescript
import { STRIPE_CONFIG } from '../config/stripe';

export async function verifySubscription(userId: string) {
  try {
    const response = await fetch(`${STRIPE_CONFIG.backendUrl}/verify-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    return await response.json();
  } catch (error) {
    console.error('Verification error:', error);
    return { isActive: false, tier: 'free' };
  }
}
```

Call this on extension startup and periodically to check subscription status.

### Step 5: Test the Integration

1. **Use Stripe test mode**:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC

2. **Test workflow**:
   - Click upgrade button in extension
   - Complete checkout with test card
   - Verify webhook receives event
   - Confirm Pro features unlock

3. **Monitor logs**:
   - Check Stripe Dashboard → Events
   - Check your backend logs
   - Check extension console for errors

### Step 6: Go Live

1. **Switch to production keys**:
   - In Stripe Dashboard, toggle to "Production mode"
   - Replace all test keys (`pk_test_`, `sk_test_`) with live keys (`pk_live_`, `sk_live_`)

2. **Update webhook endpoint** to production URL

3. **Test with real card** (use small amount first)

4. **Set up monitoring**:
   - Enable Stripe email notifications
   - Set up error logging (Sentry, LogRocket, etc.)

### Security Checklist

- [ ] Never expose secret keys in extension code
- [ ] Always verify webhooks using signature
- [ ] Store API keys in environment variables
- [ ] Use HTTPS for all backend endpoints
- [ ] Implement rate limiting on backend
- [ ] Validate all inputs on backend
- [ ] Handle failed payments gracefully
- [ ] Comply with PCI DSS (Stripe handles most of this)

### Troubleshooting

**Issue**: Checkout session not creating
- **Fix**: Check backend logs for errors
- **Fix**: Verify Stripe secret key is correct
- **Fix**: Ensure price IDs match your Stripe products

**Issue**: Webhooks not receiving events
- **Fix**: Verify webhook URL is publicly accessible
- **Fix**: Check webhook signing secret matches
- **Fix**: Look for webhook events in Stripe Dashboard

**Issue**: Subscription not activating after payment
- **Fix**: Check webhook handler is processing events correctly
- **Fix**: Verify database is being updated
- **Fix**: Check extension is calling verify endpoint on startup

## 🔒 Privacy & Permissions

TabEcho requires these permissions:
- **tabs**: To detect idle tabs and capture metadata
- **storage**: To save archived tab data locally
- **activeTab**: To capture screenshots (Pro feature)
- **scripting**: For advanced features
- **idle**: To detect user idle state

**All data is stored locally by default.** Cloud sync is only available for Enterprise users who opt-in.

## 🐛 Troubleshooting

### Extension doesn't load
- Make sure you're loading the `dist/` folder, not the root project folder
- Check that all icon files exist in the `dist/` folder
- Look for errors in `chrome://extensions/` with Developer mode enabled

### Icons missing
- See "Create Extension Icons" section above
- You can temporarily remove icon references from `dist/manifest.json`

### Background worker errors
- Check the service worker logs in `chrome://extensions/` → "service worker" link
- Look for console errors in the extension popup (right-click → Inspect)

### Storage issues
- IndexedDB might be disabled in your browser
- Check browser console for storage-related errors
- Try clearing extension data: Chrome Settings → Privacy → Clear browsing data → Cached images and files

## 📚 Next Steps

1. **Add Icons**: Create proper icon files for a polished look
2. **Test Thoroughly**: Try archiving tabs, searching, and restoring
3. **Customize Settings**: Adjust idle threshold and excluded domains
4. **Try Pro Features**: Click "Upgrade to Pro (Demo)" to test premium features
5. **Deploy**: When ready, publish to Chrome Web Store
6. **Add Backend**: Implement Stripe and cloud sync for production

## 🎊 Features to Add (Future Enhancements)

- [ ] Analytics dashboard with tab usage insights
- [ ] Keyboard shortcuts for quick actions
- [ ] Bulk operations (archive all, delete selected)
- [ ] Import from browser history
- [ ] Smart suggestions based on usage patterns
- [ ] Mobile companion app
- [ ] Browser sync across devices
- [ ] AI-powered tab categorization

## 📞 Support

For issues or questions:
- GitHub: [Create an issue](https://github.com/yourusername/tabecho)
- Email: support@tabecho.com
- Docs: https://tabecho.com/docs

## 📄 License

This project is built as a demonstration. Add your own license as needed.

---

**Built with ❤️ using Claude Code**

Enjoy using TabEcho! 🎉
