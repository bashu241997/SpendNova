# SpendNova — Google Play Store Publishing Kit & Step-by-Step Guide

This guide contains everything required to publish **SpendNova** to the **Google Play Console**, including real app screenshots, feature graphics, app listing metadata, Data Safety questionnaire answers, and release execution steps.

---

## 🖼️ Google Play Store Visual Assets

### 1. Feature Graphic (1024 × 500 px Required by Google)
![Google Play Store Feature Graphic](/Users/bachi/.gemini/antigravity-ide/brain/f4e81555-4861-4d1b-9139-292ea9cd2db6/playstore_feature_graphic_1788622824330.jpg)

---

### 2. Official Phone Screenshots (Real App UI)

````carousel
![1. Dashboard Overview](/Users/bachi/.gemini/antigravity-ide/brain/f4e81555-4861-4d1b-9139-292ea9cd2db6/home_screen_dashboard_1788622507699.png)
<!-- slide -->
![2. Smart Budgets & Category Progress](/Users/bachi/.gemini/antigravity-ide/brain/f4e81555-4861-4d1b-9139-292ea9cd2db6/budgets_screen_1788622533655.png)
<!-- slide -->
![3. Native Bottom Sheet Modal](/Users/bachi/.gemini/antigravity-ide/brain/f4e81555-4861-4d1b-9139-292ea9cd2db6/new_budget_modal_1788622550873.png)
````

---

## 📝 Google Play Console Listing Details

### 1. App Store Details
* **App Name**: `SpendNova: Personal Finance` *(30 char limit)*
* **Short Description**: `Private money manager, expense tracker, local budgets & encrypted ledger.` *(80 char limit)*
* **Category**: Finance
* **Tags**: Personal Finance, Expense Tracker, Budget Manager, Offline Ledger

### 2. Full Description *(4000 char limit)*
```text
SpendNova is the #1 private money manager and expense tracker designed for 100% data privacy. SpendNova stores and encrypts your financial ledger locally on your device with AES-256 encryption. Zero tracking, zero ads, and no central servers.

🌟 KEY FEATURES:

• 100% LOCAL & PRIVATE ENCRYPTION
Your money records never leave your device. All account balances, transactions, and categories are encrypted on local device storage.

• VISUAL SPENDING FLOW & HEATMAPS
Track daily financial activity with heatmaps, spending flow charts, and real-time cashflow breakdowns.

• SMART BUDGETS & CATEGORY LIMITS
Set custom category limits with real-time daily allowances. Stay on budget with progress bars and instant spending alerts.

• MULTI-ACCOUNT & CURRENCY SUPPORT
Manage cash, credit cards, bank accounts, and investments across global currencies (₹ INR, $ USD, € EUR, £ GBP, etc.).

• SUBSCRIPTION & EMI TRACKER
Never miss a payment. Track upcoming bills, recurring subscriptions, and overdue EMIs automatically.

• GOOGLE DRIVE BACKUP
Optionally backup and restore your encrypted database directly to your personal Google Drive account.
```

---

## 🔒 Google Play Data Safety Form Answers
When filling out the **Data Safety** section in Google Play Console, select these exact options:

* **Does your app collect or share user data?** Select **No** *(SpendNova operates 100% offline & locally).*
* **Is data encrypted in transit?** Select **Yes** *(Google Drive OAuth uses HTTPS).*
* **Can users request data deletion?** Select **Yes** *(Users can wipe all data using the in-app "Wipe Data" button).*

---

## 🚀 How to Build & Publish to Google Play Store

### Step 1: Build Release APK or App Bundle (AAB)
Run the local release build command in your terminal:
```bash
export ANDROID_HOME="/Users/bachi/Library/Android/sdk"
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
cd android && ./gradlew assembleRelease
```
*Generated AAB/APK file path:*
[`/Users/bachi/Desktop/Finance Tracker/android/app/build/outputs/apk/release/app-release.apk`](file:///Users/bachi/Desktop/Finance%20Tracker/android/app/build/outputs/apk/release/app-release.apk)

---

### Step 2: Create a App on Google Play Console
1. Log into your [Google Play Console](https://play.google.com/console).
2. Click **Create App**.
3. Fill in:
   - **App Name**: `SpendNova: Personal Finance`
   - **Default Language**: English
   - **App or Game**: App
   - **Free or Paid**: Free
4. Accept Developer Declarations and click **Create App**.

---

### Step 3: Upload Screenshots & Graphics
Under **Main store listing**:
1. Upload **App Icon**: 512 × 512 px PNG (Located at [`public/icon-512.png`](file:///Users/bachi/Desktop/Finance%20Tracker/public/icon-512.png)).
2. Upload **Feature Graphic**: 1024 × 500 px JPG (Located at [`playstore_feature_graphic_1788622824330.jpg`](file:///Users/bachi/.gemini/antigravity-ide/brain/f4e81555-4861-4d1b-9139-292ea9cd2db6/playstore_feature_graphic_1788622824330.jpg)).
3. Upload **Phone Screenshots**: Drag & drop the 3 real app screenshots above.

---

### Step 4: Create a Release Track
1. Navigate to **Production** (or **Testing** → **Internal Testing** for a test release).
2. Click **Create new release**.
3. Drag & drop [`app-release.apk`](file:///Users/bachi/Desktop/Finance%20Tracker/android/app/build/outputs/apk/release/app-release.apk) (or AAB).
4. Enter Release Notes:
   ```text
   Initial Release of SpendNova: 100% Local Encrypted Personal Finance Tracker.
   ```
5. Click **Save** → **Review Release** → **Start Rollout to Production**.

🎉 **Your app is submitted! Google typically approves production releases within 24 to 48 hours.**
