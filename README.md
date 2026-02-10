# Daily Tasks

A beautiful, minimal daily to-do list with weekly focus planning and GitHub Gist cloud sync.

## Features

- ✅ Simple task management (add, complete, delete)
- 📅 Weekly focus planning (set daily themes)
- ☁️ GitHub Gist sync (cloud backup across devices)
- 💾 LocalStorage backup
- 🎨 Beautiful, minimal design with Playfair Display and Inter fonts

## Deploy to GitHub Pages

### 1. Create a new repository on GitHub
- Go to github.com and create a new repository named `daily-tasks`
- Don't initialize with README, .gitignore, or license

### 2. Push your code
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Add your repository
git remote add origin https://github.com/YOUR-USERNAME/daily-tasks.git
git push -u origin main
```

### 3. Install dependencies
```bash
npm install
```

### 4. Update the base path in vite.config.js
Replace `daily-tasks` with your actual repository name:
```javascript
base: '/YOUR-REPO-NAME/',
```

### 5. Deploy
```bash
npm run deploy
```

### 6. Enable GitHub Pages
- Go to your repository → Settings → Pages
- Source: Deploy from a branch
- Branch: `gh-pages` → `/ (root)` → Save

Your app will be live at: `https://YOUR-USERNAME.github.io/daily-tasks`

## Local Development

```bash
npm run dev
```

Open http://localhost:5173

## GitHub Gist Sync Setup

1. **Create Personal Access Token:**
   - GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with **gist** scope

2. **Create Private Gist:**
   - Go to gist.github.com
   - Create new **private** Gist
   - Filename: `tasks.json`
   - Content: `{}`
   - Copy the Gist ID from URL

3. **Configure in App:**
   - Click Settings (⚙️) in the app
   - Paste token and Gist ID
   - Click "Save & Sync"

## Update Deployment

Whenever you make changes:
```bash
npm run deploy
```

## License

MIT
