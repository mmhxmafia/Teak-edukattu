const express = require('express');
const { gql } = require('@apollo/client/core');
const { client } = require('../lib/apolloClient');
const { sendOrderStatusEmail, sendAdminOrderNotification } = require('../services/emailService');

const router = express.Router();

// GraphQL query to get order details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: ID!) {
    order(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      orderNumber
      date
      status
      total
      subtotal
      totalTax
      shippingTotal
      customerNote
      lineItems {
        nodes {
          product {
            node {
              id
              name
              image {
                sourceUrl
              }
            }
          }
          quantity
          total
        }
      }
      billing {
        firstName
        lastName
        email
        phone
        address1
        address2
        city
        state
        postcode
        country
      }
      shipping {
        firstName
        lastName
        address1
        address2
        city
        state
        postcode
        country
      }
      statusHistory {
        date
        status
        note
      }
    }
  }
`;

// GraphQL mutation to update order status
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      order {
        id
        databaseId
        orderNumber
        status
      }
    }
  }
`;

// Get order tracking info
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const { data } = await client.query({
      query: GET_ORDER_DETAILS,
      variables: { id: orderId },
      fetchPolicy: 'network-only'
    });
    
    if (!data?.order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ 
      success: true,
      order: data.order 
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Update order status
router.post('/update-status', async (req, res) => {
  try {
    const { orderId, status, note, sendNotification = true } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false,
        error: 'Order ID and status are required' 
      });
    }
    
    // Update order status in WooCommerce via GraphQL
    const updateResult = await client.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: {
        input: {
          id: orderId,
          status: status,
          customerNote: note || ''
        }
      }
    });
    
    if (!updateResult?.data?.updateOrder?.order) {
      throw new Error('Failed to update order status');
    }
    
    // Get updated order details
    const { data } = await client.query({
      query: GET_ORDER_DETAILS,
      variables: { id: orderId },
      fetchPolicy: 'network-only'
    });
    
    if (!data?.order) {
      throw new Error('Failed to retrieve updated order');
    }
    
    // Send notifications if enabled
    if (sendNotification) {
      try {
        // Send email to customer
        await sendOrderStatusEmail(data.order, status);
        
        // Send email to admin
        await sendAdminOrderNotification(data.order, status);
      } catch (emailError) {
        console.error('Error sending notifications:', emailError);
        // Continue with response even if email fails
      }
    }
    
    res.json({ 
      success: true, 
      order: data.order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get order status history
router.get('/:orderId/history', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const { data } = await client.query({
      query: GET_ORDER_DETAILS,
      variables: { id: orderId },
      fetchPolicy: 'network-only'
    });
    
    if (!data?.order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }
    
    res.json({ 
      success: true,
      orderNumber: data.order.orderNumber || data.order.databaseId,
      statusHistory: data.order.statusHistory || [] 
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Resend order notification email
router.post('/:orderId/resend-notification', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notificationType } = req.body;
    
    if (!notificationType) {
      return res.status(400).json({ 
        success: false,
        error: 'Notification type is required' 
      });
    }
    
    const { data } = await client.query({
      query: GET_ORDER_DETAILS,
      variables: { id: orderId },
      fetchPolicy: 'network-only'
    });
    
    if (!data?.order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }
    
    if (notificationType === 'customer') {
      await sendOrderStatusEmail(data.order, data.order.status);
    } else if (notificationType === 'admin') {
      await sendAdminOrderNotification(data.order, data.order.status);
    } else if (notificationType === 'both') {
      await sendOrderStatusEmail(data.order, data.order.status);
      await sendAdminOrderNotification(data.order, data.order.status);
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid notification type. Use "customer", "admin", or "both"' 
      });
    }
    
    res.json({ 
      success: true,
      message: `Order notification(s) sent successfully` 
    });
  } catch (error) {
    console.error('Error resending notification:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
