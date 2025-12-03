// TabEcho Backend - Firebase Functions
// Handles PayPal and Razorpay subscription management

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// PAYPAL INTEGRATION
// ============================================================================

const PAYPAL_API = functions.config().paypal?.mode === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = functions.config().paypal?.client_id;
const PAYPAL_SECRET = functions.config().paypal?.secret;

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

/**
 * Verify PayPal subscription
 */
exports.verifyPayPalSubscription = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { subscriptionId, userId, plan } = req.body;

      if (!subscriptionId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Verify subscription with PayPal
      const response = await axios.get(
        `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      const subscription = response.data;

      // Check if subscription is active
      if (subscription.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Subscription not active' });
      }

      // Save subscription to Firestore
      await db.collection('users').doc(userId).set({
        provider: 'paypal',
        subscriptionId,
        plan,
        status: subscription.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      res.json({ success: true });
    } catch (error) {
      console.error('Error verifying PayPal subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * PayPal Webhook Handler
 */
exports.paypalWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const webhookEvent = req.body;

    // Verify webhook signature (implement proper verification in production)
    // See: https://developer.paypal.com/api/rest/webhooks/

    console.log('PayPal webhook event:', webhookEvent.event_type);

    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handlePayPalSubscriptionActivated(webhookEvent.resource);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handlePayPalSubscriptionCancelled(webhookEvent.resource);
        break;

      case 'BILLING.SUBSCRIPTION.UPDATED':
        await handlePayPalSubscriptionUpdated(webhookEvent.resource);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePayPalPaymentCompleted(webhookEvent.resource);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

async function handlePayPalSubscriptionActivated(subscription) {
  const userId = subscription.custom_id;

  await db.collection('users').doc(userId).set({
    provider: 'paypal',
    subscriptionId: subscription.id,
    status: 'active',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function handlePayPalSubscriptionCancelled(subscription) {
  const userId = subscription.custom_id;

  await db.collection('users').doc(userId).update({
    status: 'cancelled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePayPalSubscriptionUpdated(subscription) {
  const userId = subscription.custom_id;

  await db.collection('users').doc(userId).update({
    status: subscription.status.toLowerCase(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePayPalPaymentCompleted(payment) {
  // Log payment for analytics
  console.log('PayPal payment completed:', payment.id);
}

// ============================================================================
// RAZORPAY INTEGRATION
// ============================================================================

const RAZORPAY_KEY_ID = functions.config().razorpay?.key_id;
const RAZORPAY_KEY_SECRET = functions.config().razorpay?.key_secret;

/**
 * Create Razorpay subscription
 */
exports.createRazorpaySubscription = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { userId, planId } = req.body;

      if (!userId || !planId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create Razorpay subscription
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

      const response = await axios.post(
        'https://api.razorpay.com/v1/subscriptions',
        {
          plan_id: planId,
          total_count: 12, // 12 billing cycles
          customer_notify: 1,
          notes: {
            extensionUserId: userId,
          },
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const subscription = response.data;

      res.json({
        subscriptionId: subscription.id,
        amount: subscription.plan.item.amount,
      });
    } catch (error) {
      console.error('Error creating Razorpay subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Verify Razorpay payment
 */
exports.verifyRazorpaySubscription = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

      if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Save subscription to Firestore
      await db.collection('users').doc(userId).set({
        provider: 'razorpay',
        subscriptionId: razorpay_subscription_id,
        paymentId: razorpay_payment_id,
        plan,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      res.json({ success: true });
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Razorpay Webhook Handler
 */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const webhookSecret = functions.config().razorpay?.webhook_secret;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.subscription?.entity || req.body.payload.payment?.entity;

    console.log('Razorpay webhook event:', event);

    switch (event) {
      case 'subscription.activated':
        await handleRazorpaySubscriptionActivated(payload);
        break;

      case 'subscription.cancelled':
        await handleRazorpaySubscriptionCancelled(payload);
        break;

      case 'subscription.charged':
        await handleRazorpayPaymentCharged(payload);
        break;

      case 'subscription.halted':
      case 'subscription.expired':
        await handleRazorpaySubscriptionExpired(payload);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

async function handleRazorpaySubscriptionActivated(subscription) {
  const userId = subscription.notes.extensionUserId;

  await db.collection('users').doc(userId).set({
    provider: 'razorpay',
    subscriptionId: subscription.id,
    status: 'active',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function handleRazorpaySubscriptionCancelled(subscription) {
  const userId = subscription.notes.extensionUserId;

  await db.collection('users').doc(userId).update({
    status: 'cancelled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleRazorpaySubscriptionExpired(subscription) {
  const userId = subscription.notes.extensionUserId;

  await db.collection('users').doc(userId).update({
    status: 'expired',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleRazorpayPaymentCharged(payment) {
  console.log('Razorpay payment charged:', payment.id);
}

// ============================================================================
// COMMON ENDPOINTS
// ============================================================================

/**
 * Check subscription status
 */
exports.checkSubscription = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.json({ active: false });
      }

      const userData = userDoc.data();

      const active = userData.status === 'active';

      res.json({
        active,
        provider: userData.provider,
        plan: userData.plan,
        subscriptionId: userData.subscriptionId,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Cancel subscription
 */
exports.cancelSubscription = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      if (userData.provider === 'paypal') {
        // Cancel PayPal subscription
        const accessToken = await getPayPalAccessToken();

        await axios.post(
          `${PAYPAL_API}/v1/billing/subscriptions/${userData.subscriptionId}/cancel`,
          { reason: 'User requested cancellation' },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else if (userData.provider === 'razorpay') {
        // Cancel Razorpay subscription
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        await axios.post(
          `https://api.razorpay.com/v1/subscriptions/${userData.subscriptionId}/cancel`,
          {},
          {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          }
        );
      }

      // Update status in Firestore
      await db.collection('users').doc(userId).update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });
});
