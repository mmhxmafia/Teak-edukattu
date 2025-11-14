<?php
/**
 * WordPress Order Creation REST API Endpoint
 * 
 * Add this code to your WordPress theme's functions.php (after the Razorpay code)
 * This creates a REST API endpoint for creating orders without authentication
 */

// Add REST API endpoint for creating orders
add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/orders/create', array(
        'methods' => 'POST',
        'callback' => 'create_order_endpoint',
        'permission_callback' => '__return_true', // Allow guest checkout
    ));
});

/**
 * Create WooCommerce order via REST API
 */
function create_order_endpoint($request) {
    try {
        // Get parameters from request
        $billing = $request->get_param('billing');
        $shipping = $request->get_param('shipping');
        $line_items = $request->get_param('line_items');
        $payment_method = $request->get_param('payment_method') ?: 'razorpay';
        $customer_note = $request->get_param('customer_note') ?: '';
        
        // Validate required fields
        if (empty($billing) || empty($line_items)) {
            return new WP_Error('missing_params', 'Billing information and line items are required', array('status' => 400));
        }
        
        // Create order
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
        
        // Set billing address
        $order->set_billing_first_name($billing['firstName']);
        $order->set_billing_last_name($billing['lastName']);
        $order->set_billing_address_1($billing['address1']);
        $order->set_billing_city($billing['city']);
        $order->set_billing_state($billing['state']);
        $order->set_billing_postcode($billing['postcode']);
        $order->set_billing_country($billing['country']);
        $order->set_billing_email($billing['email']);
        $order->set_billing_phone($billing['phone']);
        
        // Set shipping address
        if (!empty($shipping)) {
            $order->set_shipping_first_name($shipping['firstName']);
            $order->set_shipping_last_name($shipping['lastName']);
            $order->set_shipping_address_1($shipping['address1']);
            $order->set_shipping_city($shipping['city']);
            $order->set_shipping_state($shipping['state']);
            $order->set_shipping_postcode($shipping['postcode']);
            $order->set_shipping_country($shipping['country']);
        } else {
            // Use billing as shipping if not provided
            $order->set_shipping_first_name($billing['firstName']);
            $order->set_shipping_last_name($billing['lastName']);
            $order->set_shipping_address_1($billing['address1']);
            $order->set_shipping_city($billing['city']);
            $order->set_shipping_state($billing['state']);
            $order->set_shipping_postcode($billing['postcode']);
            $order->set_shipping_country($billing['country']);
        }
        
        // Set payment method
        $order->set_payment_method($payment_method);
        $order->set_payment_method_title('Razorpay');
        
        // Set customer note
        if (!empty($customer_note)) {
            $order->set_customer_note($customer_note);
        }
        
        // Calculate totals
        $order->calculate_totals();
        
        // Set order status to pending payment
        $order->set_status('pending', 'Order created via REST API');
        
        // Save order
        $order->save();
        
        // Return order details
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
