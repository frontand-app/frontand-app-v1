# 🚀 Front& Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

✅ **React/Vite app** configured and building successfully  
✅ **Front& branding** updated throughout the application  
✅ **TableOutput component** ready for data workflows  
✅ **Authentication system** integrated with Supabase  
✅ **Real credits system** implemented  

## 🔧 Deployment Steps

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy from Project Root**
```bash
cd form-ai-runner
vercel --prod
```

## ⚙️ Environment Variables Setup

Configure these in **Vercel Dashboard → Project → Settings → Environment Variables**:

### **Required Variables:**
```bash
# Application
VITE_APP_NAME=Front&
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Supabase (Your actual production values)
VITE_SUPABASE_URL=https://klethzffhbnkpflbfufs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZXRoemZmaGJua3BmbGJmdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzA5NTIsImV4cCI6MjA2NzkwNjk1Mn0.ojgULbT0x-x-3iTOwYRhs4ERkOxp8Lh225ENpuufSqM

# API Configuration  
VITE_API_URL=https://your-backend-api.vercel.app
VITE_MODAL_ENDPOINT_URL=https://your-modal-app.modal.run

# Feature Flags
VITE_DEMO_MODE=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
VITE_ENABLE_DEV_TOOLS=false
VITE_LOG_LEVEL=error

# Contact & Legal
VITE_SUPPORT_EMAIL=support@frontand.dev
VITE_PRIVACY_URL=https://frontand.dev/privacy
VITE_TERMS_URL=https://frontand.dev/terms
```

