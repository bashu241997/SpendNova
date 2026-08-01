# SpendNova: Personal Expense Tracker

> **SpendNova** is a high-performance, local-first personal finance management application designed for total data sovereignty, seamless budgeting, subscription tracking, and target savings management across Mobile and Desktop Web.

---

## 🌟 Executive Overview

**SpendNova** delivers a rich, desktop-grade financial management experience with zero telemetry and absolute data privacy. Unlike traditional finance apps that transmit personal metrics to remote cloud servers, SpendNova stores 100% of your ledger, accounts, budgets, and transaction history directly on your local device database.

Designed with modern glassmorphism aesthetics, dynamic dark/light theme engines, and custom accent color palettes, SpendNova empowers users to take full control of their net worth, monthly commitments, and long-term financial goals.

---

## 🚀 Key Features

### 1. 📊 Executive Dashboard (Dual-Column Desktop & Responsive Mobile)
- **Split Dashboard Layout**: On Desktop Web, the screen is intelligently split into an executive left control panel and an independent right transaction feed.
- **Fixed Control Cards**: Keep your Accounts, Active Budgets, Savings Goals, and Upcoming Bills fixed in view while scrolling through transaction history.
- **Responsive Mobile Layout**: Compact horizontal carousels and adaptive vertical layouts tailored for phone screens.

### 2. 🔁 Subscriptions & Monthly EMIs
- **Recurring Commitment Tracking**: Manage monthly bills, subscriptions (e.g. Netflix, Spotify, House Rent), and loan EMIs (Car Loan, Home Loan, SIP investments).
- **Monthly Commitment Summary**: Calculates your exact total fixed monthly commitments.
- **Status Alerts**: Automatic categorization of bills as **Upcoming** (due within 7 days), **Due Soon**, or **Overdue**.

### 3. 🎯 Target Savings Goals
- **Goal Progress Tracking**: Set target savings goals (e.g. *Emergency Fund*, *New Vehicle*, *Goa Vacation*).
- **Visual Progress Metrics**: Real-time progress bars, percentage completed, remaining balance needed, and target completion dates.
- **Quick Deposit Modal**: Add savings deposits directly to any goal with instant visual feedback.

### 4. 💼 Multi-Account & Category Management
- **Diverse Account Types**: Manage Savings Accounts, Credit Cards, Cash, and Custom financial buckets.
- **Transfer Tracking**: Track seamless money transfers between accounts with dedicated transfer directional pills.
- **Subcategories & Icons**: Classify spending across customizable expense/income categories and subcategories.

### 5. 🧮 Custom Expression Calculator Numpad
- **Built-in Math Engine**: Calculate complex bill splits directly inside the expense entry modal (+, -, ×, ÷).
- **Instant Category/Account Binding**: Seamlessly select accounts, categories, labels, and transaction notes in a single unified flow.

### 6. 🔒 Data Sovereignty & Backup
- **100% Local Storage**: All transaction history, budget rules, and account balances remain exclusively on your device.
- **Full JSON Import / Export**: Portable backups preserve transactions, accounts, categories, budgets, recurring payments, and goals. Legacy transaction CSV files can still be imported.
- **Optional Google Drive Backup**: Once the app is configured with your Google OAuth client IDs, backups upload directly to the connected Drive account without a developer-operated backup server.

### 7. ⚖️ Legal Disclosures (India)
- **In-app terms and privacy notice**: The app includes India-focused draft disclosures and a first-run acceptance screen.
- **Professional review required**: These drafts are not a substitute for legal advice or a claim of statutory compliance.

---

## 🎨 Theme Engine & Design System

- **Vibrant Dark Mode**: Deep midnight slate background (`#0B0F19`) paired with elevated surface cards (`#151C2C`), rich status indicators, and glowing border highlights.
- **Light Mode Elegance**: Soft slate backgrounds (`#F8FAFC`) with crisp typography and high-contrast Material icons.
- **7 Curated Accent Palettes**:
  - **Slate Gray** (`#94A3B8`) *(Default)*
  - **Electric Indigo** (`#6366F1`)
  - **Mint Emerald** (`#10B981`)
  - **Cyber Violet** (`#8B5CF6`)
  - **Ocean Cyan** (`#06B6D4`)
  - **Gold Sunburst** (`#F59E0B`)
  - **Crimson Rose** (`#F43F5E`)
- **Custom Web Scrollbars**: Dynamically injected 7px thin rounded pill scrollbars matching active dark/light theme contrast.

---

## 📱 Platform Support

- **iOS & Android**: Native mobile experience built with Expo & React Native.
- **Desktop Web**: Full desktop experience with keyboard shortcuts, custom scrollbars, and split-screen web views.

## Google Drive setup

Google Drive backup is intentionally disabled until OAuth is configured. Copy `.env.example` to `.env`, add the client IDs created for your Expo web, iOS, and Android applications, and configure the matching redirect URIs in Google Cloud. Never commit `.env` or an OAuth client secret.

---

## 🛡️ Privacy & Security Architecture

1. **Zero Tracking**: No Google Analytics, Mixpanel, Segment, or telemetry SDKs embedded.
2. **Offline Resilience**: Fully operational without an internet connection.
3. **Data Erasure**: The Settings “WIPE DATA” action clears all local financial records. Export a backup first if you may need the data later.

---

*SpendNova : Personal Expense Tracker — Built for Data Privacy & Financial Clarity.*
