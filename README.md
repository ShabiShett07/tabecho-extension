# 🔄 TabEcho - Never Lose a Tab Again

**TabEcho** is a Chrome extension that automatically archives idle tabs with visual thumbnails, helping you manage tab overload while never losing important content.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)

## ✨ Features

### 🆓 Free Tier
- **Automatic idle detection** - Archives tabs after 30 minutes of inactivity
- **Timeline dashboard** - Visual organization by date (Today, Yesterday, This Week)
- **Basic search** - Find tabs by title or URL
- **One-click restore** - Reopen any archived tab instantly
- **Local storage** - All data stays on your device
- **Retention limits** - Keeps last 100 tabs or 7 days

### ⭐ Pro Tier ($4.99/month or $49/year)
- **Screenshot thumbnails** - Visual previews of archived tabs
- **Unlimited storage** - No limits on archived tabs or retention days
- **Advanced filters** - Filter by domain, project, date range
- **Tags & Projects** - Organize tabs into categories
- **Export/Import** - Backup and restore your archive as JSON
- **Tab analytics** - Usage insights and statistics
- **Priority support** - Get help when you need it

### 👔 Enterprise Tier ($14.99/month/user)
- **Cloud sync** - Access archives across devices
- **Team collaboration** - Shared projects and tabs
- **Bulk automation** - Archive rules by domain/project
- **Admin dashboard** - Manage users and settings
- **SLA & support** - Guaranteed uptime and dedicated support

## 🚀 Quick Start

### Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the extension**:
   ```bash
   npm run build
   ```
4. **Generate icons**:
   ```bash
   npm run generate-icons
   ```
5. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Usage

1. **Click the extension icon** to open the dashboard
2. **Configure settings** (idle threshold, excluded domains)
3. **Let tabs idle** for the configured time (default: 30 minutes)
4. **Browse archived tabs** in the timeline view
5. **Search & filter** to find specific tabs
6. **Restore** any tab with one click

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Storage**: IndexedDB + Chrome Storage API
- **Manifest**: Chrome Extension Manifest V3
- **Styling**: Modern CSS with gradient theme
- **Icons**: SVG → PNG via Sharp

## 📁 Project Structure

```
tabecho-extension/
├── src/
│   ├── components/       # React UI components
│   ├── storage/          # IndexedDB & settings
│   ├── background.ts     # Service worker
│   ├── App.tsx          # Main app
│   └── *.css            # Component styles
├── public/
│   └── manifest.json    # Extension manifest
├── dist/                # Build output (load this in Chrome)
├── scripts/
│   └── generate-icons.js
└── package.json
```

## 🎯 How It Works

1. **Idle Detection**: Background worker monitors all tabs
2. **Auto-Archive**: When a tab is idle > threshold → archived
3. **Visual Storage**: Metadata + optional screenshots saved locally
4. **Timeline View**: Organized dashboard with search & filters
5. **One-Click Restore**: Reopen any archived tab instantly

## 🔧 Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Generate extension icons
npm run generate-icons

# Type checking
npx tsc --noEmit

# Preview production build
npm run preview
```

### Making Changes

1. Edit source files in `src/`
2. Run `npm run build` to compile
3. Click "Reload" on extension in `chrome://extensions/`
4. Test changes in the extension popup

## 💳 Monetization

The extension includes full payment integration with PayPal and Razorpay:

1. **PayPal** - For international customers (USD)
2. **Razorpay** - For Indian customers (INR)
3. **Vercel Backend** - Serverless API for handling payments
4. **Automatic detection** - Extension detects user location

**Pricing:**
- Monthly: $4.99/month (USD) or ₹399/month (INR)
- Yearly: $49/year (USD) or ₹3999/year (INR)

See `PAYMENT_SETUP.md` for detailed setup guide.

## 🔒 Privacy & Permissions

### Required Permissions
- `tabs` - Detect idle tabs and capture metadata
- `storage` - Save archived tab data locally
- `activeTab` - Capture screenshots (Pro feature)
- `scripting` - Advanced tab manipulation
- `idle` - Detect user idle state

### Privacy Commitment
- ✅ All data stored locally by default
- ✅ No cloud sync unless opted-in (Enterprise only)
- ✅ No tracking or analytics
- ✅ No external API calls
- ✅ No account required

## 📚 Documentation

- **Quick Start**: See `QUICK_START.md`
- **Setup Guide**: See `README_SETUP.md`
- **API Docs**: Check inline comments in source files

## 🐛 Known Issues

- Screenshots only work on visible tabs (Chrome API limitation)
- Service worker may need occasional reload after updates
- IndexedDB storage has ~50MB limit (Free tier won't hit this)

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎊 Credits

Built with:
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Sharp](https://sharp.pixelplumbing.com) - Image processing

Created using **Claude Code** by Anthropic.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/tabecho/issues)
- **Email**: support@tabecho.com
- **Docs**: https://tabecho.com/docs

## 🗺️ Roadmap

- [ ] Keyboard shortcuts for quick actions
- [ ] Bulk operations (archive all, select multiple)
- [ ] Browser history import
- [ ] AI-powered categorization
- [ ] Mobile companion app
- [ ] Firefox/Edge support
- [ ] Tab group integration
- [ ] Advanced analytics dashboard

---

**TabEcho** - Automatically archive idle tabs and never lose important content again! 🎉

*Made with ❤️ using Claude Code*
