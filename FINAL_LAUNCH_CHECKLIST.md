# 🚀 Final Launch Checklist for Chrome Web Store

## ✅ What's Been Completed

- [x] Stripe integration implemented (frontend + backend templates)
- [x] Screenshot visibility bug fixed
- [x] All test/debug code removed from production UI
- [x] Upgrade buttons now open real Stripe checkout
- [x] Subscription status checking implemented
- [x] Build successful with no errors
- [x] All assets present and valid

## 🔧 Required Before Launch (YOU MUST DO)

### 1. Set Up Stripe (1-2 hours)

Follow `STRIPE_SETUP.md` to:

- [ ] Create PayPal Business account
- [ ] Create Razorpay account
- [ ] Create subscription plans on both platforms
- [ ] Deploy Vercel backend
- [ ] Configure webhooks for both PayPal and Razorpay
- [ ] Test with test cards/accounts
- [ ] Update `.env` file with your API keys

**Files to configure:**
- `.env` (copy from `.env.example` and fill in)
- Vercel backend (deploy from GitHub)

### 2. Update Placeholder URLs

**File: `src/components/Settings.tsx` (lines 309-317)**

Replace:
- `YOUR_USERNAME` with your GitHub username
- `YOUR_EMAIL@example.com` with your support email
- `YOUR_DOMAIN.com/privacy` with your privacy policy URL

### 3. Host Privacy Policy (15-30 minutes)

**Option A: GitHub Pages (Free & Easy)**

```bash
# Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
echo "# TabEcho Privacy Policy" > index.md
cp PRIVACY_POLICY.md ./
git add .
git commit -m "Add privacy policy"
git push origin gh-pages

# Enable GitHub Pages in repo settings
# Your privacy policy will be at:
# https://YOUR_USERNAME.github.io/tabecho-extension/PRIVACY_POLICY
```

**Option B: GitHub Gist (Fastest)**

1. Go to https://gist.github.com
2. Create new gist
3. Paste `PRIVACY_POLICY.md` content
4. Make it public
5. Use the gist URL

**Then update:**
- `manifest.json` - Add privacy policy URL
- `Settings.tsx` line 315 - Update privacy policy link

### 4. Clean Up Console Logs (Optional but Recommended)

**File: `src/background.ts`**

Currently has 42 console.log statements. For production, you can:

**Option A:** Remove most logs (keep only errors)
**Option B:** Wrap in DEBUG flag:

```typescript
const DEBUG = false;
const log = DEBUG ? console.log : () => {};

// Then replace console.log with log
log('🚀 TabEcho initialized');
```

### 5. Test Extension Thoroughly

