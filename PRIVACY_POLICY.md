# Privacy Policy for TabEcho

**Last Updated: November 25, 2024**

## Introduction

TabEcho ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how TabEcho handles your data when you use our Chrome extension.

**TL;DR: TabEcho stores all your data locally on your device. We don't collect, transmit, or have access to any of your information.**

## Information Collection and Use

### What Data Does TabEcho Store?

TabEcho stores the following information **locally on your device only**:

1. **Archived Tab Metadata**
   - Tab URLs
   - Tab titles
   - Favicon URLs
   - Timestamps (when tabs were archived)
   - Domain names
   - Tags and project names (if you add them)
   - Idle duration before archiving

2. **Optional Screenshot Data (Pro Users Only)**
   - Visual thumbnails of tabs before archiving
   - Stored as image files in your browser's local IndexedDB

3. **Extension Settings**
   - Idle threshold configuration
   - Auto-archive enable/disable status
   - Screenshot capture preference
   - Excluded domain list
   - Subscription tier status (Free/Pro)
   - Retention limits

### Where Is This Data Stored?

**All data is stored locally on your device** using:
- **Chrome IndexedDB**: For archived tab metadata and screenshots
- **Chrome Storage API**: For extension settings

**We do not:**
- ❌ Upload your data to any server
- ❌ Send your data to any third party
- ❌ Have access to your data
- ❌ Collect analytics or usage statistics
- ❌ Track your browsing behavior
- ❌ Store data in the cloud (unless you're an Enterprise user who explicitly opts in)

## Permissions Justification

TabEcho requires the following Chrome permissions:

### `tabs`
**Why we need it:** To detect idle tabs, read tab metadata (URL, title), and manage tab archiving.

**What we do with it:** Monitor tab activity to determine when tabs become idle based on your configured threshold.

**What we DON'T do:** We don't track your browsing history, monitor active browsing, or send tab information anywhere.

### `storage`
**Why we need it:** To save archived tab data and extension settings locally.

**What we do with it:** Store archived tabs in your browser's local IndexedDB so you can view and restore them later.

**What we DON'T do:** We don't sync to cloud storage or share with external services.

### `activeTab`
**Why we need it:** To capture screenshots of tabs (Pro feature only).

**What we do with it:** When you have Pro enabled and a tab is about to be archived, we capture a visual thumbnail for easier identification.

**What we DON'T do:** We don't capture screenshots of sensitive pages, and screenshots are stored locally only.

### `scripting`
**Why we need it:** For advanced tab manipulation features.

**What we do with it:** Interact with tab content when necessary for archiving and restoration.

**What we DON'T do:** We don't inject tracking scripts or modify page content.

### `idle`
**Why we need it:** To detect when tabs become idle.

**What we do with it:** Monitor tab activity to determine the appropriate time to archive based on your configured idle threshold.

**What we DON'T do:** We don't track when you're away from your computer or use this data for any other purpose.

## Data Sharing

**TabEcho does not share your data with anyone.** Period.

- We don't sell your data
- We don't share your data with advertisers
- We don't transmit your data to analytics services
- We don't send your data to our servers (we don't have servers)

## Third-Party Services

### Current Implementation (Free and Pro Tiers)
TabEcho currently operates **100% locally** with no third-party services.

### Future Implementation (Stripe for Pro Subscriptions)
When we implement paid Pro subscriptions via Stripe:

- **Stripe** will process payment information (credit card, billing address)
- We will NOT have access to your payment details
- Stripe's privacy policy applies to payment processing
- We will only receive: subscription status (active/cancelled), subscription tier, and anonymized user ID

### Enterprise Tier (Optional Cloud Sync)
If you're an Enterprise user who opts into cloud sync:

- Data will be synced to **Firebase** or **Supabase** (specified in Enterprise agreement)
- Synced data is encrypted in transit and at rest
- You can disable cloud sync at any time
- Cloud data is isolated per team/organization
- You maintain ownership of your data

## Data Retention

### Free Tier
- Archived tabs are kept for up to **7 days** or until you reach **100 tabs** (whichever comes first)
- Older tabs are automatically deleted to maintain storage limits
- You can manually delete tabs at any time

### Pro Tier
- **Unlimited** archive storage
- No automatic deletion based on age or count
- You control your data retention

### After Uninstalling
When you uninstall TabEcho:
- **All locally stored data is automatically deleted** by Chrome
- We don't have any copies of your data
- No data remains on any servers (because we don't store data on servers)

## Your Privacy Rights

You have complete control over your data:

- **Access**: View all archived tabs in the dashboard
- **Delete**: Remove individual tabs or clear all data
- **Export**: Export your archived tabs as JSON (Pro feature)
- **Import**: Import previously exported data
- **Control**: Configure what gets archived and when

## Children's Privacy

TabEcho does not knowingly collect data from anyone, including children under 13. Since all data is stored locally and we don't collect any personal information, TabEcho can be safely used by anyone.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date at the top of this policy
- Showing an in-extension notification for material changes

Continued use of TabEcho after changes constitutes acceptance of the updated policy.

## Security

We take security seriously:

- ✅ All data stored locally using Chrome's secure storage APIs
- ✅ Chrome automatically encrypts local storage when device is locked
- ✅ No data transmitted over the internet (except optional Stripe payments)
- ✅ No remote code execution
- ✅ Open source code (can be audited)

However, remember:
- If someone has access to your unlocked computer, they can access TabEcho data
- Keep your computer secure with a strong password and lock screen
- Use full disk encryption for maximum security

## International Users

TabEcho works globally and stores all data locally on your device, regardless of your location. We don't transfer data across borders because we don't collect or transmit data.

**For EU Users (GDPR Compliance):**
- We don't collect personal data
- No data processing occurs on our end
- You have full control over your local data
- No consent needed since we don't collect data

## Contact Us

If you have questions about this Privacy Policy or TabEcho's privacy practices:

- **Email**: support@tabecho.com
- **GitHub**: https://github.com/yourusername/tabecho/issues
- **Chrome Web Store**: Leave a review or question

## Transparency

TabEcho is committed to transparency:

- **Open Source**: Our code is available for review (coming soon to GitHub)
- **No Hidden Tracking**: We don't use analytics or tracking
- **Clear Permissions**: We explain exactly why we need each permission
- **Simple Privacy**: We make privacy simple: your data stays with you

---

## Summary

**What TabEcho Does:**
✅ Stores your archived tabs locally on your device
✅ Helps you manage tab overload
✅ Gives you complete control over your data

**What TabEcho Does NOT Do:**
❌ Collect your personal information
❌ Track your browsing activity
❌ Send your data to any server
❌ Share your data with third parties
❌ Use cookies or tracking technologies

**Your data is yours. It stays on your device. We don't want it, need it, or have access to it.**

---

*This privacy policy was last updated on November 25, 2024. If you have concerns about privacy, please contact us before using TabEcho.*
