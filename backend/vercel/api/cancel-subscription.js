import Razorpay from 'razorpay';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  return mode === 'live'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(environment());

// Simple in-memory storage
const subscriptions = new Map();

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, subscriptionId, provider } = req.body;

    if (!userId || !subscriptionId || !provider) {
      return res.status(400).json({
        error: 'userId, subscriptionId, and provider are required'
      });
    }

    if (provider === 'razorpay') {
      // Cancel Razorpay subscription
      await razorpay.subscriptions.cancel(subscriptionId);

      // Update local storage
      const subscription = subscriptions.get(userId);
      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date().toISOString();
        subscriptions.set(userId, subscription);
      }

      return res.status(200).json({
        success: true,
        message: 'Razorpay subscription cancelled'
      });
    } else if (provider === 'paypal') {
      // Cancel PayPal subscription
      const request = new checkoutNodeJssdk.billing.SubscriptionsCancelRequest(subscriptionId);
      request.requestBody({
        reason: 'Customer requested cancellation'
      });

      await paypalClient.execute(request);

      // Update local storage
      const subscription = subscriptions.get(userId);
      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date().toISOString();
        subscriptions.set(userId, subscription);
      }

      return res.status(200).json({
        success: true,
        message: 'PayPal subscription cancelled'
      });
    } else {
      return res.status(400).json({
        error: 'Invalid provider. Must be "razorpay" or "paypal"'
      });
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message });
  }
}
