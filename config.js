/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           SHADOW WEB SCRAPER - CONFIGURATION                 ║
 * ║              Premium Telegram Bot v1.0.0                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();

// ─── BOT CONFIGURATION ───
const config = {
  // Bot Identity
  botName: "Shadow Web Scraper",
  version: "1.0.0",
  developer: {
    name: "Shadow Developer",
    username: "@shadowdeveloper",
    bio: "Full Stack Developer | Bot Maker | Web Scraper Expert",
    website: "https://shadowdev.example.com",
    email: "shadow@example.com",
    social: {
      telegram: "https://t.me/shadowdeveloper",
      youtube: "https://youtube.com/@shadowdeveloper",
      whatsapp: "https://wa.me/1234567890",
      github: "https://github.com/shadowdeveloper",
      instagram: "https://instagram.com/shadowdeveloper"
    }
  },

  // Bot Settings
  botToken: process.env.BOT_TOKEN || "",
  port: process.env.PORT || 3000,
  ownerIds: (process.env.OWNER_IDS || "").split(",").map(id => id.trim()).filter(Boolean),

  // Required Channels for Verification
  channels: {
    telegram: process.env.TELEGRAM_CHANNEL || "@shadowtechhub",
    youtube: process.env.YOUTUBE_CHANNEL || "@shadowtechyoutube",
    whatsapp: process.env.WHATSAPP_CHANNEL || "@shadowtechwhatsapp"
  },

  // Scraping Settings
  scraper: {
    maxDepth: 2,                    // Max link depth to follow
    maxPages: 50,                   // Max pages per scrape
    maxFileSize: 50 * 1024 * 1024, // 50MB max file
    requestTimeout: 30000,          // 30 seconds timeout
    concurrentDownloads: 5,         // Parallel downloads
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    retryAttempts: 3,               // Retry failed downloads
    retryDelay: 2000,               // 2 seconds between retries
    allowedExtensions: [
      '.html', '.htm', '.css', '.js', '.json', '.xml',
      '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
      '.woff', '.woff2', '.ttf', '.eot', '.otf',
      '.mp4', '.webm', '.mp3', '.wav', '.pdf'
    ]
  },

  // File Paths
  paths: {
    data: "./data",
    users: "./data/users.json",
    owners: "./data/owners.json",
    scrapes: "./data/scrapes.json",
    stats: "./data/stats.json",
    bots: "./data/bots.json",
    sessions: "./data/sessions.json",
    downloads: "./data/downloads",
    temp: "./data/temp"
  },

  // UI Messages
  messages: {
    start: `
╔════════════════════════════════════════╗
║     ⚡ SHADOW WEB SCRAPER ⚡           ║
║     v1.0.0 - Premium Edition           ║
╚════════════════════════════════════════╝

🤖 Welcome! I'm your personal Web Scraper Bot.

📋 To use me, you must join our channels first:

1️⃣ Telegram Channel
2️⃣ YouTube Channel  
3️⃣ WhatsApp Channel

✅ After joining, click the "✅ Verify" button below!`,

    intro: `
╔════════════════════════════════════════╗
║  👨‍💻 DEVELOPER INTRODUCTION              ║
╚════════════════════════════════════════╝

👤 Name: {name}
📝 Bio: {bio}
💻 Version: {version}

🌐 Social Media:
• Telegram: {telegram}
• YouTube: {youtube}
• WhatsApp: {whatsapp}
• GitHub: {github}
• Instagram: {instagram}

🚀 Ready to scrape any website!
`,

    menu: `
╔════════════════════════════════════════╗
║     📊 MAIN MENU                         ║
╚════════════════════════════════════════╝

Welcome back, {name}! 👋

Choose an option below:`,

    userMenu: `
╔════════════════════════════════════════╗
║     👤 USER MENU                         ║
╚════════════════════════════════════════╝

🌐 Web Scraping Options:

🆕 /scrapnew - Scrape a new website
📁 /oldscraped - View your scraped websites
📊 /mystatics - Your scraping statistics

Just send me a website URL to start scraping!`,

    ownerMenu: `
╔════════════════════════════════════════╗
║     🔐 OWNER MENU                        ║
╚════════════════════════════════════════╝

Admin Commands:

📢 /broadcast - Send message to all users
📈 /botstatics - Bot usage statistics
👥 /userlist - List all registered users
➕ /addowner - Add new owner (reply to user)
🤖 /addbottoken - Clone bot with new token
🗑 /cleardata - Clear old scraped data

⚠️ These commands are owner-only!`,

    scraping: `
⏳ Starting scrape for:
🌐 {url}

📊 This may take a few moments...

⏱ Estimated time: ~2-5 minutes`,

    scrapeSuccess: `
✅ Scraping Complete!

🌐 URL: {url}
📄 Pages: {pages}
📦 Size: {size}
⏱ Time: {time}

Your offline website is ready!`,

    broadcastHelp: `
📢 Broadcast Command

Usage: /broadcast Your message here

Features:
• Supports HTML formatting
• Sends to all registered users
• Shows delivery report

Example: /broadcast Hello everyone!`,

    addOwnerHelp: `
➕ Add Owner Command

Usage: Reply to a user's message with /addowner
Or: /addowner <user_chat_id>

This gives the user access to Owner Menu.`,

    addBotTokenHelp: `
🤖 Add Bot Token Command

Usage: /addbottoken YOUR_BOT_TOKEN

This will clone your bot with the new token.
The new bot will have all features of this bot!`,

    notAuthorized: `
⛔ Access Denied!

You are not authorized to use this command.
This is an owner-only feature.

Contact: {developer}`,

    verifyPrompt: `
🔒 Verification Required!

Please join all 3 channels to continue:

1️⃣ Telegram Channel
2️⃣ YouTube Channel
3️⃣ WhatsApp Channel

Then click ✅ Verify button below.`,

    notJoined: `
❌ You haven't joined all channels yet!

Please join:
{channels}

Then click ✅ Verify again.`,

    verified: `
🎉 Verification Successful!

Welcome to Shadow Web Scraper! ⚡

You now have full access to all features.
`,

    statsTemplate: `
╔════════════════════════════════════════╗
║     📊 YOUR STATISTICS                    ║
╚════════════════════════════════════════╝

👤 User: {name}
🆔 ID: {id}
📅 Joined: {joined}

📊 Scraping Stats:
• Total Scrapes: {totalScrapes}
• Total Pages: {totalPages}
• Total Data: {totalData}

🏆 Ranking: {rank}
`,

    botStatsTemplate: `
╔════════════════════════════════════════╗
║     🤖 BOT STATISTICS                     ║
╚════════════════════════════════════════╝

📅 Uptime: {uptime}

👥 Users:
• Total Users: {totalUsers}
• Active Today: {activeToday}
• New Today: {newToday}

📊 Scraping:
• Total Scrapes: {totalScrapes}
• Total Pages: {totalPages}
• Total Data: {totalData}

🤖 Cloned Bots: {clonedBots}
👑 Owners: {owners}
`
  }
};

module.exports = config;
