#!/bin/bash

# Create directory structure if it doesn't exist
mkdir -p src/features/order-tracking/api
mkdir -p src/features/order-tracking/components
mkdir -p src/features/order-tracking/services
mkdir -p src/features/order-tracking/templates/emails
mkdir -p src/features/order-tracking/server

# Copy API files
cp src/api/orderTracking.js src/features/order-tracking/api/

# Copy components
cp src/pages/TrackOrder.tsx src/features/order-tracking/components/

# Copy services
cp src/services/emailService.js src/features/order-tracking/services/

# Copy email templates
cp src/templates/emails/*.html src/features/order-tracking/templates/emails/

# Copy server files
cp server/index.js src/features/order-tracking/server/

# Copy configuration files
cp .env.email src/features/order-tracking/
cp package.email.json src/features/order-tracking/

echo "Files organized successfully in src/features/order-tracking/"
