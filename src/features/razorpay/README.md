# Razorpay Payment Integration

This feature integrates Razorpay payment gateway with Edakkattu Furniture (Teakacacia LLP) e-commerce platform.

## Overview

The Razorpay integration provides:
- Secure online payment processing
- Multiple payment methods (credit/debit cards, UPI, net banking, wallets)
- Seamless checkout experience
- Payment status tracking
- Cash on Delivery alternative

## Setup Instructions

### 1. Razorpay Account Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Obtain API keys from the Razorpay Dashboard:
   - Key ID (public key)
   - Key Secret (private key)
3. Set up webhooks in the Razorpay Dashboard:
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events to subscribe: payment.authorized, payment.captured, payment.failed

### 2. Environment Configuration

Add the following to your `.env` file:

```
# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
```

For development/testing, use test keys:

```
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
```

### 3. Install Dependencies

```bash
npm install razorpay crypto
```

### 4. Server Setup

Ensure the server is running to handle Razorpay API requests:

```bash
npm run server
```

## Components

### 1. Frontend Components

- **RazorpayPayment.tsx**: Main component for initiating payments
- **Payment selection UI** in Checkout.tsx

### 2. Backend Components

- **razorpay.js**: API endpoints for order creation and payment verification
- **razorpay.ts**: TypeScript utilities for Razorpay integration

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/razorpay/create-order` | POST | Create a new Razorpay order |
| `/api/razorpay/verify-payment` | POST | Verify payment signature |
| `/api/razorpay/webhook` | POST | Handle Razorpay webhooks |

## Payment Flow

1. **Order Creation**:
   - Customer fills checkout form
   - Order is created in WooCommerce
   - Razorpay order is created via API

2. **Payment Process**:
   - Razorpay checkout modal opens
   - Customer selects payment method and completes payment
   - Razorpay sends callback with payment details

3. **Verification & Completion**:
   - Payment signature is verified
   - Order status is updated
   - Customer is redirected to confirmation page

## Testing

Use Razorpay test credentials and these test card details:

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name
- **OTP**: 1234

For UPI testing, use `success@razorpay` as the UPI ID.

## Troubleshooting

### Common Issues:

1. **Payment modal not opening**
   - Check if Razorpay script is loaded
   - Verify key ID is correct

2. **Payment verification failing**
   - Check key secret in server
   - Ensure signature generation is correct

3. **Webhook not working**
   - Verify webhook URL is accessible
   - Check webhook secret is correct

## Security Considerations

- Never expose the Key Secret in frontend code
- Always verify payment signatures server-side
- Use HTTPS for all API endpoints
- Store payment details securely

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Test Mode](https://razorpay.com/docs/payments/test-mode/)
