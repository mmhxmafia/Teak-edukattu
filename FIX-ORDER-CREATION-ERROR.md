# 🔧 Fix Order Creation Error - Quick Guide

## The Error:
```
User does not have the capabilities necessary to create an order
```

## The Problem:
WordPress GraphQL requires authentication to create orders. Guest users can't create orders via GraphQL.

## ✅ The Solution:
Add another REST API endpoint to WordPress that allows guest checkout.

---

## 📋 Step 1: Add Order Creation Code to WordPress

1. **Open your hosting file manager**
2. **Navigate to:** `public_html/wp-content/themes/your-theme-name/`
3. **Edit:** `functions.php`
4. **Scroll to the bottom** (after the Razorpay code you added earlier)
5. **Paste this code:**

```php
// Add REST API endpoint for creating orders
add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/orders/create', array(
        'methods' => 'POST',
        'callback' => 'create_order_endpoint',
        'permission_callback' => '__return_true', // Allow guest checkout
    ));
});

function create_order_endpoint($request) {
    try {
        $billing = $request->get_param('billing');
        $shipping = $request->get_param('shipping');
        $line_items = $request->get_param('line_items');
        $payment_method = $request->get_param('payment_method') ?: 'razorpay';
        
        if (empty($billing) || empty($line_items)) {
            return new WP_Error('missing_params', 'Billing and line items required', array('status' => 400));
        }
        
        $order = wc_create_order();
        
        if (is_wp_error($order)) {
            return new WP_Error('order_creation_failed', $order->get_error_message(), array('status' => 500));
        }
        
        // Add line items
        foreach ($line_items as $item) {
            $product_id = $item['product_id'];
            $quantity = $item['quantity'];
            $variation_id = isset($item['variation_id']) ? $item['variation_id'] : 0;
            
            if ($variation_id) {
                $order->add_product(wc_get_product($variation_id), $quantity);
            } else {
                $order->add_product(wc_get_product($product_id), $quantity);
            }
        }
        
        // Set billing
        $order->set_billing_first_name($billing['firstName']);
        $order->set_billing_last_name($billing['lastName']);
        $order->set_billing_address_1($billing['address1']);
        $order->set_billing_city($billing['city']);
        $order->set_billing_state($billing['state']);
        $order->set_billing_postcode($billing['postcode']);
        $order->set_billing_country($billing['country']);
        $order->set_billing_email($billing['email']);
        $order->set_billing_phone($billing['phone']);
        
        // Set shipping (use billing if not provided)
        if (!empty($shipping)) {
            $order->set_shipping_first_name($shipping['firstName']);
            $order->set_shipping_last_name($shipping['lastName']);
            $order->set_shipping_address_1($shipping['address1']);
            $order->set_shipping_city($shipping['city']);
            $order->set_shipping_state($shipping['state']);
            $order->set_shipping_postcode($shipping['postcode']);
            $order->set_shipping_country($shipping['country']);
        } else {
            $order->set_shipping_first_name($billing['firstName']);
            $order->set_shipping_last_name($billing['lastName']);
            $order->set_shipping_address_1($billing['address1']);
            $order->set_shipping_city($billing['city']);
            $order->set_shipping_state($billing['state']);
            $order->set_shipping_postcode($billing['postcode']);
            $order->set_shipping_country($billing['country']);
        }
        
        $order->set_payment_method($payment_method);
        $order->set_payment_method_title('Razorpay');
        $order->calculate_totals();
        $order->set_status('pending');
        $order->save();
        
        return array(
            'success' => true,
            'order_id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'order_key' => $order->get_order_key(),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'status' => $order->get_status(),
        );
        
    } catch (Exception $e) {
        return new WP_Error('order_error', $e->getMessage(), array('status' => 500));
    }
}
```

6. **Save the file**

---

## ✅ Step 2: Test the Endpoint

Visit this URL in your browser:
```
https://admin.teakacacia.com/wp-json/wc/v3/orders/create
```

You should see an error about missing parameters - that's GOOD! It means the endpoint exists.

---

## 🚀 Step 3: Update Frontend Code

I'll update your checkout code to use this new REST API endpoint instead of GraphQL.

---

## 📝 Summary:

**What we're doing:**
- ✅ Adding REST API endpoint for order creation
- ✅ Allows guest checkout (no authentication needed)
- ✅ Creates WooCommerce orders
- ✅ Works with Razorpay payment

**After adding this code:**
1. Save functions.php
2. Test the endpoint
3. I'll update the frontend code
4. Push to GitHub
5. Redeploy to Cloudflare
6. Orders will work!

---

**Add the code to WordPress functions.php now, then let me know!** 🚀
