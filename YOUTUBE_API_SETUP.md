# YouTube API Setup Instructions

## Get Your Free YouTube Data API v3 Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click "Select a project" at the top
   - Create a new project or use an existing one

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "ENABLE"

4. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Save the changes

6. **Add to Your Project**
   - Open your `.env.local` file
   - Replace `your_youtube_api_key_here` with your actual API key:
   ```
   YOUTUBE_API_KEY=AIzaSyDZuzkGHVPi8dqGJy-vQHLeTfnGXXXXXXX
   ```

7. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

## Free Tier Limits
- 10,000 units per day (free)
- Each search costs 100 units
- That's 100 searches per day for free
- More than enough for development and testing

## Test Your API
After setting up, the app will automatically fetch real YouTube videos based on:
- Search query: "{exam} {subject} preparation tutorial exam study"
- Example: "JEE Physics preparation tutorial exam study"

The API will return real video titles, descriptions, thumbnails, and links!