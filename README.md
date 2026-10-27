# HOT HAVEN - Streaming Portal

High-definition video catalog and streaming portal with offline support and Firestore synchronization.

## 🔐 Admin Access (Secure Login — Read This First)

The admin panel is protected by **Firebase Authentication (email + password)**. The password is verified
server-side by Firebase and **never appears in the source code or the compiled JavaScript bundle**,
so nobody can discover it by inspecting the site.

### One-time setup (required):
1. Open the [Firebase Console](https://console.firebase.google.com/) → select your project
   (`gen-lang-client-0307870632`).
2. Go to **Build → Authentication → Sign-in method** and enable the **Email/Password** provider.
3. Go to **Authentication → Users → Add user** and create your admin account
   (any email you control + a strong password).
4. Open the site, tap the HOTHAVEN logo **3 times** (header or footer) to open the admin panel,
   then sign in with that email + password.

> If you skip steps 2–3, sign-in will fail with "Invalid email or password".

## ✨ Auto-Fetch Video Details

In the admin panel, paste a **plain video URL** (Pornhub, XVideos, SpankBang, RedTube, KVS-style sites,
YouTube, Vimeo, or any page) and the app automatically fills in:

- **Title** (from `og:title` / page title)
- **Thumbnail** (from `og:image`)
- **Duration** (when the page exposes it)

Metadata is fetched best-effort through a fallback chain of read-only metadata providers
(microlink → allorigins → corsproxy → r.jina.ai). If all providers are blocked for a site,
fill the fields manually — the embed URL itself is still parsed locally and always works.
The same auto-fetch runs for the 10-slot **Batch Upload** and the quick-paste box.

## 🚀 GitHub Pages Deployment Guide

If you upload this repository to GitHub and want it hosted on **GitHub Pages** without a white screen:

### Option 1: Automatic Deployment with GitHub Actions (Recommended)
1. Push this repository to GitHub on `main` or `master` branch.
2. Go to your repository on GitHub -> **Settings** -> **Pages** (in the left sidebar).
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build and publish the site.

### Option 2: Manual Build Upload (Branch Deployment)
If you prefer deploying from a branch:
1. Run `npm run build` locally.
2. Upload the contents of the generated `dist/` folder directly to your repository's `gh-pages` branch or root folder.
3. In **Settings** -> **Pages**, choose deploy from branch `gh-pages` / root.

---

## 🛠️ Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
