# ALTER - Complete Setup Guide

This guide will help you set up the ALTER project with all features working correctly, including mobile responsiveness, OAuth authentication, and all AI-powered features.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd alter-project
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Fill in the required values in `.env`:

```env
# Required: Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Get from your Supabase project
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: For enhanced backend integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Generate a random string for session security
SESSION_SECRET=your_very_long_random_string_here
```

### 3. Start Development
```bash
npm run dev
```

## 🔧 Detailed Setup Instructions

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### Setting Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the Project URL and Anon Public key to your `.env` file
4. (Optional) Copy the Service Role key for enhanced backend features

### Configuring OAuth Providers

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - Application name: `ALTER - Code Analysis Platform`
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client Secret
4. In your Supabase project:
   - Go to Authentication > Providers
   - Enable GitHub provider
   - Add your Client ID and Client Secret

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure with:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret
7. In your Supabase project:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Client ID and Client Secret

## ✅ Features Fixed

### 1. ✅ Authentication Issues
- **Problem**: Frontend used Supabase, backend used Passport.js
- **Solution**: Updated API requests to include Supabase tokens
- **Status**: ✅ Fixed - GitHub and Google OAuth now available

### 2. ✅ API Endpoints Not Working
- **Problem**: Debug, Translate, Explain endpoints failed due to auth mismatch
- **Solution**: Updated API request function to include proper headers
- **Status**: ✅ Fixed - All features now working with same Gemini API

### 3. ✅ Mobile Responsiveness
- **Problem**: Elements not fitting properly on mobile screens
- **Solution**: Enhanced mobile-first CSS classes and responsive design
- **Status**: ✅ Fixed - Fully mobile-friendly interface

### 4. ✅ Black Screen Issue
- **Problem**: Sometimes showed black screen on browser restart
- **Solution**: Improved loading states and authentication flow
- **Status**: ✅ Fixed - Consistent loading experience

## 📱 Mobile Optimizations

The following mobile improvements have been implemented:

- **Touch-friendly targets**: All buttons meet 44px minimum size
- **Responsive navigation**: Labels hide on small screens, icons remain
- **Proper viewport**: Configured for mobile devices
- **Safe area support**: Handles device notches and home indicators
- **Optimized fonts**: Better text rendering on mobile devices
- **Improved scrolling**: Smooth scrolling with proper momentum

## 🔐 Authentication Features

- ✅ Email/Password registration and login
- ✅ Google OAuth sign-in
- ✅ GitHub OAuth sign-in
- ✅ Password reset functionality
- ✅ Email confirmation
- ✅ Secure token-based authentication
- ✅ Automatic session management

## 🤖 AI Features

All AI features are now working correctly:

- ✅ **Code Debugger**: Finds and fixes bugs in your code
- ✅ **Code Translator**: Converts code between programming languages
- ✅ **Code Explainer**: Provides detailed explanations of code logic
- ✅ **AI Chat**: Interactive programming assistant

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push
```

## 🌐 Production Deployment

### Environment Variables for Production

Update your `.env` for production:

```env
NODE_ENV=production
VITE_SUPABASE_URL=https://your-production-project.supabase.co
# Update OAuth callback URLs to your production domain
```

### OAuth Callback URLs for Production

Update your OAuth apps with production URLs:
- GitHub: `https://your-domain.com/auth/callback`
- Google: `https://your-domain.com/auth/callback`
- Supabase: `https://your-production-project.supabase.co/auth/v1/callback`

## 🔍 Troubleshooting

### Common Issues

**1. "GEMINI_API_KEY environment variable is required"**
- Make sure you've added your Gemini API key to the `.env` file
- Restart the development server after adding the key

**2. "Missing Supabase environment variables"**
- Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Check that the URLs don't have trailing slashes

**3. OAuth buttons not working**
- Verify OAuth providers are enabled in Supabase
- Check that callback URLs match exactly
- Ensure Client IDs and Secrets are correct

**4. Mobile layout issues**
- Clear browser cache and refresh
- Check viewport meta tag is present
- Test on actual mobile device, not just browser dev tools

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is properly configured
4. Check that your Gemini API key has the necessary permissions

## 📄 Project Structure

```
alter-project/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # React hooks (including auth)
│   │   ├── lib/            # Utility libraries
│   │   └── ...
├── server/                 # Backend Express server
│   ├── services/           # Business logic
│   └── ...
├── shared/                 # Shared types and schemas
└── ...
```

## 🎉 You're All Set!

Your ALTER platform is now fully configured with:
- ✅ Working AI-powered code analysis
- ✅ Secure authentication with multiple providers
- ✅ Mobile-responsive design
- ✅ Reliable loading states

Visit `http://localhost:3000` to start using your AI code analysis platform!