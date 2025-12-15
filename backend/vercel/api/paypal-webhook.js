import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  return mode === 'live'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment());

// Simple in-memory storage (replace with KV or database in production)
const subscriptions = new Map();

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    const eventType = event.event_type;

    console.log('PayPal Webhook Event:', eventType);

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        // Subscription successfully created
        const subscriptionId = event.resource.id;
        const userId = event.resource.custom_id; // User ID from extension

        subscriptions.set(userId, {
          subscriptionId,
          status: 'active',
          tier: 'pro',
          provider: 'paypal',
          activatedAt: new Date().toISOString(),
          expiresAt: null // PayPal handles expiry
        });

        console.log(`Subscription activated for user: ${userId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        // User cancelled subscription
        const userId = event.resource.custom_id;

        const subscription = subscriptions.get(userId);
        if (subscription) {
          subscription.status = 'cancelled';
          subscription.cancelledAt = new Date().toISOString();
          subscriptions.set(userId, subscription);
        }

        console.log(`Subscription cancelled for user: ${userId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        // Subscription expired
        const userId = event.resource.custom_id;

        const subscription = subscriptions.get(userId);
        if (subscription) {
          subscription.status = 'expired';
          subscription.expiredAt = new Date().toISOString();
          subscriptions.set(userId, subscription);
        }

        console.log(`Subscription expired for user: ${userId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPDATED': {
        // Subscription updated (e.g., plan change)
        const userId = event.resource.custom_id;
        const subscriptionId = event.resource.id;

        const subscription = subscriptions.get(userId);
        if (subscription) {
          subscription.updatedAt = new Date().toISOString();
          subscriptions.set(userId, subscription);
        }

        console.log(`Subscription updated for user: ${userId}`);
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Payment successfully completed
        console.log('Payment completed:', event.resource.id);
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}
