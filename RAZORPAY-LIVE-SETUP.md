# Razorpay Live Setup - Complete Guide

## ✅ Live API Keys Configured

Your live Razorpay API keys have been successfully configured:

- **Live Key ID**: `rzp_live_RfbZgy9li7xr5C`
- **Live Key Secret**: `BRVIoPQ5iqQwdjBiMVAFAi5S`

## 🔐 Important Security Notes

1. **Never commit the `.env` file to Git** - It contains sensitive credentials
2. **Keep your Key Secret private** - Never share it publicly
3. **Use environment variables** - Always use `.env` for credentials

## 📋 Next Steps to Complete Setup

### Step 1: Set Up Webhook Secret

You need to configure webhooks in your Razorpay dashboard to receive payment notifications.

1. **Go to Razorpay Dashboard**:
   - Visit: https://dashboard.razorpay.com/
   - Login with your credentials

2. **Navigate to Webhooks**:
   - Click on **Settings** (gear icon) in the left sidebar
   - Select **Webhooks** from the menu

3. **Create New Webhook**:
   - Click **+ Create New Webhook** button
   - Enter your webhook URL: `https://yourdomain.com/api/razorpay/webhook`
   - Replace `yourdomain.com` with your actual domain

4. **Select Events**:
   Enable these events:
   - ✅ `payment.authorized`
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`

5. **Get Webhook Secret**:
   - After creating the webhook, you'll see a **Secret** field
   - Copy this secret
   - Update your `.env` file:
     ```
     RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
     ```

### Step 2: Test Payment Flow

1. **Restart Your Application**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Test a Small Payment**:
   - Go to your checkout page
   - Add a product to cart
   - Complete the checkout form
   - Use a real payment method (small amount like ₹10)
   - Verify payment is successful

3. **Check Razorpay Dashboard**:
   - Go to **Payments** section
   - You should see your test payment
   - Verify the status is "Captured"

### Step 3: Production Deployment

When deploying to production:

1. **Set Environment Variables on Server**:
   - Add all `.env` variables to your hosting platform
   - Common platforms:
     - **Vercel**: Project Settings → Environment Variables
     - **Netlify**: Site Settings → Build & Deploy → Environment
     - **AWS/DigitalOcean**: Add to server environment

2. **Update Webhook URL**:
   - Change webhook URL to production domain
   - Example: `https://teakacacia.com/api/razorpay/webhook`

3. **Test Production Payments**:
   - Make a small test purchase
   - Verify order creation
   - Check email notifications
   - Confirm payment in Razorpay dashboard

## 🔍 Troubleshooting

### Payment Not Processing

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

2. **Verify API Keys**:
   - Ensure keys are correctly copied (no extra spaces)
   - Check that `VITE_RAZORPAY_KEY_ID` matches `RAZORPAY_KEY_ID`
   - Restart server after changing `.env`

3. **Check Razorpay Dashboard**:
   - Go to **Payments** section
   - Look for failed payments
   - Check error messages

### Webhook Not Working

1. **Verify Webhook URL**:
   - Must be publicly accessible
   - Must use HTTPS (not HTTP)
   - Server must be running

2. **Check Webhook Logs**:
   - Razorpay Dashboard → Webhooks
   - Click on your webhook
   - View delivery logs

3. **Test Webhook**:
   - Use Razorpay's webhook testing tool
   - Check server logs for incoming requests

## 📞 Support

If you encounter issues:

1. **Razorpay Support**:
   - Email: support@razorpay.com
   - Phone: +91-80-6891-8144
   - Dashboard: Use chat support

2. **Check Documentation**:
   - Razorpay Docs: https://razorpay.com/docs/
   - Payment Gateway: https://razorpay.com/docs/payments/

## ✨ Payment Methods Available

With your live account, customers can pay using:

- **Cards**: Credit and Debit cards (Visa, Mastercard, RuPay, etc.)
- **UPI**: Google Pay, PhonePe, Paytm, BHIM, etc.
- **Net Banking**: 50+ banks supported
- **Wallets**: Paytm, PhonePe Pay, Amazon Pay, etc.
- **EMI**: Multiple bank EMI options
- **Pay Later**: LazyPay, Simpl, etc.

## 🎉 You're Almost Ready!

Once you complete the webhook setup, your payment system will be fully functional and ready to accept real payments from customers!

---

**Last Updated**: November 14, 2025
**Status**: Live API Keys Configured ✅
**Pending**: Webhook Secret Configuration
