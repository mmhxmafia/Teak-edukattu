# Payment System Test Checklist

## ✅ Pre-Flight Checks

### 1. Environment Variables
- [x] Live Razorpay Key ID configured: `rzp_live_RfbZgy9li7xr5C`
- [x] Live Razorpay Key Secret configured: `BRVIoPQ5iqQwdjBiMVAFAi5S`
- [ ] Webhook Secret configured (pending - see RAZORPAY-LIVE-SETUP.md)

### 2. Server Configuration
- [x] Razorpay SDK installed (`razorpay` npm package)
- [x] Server API routes configured (`/api/razorpay/*`)
- [x] Environment variables loaded in server

### 3. Frontend Configuration
- [x] Razorpay client library integrated
- [x] Payment component created (`RazorpayPayment.tsx`)
- [x] Checkout page integrated with Razorpay

## 🧪 Testing Steps

### Step 1: Restart Application

```bash
# Stop the current server (Ctrl+C if running)
# Then restart to load new environment variables
npm run dev
```

### Step 2: Test Checkout Flow

1. **Add Product to Cart**:
   - [ ] Navigate to products page
   - [ ] Add at least one product to cart
   - [ ] Verify cart shows correct items and total

2. **Fill Checkout Form**:
   - [ ] Enter customer information
   - [ ] Enter shipping address
   - [ ] Select country from dropdown (India or USA)
   - [ ] Verify all required fields are filled

3. **Initiate Payment**:
   - [ ] Click "Place Order" button
   - [ ] Razorpay payment modal should open
   - [ ] Verify order details are correct

### Step 3: Test Payment Methods

Test with a small amount (₹10-50) using:

#### UPI Payment
- [ ] Select UPI option
- [ ] Enter UPI ID or scan QR code
- [ ] Complete payment in UPI app
- [ ] Verify payment success

#### Card Payment
- [ ] Select Card option
- [ ] Enter card details
- [ ] Complete payment
- [ ] Verify payment success

#### Net Banking
- [ ] Select Net Banking
- [ ] Choose your bank
- [ ] Complete payment
- [ ] Verify payment success

### Step 4: Verify Payment Success

After successful payment:
- [ ] Payment success message displayed
- [ ] Redirected to order confirmation page
- [ ] Order number displayed
- [ ] Order details are correct
- [ ] Email confirmation sent (check inbox)

### Step 5: Check Razorpay Dashboard

1. **Login to Dashboard**:
   - Visit: https://dashboard.razorpay.com/
   - Go to **Payments** section

2. **Verify Payment**:
   - [ ] Payment appears in dashboard
   - [ ] Status is "Captured"
   - [ ] Amount is correct
   - [ ] Customer details are correct

### Step 6: Check WordPress Orders

1. **Login to WordPress Admin**:
   - Visit: https://admin.teakacacia.com/wp-admin
   - Go to **WooCommerce → Orders**

2. **Verify Order**:
   - [ ] Order appears in WooCommerce
   - [ ] Order status is correct
   - [ ] Payment method shows "Razorpay"
   - [ ] Customer details are correct

## 🚨 Common Issues & Solutions

### Issue: Razorpay Modal Not Opening

**Solution**:
1. Check browser console for errors
2. Verify `VITE_RAZORPAY_KEY_ID` is set correctly
3. Ensure Razorpay script is loaded
4. Restart the development server

### Issue: Payment Fails Immediately

**Solution**:
1. Check if API keys are correct (no extra spaces)
2. Verify server is running
3. Check server logs for errors
4. Ensure amount is in paise (multiply by 100)

### Issue: Payment Success but Order Not Created

**Solution**:
1. Check webhook configuration
2. Verify webhook URL is accessible
3. Check server logs for webhook errors
4. Ensure webhook secret is configured

### Issue: "Invalid Key ID" Error

**Solution**:
1. Verify you're using live keys (starts with `rzp_live_`)
2. Check for typos in `.env` file
3. Restart server after changing `.env`
4. Clear browser cache

## 📊 Test Payment Cards (for testing)

Razorpay provides test cards for testing in live mode:

### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Failed Payment
- **Card Number**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

**Note**: These test cards only work in test mode. In live mode, use real payment methods with small amounts.

## ✅ Final Checklist

Before going fully live:

- [ ] All test payments successful
- [ ] Webhook configured and working
- [ ] Email notifications working
- [ ] Order creation in WordPress working
- [ ] Payment amounts are correct
- [ ] All payment methods tested
- [ ] Error handling tested
- [ ] Mobile responsiveness tested
- [ ] SSL certificate installed (HTTPS)
- [ ] Terms and conditions page created
- [ ] Privacy policy page created
- [ ] Refund policy page created

## 🎉 Ready to Go Live!

Once all checks are complete, you're ready to accept real payments from customers!

---

**Important**: Always test with small amounts first before processing large transactions.
