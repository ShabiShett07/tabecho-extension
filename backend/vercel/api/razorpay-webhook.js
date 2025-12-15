import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Simple in-memory storage (replace with KV or database in production)
const subscriptions = new Map();

// Verify Razorpay webhook signature
function verifyWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.event;

    console.log('Razorpay Webhook Event:', eventType);

    switch (eventType) {
      case 'subscription.activated': {
        // Subscription successfully created
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id; // User ID from extension

        if (userId) {
          subscriptions.set(userId, {
            subscriptionId: subscription.id,
            status: 'active',
            tier: 'pro',
            provider: 'razorpay',
            activatedAt: new Date().toISOString(),
            expiresAt: new Date(subscription.current_end * 1000).toISOString()
          });

          console.log(`Subscription activated for user: ${userId}`);
        }
        break;
      }

      case 'subscription.cancelled': {
        // User cancelled subscription
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (userId) {
          const existingSubscription = subscriptions.get(userId);
          if (existingSubscription) {
            existingSubscription.status = 'cancelled';
            existingSubscription.cancelledAt = new Date().toISOString();
            subscriptions.set(userId, existingSubscription);
          }

          console.log(`Subscription cancelled for user: ${userId}`);
        }
        break;
      }

      case 'subscription.charged': {
        // Payment successfully completed
        const payment = event.payload.payment.entity;
        console.log('Payment completed:', payment.id);
        break;
      }

      case 'subscription.halted': {
        // Subscription halted due to payment failure
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (userId) {
          const existingSubscription = subscriptions.get(userId);
          if (existingSubscription) {
            existingSubscription.status = 'halted';
            existingSubscription.haltedAt = new Date().toISOString();
            subscriptions.set(userId, existingSubscription);
          }

          console.log(`Subscription halted for user: ${userId}`);
        }
        break;
      }

      case 'subscription.expired': {
        // Subscription expired
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (userId) {
          const existingSubscription = subscriptions.get(userId);
          if (existingSubscription) {
            existingSubscription.status = 'expired';
            existingSubscription.expiredAt = new Date().toISOString();
            subscriptions.set(userId, existingSubscription);
          }

          console.log(`Subscription expired for user: ${userId}`);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}
