# Soham's Portfolio - Unified Vue.js Application

A modern portfolio website built with Vue.js and integrated Express.js backend for live status integrations.

## 🚀 Features

- **Vue.js Frontend**: Modern reactive UI with Vue Router
- **Integrated Backend**: Express.js API routes within the same project
- **Live Integrations**: Real-time Discord, Spotify, and AniList status
- **Interactive Terminal**: Full-featured terminal simulator
- **Responsive Design**: Works on all devices
- **Unified Deployment**: Single Vercel deployment for both frontend and backend

## 🛠️ Tech Stack

- Vue.js 3 with Composition API
- Vue Router for navigation
- Tailwind CSS for styling
- Vite for build tooling
- Express.js for API routes
- Axios for API calls

## 📁 Project Structure

```bash
├── src/                # Vue.js frontend
│   ├── components/     # Reusable Vue components
│   ├── views/          # Page components
│   ├── services/       # API service layer
│   └── utils/          # Utility functions
├── server/             # Express.js backend
│   ├── routes/         # API route handlers
│   └── index.js        # Main server file
├── public/             # Static assets
├── package.json        # Unified dependencies
└── vercel.json         # Deployment config
```

## 🚀 Development Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

   Required for Discord status:

   ```bash
   DISCORD_BOT_TOKEN=your_bot_token
   DISCORD_GUILD_ID=your_guild_id
   DISCORD_USER_ID=target_user_id
   ```

3. **Start development (frontend + backend):**

   ```bash
   npm run dev:full
   ```

   Or run separately:

   ```bash
   # Frontend only
   npm run dev
   
   # Backend only
   npm run server
   ```

## 🌐 Deployment

1. **Build and deploy:**

   ```bash
   ./deploy.sh
   ```

2. **Set environment variables in Vercel:**

   ```bash
   vercel env add SPOTIFY_CLIENT_ID
   vercel env add SPOTIFY_CLIENT_SECRET
   vercel env add SPOTIFY_REFRESH_TOKEN
   vercel env add DISCORD_BOT_TOKEN
   vercel env add DISCORD_GUILD_ID
   vercel env add DISCORD_USER_ID
   ```

## 🎵 API Integrations

### Spotify Setup

1. **Create Spotify App:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create new app with required scopes:
     - `user-read-currently-playing`
     - `user-read-playback-state`
     - `user-read-recently-played`

2. **Get Refresh Token:**
   - Use the authorization flow to get a refresh token
   - Store it as `SPOTIFY_REFRESH_TOKEN` environment variable

### AniList Integration

- Uses public GraphQL API
- No authentication required for public user data

### Discord Status

Uses a live Discord bot to read presence from a guild member.

1. Create a bot at the [Discord Developer Portal](https://discord.com/developers/applications) and copy the bot token.
2. Enable `PRESENCE INTENT` and `SERVER MEMBERS INTENT` in the bot settings.
3. Invite the bot to your guild with scope `bot` and permissions `View Server Insights` (presence) and `Read Members`.
4. Fill `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, and `DISCORD_USER_ID` in your `.env`.
5. The API at `/api/discord/status` now returns live status, activities, avatar, and banner for the configured user.

## 🖥️ Terminal Commands

The interactive terminal supports various commands:

- `help` - Show all available commands
- `neofetch` - Display system information
- `spotify` / `music` - Show current Spotify track
- `ls`, `cd`, `pwd` - File system navigation
- `cowsay [text]` - ASCII cow says something
- `fortune` - Random programming quotes
- `clear` - Clear terminal
- `exit` - Return to portfolio

## 📝 Changes Made

### Unified Structure Benefits

- **Single deployment** - Frontend and backend deploy together
- **Simplified development** - One project, one set of dependencies
- **Integrated routing** - API routes handled by Vite proxy in development
- **Cleaner architecture** - No separate frontend/backend coordination needed

### Key Improvements

1. **Unified project structure** for easier maintenance
2. **Integrated API service** with relative paths
3. **Single Vercel deployment** configuration
4. **Simplified development workflow**
5. **Clean, minimal code** following Vue.js best practices

## 📄 License

MIT License - feel free to use this for your own portfolio!

---

Built with ❤️ by Soham using Vue.js and Express.js
