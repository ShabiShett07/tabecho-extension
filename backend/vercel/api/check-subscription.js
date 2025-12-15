// Simple in-memory storage (replace with KV or database in production)
const subscriptions = new Map();

export default async function handler(req, res) {
  // Accept both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get userId from query params or body
    const userId = req.method === 'GET'
      ? req.query.userId
      : req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user has active subscription
    const subscription = subscriptions.get(userId);

    if (!subscription) {
      return res.status(200).json({
        isActive: false,
        tier: 'free',
        message: 'No subscription found'
      });
    }

    // Check if subscription is active and not expired
    const isActive =
      subscription.status === 'active' &&
      (!subscription.expiresAt || new Date(subscription.expiresAt) > new Date());

    return res.status(200).json({
      isActive,
      tier: isActive ? subscription.tier : 'free',
      provider: subscription.provider,
      status: subscription.status,
      expiresAt: subscription.expiresAt,
      subscriptionId: subscription.subscriptionId
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({ error: error.message });
  }
}
