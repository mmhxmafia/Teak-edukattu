# 🎯 Using WordPress as Backend for Razorpay - Complete Guide

## YES! You Can Use WordPress WooCommerce as Your Backend! ✅

Your beautiful React frontend → WordPress REST API → Razorpay Plugin → Razorpay

**No separate backend server needed!**

---

## 📋 Step 1: Add REST API Endpoint to WordPress

You need to add a custom REST API endpoint to WordPress that creates Razorpay orders.

### Option A: Add to functions.php (Quick & Easy)

1. **Login to WordPress Admin**
2. **Go to:** Appearance → Theme File Editor
3. **Select:** functions.php (on the right side)
4. **Scroll to the bottom** and add this code:

```php
// Razorpay REST API Endpoint for React Frontend
add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/razorpay/create-order', array(
        'methods' => 'POST',
        'callback' => 'create_razorpay_order_endpoint',
        'permission_callback' => '__return_true',
    ));
});

function create_razorpay_order_endpoint($request) {
    try {
        $amount = $request->get_param('amount');
        $currency = $request->get_param('currency') ?: 'INR';
        $receipt = $request->get_param('receipt');
        $notes = $request->get_param('notes') ?: array();
        
        if (empty($amount) || empty($receipt)) {
            return new WP_Error('missing_params', 'Amount and receipt are required', array('status' => 400));
        }
        
        $razorpay_settings = get_option('woocommerce_razorpay_settings');
        $razorpay_key_id = $razorpay_settings['key_id'];
        $razorpay_key_secret = $razorpay_settings['key_secret'];
        
        if (empty($razorpay_key_id) || empty($razorpay_key_secret)) {
            return new WP_Error('razorpay_not_configured', 'Razorpay is not configured', array('status' => 500));
        }
        
        require_once WP_PLUGIN_DIR . '/woo-razorpay/razorpay-sdk/Razorpay.php';
        $api = new Razorpay\Api\Api($razorpay_key_id, $razorpay_key_secret);
        
        $orderData = array(
            'receipt' => $receipt,
            'amount' => $amount,
            'currency' => $currency,
            'notes' => $notes
        );
        
        $razorpayOrder = $api->order->create($orderData);
        
        return array(
            'id' => $razorpayOrder['id'],
            'entity' => $razorpayOrder['entity'],
            'amount' => $razorpayOrder['amount'],
            'amount_paid' => $razorpayOrder['amount_paid'],
            'amount_due' => $razorpayOrder['amount_due'],
            'currency' => $razorpayOrder['currency'],
            'receipt' => $razorpayOrder['receipt'],
            'status' => $razorpayOrder['status'],
            'attempts' => $razorpayOrder['attempts'],
            'created_at' => $razorpayOrder['created_at'],
        );
        
    } catch (Exception $e) {
        return new WP_Error('razorpay_error', $e->getMessage(), array('status' => 500));
    }
}

// Enable CORS for React frontend
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
}, 15);
```

5. **Click "Update File"**

---

## ✅ Step 2: Test the Endpoint

Test if the endpoint works:

1. Open your browser
2. Go to: `https://admin.teakacacia.com/wp-json/wc/v3/razorpay/create-order`
3. You should see an error message (that's okay - it means the endpoint exists!)

---

## 🚀 Step 3: Deploy Frontend to Cloudflare

Now your frontend will automatically use WordPress as the backend!

### Add Environment Variables in Cloudflare:

1. `VITE_GRAPHQL_ENDPOINT` = `https://admin.teakacacia.com/graphql`
2. `VITE_APP_NAME` = `Teakacacia`
3. `VITE_APP_URL` = `https://teakacacia.com`
4. `VITE_RAZORPAY_KEY_ID` = `rzp_live_RfbZgy9li7xr5C`

### Deploy:
- Click **Save and Deploy**
- Wait 5 minutes
- Done!

---

## 🎉 How It Works:

```
1. User fills checkout form in React ✅
2. React calls: https://admin.teakacacia.com/wp-json/wc/v3/razorpay/create-order
3. WordPress creates Razorpay order using plugin ✅
4. Returns order ID to React ✅
5. React opens Razorpay payment modal ✅
6. User completes payment ✅
7. Razorpay webhook notifies WordPress ✅
8. WordPress updates order status ✅
```

---

## ✅ Benefits:

- ✅ **No separate backend server** needed
- ✅ **WordPress handles everything**
- ✅ **Your beautiful React UI** stays
- ✅ **100% FREE** hosting
- ✅ **Razorpay plugin** does the heavy lifting
- ✅ **5 minutes** to deploy

---

## 🔧 Troubleshooting:

### If endpoint doesn't work:

1. **Check Razorpay plugin is installed and activated**
2. **Check Razorpay keys are configured in WooCommerce settings**
3. **Check the code was added to functions.php correctly**
4. **Try deactivating and reactivating the Razorpay plugin**

### If CORS errors:

The CORS headers in the code should fix this. If not:
1. Install "WP REST API CORS" plugin
2. Or add CORS headers in your hosting .htaccess file

---

## 🎯 Summary:

**Total Setup Time: 10 Minutes**

1. Add code to WordPress functions.php (5 min)
2. Deploy frontend to Cloudflare (5 min)
3. Test payment (2 min)

**No backend server deployment needed!** ✅

---

## 🚀 Ready to Go Live?

1. Add the code to WordPress functions.php
2. Deploy frontend to Cloudflare
3. Test a payment
4. You're live!

**This is the simplest solution!** 🎉
