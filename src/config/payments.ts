// Payment Configuration for TabEcho
// Supports PayPal (International) and Razorpay (India)

export const PAYMENT_CONFIG = {
  // PayPal Configuration (for international customers)
  paypal: {
    // Get this from: https://developer.paypal.com/dashboard/applications
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',

    // Create these in PayPal Dashboard: Products & Subscriptions
    plans: {
      monthly: import.meta.env.VITE_PAYPAL_PLAN_MONTHLY || 'P-YOUR_MONTHLY_PLAN_ID',
      yearly: import.meta.env.VITE_PAYPAL_PLAN_YEARLY || 'P-YOUR_YEARLY_PLAN_ID',
    },
  },

  // Razorpay Configuration (for Indian customers)
  razorpay: {
    // Get this from: https://dashboard.razorpay.com/app/keys
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',

    // Create these in Razorpay Dashboard: Subscriptions > Plans
    plans: {
      monthly: import.meta.env.VITE_RAZORPAY_PLAN_MONTHLY || 'plan_YOUR_MONTHLY_PLAN_ID',
      yearly: import.meta.env.VITE_RAZORPAY_PLAN_YEARLY || 'plan_YOUR_YEARLY_PLAN_ID',
    },
  },

  // Your backend API endpoints
  api: {
    // PayPal endpoints
    createPayPalSubscription: import.meta.env.VITE_API_URL + '/paypal/create-subscription',
    verifyPayPalSubscription: import.meta.env.VITE_API_URL + '/paypal/verify',

    // Razorpay endpoints
    createRazorpaySubscription: import.meta.env.VITE_API_URL + '/razorpay/create-subscription',
    verifyRazorpaySubscription: import.meta.env.VITE_API_URL + '/razorpay/verify',

    // Common endpoint
    checkSubscription: import.meta.env.VITE_API_URL + '/check-subscription',
    cancelSubscription: import.meta.env.VITE_API_URL + '/cancel-subscription',

    // Webhooks (configured in PayPal/Razorpay dashboards)
    paypalWebhook: import.meta.env.VITE_API_URL + '/webhooks/paypal',
    razorpayWebhook: import.meta.env.VITE_API_URL + '/webhooks/razorpay',
  },

  // Pricing (in USD and INR)
  pricing: {
    monthly: {
      usd: 4.99,
      inr: 399,
    },
    yearly: {
      usd: 49,
      inr: 3999,
    },
  },
}

// Get unique user identifier for the extension
export async function getExtensionUserId(): Promise<string> {
  const result = await chrome.storage.local.get('userId')

  if (result.userId && typeof result.userId === 'string') {
    return result.userId as string
  }

  // Generate a new unique ID if not exists
  const userId = `ext_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  await chrome.storage.local.set({ userId })

  return userId
}

// Detect user's country (simplified - you can use a geolocation API for better accuracy)
export async function detectUserCountry(): Promise<'IN' | 'OTHER'> {
  try {
    // Try to detect timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
      return 'IN'
    }

    // Try to detect currency
    const currency = new Intl.NumberFormat().resolvedOptions().currency
    if (currency === 'INR') {
      return 'IN'
    }

    // Check stored preference
    const stored = await chrome.storage.local.get('userCountry')
    if (stored.userCountry) {
      return stored.userCountry as 'IN' | 'OTHER'
    }

    return 'OTHER'
  } catch {
    return 'OTHER'
  }
}

// Save user's country preference
export async function saveUserCountry(country: 'IN' | 'OTHER'): Promise<void> {
  await chrome.storage.local.set({ userCountry: country })
}
