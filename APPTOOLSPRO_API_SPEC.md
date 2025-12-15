# AppToolsPro API Specification for TabEcho

This document specifies the API endpoints you need to implement on `apptoolspro.com` for TabEcho extension integration.

## Base URL

```
https://apptoolspro.com/api/tabecho
```

## Required Endpoints

### 1. Check Subscription Status

**Endpoint:** `GET /check-subscription`

**Description:** Check if a user has an active TabEcho Pro subscription

**Query Parameters:**
- `userId` (string, required) - Unique extension user ID

**Example Request:**
```
GET https://apptoolspro.com/api/tabecho/check-subscription?userId=ext_1234567890_abc123
```

**Response Format:**

```json
{
  "active": true,
  "tier": "pro",
  "provider": "paypal",
  "status": "active",
  "expiresAt": "2025-01-15T00:00:00Z",
  "subscriptionId": "I-BW452GLLEP1G"
}
```

**Response Fields:**
- `active` (boolean, required) - Whether subscription is currently active
- `tier` (string, required) - Subscription tier: `"pro"` or `"free"`
- `provider` (string, optional) - Payment provider: `"paypal"` or `"razorpay"`
- `status` (string, optional) - Subscription status: `"active"`, `"cancelled"`, `"expired"`
- `expiresAt` (string, optional) - ISO 8601 date when subscription expires
- `subscriptionId` (string, optional) - Payment provider subscription ID

**Response for No Subscription:**
```json
{
  "active": false,
  "tier": "free",
  "message": "No subscription found"
}
```

**HTTP Status Codes:**
- `200 OK` - Success (active or inactive)
- `400 Bad Request` - Missing or invalid userId
- `500 Internal Server Error` - Server error

---

### 2. Cancel Subscription (Optional)

**Endpoint:** `POST /cancel-subscription`

**Description:** Cancel a user's subscription

**Request Body:**
```json
{
  "userId": "ext_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

**HTTP Status Codes:**
- `200 OK` - Subscription cancelled
- `400 Bad Request` - Missing userId or no active subscription
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## Implementation Guide

### User ID Management

The extension generates a unique `userId` for each installation:
- Format: `ext_[timestamp]_[random]`
- Example: `ext_1702645200_k9j2h4m6n8`
- Stored in: `chrome.storage.local.userId`

**You need to:**
1. Store this `userId` when user completes payment
2. Link it to their subscription in your database
3. Use it to check subscription status

### Payment Flow Integration

**Step 1: User clicks "Upgrade" in extension**
- Extension redirects to: `https://tabecho.apptoolspro.com/payment?plan=monthly`
- URL parameters available:
  - `plan`: `"monthly"` or `"yearly"`

**Step 2: Capture userId on your payment page**

Add this JavaScript to your payment page:

```javascript
// Get userId from extension
async function getExtensionUserId() {
  return new Promise((resolve) => {
    // Check if TabEcho extension is installed
    chrome.runtime.sendMessage(
      'YOUR_EXTENSION_ID', // Replace with actual extension ID
      { action: 'getUserId' },
      (response) => {
        if (response && response.userId) {
          resolve(response.userId);
        } else {
          // Fallback: generate temporary ID
          resolve(`web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        }
      }
    );
  });
}

// Use it before payment
const userId = await getExtensionUserId();
// Store userId with payment metadata
```

**Step 3: Store subscription after successful payment**

After PayPal/Razorpay confirms payment:

```javascript
// Pseudo-code for your backend
async function handlePaymentSuccess(subscriptionData) {
  await database.subscriptions.create({
    userId: subscriptionData.userId,
    provider: 'paypal', // or 'razorpay'
    subscriptionId: subscriptionData.subscriptionId,
    plan: subscriptionData.plan,
    status: 'active',
    createdAt: new Date(),
    expiresAt: calculateExpiryDate(subscriptionData.plan)
  });
}
```

**Step 4: Extension auto-checks subscription**

The extension will automatically:
- Call `/check-subscription` on startup
- Check every 24 hours
- Enable Pro features if `active: true`

### Database Schema Suggestion

```sql
CREATE TABLE tabecho_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(20) NOT NULL, -- 'paypal' or 'razorpay'
  subscription_id VARCHAR(255) NOT NULL,
  plan VARCHAR(20) NOT NULL, -- 'monthly' or 'yearly'
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired'
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  UNIQUE(subscription_id)
);

