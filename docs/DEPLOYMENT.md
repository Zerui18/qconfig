# Deploying to GitHub Pages

I have configured your project for automatic deployment to GitHub Pages using GitHub Actions.

## What I Did
1.  **Updated `next.config.ts`**: Enabled static export (`output: 'export'`) and disabled image optimization.
2.  **Created Workflow**: Added `.github/workflows/deploy.yml` to build and deploy your site automatically when you push to `main`.

## What You Need To Do

### 1. Push Changes
Commit and push the new files to your GitHub repository:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push
```

### 2. Configure GitHub Repository
1.  Go to your repository on GitHub.
2.  Navigate to **Settings** > **Pages**.
3.  Under **Build and deployment** > **Source**, select **GitHub Actions**.

### 3. Check Deployment
1.  Go to the **Actions** tab in your repository.
2.  You should see a workflow run named "Deploy to GitHub Pages".
3.  Once it completes (green checkmark), your site will be live!

### Important Note on Base Path
If your repository name is **NOT** `qconfig`, you may need to update the `basePath` in `next.config.ts`.
- If your URL is `https://username.github.io/my-repo/`, set `basePath: '/my-repo'`.
- If you are using a custom domain or `username.github.io` (root), no change is needed.
