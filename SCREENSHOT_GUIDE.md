# 📸 Screenshot & Promotional Image Creation Guide

This guide will help you create the required screenshots and promotional images for the Chrome Web Store listing.

## 🎯 Required Assets

### 1. Screenshots (3-5 images at 1280x800px)
- **Screenshot 1**: Dashboard/Timeline View
- **Screenshot 2**: Search Functionality
- **Screenshot 3**: Settings Panel
- **Screenshot 4** (Optional): Tab Card Detail
- **Screenshot 5** (Optional): Pro Features

### 2. Promotional Images
- **Small Promo Tile**: 440x280px
- **Marquee Promo Tile** (Optional but recommended): 1400x560px

---

## 📋 Step-by-Step: Creating Screenshots

### Preparation

1. **Load the Extension in Chrome**
   ```bash
   # Navigate to chrome://extensions/
   # Enable "Developer mode" (top right)
   # Click "Load unpacked"
   # Select: /Users/shabareeshshetty/Developer/tabecho-extension/dist
   ```

2. **Add Test Data**
   - Open several tabs and let them become idle (or manually archive them)
   - Add various titles, URLs, and domains to make screenshots look realistic
   - For Pro features: add tags, projects, and screenshot thumbnails (if available)

3. **Set Up Screen Size**
   - Open Chrome DevTools (F12 or Cmd+Option+I)
   - Click the device toolbar icon (Cmd+Shift+M)
   - Set custom dimensions: **1280 x 800**

### Screenshot 1: Dashboard/Timeline View

**What to Show:**
- Main timeline with archived tabs
- Date grouping (Today, Yesterday, This Week, etc.)
- Multiple tab cards showing titles, URLs, favicons, and domains
- Clean, organized layout

**How to Capture:**
1. Open the extension popup (click the extension icon)
2. Make sure you have at least 5-10 archived tabs visible
3. Position the view to show the timeline clearly
4. Use screenshot tool:
   - **Mac**: Cmd+Shift+4 (select area)
   - **Windows**: Win+Shift+S
   - **Chrome DevTools**: Right-click → "Capture screenshot"

**Tips:**
- Use realistic tab titles (e.g., "React Documentation", "GitHub - Project Name")
- Show variety in dates (some today, some yesterday, some older)
- Make sure the UI looks clean and professional

### Screenshot 2: Search Functionality

**What to Show:**
- Search bar with an active query
- Filtered results highlighting the search feature
- Clear indication that search is working

**How to Capture:**
1. Open extension dashboard
2. Type a search query (e.g., "react" or "documentation")
3. Show filtered results that match the query
4. Capture the screen showing both the search input and results

**Tips:**
- Use a common search term that will return multiple results
- Highlight the search bar visually if possible
- Show enough results to demonstrate the feature (3-5 results)

### Screenshot 3: Settings Panel

**What to Show:**
- Settings interface
- Customization options (idle threshold, excluded domains)
- Tier comparison (Free vs Pro features)

