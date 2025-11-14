const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Admin email addresses
const ADMIN_EMAILS = [
  'rennymathewt@gmail.com',  // Owner email
  'ninayazvaz@gmail.com'     // Developer email for testing
];

// Create email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use app password for better security
  }
});

// Email queue to prevent rate limiting
const emailQueue = [];
let isProcessing = false;

// Process email queue with delay between sends
const processEmailQueue = async () => {
  if (emailQueue.length === 0) {
    isProcessing = false;
    return;
  }
  
  isProcessing = true;
  const emailTask = emailQueue.shift();
  
  try {
    const info = await sendWithRetry(emailTask.mailOptions);
    logEmailSend(info, emailTask.metadata);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email after retries:', error);
    logEmailError(error, emailTask.metadata);
  }
  
  // Process next email after a delay
  setTimeout(processEmailQueue, 1000);
};

// Add email to queue
const queueEmail = (mailOptions, metadata) => {
  emailQueue.push({ mailOptions, metadata });
  
  if (!isProcessing) {
    processEmailQueue();
  }
};

// Send email with retry logic
const sendWithRetry = async (mailOptions, retries = 3) => {
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying email send, ${retries} attempts left`);
      await new Promise(r => setTimeout(r, 3000));
      return sendWithRetry(mailOptions, retries - 1);
    }
    throw error;
  }
};

// Load and compile email template
const loadTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    const template = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(template);
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    // Fallback to basic template if file not found
    return handlebars.compile(`
      <h1>{{subject}}</h1>
      <p>Order #{{orderNumber}}</p>
      <p>Status: {{status}}</p>
    `);
  }
};

// Log email sending results
const logEmailSend = (info, metadata) => {
  const log = {
    timestamp: new Date().toISOString(),
    messageId: info.messageId,
    recipient: metadata.recipient,
    orderId: metadata.orderId,
    template: metadata.template,
    success: true
  };
  
  // Ensure logs directory exists
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to log file
  fs.appendFileSync(
    path.join(logsDir, 'email.log'), 
    JSON.stringify(log) + '\n'
  );
};

// Log email errors
const logEmailError = (error, metadata) => {
  const log = {
    timestamp: new Date().toISOString(),
    error: error.message,
    recipient: metadata.recipient,
    orderId: metadata.orderId,
    template: metadata.template,
    success: false
  };
  
  // Ensure logs directory exists
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to log file
  fs.appendFileSync(
    path.join(logsDir, 'email_errors.log'), 
    JSON.stringify(log) + '\n'
  );
};

// Format price for display
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
};

// Send order status email to customer
const sendOrderStatusEmail = async (order, status) => {
  try {
    const templateName = status.toLowerCase().replace(/\s+/g, '_');
    const template = loadTemplate(templateName);
    
    // Calculate order total
    const subtotal = order.lineItems.nodes.reduce((sum, item) => 
      sum + parseFloat(item.total), 0);
    
    const shipping = parseFloat(order.shippingTotal || 0);
    const tax = parseFloat(order.totalTax || 0);
    const total = parseFloat(order.total || subtotal + shipping + tax);
    
    // Prepare template data
    const templateData = {
      siteName: 'Edakkattu Furniture (Teakacacia LLP)',
      siteUrl: process.env.SITE_URL || 'https://teakacacia.com',
      orderNumber: order.orderNumber || order.databaseId,
      customerName: `${order.billing.firstName} ${order.billing.lastName}`,
      orderDate: new Date(order.date).toLocaleDateString('en-IN', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }),
      status: status,
      items: order.lineItems.nodes.map(item => ({
        name: item.product?.node?.name || 'Product',
        quantity: item.quantity,
        price: formatPrice(item.total / item.quantity),
        total: formatPrice(item.total),
        image: item.product?.node?.image?.sourceUrl || ''
      })),
      subtotal: formatPrice(subtotal),
      shipping: formatPrice(shipping),
      tax: formatPrice(tax),
      total: formatPrice(total),
      trackingUrl: `${process.env.SITE_URL || 'https://teakacacia.com'}/track-order/${order.orderNumber || order.databaseId}`,
      year: new Date().getFullYear()
    };
    
    const html = template(templateData);
    
    const mailOptions = {
      from: `"Edakkattu Furniture (Teakacacia LLP)" <${process.env.EMAIL_USER}>`,
      to: order.billing.email,
      subject: `Your Order #${order.orderNumber || order.databaseId} is ${status}`,
      html: html
    };
    
    // Queue the email
    queueEmail(mailOptions, {
      recipient: order.billing.email,
      orderId: order.orderNumber || order.databaseId,
      template: templateName
    });
    
    return { queued: true };
  } catch (error) {
    console.error('Error preparing customer email:', error);
    throw error;
  }
};

// Send order notification to admin
const sendAdminOrderNotification = async (order, status) => {
  try {
    const template = loadTemplate('admin_notification');
    
    // Calculate order total
    const subtotal = order.lineItems.nodes.reduce((sum, item) => 
      sum + parseFloat(item.total), 0);
    
    const shipping = parseFloat(order.shippingTotal || 0);
    const tax = parseFloat(order.totalTax || 0);
    const total = parseFloat(order.total || subtotal + shipping + tax);
    
    // Prepare template data
    const templateData = {
      siteName: 'Edakkattu Furniture (Teakacacia LLP)',
      siteUrl: process.env.SITE_URL || 'https://teakacacia.com',
      orderNumber: order.orderNumber || order.databaseId,
      customerName: `${order.billing.firstName} ${order.billing.lastName}`,
      customerEmail: order.billing.email,
      customerPhone: order.billing.phone || 'Not provided',
      orderDate: new Date(order.date).toLocaleDateString('en-IN', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }),
      status: status,
      items: order.lineItems.nodes.map(item => ({
        name: item.product?.node?.name || 'Product',
        quantity: item.quantity,
        price: formatPrice(item.total / item.quantity),
        total: formatPrice(item.total)
      })),
      subtotal: formatPrice(subtotal),
      shipping: formatPrice(shipping),
      tax: formatPrice(tax),
      total: formatPrice(total),
      billingAddress: `${order.billing.address1}, ${order.billing.city}, ${order.billing.state}, ${order.billing.postcode}, ${order.billing.country}`,
      shippingAddress: `${order.shipping.address1}, ${order.shipping.city}, ${order.shipping.state}, ${order.shipping.postcode}, ${order.shipping.country}`,
      adminUrl: `${process.env.ADMIN_URL || 'https://teakacacia.com/wp-admin'}/post.php?post=${order.databaseId}&action=edit`,
      year: new Date().getFullYear()
    };
    
    const html = template(templateData);
    
    // Send to all admin emails
    ADMIN_EMAILS.forEach(adminEmail => {
      const mailOptions = {
        from: `"Edakkattu Furniture (Teakacacia LLP) Orders" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `${status === 'Placed' ? 'New Order' : 'Order Status Update'}: #${order.orderNumber || order.databaseId} - ${status}`,
        html: html
      };
      
      // Queue the email
      queueEmail(mailOptions, {
        recipient: adminEmail,
        orderId: order.orderNumber || order.databaseId,
        template: 'admin_notification'
      });
    });
    
    return { queued: true };
  } catch (error) {
    console.error('Error preparing admin email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderStatusEmail,
  sendAdminOrderNotification
};
