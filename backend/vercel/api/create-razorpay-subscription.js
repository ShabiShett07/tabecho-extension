import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId, userEmail } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({
        error: 'planId and userId are required'
      });
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // For yearly plans, adjust as needed
      notes: {
        user_id: userId,
        email: userEmail || ''
      }
    });

    return res.status(200).json({
      subscriptionId: subscription.id,
      status: subscription.status,
      shortUrl: subscription.short_url
    });
  } catch (error) {
    console.error('Create Razorpay subscription error:', error);
    res.status(500).json({ error: error.message });
  }
}
