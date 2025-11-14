# Razorpay Setup Guide for Edakkattu Furniture (Teakacacia LLP)

This guide will walk you through the process of setting up your Razorpay account and integrating it with your website.

## Step 1: Complete Your Razorpay Account Setup

Based on the screenshot you shared, you've already created a Razorpay account and selected "Website" as your integration type. Now you need to:

1. Click on the "Set up your payment gateway" section that shows "You are in live mode"
2. Click the "Reveal Live API Keys" button at the bottom of that section

## Step 2: Get Your API Keys

After clicking "Reveal Live API Keys", you'll see two important keys:

1. **Key ID**: This is your public key that will be used in the frontend
2. **Key Secret**: This is your private key that should ONLY be used on the server side

## Step 3: Update Your Environment Variables

Add these keys to your `.env` file:

```
# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
```

## Step 4: Set Up Webhooks

Webhooks allow Razorpay to notify your server about payment events:

1. In the Razorpay Dashboard, go to Settings > Webhooks
2. Click "Add New Webhook"
3. Enter your webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Select events to subscribe to:
   - payment.authorized
   - payment.captured
   - payment.failed
5. Create a webhook secret and add it to your `.env` file:
   ```
   RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
   ```

## Step 5: Test Your Integration

Before going live, test your integration using Razorpay's test mode:

1. In the Razorpay Dashboard, switch to Test Mode
2. Get your test API keys
3. Update your `.env` file temporarily with test keys
4. Use these test card details:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Name: Any name
   - OTP: 1234

## Step 6: Go Live

Once testing is complete:

1. Switch back to Live Mode in the Razorpay Dashboard
2. Update your `.env` file with your live API keys
3. Deploy your application

## Additional Razorpay Settings

For a complete setup, you should also configure:

1. **Branding**: Customize the payment page with your logo and colors
2. **Business Details**: Ensure your business information is accurate
3. **Payment Methods**: Enable/disable specific payment methods
4. **Refund Policy**: Set up your refund policy
5. **Email Notifications**: Configure email templates for payment receipts

## Troubleshooting

If you encounter issues:

1. **Payment failures**: Check the Razorpay dashboard for error codes
2. **Integration issues**: Verify your API keys are correct
3. **Webhook problems**: Ensure your server is accessible and the webhook URL is correct
4. **Contact Razorpay Support**: If problems persist, contact Razorpay support at support@razorpay.com

## Next Steps

After completing your Razorpay setup:

1. Complete the "Accept your first payment" step in the Razorpay dashboard
2. Set up your bank account for settlements
3. Configure automatic settlements
4. Review and customize your payment page

For detailed documentation, visit [Razorpay's Documentation](https://razorpay.com/docs/).
