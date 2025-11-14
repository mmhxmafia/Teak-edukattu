const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order
 * POST /api/razorpay/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes = {} } = req.body;

    // Validate required fields
    if (!amount || !receipt) {
      return res.status(400).json({
        success: false,
        error: 'Amount and receipt are required',
      });
    }

    // Create order
    const options = {
      amount: amount, // amount in paise (100 paise = ₹1)
      currency: 'INR',
      receipt: receipt,
      notes: {
        ...notes,
        merchant: 'Edakkattu Furniture (Teakacacia LLP)',
      },
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong',
    });
  }
});

/**
 * Verify Razorpay payment signature
 * POST /api/razorpay/verify-payment
 */
router.post('/verify-payment', (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    // Validate required fields
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID, Order ID and Signature are required',
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isSignatureValid = generatedSignature === signature;

    res.json({
      success: true,
      verified: isSignatureValid,
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong',
    });
  }
});

/**
 * Handle Razorpay webhook
 * POST /api/razorpay/webhook
 */
router.post('/webhook', (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // Validate webhook signature
    const isValidSignature = validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature',
      });
    }

    // Process webhook event
    const event = req.body;
    
    // Handle different event types
    switch (event.event) {
      case 'payment.authorized':
        // Payment has been authorized
        console.log('Payment authorized:', event.payload.payment.entity);
        break;
        
      case 'payment.captured':
        // Payment has been captured (completed)
        console.log('Payment captured:', event.payload.payment.entity);
        // Update order status in your database
        break;
        
      case 'payment.failed':
        // Payment has failed
        console.log('Payment failed:', event.payload.payment.entity);
        // Update order status in your database
        break;
        
      case 'refund.created':
        // Refund has been initiated
        console.log('Refund created:', event.payload.refund.entity);
        break;
        
      default:
        console.log('Unhandled event:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong',
    });
  }
});

/**
 * Validate Razorpay webhook signature
 */
function validateWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

module.exports = router;
