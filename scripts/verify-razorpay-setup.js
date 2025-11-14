#!/usr/bin/env node

/**
 * Razorpay Setup Verification Script
 * 
 * This script verifies that your Razorpay configuration is correct
 * Run: node scripts/verify-razorpay-setup.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file
const envPath = join(__dirname, '..', '.env');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ Could not read .env file');
  process.exit(1);
}

// Parse .env file
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

console.log('\n🔍 Verifying Razorpay Setup...\n');

// Check environment variables
const checks = {
  'RAZORPAY_KEY_ID': envVars.RAZORPAY_KEY_ID,
  'RAZORPAY_KEY_SECRET': envVars.RAZORPAY_KEY_SECRET,
  'VITE_RAZORPAY_KEY_ID': envVars.VITE_RAZORPAY_KEY_ID,
  'RAZORPAY_WEBHOOK_SECRET': envVars.RAZORPAY_WEBHOOK_SECRET
};

let allPassed = true;

// Verify each environment variable
Object.entries(checks).forEach(([key, value]) => {
  const status = value && value !== 'YOUR_KEY_ID' && value !== 'YOUR_KEY_SECRET' && value !== 'YOUR_WEBHOOK_SECRET';
  const icon = status ? '✅' : '❌';
  
  if (!status) allPassed = false;
  
  if (key.includes('SECRET')) {
    // Don't show full secret, just indicate if it's set
    console.log(`${icon} ${key}: ${status ? '***configured***' : 'NOT SET'}`);
  } else {
    console.log(`${icon} ${key}: ${value || 'NOT SET'}`);
  }
});

console.log('\n');

// Check if keys match
if (checks.RAZORPAY_KEY_ID === checks.VITE_RAZORPAY_KEY_ID) {
  console.log('✅ Client and server key IDs match');
} else {
  console.log('❌ WARNING: Client and server key IDs do not match!');
  allPassed = false;
}

// Check if using live keys
if (checks.RAZORPAY_KEY_ID && checks.RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
  console.log('✅ Using LIVE Razorpay keys');
} else if (checks.RAZORPAY_KEY_ID && checks.RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
  console.log('⚠️  Using TEST Razorpay keys');
} else {
  console.log('❌ Invalid Razorpay key format');
  allPassed = false;
}

// Check webhook secret
if (!checks.RAZORPAY_WEBHOOK_SECRET || checks.RAZORPAY_WEBHOOK_SECRET === 'YOUR_WEBHOOK_SECRET') {
  console.log('⚠️  Webhook secret not configured (webhooks will not work)');
  console.log('   See RAZORPAY-LIVE-SETUP.md for instructions');
}

console.log('\n');

// Final verdict
if (allPassed && checks.RAZORPAY_WEBHOOK_SECRET && checks.RAZORPAY_WEBHOOK_SECRET !== 'YOUR_WEBHOOK_SECRET') {
  console.log('🎉 All checks passed! Your Razorpay setup is complete.\n');
  console.log('Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test a payment with a small amount');
  console.log('3. Check PAYMENT-TEST-CHECKLIST.md for detailed testing steps\n');
} else if (allPassed) {
  console.log('⚠️  Setup is mostly complete, but webhook secret is missing.\n');
  console.log('Next steps:');
  console.log('1. Configure webhook secret (see RAZORPAY-LIVE-SETUP.md)');
  console.log('2. Restart your development server: npm run dev');
  console.log('3. Test a payment with a small amount\n');
} else {
  console.log('❌ Setup incomplete. Please fix the issues above.\n');
  console.log('See RAZORPAY-LIVE-SETUP.md for detailed setup instructions.\n');
  process.exit(1);
}
