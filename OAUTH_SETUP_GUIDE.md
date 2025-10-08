# OAuth Setup Guide for localhost:3000

## ✅ Updated Configuration

The `NEXTAUTH_URL` has been updated to `http://localhost:3000` in your `.env.local` file.

## 🔧 Required OAuth Redirect URI Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project
3. Go to APIs & Services → Credentials
4. Select your OAuth 2.0 client ID
5. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Save the changes

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. Update the **Authorization callback URL** to:
   ```
   http://localhost:3000/api/auth/callback/github
   ```
4. Save the changes

## 🚀 Current Environment Variables

Your `.env.local` now contains:
- ✅ `NEXTAUTH_URL=http://localhost:3000` (Updated)
- ✅ `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (Ready)
- ✅ `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (Ready)

## 🔗 Expected Callback URLs

When you run `npm run dev`, NextAuth will expect:
- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

## ⚠️ Important Notes

1. **Restart your development server** after making these changes:
   ```bash
   npm run dev
   ```

2. **Clear browser cache/cookies** if you experience login issues

3. **Check browser console** for any OAuth-related errors

4. **Verify the OAuth apps** are not restricted to specific domains that exclude localhost

## 🧪 Test the Authentication

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Click the login button
4. Try both Google and GitHub authentication

If you encounter any issues, check the browser console and verify that the redirect URIs match exactly in both Google Cloud Console and GitHub Developer Settings.