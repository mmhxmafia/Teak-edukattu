/**
 * Order Tracking & Email Notification System
 * 
 * This feature provides:
 * - Real-time order tracking for customers
 * - Automated email notifications for order status changes
 * - Admin notifications for new orders and status updates
 * - Beautiful, responsive email templates
 * - Secure API endpoints for order management
 */

// Export components
export { default as TrackOrder } from './components/TrackOrder';

// Export API endpoints
// Note: These are server-side and not directly importable in the frontend
// export { default as orderTrackingApi } from './api/orderTracking';

// Export GraphQL queries
export const GET_ORDER_DETAILS = `
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

// Export types
export interface OrderStatus {
  date: string;
  status: string;
  note?: string;
}

export interface OrderItem {
  product: {
    node: {
      id: string;
      name: string;
      image?: {
        sourceUrl: string;
      };
    };
  };
  quantity: number;
  total: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Order {
  id: string;
  databaseId: string;
  orderNumber?: string;
  date: string;
  status: string;
  total: string;
  subtotal: string;
  totalTax: string;
  shippingTotal: string;
  customerNote?: string;
  lineItems: {
    nodes: OrderItem[];
  };
  billing: OrderAddress;
  shipping: OrderAddress;
  statusHistory?: OrderStatus[];
}

// Export utility functions
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'bg-blue-500';
    case 'shipped':
      return 'bg-amber-500';
    case 'delivered':
    case 'completed':
      return 'bg-green-500';
    case 'on-hold':
      return 'bg-orange-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const formatOrderDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Export feature information
export const featureInfo = {
  name: 'Order Tracking & Email Notification System',
  version: '1.0.0',
  description: 'A comprehensive system for tracking orders and sending email notifications',
  author: 'Edakkattu Furniture (Teakacacia LLP) Development Team',
  documentation: './README.md',
  quickStart: './QUICK-START.md'
};

export default {
  TrackOrder,
  getStatusColor,
  formatOrderDate,
  featureInfo
};
