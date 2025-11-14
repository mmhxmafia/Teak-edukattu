<?php
/**
 * WordPress Razorpay REST API Endpoint
 * 
 * Add this code to your WordPress theme's functions.php
 * OR create a custom plugin with this code
 * 
 * This creates a REST API endpoint that your React frontend can call
 * to create Razorpay orders using the WooCommerce Razorpay plugin
 */

// Add REST API endpoint for creating Razorpay orders
add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/razorpay/create-order', array(
        'methods' => 'POST',
        'callback' => 'create_razorpay_order_endpoint',
        'permission_callback' => '__return_true', // Allow public access
    ));
});

/**
 * Create Razorpay order via REST API
 */
function create_razorpay_order_endpoint($request) {
    try {
        // Get parameters from request
        $amount = $request->get_param('amount');
        $currency = $request->get_param('currency') ?: 'INR';
        $receipt = $request->get_param('receipt');
        $notes = $request->get_param('notes') ?: array();
        
        // Validate required fields
        if (empty($amount) || empty($receipt)) {
            return new WP_Error('missing_params', 'Amount and receipt are required', array('status' => 400));
        }
        
        // Get Razorpay credentials from WooCommerce settings
        $razorpay_key_id = get_option('woocommerce_razorpay_settings')['key_id'];
        $razorpay_key_secret = get_option('woocommerce_razorpay_settings')['key_secret'];
        
        if (empty($razorpay_key_id) || empty($razorpay_key_secret)) {
            return new WP_Error('razorpay_not_configured', 'Razorpay is not configured', array('status' => 500));
        }
        
        // Create Razorpay order using Razorpay PHP SDK
        require_once WP_PLUGIN_DIR . '/woo-razorpay/razorpay-sdk/Razorpay.php';
        
        $api = new Razorpay\Api\Api($razorpay_key_id, $razorpay_key_secret);
        
        $orderData = array(
            'receipt' => $receipt,
            'amount' => $amount,
            'currency' => $currency,
            'notes' => $notes
        );
        
        $razorpayOrder = $api->order->create($orderData);
        
        // Return order details
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

/**
 * Add CORS headers to allow requests from your React frontend
 */
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
