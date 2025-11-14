# 🚀 Complete Deployment Guide - Git + Cloudflare Pages

## Step 1: Push Code to Git (GitHub)

### 1.1 Check Git Status
Open your terminal in the project folder and run:

```bash
git status
```

This shows which files have changed.

### 1.2 Add All Files to Git
```bash
git add .
```

**Important**: The `.env` file will NOT be added (it's in .gitignore for security)

### 1.3 Commit Your Changes
```bash
git commit -m "Production ready - Razorpay live, Indian defaults, all features complete"
```

### 1.4 Push to GitHub

**If this is your first push:**
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**If you already have a remote:**
```bash
git push origin main
```

**If you get authentication error:**
- You may need to use a Personal Access Token instead of password
- Go to GitHub → Settings → Developer Settings → Personal Access Tokens
- Generate a new token with "repo" permissions
- Use the token as your password when pushing

---

## Step 2: Deploy to Cloudflare Pages

### 2.1 Go to Cloudflare Dashboard
1. Visit: https://dash.cloudflare.com/
2. Login with your Cloudflare account
3. Click **Workers & Pages** in the left sidebar
4. Click **Create Application**
5. Select **Pages** tab
6. Click **Connect to Git**

### 2.2 Connect Your GitHub Repository
1. Click **Connect GitHub**
2. Authorize Cloudflare to access your GitHub
3. Select your repository: `YOUR_REPO_NAME`
4. Click **Begin Setup**

### 2.3 Configure Build Settings

**Project Name**: `teakacacia` (or your preferred name)

**Production Branch**: `main`

**Framework Preset**: Select **Vite** from dropdown

**Build Command**:
```bash
npm run build
```

**Build Output Directory**:
```
dist
```

**Root Directory**: Leave empty (or `/`)

### 2.4 Add Environment Variables (CRITICAL!)

Click **Add variable** and add these one by one:

| Variable Name | Value |
|--------------|-------|
| `VITE_GRAPHQL_ENDPOINT` | `https://admin.teakacacia.com/graphql` |
| `VITE_APP_NAME` | `Teakacacia` |
| `VITE_APP_URL` | `https://teakacacia.com` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_RfbZgy9li7xr5C` |

**⚠️ IMPORTANT**: 
- Only add variables starting with `VITE_`
- Do NOT add `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` here
- These are for backend only (we'll deploy backend separately)

### 2.5 Deploy!
1. Click **Save and Deploy**
2. Wait 2-5 minutes for build to complete
3. You'll get a URL like: `https://teakacacia.pages.dev`

---

## Step 3: Connect Your Custom Domain

### 3.1 Add Custom Domain to Cloudflare Pages
1. In your Cloudflare Pages project, go to **Custom Domains** tab
2. Click **Set up a custom domain**
3. Enter: `teakacacia.com`
4. Click **Continue**

### 3.2 Configure DNS
Cloudflare will show you DNS records to add. Usually it's automatic if your domain is already on Cloudflare.

If your domain is on Cloudflare:
- It will automatically add the CNAME record
- Just click **Activate Domain**

If your domain is elsewhere:
- Add the CNAME record shown to your domain registrar
- Point `teakacacia.com` to your Cloudflare Pages URL

### 3.3 Wait for SSL Certificate
- Cloudflare will automatically provision an SSL certificate
- This takes 5-15 minutes
- Your site will be available at `https://teakacacia.com`

---

## Step 4: Deploy Backend Server (For Razorpay)

⚠️ **IMPORTANT**: Cloudflare Pages only hosts the frontend. You need a backend server for:
- Razorpay payment processing
- Webhook handling
- API endpoints

### Option A: Deploy to Render.com (Recommended - Free)

1. **Go to Render.com**
   - Visit: https://render.com/
   - Sign up / Login with GitHub

2. **Create New Web Service**
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   - Select the same repository

3. **Configure Service**
   - **Name**: `teakacacia-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to India (Singapore recommended)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`

4. **Add Environment Variables**
   Click **Advanced** → **Add Environment Variable**:
   
   ```
   RAZORPAY_KEY_ID=rzp_live_RfbZgy9li7xr5C
   RAZORPAY_KEY_SECRET=BRVIoPQ5iqQwdjBiMVAFAi5S
   RAZORPAY_WEBHOOK_SECRET=whsec_TkAcAcIa2024SecureWebhookKey9X7mP3nQ5rL8wZ
   ```

5. **Deploy**
   - Click **Create Web Service**
   - Wait 3-5 minutes for deployment
   - You'll get a URL like: `https://teakacacia-backend.onrender.com`

### Option B: Deploy to Railway.app

1. Go to https://railway.app/
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Add environment variables (same as above)
5. Deploy!

---

## Step 5: Update Razorpay Webhook URL

After backend is deployed:

1. **Go to Razorpay Dashboard**
   - Visit: https://dashboard.razorpay.com/
   - Go to **Settings** → **Webhooks**

2. **Edit Your Webhook**
   - Click on your existing webhook
   - Update the URL to: `https://your-backend-url.onrender.com/api/razorpay/webhook`
   - Replace `your-backend-url` with your actual Render URL
   - Save changes

---

## Step 6: Update Frontend to Use Backend URL

After deploying backend, you need to update your frontend to point to the backend API.

### 6.1 Create API Configuration File

Create a new file: `src/config/api.ts`

```typescript
export const API_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  RAZORPAY_ENDPOINT: '/api/razorpay'
};
```

### 6.2 Add Backend URL to Cloudflare Environment Variables

Go back to Cloudflare Pages:
1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://teakacacia-backend.onrender.com` (your actual backend URL)
3. Click **Save**
4. Redeploy your site

---

## Step 7: Test Everything!

### 7.1 Test Frontend
1. Visit `https://teakacacia.com`
2. Browse products
3. Add to cart
4. Check all pages work

### 7.2 Test Payment Flow
1. Add product to cart
2. Go to checkout
3. Fill in form (use test data)
4. Complete payment with small amount (₹10)
5. Verify order confirmation
6. Check email received
7. Check order in WordPress admin
8. Check payment in Razorpay dashboard

### 7.3 Test Webhook
1. Make a payment
2. Check Razorpay Dashboard → Webhooks → Logs
3. Verify webhook was delivered successfully
4. Check order status updated in WordPress

---

## 🎉 Deployment Complete!

Your site is now live at:
- **Main URL**: https://teakacacia.com
- **Alternate URL**: https://edakkattufurniture.com (redirects to main)
- **Backend API**: https://teakacacia-backend.onrender.com

---

## 📝 Quick Command Reference

### Git Commands
```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### Update Deployment
```bash
# Make changes to your code
# Then:
git add .
git commit -m "Update: description of changes"
git push origin main

# Cloudflare Pages will automatically rebuild and deploy!
```

---

## 🚨 Troubleshooting

### Build Failed on Cloudflare
- Check build logs in Cloudflare dashboard
- Verify all environment variables are set
- Make sure `package.json` has correct build script

### Payment Not Working
- Check backend server is running (visit backend URL)
- Verify environment variables on backend
- Check Razorpay webhook logs
- Verify API keys are correct

### Domain Not Working
- Wait 5-15 minutes for DNS propagation
- Check DNS settings in Cloudflare
- Verify SSL certificate is active

---

## 📞 Need Help?

If you encounter issues:
1. Check Cloudflare Pages build logs
2. Check Render/Railway deployment logs
3. Check browser console for errors
4. Check Razorpay dashboard for payment errors

---

**Last Updated**: November 14, 2025  
**Status**: Ready for Deployment ✅
