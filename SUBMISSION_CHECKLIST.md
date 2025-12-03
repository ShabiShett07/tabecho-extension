# ✅ Chrome Web Store Submission Checklist

Complete checklist to launch TabEcho on the Chrome Web Store.

---

## 📦 PREPARATION (COMPLETED ✅)

### ✅ 1. Extension Package
- [x] Extension built successfully
- [x] Icons generated (16, 32, 48, 128px)
- [x] ZIP package created: `tabecho-extension-v1.0.0.zip` (76KB)
- [x] Manifest version: 1.0.0
- [x] All files included in ZIP

**Location:** `/Users/shabareeshshetty/Developer/tabecho-extension/tabecho-extension-v1.0.0.zip`

**To rebuild package:**
```bash
cd /Users/shabareeshshetty/Developer/tabecho-extension
./scripts/package-for-webstore.sh
```

### ✅ 2. Documentation Ready
- [x] Privacy Policy written (`PRIVACY_POLICY.md`)
- [x] Chrome Web Store launch guide (`CHROME_WEBSTORE_LAUNCH.md`)
- [x] Screenshot guide created (`SCREENSHOT_GUIDE.md`)
- [x] Privacy hosting guide created (`PRIVACY_HOSTING_GUIDE.md`)
- [x] Git repository initialized

---

## 🚀 NEXT STEPS (TO DO)

### ☐ 3. Host Privacy Policy

**Choose ONE method:**

#### Option A: GitHub Pages (Recommended)
```bash
cd /Users/shabareeshshetty/Developer/tabecho-extension

# Create GitHub repository (if you have GitHub CLI)
gh auth login
gh repo create tabecho-extension --public --source=. --push

# OR manually create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/tabecho-extension.git
git push -u origin main

# Enable GitHub Pages:
# 1. Go to repo Settings → Pages
# 2. Source: main branch, / (root)
# 3. Save
```

**Privacy Policy URL:**
```
https://YOUR_USERNAME.github.io/tabecho-extension/PRIVACY_POLICY
```

#### Option B: GitHub Gist (Fastest)
1. Go to https://gist.github.com
2. Create new gist
3. Filename: `privacy-policy.md`
4. Copy content from `PRIVACY_POLICY.md`
5. Make it Public
6. Save URL

#### Option C: Google Docs (Easiest)
1. Create new Google Doc
2. Copy content from `PRIVACY_POLICY.md`
3. Format (remove markdown syntax)
4. File → Publish to web
5. Save URL

**⚠️ IMPORTANT:** Test the URL in incognito mode to verify it's publicly accessible!

**Save your privacy policy URL here:**
```
Privacy Policy URL: _________________________________
```

---

### ☐ 4. Create Store Screenshots

**Requirements:** 3-5 images, 1280x800px each

See `SCREENSHOT_GUIDE.md` for detailed instructions.

**Quick Steps:**
1. Load extension in Chrome (`chrome://extensions/` → Load unpacked → select `dist/` folder)
2. Add test data (archive some tabs)
3. Set browser window to 1280x800px
4. Take screenshots:
   - Screenshot 1: Dashboard with timeline
   - Screenshot 2: Search in action
   - Screenshot 3: Settings panel
   - Screenshot 4: (Optional) Tab card details
   - Screenshot 5: (Optional) Pro features

**Save screenshots to:**
```
store-assets/screenshots/
├── 01-dashboard.png
├── 02-search.png
├── 03-settings.png
├── 04-tab-detail.png (optional)
└── 05-pro-features.png (optional)
```

---

### ☐ 5. Create Promotional Images

**Requirements:**
- Small Promo Tile: 440x280px
- Marquee Promo Tile: 1400x560px (optional but recommended)

