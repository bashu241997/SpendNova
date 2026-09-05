#!/bin/bash
# post-export.sh — Patches dist/index.html with our custom head tags after Expo export

DIST_HTML="dist/index.html"

if [ ! -f "$DIST_HTML" ]; then
  echo "❌ dist/index.html not found. Run 'npx expo export --platform web' first."
  exit 1
fi

# Read our custom web/index.html head content and inject it into the Expo-generated dist/index.html
# We replace the <head> section's closing with our injected tags + </head>

INJECT_TAGS='
    <!-- PWA & iOS Installability -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="SpendNova" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <meta name="theme-color" content="#0F172A" />

    <!-- SEO -->
    <title>Money Management \&amp; Financial Management App - SpendNova | #1 Free Money Tracker</title>
    <meta name="description" content="SpendNova is the #1 free money management &amp; financial management app. Easily manage money, track daily expenses, control cash flow, set category budgets, and monitor savings goals with 100% private AES-256 local encryption." />
    <meta name="keywords" content="money management, financial management, money management app, expense tracker, budget planner, savings goals, money tracker, personal finance" />
    <meta name="author" content="SpendNova" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="https://spendnova-ledger.web.app/" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SpendNova Money Management" />
    <meta property="og:url" content="https://spendnova-ledger.web.app/" />
    <meta property="og:title" content="Money Management &amp; Financial Management App - SpendNova" />
    <meta property="og:description" content="The #1 free money management software for tracking expenses, cash flow, and savings goals with local AES-256 encryption." />
    <meta property="og:image" content="https://spendnova-ledger.web.app/icon-512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Money Management &amp; Financial Management App - SpendNova" />
    <meta name="twitter:description" content="Free money manager &amp; financial management app. Manage money, expenses, and cash flow with zero cloud tracking." />
    <meta name="twitter:image" content="https://spendnova-ledger.web.app/icon-512.png" />

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "SpendNova Money Management",
      "url": "https://spendnova-ledger.web.app/",
      "description": "SpendNova is the #1 free money management and financial management app.",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web, Android, iOS",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
    </script>
'

# Use sed to:
# 1. Replace the Expo-generated <title> with our SEO title
# 2. Inject our tags before </head>
# 3. Add service worker registration before </body>

# Create a temp file with modifications
python3 -c "
import re

with open('$DIST_HTML', 'r') as f:
    html = f.read()

# Remove Expo's default title
html = re.sub(r'<title>.*?</title>', '', html, count=1)

# Remove Expo's default favicon link (we have our own)
html = re.sub(r'<link rel=\"icon\" href=\"/favicon.ico\"/>', '', html)

# Inject our tags before </head>
inject = '''$INJECT_TAGS'''
html = html.replace('</head>', inject + '\n  </head>')

# Add service worker + noscript SEO before </body>
sw_script = '''
    <noscript>
      <div style=\"padding:40px;text-align:center;font-family:sans-serif;\">
        <h1>SpendNova - Money Management App</h1>
        <p>Track expenses, budgets, and savings goals with 100% local encryption.</p>
      </div>
    </noscript>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
            console.log('SW registration failed:', err);
          });
        });
      }
    </script>
'''
html = html.replace('</body>', sw_script + '\n</body>')

# Add background color to body
html = html.replace('height: 100%;\\n      }', 'height: 100%;\\n        margin: 0;\\n        padding: 0;\\n        background-color: #0B0F19;\\n      }')

with open('$DIST_HTML', 'w') as f:
    f.write(html)

print('✅ dist/index.html patched successfully')
"
