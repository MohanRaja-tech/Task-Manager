# 🔐 Google OAuth Setup Guide - Complete Fresh Start

## 📋 **Prerequisites**
- Google account
- Google Cloud Console access
- Firebase account

---

## 🚀 **Step 1: Create/Configure Google Cloud Project**

### 1.1 Go to Google Cloud Console
- Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Sign in with your Google account

### 1.2 Create or Select Project
- **Option A**: Create new project → Click "New Project" → Enter project name
- **Option B**: Use existing project → Select from dropdown

### 1.3 Enable Google+ API (Required for OAuth)
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" 
3. Click on it and press **ENABLE**
4. Also enable "Google Identity" if available

---

## 🔧 **Step 2: Create OAuth 2.0 Credentials**

### 2.1 Go to Credentials
- Navigate to **APIs & Services** → **Credentials**

### 2.2 Create OAuth 2.0 Client ID
1. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
2. If prompted, configure OAuth consent screen first (see Step 3)
3. **Application Type**: `Web application`
4. **Name**: `Task Manager App` (or your preferred name)

### 2.3 Configure Authorized Origins & Redirect URIs

**Authorized JavaScript origins** (Add all these):
```
http://localhost:3000
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:8080
```

**Authorized redirect URIs** (Add these):
```
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
http://localhost:5175/auth/callback
```

### 2.4 Save and Download
1. Click **CREATE**
2. **IMPORTANT**: Download the JSON file when prompted
3. Note down the **Client ID** and **Client Secret**

---

## 🎯 **Step 3: Configure OAuth Consent Screen**

### 3.1 Basic Information
- **App name**: `Task Manager`
- **User support email**: Your email
- **Developer contact**: Your email

### 3.2 Scopes (Add these)
- `../auth/userinfo.email`
- `../auth/userinfo.profile`
- `openid`

### 3.3 Test Users (For Development)
- Add your email address as a test user
- Add any other emails you want to test with

---

## 🔥 **Step 4: Setup Firebase Project**

### 4.1 Create Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add project**
3. **IMPORTANT**: Use the SAME project name as your Google Cloud project
4. Enable Google Analytics (optional)

### 4.2 Enable Authentication
1. Go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Google** provider
4. **Web SDK configuration**: Select your OAuth 2.0 client from dropdown
5. **Save**

### 4.3 Add Web App
1. Go to **Project Settings** (gear icon)
2. Click **Add app** → **Web** (</> icon)
3. **App nickname**: `Task Manager Web`
4. **Also set up Firebase Hosting**: No (unless you want it)
5. Click **Register app**
6. **COPY the Firebase config object** - you'll need this!

---

## 💻 **Step 5: Update Your Code**

### 5.1 Update Firebase Configuration
Open `/react-app/src/config/firebase.js` and replace the firebaseConfig object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_FIREBASE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // optional
};
```

### 5.2 Update Backend Environment
Open `/backend/.env` and update:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

---

## ✅ **Step 6: Verification Checklist**

### 6.1 Google Cloud Console
- [ ] OAuth 2.0 Client created
- [ ] Authorized origins include localhost ports
- [ ] Google+ API enabled
- [ ] Client ID and Secret noted down

### 6.2 Firebase Console
- [ ] Project created (same as Google Cloud)
- [ ] Authentication enabled
- [ ] Google sign-in method enabled
- [ ] Web app added and config copied

### 6.3 Code Configuration
- [ ] Firebase config updated in firebase.js
- [ ] Backend .env updated with Client ID and Secret
- [ ] No placeholder values remain

---

## 🧪 **Step 7: Testing**

### 7.1 Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd react-app
npm run dev
```

### 7.2 Test Authentication
1. Open `http://localhost:XXXX` (check your frontend port)
2. Go to Login/SignUp page
3. Click "Continue with Google"
4. Should see Google sign-in popup
5. Select your account
6. Should redirect back and authenticate successfully

---

## 🚨 **Common Issues & Solutions**

### Issue 1: "Unauthorized" Error
- **Check**: Authorized JavaScript origins include your current localhost port
- **Fix**: Add the exact URL (with port) to Google Cloud Console

### Issue 2: "Invalid Client ID"
- **Check**: Client ID in .env matches the one from Google Cloud Console
- **Fix**: Double-check copy/paste, no extra spaces

### Issue 3: "PEM Error"
- **Check**: Using the same Google Cloud project for both Firebase and OAuth client
- **Fix**: Ensure Firebase and backend use same project credentials

### Issue 4: Popup Blocked
- **Check**: Browser popup settings
- **Fix**: Allow popups for localhost in browser settings

---

## 📞 **Need Help?**

After following these steps:
1. Share any specific error messages you see
2. Confirm which step you completed
3. Share the first few characters of your Client ID (for verification)

**Ready to start? Begin with Step 1! 🚀**
