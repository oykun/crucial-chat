# AI Design Agency Chatbot

A simple AI-powered chatbot for your design agency website. Built with vanilla HTML/CSS/JavaScript and Vercel serverless functions.

## Features

- Clean, minimal chat interface
- AI responses powered by OpenAI GPT-3.5
- Editable agency information in a simple text file
- Zero framework dependencies (just vanilla JS + OpenAI SDK)
- Deployed on Vercel with custom subdomain support

## Project Structure

```
├── public/
│   ├── index.html          # Chat interface (HTML + CSS + JS)
│   └── agency-info.txt     # Your agency information (edit this!)
├── api/
│   └── chat.js            # Vercel serverless function
├── package.json           # Dependencies (only OpenAI SDK)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Setup Instructions

### 1. Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   Then edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Edit your agency information:**
   Edit `public/agency-info.txt` with information about your design agency.

4. **Test locally:**
   ```bash
   npx vercel dev
   ```
   Visit `http://localhost:3000` to test your chatbot.

### 2. Deploy to GitHub

1. **Initialize git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI chatbot setup"
   ```

2. **Create GitHub repository:**
   - Go to GitHub.com and create a new repository
   - Copy the repository URL

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### 3. Deploy to Vercel

1. **Import project:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

2. **Set environment variables:**
   - In your Vercel project dashboard
   - Go to "Settings" → "Environment Variables"
   - Add: `OPENAI_API_KEY` = `your_actual_api_key_here`
   - Click "Save"

3. **Deploy:**
   - Click "Deploy" (should happen automatically)
   - Wait for deployment to complete
   - Your chatbot will be live at: `https://your-project-name.vercel.app`

### 4. Set Up Custom Subdomain (ailab.oykun.com)

#### Step A: DNS Configuration

1. **Go to your DNS provider** (wherever oykun.com is registered)
2. **Add a CNAME record:**
   - Name: `ailab`
   - Value: `cname.vercel-dns.com`
   - TTL: 3600 (or default)

#### Step B: Vercel Configuration

1. **In your Vercel project dashboard:**
   - Go to "Settings" → "Domains"
   - Click "Add Domain"
   - Enter: `ailab.oykun.com`
   - Click "Add"

2. **Wait for DNS propagation:**
   - This usually takes 5-60 minutes
   - Vercel will automatically configure SSL

3. **Test your subdomain:**
   - Visit `https://ailab.oykun.com`
   - Your chatbot should be live!

## Customizing Your Chatbot

### Update Agency Information

Edit `public/agency-info.txt` with your agency details. The AI will use this information to answer questions about your services.

### Styling

The chat interface uses inline CSS in `public/index.html`. You can modify the styles directly in the `<style>` section.

### AI Behavior

The AI behavior is controlled in `api/chat.js`. You can modify the `systemPrompt` to change how the AI responds.

## Troubleshooting

### Common Issues

1. **"API quota exceeded" error:**
   - Check your OpenAI billing at platform.openai.com
   - Ensure you have credits available

2. **"Invalid API key" error:**
   - Verify your API key in Vercel environment variables
   - Make sure there are no extra spaces or characters

3. **Subdomain not working:**
   - Check DNS propagation at whatsmydns.net
   - Ensure CNAME record is correct: `ailab` → `cname.vercel-dns.com`

4. **Chat not responding:**
   - Check Vercel function logs in the dashboard
   - Verify environment variables are set correctly

### Getting Help

- Check Vercel function logs in your dashboard
- Verify environment variables are set correctly
- Test locally first with `npx vercel dev`

## Cost

- **Vercel:** Free tier (generous limits)
- **OpenAI:** Pay-per-use (very cheap for a small chatbot)
- **Domain:** No additional cost (uses existing oykun.com)

## Security Notes

- Never commit your `.env.local` file to git
- Your OpenAI API key is secure in Vercel environment variables
- The chatbot is read-only and doesn't store any user data
