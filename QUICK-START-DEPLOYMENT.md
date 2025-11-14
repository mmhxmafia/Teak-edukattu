# 🚀 Quick Start - Deploy to Cloudflare Pages

## ✅ Prerequisites Checklist
- [x] Razorpay live keys configured
- [x] All features tested locally
- [x] Indian defaults set
- [x] Error handling implemented
- [ ] Git installed
- [ ] GitHub account ready
- [ ] Cloudflare account ready

---

## 📦 Step 1: Install Git (If Not Installed)

### For Windows:
1. Download Git from: https://git-scm.com/download/win
2. Run the installer
3. Use default settings
4. Restart your terminal/IDE

### For Mac:
```bash
brew install git
```

### For Linux:
```bash
sudo apt-get install git
```

---

## 🔐 Step 2: Initialize Git Repository

Open terminal in your project folder and run these commands one by one:

```bash
# Initialize git repository
git init

# Check what files will be committed
git status

# Add all files (except .env - it's in .gitignore)
git add .

# Commit the files
git commit -m "Initial commit - Production ready with Razorpay live"

# Set main branch
git branch -M main
```

---

## 🌐 Step 3: Create GitHub Repository

### Option A: Using GitHub Website (Easier)

1. **Go to GitHub**
   - Visit: https://github.com/
   - Login to your account

2. **Create New Repository**
   - Click the **+** icon (top right)
   - Select **New repository**

3. **Repository Settings**
   - **Repository name**: `teakacacia-website` (or your choice)
   - **Description**: "Teakacacia Furniture E-commerce Website"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
   - Click **Create repository**

4. **Copy the Repository URL**
   - You'll see a URL like: `https://github.com/YOUR_USERNAME/teakacacia-website.git`
   - Copy this URL

5. **Connect Your Local Code to GitHub**
   In your terminal, run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/teakacacia-website.git
   git push -u origin main
   ```

6. **Enter Credentials**
   - Username: Your GitHub username
   - Password: Use a Personal Access Token (not your password)
   
   **To create a token:**
   - Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name: "Teakacacia Deployment"
   - Select scope: **repo** (check the box)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)
   - Use this token as your password when pushing

---

## ☁️ Step 4: Deploy to Cloudflare Pages

### 4.1 Login to Cloudflare
1. Go to: https://dash.cloudflare.com/
2. Login with your account
3. If you don't have an account, sign up (it's free!)

### 4.2 Create Pages Project
1. Click **Workers & Pages** in left sidebar
2. Click **Create Application**
3. Click **Pages** tab
4. Click **Connect to Git**

### 4.3 Connect GitHub
1. Click **Connect GitHub**
2. Authorize Cloudflare
3. Select your repository: `teakacacia-website`
4. Click **Begin Setup**

### 4.4 Configure Build Settings

Fill in these EXACT values:

**Project name**: `teakacacia`

**Production branch**: `main`

**Framework preset**: Select **Vite** from dropdown

**Build command**:
```
npm run build
```

**Build output directory**:
```
dist
```

**Root directory**: (leave empty)

### 4.5 Add Environment Variables

Click **Add variable** button and add these ONE BY ONE:

**Variable 1:**
- Name: `VITE_GRAPHQL_ENDPOINT`
- Value: `https://admin.teakacacia.com/graphql`

**Variable 2:**
- Name: `VITE_APP_NAME`
- Value: `Teakacacia`

**Variable 3:**
- Name: `VITE_APP_URL`
- Value: `https://teakacacia.com`

**Variable 4:**
- Name: `VITE_RAZORPAY_KEY_ID`
- Value: `rzp_live_RfbZgy9li7xr5C`

### 4.6 Deploy!
1. Click **Save and Deploy**
2. Wait 2-5 minutes
3. You'll see build logs
4. When complete, you'll get a URL like: `https://teakacacia.pages.dev`
5. Click the URL to view your site!

---

## 🌍 Step 5: Connect Your Domain

### 5.1 Add Custom Domain
1. In your Cloudflare Pages project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `teakacacia.com`
5. Click **Continue**

### 5.2 Activate Domain
- If domain is on Cloudflare: Click **Activate domain** (automatic)
- If domain is elsewhere: Follow DNS instructions shown

### 5.3 Wait for SSL
- SSL certificate provisions automatically
- Takes 5-15 minutes
- Your site will be live at `https://teakacacia.com`

---

## 🔧 Step 6: Deploy Backend (IMPORTANT!)

⚠️ **Your frontend is live, but you need a backend for payments!**

### Quick Backend Deployment to Render.com:

1. **Go to Render**
   - Visit: https://render.com/
   - Sign up with GitHub

2. **New Web Service**
   - Click **New** → **Web Service**
   - Connect same GitHub repository
   - Click **Connect**

3. **Configure**
   - Name: `teakacacia-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server/index.js`

4. **Add Environment Variables**
   Click **Advanced** → Add these:
   ```
   RAZORPAY_KEY_ID=rzp_live_RfbZgy9li7xr5C
   RAZORPAY_KEY_SECRET=BRVIoPQ5iqQwdjBiMVAFAi5S
   RAZORPAY_WEBHOOK_SECRET=whsec_TkAcAcIa2024SecureWebhookKey9X7mP3nQ5rL8wZ
   ```

5. **Deploy**
   - Click **Create Web Service**
   - Wait 3-5 minutes
   - Copy your backend URL (e.g., `https://teakacacia-backend.onrender.com`)

6. **Update Razorpay Webhook**
   - Go to: https://dashboard.razorpay.com/
   - Settings → Webhooks
   - Edit your webhook
   - Update URL to: `https://teakacacia-backend.onrender.com/api/razorpay/webhook`
   - Save

---

## ✅ Step 7: Test Your Live Site!

1. **Visit your site**: https://teakacacia.com
2. **Test checkout**:
   - Add product to cart
   - Go to checkout
   - Fill form
   - Make small test payment (₹10)
3. **Verify**:
   - Order confirmation shows
   - Email received
   - Payment in Razorpay dashboard
   - Order in WordPress admin

---

## 🎉 You're Live!

Your website is now live at:
- ✅ https://teakacacia.com
- ✅ https://edakkattufurniture.com (redirects)
- ✅ Backend API running
- ✅ Payments working
- ✅ All features active

---

## 🔄 How to Update Your Site

When you make changes:

```bash
# 1. Make your code changes
# 2. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 3. Cloudflare automatically rebuilds and deploys!
# Wait 2-3 minutes and your changes are live
```

---

## 📞 Need Help?

Common issues:

**Build fails**: Check environment variables are set correctly

**Payment not working**: Verify backend is running and webhook URL is updated

**Domain not working**: Wait 15 minutes for DNS propagation

---

**Ready to deploy?** Start with Step 1! 🚀