**Use Canva (Easiest):**
1. Go to https://www.canva.com
2. Create custom size design
3. Design elements:
   - Background: Purple gradient (#667eea to #764ba2)
   - Icon: Upload `dist/icon-128.png`
   - Text: "TabEcho" + "Never Lose a Tab Again"
4. Download as PNG

**Save to:**
```
store-assets/promo/
├── small-promo-440x280.png
└── marquee-1400x560.png
```

---

### ☐ 6. Set Up Chrome Web Store Developer Account

1. **Go to Developer Console:**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Sign in with Google account

2. **Pay Registration Fee:**
   - One-time fee: $5 USD
   - Required to publish extensions
   - Payment via credit/debit card

3. **Set Up Profile:**
   - Developer name
   - Support email address
   - Website (optional)

---

### ☐ 7. Submit to Chrome Web Store

#### A. Upload Extension Package

1. Click **"New Item"** in developer console
2. Click **"Choose file"**
3. Upload: `tabecho-extension-v1.0.0.zip`
4. Click **"Upload"**

#### B. Fill Out Store Listing

**Item Details:**

**Name:**
```
TabEcho
```

**Summary (132 characters max):**
```
Never lose a tab again! TabEcho automatically archives idle tabs with visual thumbnails and smart search.
```

**Description:**
```
Copy from CHROME_WEBSTORE_LAUNCH.md (lines 80-171)
```

**Category:**
```
Productivity
```

**Language:**
```
English
```

#### C. Upload Store Assets

**Icon:**
- Upload: `dist/icon-128.png`

**Screenshots:**
- Upload 3-5 screenshots from `store-assets/screenshots/`
- Ensure each is 1280x800px

**Small Promo Tile:**
- Upload: `store-assets/promo/small-promo-440x280.png`

**Marquee Promo Tile (Optional):**
- Upload: `store-assets/promo/marquee-1400x560.png`

#### D. Privacy Practices

**Single Purpose:**
```
Tab management and archiving
```

**Permission Justifications:**

**tabs:**
```
Required to detect idle tabs and read tab metadata (URL, title) for archiving
```

**storage:**
```
Required to save archived tab data locally in Chrome's IndexedDB
```

**activeTab:**
```
Required to capture screenshots of tabs (Pro feature only) before archiving
```

**scripting:**
```
Required for tab manipulation and content interaction during archiving/restoration
```

**idle:**
```
Required to detect when tabs become idle based on user-configured threshold
```

**host_permissions (<all_urls>):**
```
Required to access tab content for screenshot capture and tab manipulation across all websites
```

**Privacy Policy URL:**
```
[Paste your hosted privacy policy URL here]
```

**Data Usage:**
- Are you using remote code? **NO**
- Do you collect user data? **NO** (all data stored locally)
- Do you use encryption? **YES** (Chrome's built-in storage encryption)

#### E. Distribution Settings

**Visibility:**
```
Public
```

**Regions:**
```
All regions
```

**Pricing:**
```
Free (with future in-app purchases for Pro tier)
```

#### F. Support & Contact

**Support Email:**
```
support@tabecho.com (or your email address)
```

**Support URL (Optional):**
```
https://github.com/YOUR_USERNAME/tabecho-extension
```

**Website (Optional):**
```
https://YOUR_USERNAME.github.io/tabecho-extension
```

---

### ☐ 8. Pre-Submission Review

**Before clicking "Submit for Review":**

- [ ] Extension tested thoroughly in Chrome
- [ ] All screenshots show actual functionality
- [ ] Privacy policy URL is publicly accessible
- [ ] Support email is active and monitored
- [ ] All permissions are justified accurately
- [ ] Description matches actual features
- [ ] Version number is correct (1.0.0)
- [ ] No sensitive data in screenshots
- [ ] Icons display correctly
- [ ] ZIP package is under 20MB (✓ 76KB)

---

### ☐ 9. Submit for Review

1. **Review all information** in the developer console
2. Click **"Submit for Review"**
3. Wait for confirmation email

**Review Timeline:**
- Typical review: 1-3 business days
- Fast-track: Sometimes within hours
- Rejection: You'll receive email with reasons

**If Rejected:**
1. Read the rejection email carefully
2. Address all issues mentioned
3. Resubmit when ready

---

## 📊 POST-LAUNCH

### ☐ 10. After Approval

**When your extension is approved:**

- [ ] Share on social media (Twitter, LinkedIn, Reddit)
- [ ] Post on Product Hunt
- [ ] Write a launch blog post
- [ ] Set up support email workflow
- [ ] Monitor reviews and ratings
- [ ] Respond to user feedback

**Monitoring:**
- Check Chrome Web Store dashboard daily
- Respond to reviews within 24-48 hours
- Track install count and active users
- Monitor crash reports

---

## 🎯 QUICK REFERENCE

### Important URLs

**Developer Console:**
https://chrome.google.com/webstore/devconsole

**Extension Testing:**
chrome://extensions/

**Your Privacy Policy URL:**
```
[Fill in after hosting]
```

**Your GitHub Repo:**
```
https://github.com/YOUR_USERNAME/tabecho-extension
```

### Key Files

**Extension Package:**
```
tabecho-extension-v1.0.0.zip (76KB)
```

**Documentation:**
```
CHROME_WEBSTORE_LAUNCH.md     - Full launch guide
SCREENSHOT_GUIDE.md           - Screenshot creation guide
PRIVACY_HOSTING_GUIDE.md      - Privacy policy hosting options
SUBMISSION_CHECKLIST.md       - This file
```

**Store Assets:**
```
store-assets/screenshots/     - Store screenshots (1280x800)
store-assets/promo/           - Promotional images
```

---

## 💡 TIPS FOR SUCCESS

### Do's ✅
- Test extension thoroughly before submission
- Use high-quality, realistic screenshots
- Write clear, accurate descriptions
- Respond to reviews promptly
- Update regularly with bug fixes
- Be transparent about permissions

### Don'ts ❌
- Don't request unnecessary permissions
- Don't use misleading screenshots or descriptions
- Don't include placeholder text or dummy data
- Don't submit with known bugs
- Don't ignore user feedback
- Don't copy from other extensions

---

## 🆘 NEED HELP?

### Common Issues

**"Extension package rejected"**
- Check manifest.json is valid
- Ensure all icons are included
- Verify no prohibited content

**"Privacy policy URL not accessible"**
- Test in incognito/private browsing
- Ensure HTTPS URL
- Check URL is publicly visible

**"Screenshots don't match functionality"**
- Retake screenshots showing actual features
- Don't use mockups or fake data
- Show real extension UI

### Resources

**Chrome Web Store Policies:**
https://developer.chrome.com/docs/webstore/program-policies/

**Extension Development Docs:**
https://developer.chrome.com/docs/extensions/

**Developer Support:**
https://groups.google.com/a/chromium.org/g/chromium-extensions

---

## ✅ FINAL CHECKLIST

Before submission, verify ALL items are complete:

### Required Items
- [ ] Chrome Web Store developer account created ($5 paid)
- [ ] Extension ZIP package ready (76KB)
- [ ] Privacy policy hosted and URL accessible
- [ ] 3-5 screenshots created (1280x800px)
- [ ] Small promo tile created (440x280px)
- [ ] Support email address set up
- [ ] All permissions justified
- [ ] Extension tested in Chrome

### Optional But Recommended
- [ ] Marquee promo tile created (1400x560px)
- [ ] Demo video uploaded to YouTube
- [ ] Landing page created
- [ ] Social media posts prepared
- [ ] GitHub repository public

---

## 🎉 YOU'RE READY!

You've completed all the preparation work. Now:

1. ✅ Host your privacy policy
2. ✅ Create screenshots and promo images
3. ✅ Set up developer account
4. ✅ Fill out and submit store listing
5. ✅ Wait for approval (1-3 days)
6. ✅ Celebrate your launch! 🎊

**Good luck with your Chrome Web Store launch!**

---

*Last updated: November 25, 2024*
*TabEcho v1.0.0*
