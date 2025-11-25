# TabEcho Chrome Extension - Setup Guide

## 🎉 Your TabEcho extension has been successfully built!

TabEcho is a Chrome extension that automatically archives idle tabs with visual thumbnails, helping you manage tab overload while never losing important content.

## 📦 What's Been Built

✅ **Core Features:**
- Automatic idle tab detection and archiving
- Visual timeline dashboard with search and filters
- IndexedDB storage for metadata and screenshots
- Tag and project organization
- Settings panel with customizable idle threshold
- Export/Import functionality (Pro feature)
- Free and Pro tier support (with demo upgrade)

✅ **Tech Stack:**
- React + TypeScript + Vite
- Chrome Extension Manifest V3
- IndexedDB for local storage
- Modern, responsive UI with CSS

## 🚀 Installation Steps

### 1. Create Extension Icons

The extension needs icon files. You can:

**Option A:** Create your own PNG icons (16x16, 32x32, 48x48, 128x128 pixels)
- Save them as `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png` in the `dist/` folder
- Use any image editor or online tool like Canva, Figma, or photopea.com

**Option B:** Use the provided script to generate simple placeholder icons:
```bash
npm run generate-icons
```

**Option C:** Temporarily remove icon references:
- Edit `dist/manifest.json` and remove the `icons` and `action.default_icon` sections

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The TabEcho extension should now appear in your extensions list!

### 3. Pin the Extension

- Click the puzzle piece icon in Chrome toolbar
- Find TabEcho and click the pin icon
- The extension icon will appear in your toolbar

### 4. Start Using TabEcho!

Click the extension icon to open the dashboard and explore:
- **Dashboard**: View all archived tabs in a visual timeline
- **Search**: Find tabs by title, URL, domain, or tags
- **Filters**: Filter by domain or project (Pro feature)
- **Settings**: Customize idle threshold, enable auto-archive, and more
- **Upgrade**: Try the Pro tier (demo mode - no payment required)

## 🎯 How It Works

1. **Idle Detection**: TabEcho monitors your tabs and detects when they've been idle for your configured threshold (default: 30 minutes)
2. **Auto-Archive**: When a tab becomes idle, it's automatically archived with metadata (URL, title, timestamp)
3. **Screenshots** (Pro): Pro users can capture visual thumbnails of tabs before archiving
4. **Visual Timeline**: Browse archived tabs in an organized timeline (Today, Yesterday, This Week, etc.)
5. **Restore Anytime**: Click the restore button to reopen any archived tab

## ⚙️ Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Preview production build
npm run preview
```

### Project Structure

```
tabecho-extension/
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.tsx # Main dashboard view
│   │   ├── TabCard.tsx   # Individual tab card
│   │   ├── SearchBar.tsx # Search functionality
│   │   ├── Filters.tsx   # Filter controls
│   │   └── Settings.tsx  # Settings panel
│   ├── storage/          # Storage layer
│   │   ├── db.ts         # IndexedDB wrapper
│   │   └── settings.ts   # Settings manager
│   ├── background.ts     # Background service worker
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── *.css            # Component styles
├── public/
│   └── manifest.json    # Extension manifest
├── dist/                # Built extension (load this in Chrome)
└── vite.config.ts       # Build configuration
```

## 🎨 Features by Tier

### Free Tier
- ✅ Idle tab detection and archiving
- ✅ Basic metadata storage (URL, title, timestamp)
- ✅ List-based dashboard view
- ✅ Simple search by title/URL
- ✅ Restore archived tabs
- ⚠️ Limited to 100 tabs or 7 days retention

### Pro Tier ($4.99/month or $49/year)
- ✅ **All Free features**
- ✅ Visual screenshot thumbnails
- ✅ Unlimited archive storage
- ✅ Advanced filters (domain, project, date range)
- ✅ Tag and project organization
- ✅ Export/Import data (JSON)
- ✅ Tab usage analytics
- ✅ Priority support

### Enterprise Tier ($14.99/month/user)
- ✅ **All Pro features**
- ✅ Cross-device cloud sync
- ✅ Multi-user / team shared projects
- ✅ Bulk automation rules
- ✅ Admin dashboard
- ✅ SLA & custom support

## 💳 Stripe Integration (Future)

The extension includes placeholder code for Stripe payments. To implement:

1. Create a Stripe account at stripe.com
2. Set up a backend (Firebase Functions, Supabase, or Node.js)
3. Implement webhook handling for subscription events
4. Update the extension to verify subscription status via your backend API
5. Replace demo upgrade button with real Stripe checkout

## 🔒 Privacy & Permissions

TabEcho requires these permissions:
- **tabs**: To detect idle tabs and capture metadata
- **storage**: To save archived tab data locally
- **activeTab**: To capture screenshots (Pro feature)
- **scripting**: For advanced features
- **idle**: To detect user idle state

**All data is stored locally by default.** Cloud sync is only available for Enterprise users who opt-in.

## 🐛 Troubleshooting

### Extension doesn't load
- Make sure you're loading the `dist/` folder, not the root project folder
- Check that all icon files exist in the `dist/` folder
- Look for errors in `chrome://extensions/` with Developer mode enabled

### Icons missing
- See "Create Extension Icons" section above
- You can temporarily remove icon references from `dist/manifest.json`

### Background worker errors
- Check the service worker logs in `chrome://extensions/` → "service worker" link
- Look for console errors in the extension popup (right-click → Inspect)

### Storage issues
- IndexedDB might be disabled in your browser
- Check browser console for storage-related errors
- Try clearing extension data: Chrome Settings → Privacy → Clear browsing data → Cached images and files

## 📚 Next Steps

1. **Add Icons**: Create proper icon files for a polished look
2. **Test Thoroughly**: Try archiving tabs, searching, and restoring
3. **Customize Settings**: Adjust idle threshold and excluded domains
4. **Try Pro Features**: Click "Upgrade to Pro (Demo)" to test premium features
5. **Deploy**: When ready, publish to Chrome Web Store
6. **Add Backend**: Implement Stripe and cloud sync for production

## 🎊 Features to Add (Future Enhancements)

- [ ] Analytics dashboard with tab usage insights
- [ ] Keyboard shortcuts for quick actions
- [ ] Bulk operations (archive all, delete selected)
- [ ] Import from browser history
- [ ] Smart suggestions based on usage patterns
- [ ] Mobile companion app
- [ ] Browser sync across devices
- [ ] AI-powered tab categorization

## 📞 Support

For issues or questions:
- GitHub: [Create an issue](https://github.com/yourusername/tabecho)
- Email: support@tabecho.com
- Docs: https://tabecho.com/docs

## 📄 License

This project is built as a demonstration. Add your own license as needed.

---

**Built with ❤️ using Claude Code**

Enjoy using TabEcho! 🎉
