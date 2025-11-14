# Order Tracking System: Quick Start Guide

This guide provides step-by-step instructions to get the order tracking and email notification system up and running quickly.

## 1. Setup Email Credentials

1. Create a Gmail account for sending notifications or use an existing one
2. Generate an App Password:
   - Go to your Google Account → Security
   - Enable 2-Step Verification if not already enabled
   - Go to App passwords
   - Select "Mail" and "Other" (Custom name)
   - Name it "Edakkattu Furniture (Teakacacia LLP) Orders"
   - Copy the generated 16-character password

3. Update your `.env` file:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_APP_PASSWORD=your-16-char-app-password
   SITE_URL=https://teakacacia.com
   ADMIN_URL=https://teakacacia.com/wp-admin
   ADMIN_EMAIL=rennymathewt@gmail.com
   DEVELOPER_EMAIL=ninayazvaz@gmail.com
   ```

## 2. Install Dependencies

Run these commands in your project root:

```bash
# Install required packages
npm install body-parser cors dotenv express handlebars nodemailer

# Install dev dependencies
npm install --save-dev nodemon
```

## 3. Start the Server

Add this to your `package.json` scripts section:
```json
"scripts": {
  "server": "node server/index.js",
  "dev:server": "nodemon server/index.js"
}
```

Then run:
```bash
npm run server
```

## 4. Test the System

### Test Email Sending:
```bash
curl -X POST http://localhost:5000/api/orders/123/resend-notification \
  -H "Content-Type: application/json" \
  -d '{"notificationType": "both"}'
```

### Test Order Status Update:
```bash
curl -X POST http://localhost:5000/api/orders/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123",
    "status": "shipped",
    "note": "Order shipped via FedEx",
    "sendNotification": true
  }'
```

### Test Order Tracking:
Open your browser and navigate to:
```
http://localhost:3000/track-order/123
```

## 5. Integration with WordPress

1. Ensure your WooCommerce GraphQL API is properly configured
2. Verify the order status names match between your frontend and WooCommerce
3. Test a complete order flow:
   - Create test order in WooCommerce
   - Update status in admin panel
   - Verify emails are sent
   - Check tracking page displays correctly

## 6. Troubleshooting

### Email Issues:
- Check server logs for SMTP errors
- Verify Gmail account settings allow app access
- Test sending a simple email directly with nodemailer

### API Issues:
- Verify server is running on correct port
- Check for CORS issues in browser console
- Test API endpoints directly with curl or Postman

### Tracking Page Issues:
- Check GraphQL connection in browser console
- Verify order ID format matches WooCommerce format
- Ensure React routes are properly configured

## Need Help?

Contact the developer at ninayazvaz@gmail.com for assistance.