### **Optional Variables (for future features):**
```bash
# OAuth (when ready)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_SLACK_CLIENT_ID=your_slack_client_id

# Analytics (when enabled)
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## 🔒 Password Protection Setup

### **Method 1: Vercel Password Protection (Recommended)**

1. **Go to Vercel Dashboard** → Your Project → Settings
2. **Navigate to "Deployment Protection"**
3. **Enable "Password Protection"**
4. **Set Password**: Use a secure password for testing
5. **Apply to all deployments**

### **Method 2: Custom Password Page (Alternative)**

If you want more control, we can create a custom password page:

```typescript
// src/components/PasswordProtection.tsx
export const PasswordProtection = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_SITE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('site_auth', 'true');
    }
  };
  
  if (isAuthenticated || localStorage.getItem('site_auth')) {
    return <App />; // Your main app
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Front& Preview Access</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
        />
        <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-md">
          Access Front&
        </button>
      </form>
    </div>
  );
};
```

## 🏗️ Build Configuration

### **Vercel Settings:**
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### **Build Optimization:**
```json
// vercel.json (already created)
{
  "version": 2,
  "name": "frontand-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## 🚀 Deployment Commands

### **Initial Deployment:**
```bash
cd form-ai-runner
vercel --prod
```

### **Subsequent Deployments:**
```bash
# Push to git (if connected to GitHub)
git add .
git commit -m "Deploy to production"
git push origin main

# Or manual deployment
vercel --prod
```

### **Preview Deployments:**
```bash
vercel
# Creates a preview URL for testing
```

## 🧪 Testing Checklist

After deployment, test these features:

### **Basic Functionality:**
- ✅ **Homepage loads** with Front& branding
- ✅ **Navigation works** between pages
- ✅ **Responsive design** on mobile/desktop
- ✅ **Password protection** (if enabled)

### **Authentication Flow:**
- ✅ **Sign up form** works and sends emails
- ✅ **Email confirmation** links work correctly
- ✅ **Sign in form** with proper error handling
- ✅ **Password reset** functionality

### **Workflow Features:**
- ✅ **Keyword clustering** demo works
- ✅ **Sentiment analysis** demo works
- ✅ **Google Sheets workflow** shows table output
- ✅ **Credits display** shows correctly
- ✅ **Table sorting/filtering** works

### **Performance:**
- ✅ **Fast loading times** (< 3 seconds)
- ✅ **No console errors** in browser
- ✅ **Lighthouse score** > 90

## 🔗 Custom Domain Setup (Optional)

### **Add Custom Domain:**
1. **Go to Vercel Dashboard** → Project → Settings → Domains
2. **Add Domain**: `frontand.dev` or your domain
3. **Configure DNS**: Add A/CNAME records as shown
4. **SSL Certificate**: Auto-generated by Vercel

### **DNS Configuration:**
```bash
# For root domain (frontand.dev)
A Record: @ → 76.76.19.61

# For subdomain (app.frontand.dev)  
CNAME: app → cname.vercel-dns.com
```

## 📊 Monitoring & Analytics

### **Vercel Analytics:**
- **Enable in Dashboard** → Project → Analytics
- **View performance metrics** and user insights
- **Monitor Core Web Vitals**

### **Error Monitoring:**
```bash
# Add to environment variables when ready
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ENABLE_SENTRY=true
```

## 🚨 Troubleshooting

### **Common Issues:**

**Build Fails:**
```bash
# Check build locally first
npm run build
npm run preview
```

**Environment Variables Not Working:**
- Ensure they start with `VITE_`
- Check they're set in Vercel dashboard
- Redeploy after adding new variables

**Password Protection Not Working:**
- Check Vercel dashboard settings
- Ensure "Deployment Protection" is enabled
- Try incognito mode to test

**Routing Issues:**
- Verify `vercel.json` configuration
- Check that all routes redirect to `index.html`

### **Support Commands:**
```bash
# Check deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]
```

## 🎯 Post-Deployment Steps

1. **Test all functionality** thoroughly
2. **Share preview URL** with stakeholders
3. **Set up monitoring** and alerts
4. **Configure custom domain** (if needed)
5. **Enable analytics** for insights
6. **Set up CI/CD** with GitHub integration

## 📱 Preview URLs

After deployment, you'll get URLs like:
- **Production**: `https://frontand-app.vercel.app`
- **Custom Domain**: `https://frontand.dev` (if configured)
- **Preview**: `https://frontand-app-git-main.vercel.app`

## 🔐 Sharing Access

For password-protected testing:
1. **Share the URL**: `https://your-app.vercel.app`
2. **Provide password**: The one you set in Vercel dashboard
3. **Instructions**: "Enter password to access Front& preview"

Your Front& app will be live and ready for professional testing! 🎉 

## 📋 Pre-Deployment Checklist

✅ **React/Vite app** configured and building successfully  
✅ **Front& branding** updated throughout the application  
✅ **TableOutput component** ready for data workflows  
✅ **Authentication system** integrated with Supabase  
✅ **Real credits system** implemented  

## 🔧 Deployment Steps

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy from Project Root**
```bash
cd form-ai-runner
vercel --prod
```

## ⚙️ Environment Variables Setup

Configure these in **Vercel Dashboard → Project → Settings → Environment Variables**:

### **Required Variables:**
```bash
# Application
VITE_APP_NAME=Front&
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Supabase (Your actual production values)
VITE_SUPABASE_URL=https://klethzffhbnkpflbfufs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZXRoemZmaGJua3BmbGJmdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzA5NTIsImV4cCI6MjA2NzkwNjk1Mn0.ojgULbT0x-x-3iTOwYRhs4ERkOxp8Lh225ENpuufSqM

# API Configuration  
VITE_API_URL=https://your-backend-api.vercel.app
VITE_MODAL_ENDPOINT_URL=https://your-modal-app.modal.run

# Feature Flags
VITE_DEMO_MODE=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
VITE_ENABLE_DEV_TOOLS=false
VITE_LOG_LEVEL=error

# Contact & Legal
VITE_SUPPORT_EMAIL=support@frontand.dev
VITE_PRIVACY_URL=https://frontand.dev/privacy
VITE_TERMS_URL=https://frontand.dev/terms
```

### **Optional Variables (for future features):**
```bash
# OAuth (when ready)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_SLACK_CLIENT_ID=your_slack_client_id

# Analytics (when enabled)
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## 🔒 Password Protection Setup

### **Method 1: Vercel Password Protection (Recommended)**

1. **Go to Vercel Dashboard** → Your Project → Settings
2. **Navigate to "Deployment Protection"**
3. **Enable "Password Protection"**
4. **Set Password**: Use a secure password for testing
5. **Apply to all deployments**

### **Method 2: Custom Password Page (Alternative)**

If you want more control, we can create a custom password page:

```typescript
// src/components/PasswordProtection.tsx
export const PasswordProtection = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_SITE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('site_auth', 'true');
    }
  };
  
  if (isAuthenticated || localStorage.getItem('site_auth')) {
    return <App />; // Your main app
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Front& Preview Access</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
        />
        <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-md">
          Access Front&
        </button>
      </form>
    </div>
  );
};
```

## 🏗️ Build Configuration

### **Vercel Settings:**
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### **Build Optimization:**
```json
// vercel.json (already created)
{
  "version": 2,
  "name": "frontand-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## 🚀 Deployment Commands

### **Initial Deployment:**
```bash
cd form-ai-runner
vercel --prod
```

### **Subsequent Deployments:**
```bash
# Push to git (if connected to GitHub)
git add .
git commit -m "Deploy to production"
git push origin main

# Or manual deployment
vercel --prod
```

### **Preview Deployments:**
```bash
vercel
# Creates a preview URL for testing
```

## 🧪 Testing Checklist

After deployment, test these features:

### **Basic Functionality:**
- ✅ **Homepage loads** with Front& branding
- ✅ **Navigation works** between pages
- ✅ **Responsive design** on mobile/desktop
- ✅ **Password protection** (if enabled)

### **Authentication Flow:**
- ✅ **Sign up form** works and sends emails
- ✅ **Email confirmation** links work correctly
- ✅ **Sign in form** with proper error handling
- ✅ **Password reset** functionality

### **Workflow Features:**
- ✅ **Keyword clustering** demo works
- ✅ **Sentiment analysis** demo works
- ✅ **Google Sheets workflow** shows table output
- ✅ **Credits display** shows correctly
- ✅ **Table sorting/filtering** works

### **Performance:**
- ✅ **Fast loading times** (< 3 seconds)
- ✅ **No console errors** in browser
- ✅ **Lighthouse score** > 90

## 🔗 Custom Domain Setup (Optional)

### **Add Custom Domain:**
1. **Go to Vercel Dashboard** → Project → Settings → Domains
2. **Add Domain**: `frontand.dev` or your domain
3. **Configure DNS**: Add A/CNAME records as shown
4. **SSL Certificate**: Auto-generated by Vercel

### **DNS Configuration:**
```bash
# For root domain (frontand.dev)
A Record: @ → 76.76.19.61

# For subdomain (app.frontand.dev)  
CNAME: app → cname.vercel-dns.com
```

## 📊 Monitoring & Analytics

### **Vercel Analytics:**
- **Enable in Dashboard** → Project → Analytics
- **View performance metrics** and user insights
- **Monitor Core Web Vitals**

### **Error Monitoring:**
```bash
# Add to environment variables when ready
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ENABLE_SENTRY=true
```

## 🚨 Troubleshooting

### **Common Issues:**

**Build Fails:**
```bash
# Check build locally first
npm run build
npm run preview
```

**Environment Variables Not Working:**
- Ensure they start with `VITE_`
- Check they're set in Vercel dashboard
- Redeploy after adding new variables

**Password Protection Not Working:**
- Check Vercel dashboard settings
- Ensure "Deployment Protection" is enabled
- Try incognito mode to test

**Routing Issues:**
- Verify `vercel.json` configuration
- Check that all routes redirect to `index.html`

### **Support Commands:**
```bash
# Check deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]
```

## 🎯 Post-Deployment Steps

1. **Test all functionality** thoroughly
2. **Share preview URL** with stakeholders
3. **Set up monitoring** and alerts
4. **Configure custom domain** (if needed)
5. **Enable analytics** for insights
6. **Set up CI/CD** with GitHub integration

## 📱 Preview URLs

After deployment, you'll get URLs like:
- **Production**: `https://frontand-app.vercel.app`
- **Custom Domain**: `https://frontand.dev` (if configured)
- **Preview**: `https://frontand-app-git-main.vercel.app`

## 🔐 Sharing Access

For password-protected testing:
1. **Share the URL**: `https://your-app.vercel.app`
2. **Provide password**: The one you set in Vercel dashboard
3. **Instructions**: "Enter password to access Front& preview"

Your Front& app will be live and ready for professional testing! 🎉 
 
 