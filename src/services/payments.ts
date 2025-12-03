// Payment Service for TabEcho
// Handles both PayPal (international) and Razorpay (India) subscriptions

import { PAYMENT_CONFIG, getExtensionUserId, detectUserCountry } from '../config/payments'
import { updateSettings } from '../storage/settings'

export type PaymentProvider = 'paypal' | 'razorpay'

export interface SubscriptionStatus {
  active: boolean
  provider?: PaymentProvider
  plan?: 'monthly' | 'yearly'
  subscriptionId?: string
  expiresAt?: number
}

/**
 * Load PayPal SDK dynamically
 */
function loadPayPalSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).paypal) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYMENT_CONFIG.paypal.clientId}&vault=true&intent=subscription`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'))
    document.head.appendChild(script)
  })
}

/**
 * Load Razorpay SDK dynamically
 */
function loadRazorpaySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.head.appendChild(script)
  })
}

/**
 * Open PayPal subscription checkout
 */
export async function openPayPalCheckout(plan: 'monthly' | 'yearly'): Promise<void> {
  try {
    await loadPayPalSDK()

    const userId = await getExtensionUserId()
    const planId = plan === 'monthly'
      ? PAYMENT_CONFIG.paypal.plans.monthly
      : PAYMENT_CONFIG.paypal.plans.yearly

    const paypal = (window as any).paypal

    // Create PayPal button container
    const container = document.createElement('div')
    container.id = 'paypal-button-container'
    document.body.appendChild(container)

    // Render PayPal subscription button
    paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe',
      },
      createSubscription: async function(data: any, actions: any) {
        return actions.subscription.create({
          plan_id: planId,
          custom_id: userId,
        })
      },
      onApprove: async function(data: any, actions: any) {
        // Subscription created successfully
        const subscriptionId = data.subscriptionID

        // Verify subscription with backend
        await verifyPayPalSubscription(subscriptionId, userId, plan)

        // Clean up button container
        container.remove()

        // Show success message
        alert('🎉 Subscription activated! Enjoy TabEcho Pro!')

        // Reload settings
        window.location.reload()
      },
      onError: function(err: any) {
        console.error('PayPal error:', err)
        container.remove()
        alert('Payment failed. Please try again.')
      },
      onCancel: function(data: any) {
        container.remove()
        alert('Payment cancelled.')
      },
    }).render('#paypal-button-container')

  } catch (error) {
    console.error('Error opening PayPal checkout:', error)
    throw error
  }
}

/**
 * Verify PayPal subscription with backend
 */
async function verifyPayPalSubscription(
  subscriptionId: string,
  userId: string,
  plan: 'monthly' | 'yearly'
): Promise<void> {
  const response = await fetch(PAYMENT_CONFIG.api.verifyPayPalSubscription, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriptionId, userId, plan }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify subscription')
  }
}

/**
 * Open Razorpay subscription checkout
 */
export async function openRazorpayCheckout(plan: 'monthly' | 'yearly'): Promise<void> {
  try {
    await loadRazorpaySDK()

    const userId = await getExtensionUserId()
    const planId = plan === 'monthly'
      ? PAYMENT_CONFIG.razorpay.plans.monthly
      : PAYMENT_CONFIG.razorpay.plans.yearly

    // Create subscription via backend
    const response = await fetch(PAYMENT_CONFIG.api.createRazorpaySubscription, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planId }),
    })

    if (!response.ok) {
      throw new Error('Failed to create subscription')
    }

    const { subscriptionId, amount } = await response.json()

    // Open Razorpay checkout
    const Razorpay = (window as any).Razorpay
    const rzp = new Razorpay({
      key: PAYMENT_CONFIG.razorpay.keyId,
      subscription_id: subscriptionId,
      name: 'TabEcho Pro',
      description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
      image: chrome.runtime.getURL('icon-128.png'),
      handler: async function(response: any) {
        // Payment successful
        await verifyRazorpayPayment(response, userId, plan)

        // Show success message
        alert('🎉 Subscription activated! Enjoy TabEcho Pro!')

        // Reload settings
        window.location.reload()
      },
      prefill: {
        email: '',
        contact: '',
      },
      theme: {
        color: '#667eea',
      },
      modal: {
        ondismiss: function() {
          alert('Payment cancelled.')
        },
      },
    })

    rzp.open()

  } catch (error) {
    console.error('Error opening Razorpay checkout:', error)
    throw error
  }
}

/**
 * Verify Razorpay payment with backend
 */
async function verifyRazorpayPayment(
  paymentData: any,
  userId: string,
  plan: 'monthly' | 'yearly'
): Promise<void> {
  const response = await fetch(PAYMENT_CONFIG.api.verifyRazorpaySubscription, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...paymentData,
      userId,
      plan,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to verify payment')
  }
}

/**
 * Check subscription status from backend
 */
export async function checkSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const userId = await getExtensionUserId()

    const response = await fetch(
      `${PAYMENT_CONFIG.api.checkSubscription}?userId=${encodeURIComponent(userId)}`
    )

    if (!response.ok) {
      throw new Error('Failed to check subscription status')
    }

    const status: SubscriptionStatus = await response.json()

    // Update local settings based on subscription status
    if (status.active) {
      await updateSettings({
        isPro: true,
        enableScreenshots: true,
        retentionLimit: -1,
        retentionDays: -1,
      })
    } else {
      await updateSettings({
        isPro: false,
        enableScreenshots: false,
        retentionLimit: 100,
        retentionDays: 7,
      })
    }

    // Store subscription info
    await chrome.storage.local.set({ subscriptionStatus: status })

    return status
  } catch (error) {
    console.error('Error checking subscription:', error)

    // Return cached status on error
    const cached = await chrome.storage.local.get('subscriptionStatus')
    if (cached.subscriptionStatus && typeof cached.subscriptionStatus === 'object') {
      return cached.subscriptionStatus as SubscriptionStatus
    }
    return { active: false }
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<void> {
  try {
    const userId = await getExtensionUserId()

    const response = await fetch(PAYMENT_CONFIG.api.cancelSubscription, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    // Update local status
    await updateSettings({
      isPro: false,
      enableScreenshots: false,
      retentionLimit: 100,
      retentionDays: 7,
    })

    await chrome.storage.local.set({
      subscriptionStatus: { active: false },
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Get recommended payment provider based on user location
 */
export async function getRecommendedProvider(): Promise<PaymentProvider> {
  const country = await detectUserCountry()
  return country === 'IN' ? 'razorpay' : 'paypal'
}

/**
 * Initialize subscription checking on extension startup
 */
export async function initializeSubscription(): Promise<void> {
  // Check subscription status on startup
  await checkSubscriptionStatus()

  // Set up periodic check (once per day)
  chrome.alarms.create('check-subscription', {
    periodInMinutes: 60 * 24, // Check every 24 hours
  })

  // Listen for alarm
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'check-subscription') {
      checkSubscriptionStatus()
    }
  })
}
