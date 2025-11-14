# Order Tracking & Email Notification System

A comprehensive system for tracking orders and sending email notifications for Edakkattu Furniture (Teakacacia LLP) e-commerce platform.

## Overview

This feature provides:
- Real-time order tracking for customers
- Automated email notifications for order status changes
- Admin notifications for new orders and status updates
- Beautiful, responsive email templates
- Secure API endpoints for order management

## Directory Structure

```
src/features/order-tracking/
├── api/                      # API endpoints for order tracking
│   └── orderTracking.js      # Order tracking API routes
├── components/               # React components
│   └── TrackOrder.tsx        # Order tracking page component
├── services/                 # Backend services
│   └── emailService.js       # Email notification service
├── templates/                # Email templates
│   ├── placed.html           # Order confirmation email
│   ├── processing.html       # Order processing email
│   ├── shipped.html          # Order shipped email
│   ├── completed.html        # Order delivered email
│   └── admin_notification.html # Admin notification email
├── server/                   # Server configuration
│   └── index.js              # Express server setup
└── README.md                 # Documentation (this file)
```

## Features

### 1. Order Tracking

Customers can track their orders through:
- Direct link in order confirmation email
- Order tracking page with order number search
- Detailed order status timeline
- Complete order information display

### 2. Email Notifications

#### Currently Implemented Emails:
- **Order-Related Emails**
  - Order confirmation (when placed)
  - Order processing notification
  - Order shipped notification
  - Order delivered/completed notification
  - Admin notifications for new orders and status changes

#### Additional Email Types (Framework Ready):
- **Account-Related Emails**
  - Welcome email (new account creation)
  - Password reset email
  - Account verification email

- **Marketing Emails**
  - Abandoned cart reminder
  - Product recommendations
  - Special offers and promotions
  - Newsletter templates

- **Customer Service Emails**
  - Support ticket confirmation
  - Feedback request
  - Review request email

### 3. Admin Management

Admins can:
- Update order status in WordPress admin
- Add notes to status changes
- Resend notifications if needed
- View email delivery logs

## Technical Implementation

### Frontend (React)

The order tracking page (`TrackOrder.tsx`) provides:
- Order search functionality
- Status timeline visualization
- Order details display
- Responsive design for all devices

### Backend (Node.js/Express)

The backend provides:
- RESTful API endpoints for order tracking
- Email sending service with retry logic
- Queue system to prevent rate limiting
- Error handling and logging

### Email Service

The email service (`emailService.js`) features:
- Gmail SMTP integration (free, up to 500 emails/day)
- HTML email templates with Handlebars
- Queue system to manage email sending
- Retry logic for failed emails
- Logging for monitoring

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders/:orderId` | GET | Get order details |
| `/api/orders/update-status` | POST | Update order status |
| `/api/orders/:orderId/history` | GET | Get status history |
| `/api/orders/:orderId/resend-notification` | POST | Resend notifications |

## Setup Instructions

### 1. Environment Configuration

Copy the values from `.env.email` to your `.env` file:

```
# Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password-from-google

# Site URLs
SITE_URL=https://teakacacia.com
ADMIN_URL=https://teakacacia.com/wp-admin

# Admin notification settings
ADMIN_EMAIL=rennymathewt@gmail.com
DEVELOPER_EMAIL=ninayazvaz@gmail.com
```

### 2. Install Dependencies

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "handlebars": "^4.7.8",
    "nodemailer": "^6.9.9"
  },
  "scripts": {
    "server": "node server/index.js",
    "dev:server": "nodemon server/index.js"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
```

Then run:
```
npm install
```

### 3. Start the Server

```
npm run server
```

## Usage Examples

### Tracking an Order (Customer)

1. Visit `/track-order`
2. Enter order number
3. View order status and details

### Updating Order Status (Admin)

#### Via WordPress Admin:
1. Go to WooCommerce → Orders
2. Select an order
3. Change status and save

#### Via API:
```javascript
fetch('/api/orders/update-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: '123',
    status: 'shipped',
    note: 'Order shipped via FedEx',
    sendNotification: true
  })
})
```

### Resending Notifications

```javascript
fetch('/api/orders/123/resend-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationType: 'both' })
})
```

## Email Templates

All email templates are responsive and designed for optimal viewing on both desktop and mobile devices.

### Customer Templates:
- **Order Placed**: Confirmation with order details
- **Processing**: Status update with timeline
- **Shipped**: Shipping notification with tracking info
- **Completed**: Delivery confirmation with feedback request

### Admin Template:
- **Admin Notification**: New order or status change notification

## Extending the Email System

The email system is designed to be easily expandable. To add a new email type:

### 1. Create a New Template

Create a new HTML template in `src/features/order-tracking/templates/emails/`:

```html
<!-- welcome.html template -->
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to Edakkattu Furniture (Teakacacia LLP)</title>
  <!-- styles here -->
</head>
<body>
  <h1>Welcome, {{customerName}}!</h1>
  <p>Thank you for creating an account with Edakkattu Furniture (Teakacacia LLP).</p>
  <!-- more content -->
</body>
</html>
```

### 2. Add a Sending Function

Add a new function in `emailService.js` for sending that specific email type:

```javascript
// Add to emailService.js
const sendWelcomeEmail = async (customer) => {
  const template = loadTemplate('welcome');
  const html = template({
    customerName: `${customer.firstName} ${customer.lastName}`,
    // other template data
  });
  
  const mailOptions = {
    from: `"Edakkattu Furniture (Teakacacia LLP)" <${process.env.EMAIL_USER}>`,
    to: customer.email,
    subject: `Welcome to Edakkattu Furniture (Teakacacia LLP)!`,
    html: html
  };
  
  queueEmail(mailOptions, {
    recipient: customer.email,
    template: 'welcome'
  });
};

// Export the new function
module.exports = {
  // existing exports
  sendWelcomeEmail,
};
```

### 3. Create an API Endpoint (if needed)

Add an endpoint in `orderTracking.js` if the email needs to be triggered via API:

```javascript
// Send welcome email
router.post('/send-welcome', async (req, res) => {
  try {
    const { customer } = req.body;
    
    await sendWelcomeEmail(customer);
    
    res.json({ 
      success: true,
      message: `Welcome email sent to ${customer.email}` 
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
```

This modular approach allows for easy addition of any email type needed for the e-commerce platform.

## Troubleshooting

### Common Issues:

1. **Emails not sending**
   - Check Gmail credentials in `.env`
   - Verify Gmail "Less secure apps" setting or use App Password
   - Check email sending logs

2. **Order tracking not showing**
   - Verify GraphQL connection
   - Check order ID format
   - Ensure order exists in database

3. **Status updates not triggering emails**
   - Check server logs
   - Verify webhook configuration
   - Test API endpoint directly

## Limitations

- Gmail limits: 500 emails per day
- Suitable for up to 500 monthly customers
- For higher volume, consider migrating to SendGrid or Mailgun

## Future Enhancements

- SMS notifications
- Real-time delivery tracking integration
- Customer feedback collection
- Analytics dashboard for order statuses
