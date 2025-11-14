/**
 * Razorpay Integration for Edakkattu Furniture (Teakacacia LLP)
 * 
 * This module provides functions for integrating with Razorpay payment gateway.
 */

// Types for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (100 paise = ₹1)
  currency: string;
  name: string;
  description: string;
  image?: string; // URL of your logo
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    animation?: boolean;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

/**
 * Load the Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Create a Razorpay order
 * @param amount Amount in paise (100 paise = ₹1)
 * @param receipt Receipt ID (usually your internal order ID)
 * @param notes Additional notes for the order
 */
export const createRazorpayOrder = async (
  amount: number,
  receipt: string,
  notes: Record<string, string> = {}
): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        receipt,
        notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Initialize Razorpay payment
 * @param options Razorpay options
 */
export const initializeRazorpayPayment = async (options: RazorpayOptions): Promise<void> => {
  const isScriptLoaded = await loadRazorpayScript();
  
  if (!isScriptLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

/**
 * Verify Razorpay payment
 * @param paymentId Razorpay payment ID
 * @param orderId Razorpay order ID
 * @param signature Razorpay signature
 */
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        orderId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify Razorpay payment');
    }

    const data = await response.json();
    return data.verified;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

export default {
  loadRazorpayScript,
  createRazorpayOrder,
  initializeRazorpayPayment,
  verifyRazorpayPayment,
};