CREATE INDEX idx_user_id ON tabecho_subscriptions(user_id);
CREATE INDEX idx_subscription_id ON tabecho_subscriptions(subscription_id);
```

### Example Implementation (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();

// Check subscription endpoint
router.get('/check-subscription', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required'
      });
    }

    // Query your database
    const subscription = await db.query(
      'SELECT * FROM tabecho_subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (!subscription || subscription.rows.length === 0) {
      return res.json({
        active: false,
        tier: 'free',
        message: 'No subscription found'
      });
    }

    const sub = subscription.rows[0];

    // Check if expired
    const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();

    if (isExpired) {
      // Update status to expired
      await db.query(
        'UPDATE tabecho_subscriptions SET status = $1 WHERE user_id = $2',
        ['expired', userId]
      );

      return res.json({
        active: false,
        tier: 'free',
        status: 'expired'
      });
    }

    return res.json({
      active: true,
      tier: 'pro',
      provider: sub.provider,
      status: sub.status,
      expiresAt: sub.expires_at,
      subscriptionId: sub.subscription_id
    });

  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Cancel subscription endpoint
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required'
      });
    }

    const result = await db.query(
      'UPDATE tabecho_subscriptions SET status = $1, cancelled_at = NOW() WHERE user_id = $2 AND status = $3',
      ['cancelled', userId, 'active']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'No active subscription found'
      });
    }

    return res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
```

### CORS Configuration

**Important:** Enable CORS for your API endpoints:

```javascript
// Allow extension to call your API
app.use('/api/tabecho', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'chrome-extension://YOUR_EXTENSION_ID');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
```

Or allow all origins for testing (not recommended for production):

```javascript
const cors = require('cors');
app.use('/api/tabecho', cors());
```

---

## Testing Your API

### Test Check Subscription

```bash
# Test with active subscription
curl "https://apptoolspro.com/api/tabecho/check-subscription?userId=test_user_123"

# Expected response:
{
  "active": true,
  "tier": "pro",
  "provider": "paypal",
  "status": "active"
}
```

### Test Cancel Subscription

```bash
curl -X POST https://apptoolspro.com/api/tabecho/cancel-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'

# Expected response:
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

---

## Extension Behavior

### Subscription Check Frequency

The extension checks subscription status:
1. **On startup** - When extension is loaded
2. **Every 24 hours** - Automatic background check
3. **After payment** - User manually triggers check

### Pro Feature Activation

When API returns `active: true`:
- ✅ Screenshot thumbnails enabled
- ✅ Unlimited archive storage
- ✅ Advanced search & filters
- ✅ Tags & organization features
- ✅ Export/Import functionality

### Fallback Behavior

If API is unreachable:
- Extension uses cached subscription status
- Shows "Unable to verify subscription" message
- Retries on next check

---

## Security Considerations

1. **Rate Limiting**: Limit API calls per userId (e.g., 100/hour)
2. **Authentication**: Consider adding API key for additional security
3. **Validation**: Always validate userId format
4. **HTTPS Only**: Ensure all API calls use HTTPS
5. **Data Privacy**: Don't log sensitive user data

---

## Quick Start Checklist

- [ ] Create database table for subscriptions
- [ ] Implement `/check-subscription` endpoint
- [ ] Implement `/cancel-subscription` endpoint (optional)
- [ ] Enable CORS for extension
- [ ] Test with sample userId
- [ ] Update payment page to capture userId
- [ ] Store userId when payment succeeds
- [ ] Deploy API to production
- [ ] Test from extension

---

## Need Help?

If you need assistance implementing these endpoints, let me know! I can help with:
- Specific backend framework (Node.js, PHP, Python, etc.)
- Database setup
- Payment webhook integration
- Testing and debugging