- [ ] Load extension in Chrome (chrome://extensions)
- [ ] Test auto-archiving (open tabs, let them idle)
- [ ] Test screenshot capture (Pro mode)
- [ ] Test search and filters
- [ ] Test export/import
- [ ] Test settings save correctly
- [ ] Test Stripe checkout flow (use test cards)
- [ ] Test subscription verification
- [ ] Test on fresh Chrome profile

### 6. Prepare Store Listing Materials

**Required:**
- [ ] Icon (128x128) - ✅ Already have it
- [ ] Screenshots (1280x800 or 640x400) - See SCREENSHOT_GUIDE.md
- [ ] Promotional tile (440x280)
- [ ] Store description (short and detailed)

**Create Screenshots:**

1. Load extension
2. Archive some test tabs
3. Take screenshots of:
   - Dashboard with archived tabs
   - Tab card with screenshot thumbnail (Pro feature)
   - Settings page
   - Search results
   - Filters in action

### 7. Final Code Review

- [ ] No hardcoded test data
- [ ] No "TODO" or "FIXME" comments
- [ ] All images/assets optimized
- [ ] manifest.json version is correct
- [ ] Extension name and description are final
- [ ] All permissions are justified

### 8. Build for Production

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Verify dist/ folder
ls -la dist/

# Create zip for upload
cd dist
zip -r ../tabecho-extension-v1.0.0.zip .
cd ..
```

### 9. Chrome Web Store Submission

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 one-time developer fee (if not already paid)
3. Click "New Item"
4. Upload `tabecho-extension-v1.0.0.zip`
5. Fill in store listing:

**Store Listing:**

```
Short Description (132 chars):
Automatically archive idle tabs with screenshots. Never lose important content. Free & Pro tiers available.

Detailed Description:
TabEcho automatically archives your idle browser tabs, so you never lose important content. Perfect for researchers, developers, and anyone who keeps many tabs open.

🌟 KEY FEATURES

✅ Automatic Tab Archiving
- Set custom idle thresholds (5, 10, 30, 60+ minutes)
- Tabs archive automatically when inactive
- Never lose important content again

🔍 Smart Search & Filters
- Search by title, URL, domain, or tags
- Filter by domain or project
- Group by date (Today, Yesterday, This Week, etc.)

🏷️ Organization Tools (Pro)
- Add tags to archived tabs
- Organize by projects
- Advanced filtering options

📸 Visual Thumbnails (Pro)
- Screenshot preview of each archived tab
- Quickly identify content visually
- Perfect for visual reference

💾 Data Management (Pro)
- Export all archived tabs as JSON
- Import from previous exports
- Unlimited archive storage

⚙️ Customization
- Exclude specific domains (Gmail, Slack, etc.)
- Choose to auto-close archived tabs
- Toggle features on/off globally

🆓 FREE TIER
- Archive up to 100 tabs
- 7-day retention
- Basic search and filters
- Perfect for light users

⭐ PRO TIER ($4.99/month or $49/year)
- Unlimited archive storage
- Screenshot thumbnails
- Advanced filters
- Tags & Projects
- Export/Import data

Privacy-focused: All data stored locally in your browser.
```

**Category:** Productivity
**Language:** English

6. Add screenshots
7. Add promotional images
8. Set pricing (free with in-app purchases)
9. Add privacy policy URL
10. Justify permissions in review notes

### 10. Submission Review Notes

**Important:** Explain `<all_urls>` permission:

```
PERMISSION JUSTIFICATION:

The extension requests "host_permissions: <all_urls>" because:

1. Screenshot Capture: We use chrome.tabs.captureVisibleTab() to capture
   screenshots of archived tabs (Pro feature). This API requires host
   permissions for the tabs being captured.

2. Tab Monitoring: We track idle tabs across all domains to provide the
   core archiving functionality.

The extension:
- Does NOT inject content scripts
- Does NOT modify web pages
- Does NOT track user browsing
- Only captures screenshots when explicitly enabled by Pro users
- All data stored locally using IndexedDB

Privacy Policy: [YOUR_PRIVACY_POLICY_URL]
```

## ⚠️ Critical Warnings

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Test Stripe in test mode first** - Use test cards only
3. **Test on fresh Chrome profile** - Catch first-time user issues
4. **Keep secret keys secret** - Never expose in extension code
5. **Test webhook thoroughly** - Subscriptions won't work without it

## 📊 Expected Timeline

- **Stripe Setup:** 1-2 hours
- **URL Updates:** 15 minutes
- **Privacy Policy:** 30 minutes
- **Testing:** 1-2 hours
- **Screenshots:** 30 minutes
- **Submission:** 30 minutes
- **Google Review:** 1-3 days

**Total:** ~1 day of work + Google review time

## 🎉 After Approval

1. **Monitor:**
   - Chrome Web Store reviews
   - PayPal & Razorpay Dashboards for subscriptions
   - Vercel logs for errors

2. **Promote:**
   - Share on Twitter, Reddit, ProductHunt
   - Create demo video
   - Write blog post

3. **Iterate:**
   - Collect user feedback
   - Fix bugs quickly
   - Plan v2.0 features

## 🆘 Support Resources

- **Stripe Issues:** STRIPE_SETUP.md
- **Privacy Policy:** PRIVACY_HOSTING_GUIDE.md
- **Screenshots:** SCREENSHOT_GUIDE.md
- **Submission:** CHROME_WEBSTORE_LAUNCH.md
- **General Issues:** PRODUCTION_ISSUES.md

## ✅ Pre-Submission Checklist

Before clicking "Submit for Review":

- [ ] Stripe is fully configured and tested
- [ ] Privacy policy is publicly hosted
- [ ] All placeholder URLs are replaced
- [ ] Extension tested thoroughly
- [ ] Screenshots look professional
- [ ] Store description is compelling
- [ ] Permissions are justified in review notes
- [ ] Build is from production environment
- [ ] Version number is correct (1.0.0)
- [ ] You're ready to support users!

---

## 🚀 Ready to Launch?

If all checkboxes above are completed, you're ready to submit!

1. Create final build: `npm run build`
2. Create zip: `cd dist && zip -r ../tabecho-v1.0.0.zip .`
3. Go to Chrome Web Store Developer Dashboard
4. Upload and submit!

**Good luck with your launch! 🎉**
