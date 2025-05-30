# Render Deployment Guide

This guide will help you deploy your URL Viewer application to Render.

## Prerequisites

1. A Render account (free tier available)
2. Your Telegram Bot Token
3. Your Telegram Chat ID
4. This repository pushed to GitHub/GitLab

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in Render:

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID
- `NODE_ENV` - Set to "production"
- `PORT` - Will be automatically set by Render to 10000

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab including the `render.yaml` file
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect the `render.yaml` configuration
6. Set your environment variables in the Render dashboard
7. Deploy

### Option B: Manual Web Service Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure the following settings:
   - **Name**: `url-viewer-app`
   - **Environment**: `Node`
   - **Region**: Choose your preferred region
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or your preferred plan)

5. Set Environment Variables:
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `TELEGRAM_CHAT_ID`: Your chat ID
   - `NODE_ENV`: production

6. Click "Create Web Service"

## Step 3: Configure Your Domain

After deployment, Render will provide you with a URL like:
`https://your-app-name.onrender.com`

## Step 4: Verify Deployment

1. Visit your deployed URL
2. Test the webview functionality
3. Check that the Telegram bot integration works
4. Verify the status dashboard displays correctly

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **App Won't Start**: Verify environment variables are set correctly
3. **Telegram Bot Not Working**: Ensure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
4. **Port Issues**: Render automatically sets PORT to 10000

### Checking Logs:

1. Go to your service in Render dashboard
2. Click on "Logs" tab to see deployment and runtime logs
3. Look for any error messages

## Features Available After Deployment:

- Full webview functionality with iframe display
- Real-time status dashboard with refresh count
- Telegram bot remote control
- Auto-scroll and auto-refresh capabilities
- Background persistence
- WebSocket communication for live updates

## Cost:

- Free tier includes 750 hours per month
- App will sleep after 15 minutes of inactivity on free tier
- Consider upgrading to paid plan for 24/7 availability

## Support:

If you encounter issues, check the Render documentation or contact support through their dashboard.