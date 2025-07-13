# Production Deployment Guide

## Frontend (Vercel) Deployment

### 1. Environment Variables Setup
In your Vercel dashboard, add the following environment variable:
- **Key**: `VITE_API_URL`
- **Value**: `https://flashcard-maker-backend.onrender.com`
- **Environment**: Production

### 2. Build Settings
Vercel should automatically detect this as a Vite project. If not, configure:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Root Directory
If deploying from a monorepo, set the root directory to: `frontend`

## Backend (Render) Deployment

### 1. Update your Render app name
Replace `flashcard-maker-backend` in the following files with your actual Render app name:
- `frontend/.env.production`
- `frontend/vite.config.js` (fallback URL)
- `frontend/src/services/api.js` (fallback URL)

### 2. Environment Variables
In your Render dashboard, ensure these environment variables are set:
- `OPENAI_API_KEY`: Your OpenAI API key
- `ALLOWED_ORIGINS`: `https://flashcard-maker-lyart.vercel.app`

### 3. Verify CORS Configuration
The backend should automatically pick up the ALLOWED_ORIGINS from environment variables.

## Deployment Steps

### For Frontend:
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to Vercel
```

### For Backend:
```bash
cd backend
# Push to your connected Git repository
# Render will automatically deploy
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Verify ALLOWED_ORIGINS is set correctly in Render
   - Check that your frontend URL matches exactly

2. **API Not Found (404)**
   - Verify the backend URL is correct
   - Check that the backend is running on Render
   - Ensure the /v1 prefix is included in API calls

3. **Environment Variables Not Working**
   - Ensure VITE_API_URL is set in Vercel
   - Variables must start with VITE_ to be accessible in frontend
   - Rebuild after changing environment variables

### Testing API Connection:
You can test the API connection by opening browser dev tools and checking the console for "API Configuration" log message.

### Health Check:
Once deployed, test the backend health by visiting:
`https://your-render-app-name.onrender.com/v1/health` (if you have a health endpoint)