**How to Capture:**
1. Open extension dashboard
2. Navigate to Settings (if there's a settings page/tab)
3. Show the main settings options
4. If there's a Pro tier section, include it

**Tips:**
- Make sure all settings are clearly visible
- Show realistic values (e.g., 30 minutes idle threshold)
- If there's a Free vs Pro comparison, make it prominent

### Screenshot 4: Tab Card Detail (Optional)

**What to Show:**
- A single tab card with all details
- Tags, project assignment, action buttons
- Edit functionality if available

**How to Capture:**
1. Hover over or select a tab card to show details
2. If there's an expanded view, show it
3. Include any interaction states (hover effects, buttons)

### Screenshot 5: Pro Features (Optional)

**What to Show:**
- Screenshot thumbnails on tab cards
- Pro badge/indicator
- Advanced filters (domain, project filters)
- Tags and projects in action

**How to Capture:**
1. Enable Pro features (if you can mock them)
2. Show tab cards with visual thumbnails
3. Highlight the Pro-specific features

---

## 🎨 Creating Promotional Images

### Option 1: Canva (Recommended - Easy & Free)

1. **Go to Canva**: https://www.canva.com
2. **Create Custom Size**:
   - Click "Create a design"
   - Select "Custom size"
   - For Small Promo: 440 x 280 pixels
   - For Marquee: 1400 x 560 pixels

3. **Design Elements**:
   - **Background**: Use gradient (purple: #667eea to #764ba2)
   - **Icon**: Upload the 128x128 icon from dist/icon-128.png
   - **Text**:
     - Title: "TabEcho" (large, bold, white)
     - Tagline: "Never Lose a Tab Again" (smaller, white)
   - **Optional**: Add screenshot mockups or feature highlights

4. **Download**:
   - Click "Share" → "Download"
   - File type: PNG
   - Quality: High
   - Download and save

### Option 2: Figma (Advanced)

1. **Create Frame**:
   - Small Promo: 440 x 280
   - Marquee: 1400 x 560

2. **Design Layout**:
   ```
   Small Promo (440x280):
   ┌─────────────────────┐
   │  [Icon]  TabEcho    │
   │  Never Lose a Tab   │
   │  Again!             │
   └─────────────────────┘

   Marquee (1400x560):
   ┌────────────────────────────────────┐
   │ [Icon] TabEcho                     │
   │ Never Lose a Tab Again!            │
   │                                    │
   │ ✨ Auto Archive  🔍 Smart Search   │
   │ 📸 Thumbnails   🏷️ Tags & Projects │
   │                                    │
   │ [Screenshot mockup]  [Install Now] │
   └────────────────────────────────────┘
   ```

3. **Export**:
   - Right-click frame → Export
   - Format: PNG
   - Scale: 1x
   - Export

### Quick Design Template

**Colors:**
- Primary gradient: Linear gradient from #667eea (top-left) to #764ba2 (bottom-right)
- Text: White (#FFFFFF)
- Accent: Light purple (#A78BFA)

**Fonts:**
- Title: "Inter" or "Poppins" (Bold, 48px for marquee, 24px for small)
- Tagline: "Inter" or "Poppins" (Regular, 24px for marquee, 14px for small)

**Icon Placement:**
- Small Promo: Center or left-aligned
- Marquee: Left side with text, right side with screenshot/features

---

## ✅ Pre-Submission Checklist

Before uploading to Chrome Web Store, verify:

- [ ] All screenshots are exactly 1280x800px
- [ ] Screenshots are in PNG or JPEG format
- [ ] Each screenshot is under 1MB
- [ ] Small promo tile is exactly 440x280px
- [ ] Marquee promo tile is exactly 1400x560px (if created)
- [ ] All images clearly show the extension's features
- [ ] No placeholder text or dummy data visible
- [ ] Images are high quality and professional-looking

---

## 📂 File Organization

Save your assets in this structure:

```
tabecho-extension/
├── store-assets/
│   ├── screenshots/
│   │   ├── 01-dashboard.png (1280x800)
│   │   ├── 02-search.png (1280x800)
│   │   ├── 03-settings.png (1280x800)
│   │   ├── 04-tab-detail.png (1280x800) [optional]
│   │   └── 05-pro-features.png (1280x800) [optional]
│   └── promo/
│       ├── small-promo-440x280.png
│       └── marquee-1400x560.png
```

---

## 🆘 Need Help?

### Quick Screenshot Tools

- **Mac**:
  - Cmd+Shift+4: Select area
  - Cmd+Shift+3: Full screen
  - Preview app to crop/resize

- **Windows**:
  - Win+Shift+S: Snipping tool
  - Print Screen: Full screen
  - Paint to crop/resize

- **Online Tools**:
  - Canva: https://www.canva.com
  - Figma: https://www.figma.com
  - CloudConvert: https://cloudconvert.com (for resizing)

### Image Editing (if needed)

- **Resize**: Use https://www.iloveimg.com/resize-image
- **Compress**: Use https://tinypng.com
- **Add Annotations**: Use Canva or Figma

---

## 🚀 Next Steps

After creating all assets:

1. Save them in the `store-assets/` folder
2. Review the quality and accuracy
3. Proceed to hosting the privacy policy
4. Fill out the Chrome Web Store listing form
5. Upload all assets during submission

**You're doing great! Keep going!** 🎉
