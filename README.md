# Dynamic Flux Board 🚀

A professional-grade digital signage player and editor for looping images, text, HTML pages, and local directories.

## 🛠️ How to Upload to GitHub (and fix errors)

If you encountered an error while pushing, follow these steps exactly:

### 1. Initialize and Prepare
Open your terminal in this project folder:
```bash
# Remove existing git if any (optional but helps start fresh)
rm -rf .git

# Initialize new git
git init

# Add all files (the .gitignore will automatically skip node_modules)
git add .

# Commit your changes
git commit -m "Initial commit: Dynamic Flux Board"
```

### 2. Connect to GitHub
Go to GitHub, create a **new public repository** named `dynamic-flux-board`, and **do NOT** initialize it with a README or License. Then run:
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/dynamic-flux-board.git

# Set branch to main
git branch -M main
```

### 3. Push to GitHub
```bash
# This sends your code to the cloud
git push -u origin main
```

### ❌ Troubleshooting "Something went wrong"
* **Error: `remote origin already exists`**: Run `git remote remove origin` and then try the `add` command again.
* **Error: `Permission denied (publickey)`**: You might need to use the HTTPS link instead of SSH, or setup your SSH keys.
* **Error: `Updates were rejected because the remote contains work that you do not have locally`**: Run `git pull origin main --rebase` then `git push -u origin main`.
* **Large Files**: If you have huge image files in the folder, Git might struggle. Try to keep local images small or use URLs.

## 🌐 Activating the Live Website
Once pushed:
1. Go to your repo on GitHub.
2. Click **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Your site will be live at `https://YOUR_USERNAME.github.io/dynamic-flux-board/` within a few minutes!
