# Shadow Web Scraper v1.0.0

> Premium Telegram Bot - Complete Website Offline Downloader with Bot Cloning

## Features

- **Website Scraping** - Download complete websites as offline ZIP files
- **Offline Ready** - All resources (HTML, CSS, JS, images, fonts) converted to local paths
- **Bot Cloning** - Add any bot token to clone your bot with all features
- **Channel Verification** - Users must join channels before using the bot
- **Premium UI** - Beautiful animated keyboards and styled messages
- **JSON Storage** - No database required, all data stored in JSON files
- **Owner System** - Add unlimited owners with admin privileges
- **Broadcast** - Send messages to all users
- **Railway Ready** - One-click deploy to Railway with zero config

## Quick Deploy

### Railway (Recommended)

1. Fork this repository to your GitHub
2. Go to [Railway](https://railway.app) and create new project
3. Connect your GitHub repository
4. Add environment variables (see below)
5. Deploy!

### Environment Variables

Create a `.env` file with:

```env
# Required - Get from @BotFather
BOT_TOKEN=your_bot_token_here

# Required - Your Telegram Chat ID
OWNER_IDS=your_chat_id

# Required - Channel usernames (users must join these)
TELEGRAM_CHANNEL=@your_tg_channel
YOUTUBE_CHANNEL=@your_yt_channel
WHATSAPP_CHANNEL=@your_wa_channel

# Required - Port for Railway
PORT=3000
```

### Local Run

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Start the bot
npm start
```

## Commands

### User Commands
- `/start` - Start the bot
- `/scrapnew` - Scrape a new website
- `/oldscraped` - View your scraped websites
- `/mystatics` - Your scraping statistics
- `/help` - Show help

### Owner Commands
- `/broadcast` - Send message to all users
- `/botstatics` - Bot statistics
- `/userlist` - List all users
- `/addowner` - Add new owner
- `/addbottoken` - Clone bot with new token

## How to Use

1. Start bot with `/start`
2. Join all 3 required channels
3. Click Verify button
4. Send any website URL to scrape
5. Download the ZIP file
6. Extract and open `index.html` offline!

## Tech Stack

- Node.js 18+
- node-telegram-bot-api
- Puppeteer (Headless Chrome)
- Cheerio (HTML Parsing)
- Archiver (ZIP Creation)
- Express (Health Check Server)

## License

MIT
