# HOT HAVEN - Streaming Portal

High-definition video catalog and streaming portal with offline support and Firestore synchronization.

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
