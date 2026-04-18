#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           SHADOW WEB SCRAPER - MAIN ENTRY POINT              ║
 * ║                Premium Telegram Bot v1.0.0                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const db = require('./modules/database');
const { startServer } = require('./website/server');
const {
  handleStart,
  handleHelp,
  handleText,
  handleCallback,
  clearState
} = require('./modules/handlers');

// ─── Print Banner ───
function printBanner() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           ⚡ SHADOW WEB SCRAPER ⚡                            ║
║           Premium Telegram Bot v${config.version}                       ║
║                                                              ║
║   Features:                                                  ║
║   • Complete Website Offline Downloading                     ║
║   • ZIP Export with Local Paths                              ║
║   • Bot Cloning (Multi-Bot Support)                          ║
║   • Premium UI with Animations                               ║
║   • JSON-Based Storage (No Database Required)                ║
║   • Railway Deployment Ready                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

// ─── Main Function ───
async function main() {
  printBanner();
  
  // ─── Validate Configuration ───
  if (!config.botToken || config.botToken === 'your_main_bot_token_here') {
    console.error('❌ Error: BOT_TOKEN not configured!');
    console.log('📝 Set BOT_TOKEN in .env file or environment variables');
    process.exit(1);
  }
  
  // ─── Initialize Database ───
  console.log('📦 Initializing database...');
  db.initDatabase();
  console.log('✅ Database ready!');
  
  // ─── Start Health Check Server ───
  console.log('🌐 Starting health check server...');
  startServer();
  
  // ─── Initialize Bot ───
  console.log('🤖 Starting Telegram bot...');
  
  const bot = new TelegramBot(config.botToken, {
    polling: true,
    request: {
      timeout: 30000,
      retry: 3
    }
  });
  
  // ─── Bot Event Handlers ───
  
  // /start command
  bot.onText(/^\/start$/, (msg) => {
    handleStart(bot, msg);
  });
  
  // /help command
  bot.onText(/^\/help$/, (msg) => {
    handleHelp(bot, msg);
  });
  
  // /scrapnew command
  bot.onText(/^\/scrapnew$/, (msg) => {
    const chatId = msg.chat.id;
    clearState(chatId);
    
    // Import handler
    const { setState } = require('./modules/handlers');
    setState(chatId, 'scraping_url');
    
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    
    sendMessage(bot, chatId, `
${kb.EMOJI.zap}<b>╔══════════════════════════════════════╗</b>
<b>║      ⚡ SCRAP NEW WEBSITE               ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.zap}

${kb.EMOJI.globe} <b>Send me a website URL!</b>

${kb.EMOJI.bulb} Example: <code>https://example.com</code>
${kb.EMOJI.link} I'll download the complete website

${kb.EMOJI.cross} Send /cancel to abort`, {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  
  // /oldscraped command
  bot.onText(/^\/oldscraped$/, async (msg) => {
    const chatId = msg.chat.id;
    const scrapes = db.getScrapes(chatId);
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    const tpl = require('./modules/templates');
    
    await sendMessage(bot, chatId, tpl.getScrapedList(scrapes), {
      reply_markup: kb.getScrapedListKeyboard(scrapes)
    });
  });
  
  // /mystatics command
  bot.onText(/^\/mystatics$/, async (msg) => {
    const chatId = msg.chat.id;
    const user = db.getUser(chatId);
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    const tpl = require('./modules/templates');
    
    await sendMessage(bot, chatId, tpl.getUserStats(user), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
  });
  
  // /broadcast command (owner only)
  bot.onText(/^\/broadcast$/, (msg) => {
    const chatId = msg.chat.id;
    if (!db.isOwner(chatId)) return;
    
    clearState(chatId);
    const { setState } = require('./modules/handlers');
    setState(chatId, 'broadcast');
    
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    const tpl = require('./modules/templates');
    
    sendMessage(bot, chatId, tpl.getBroadcastHelp(), {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  
  // /botstatics command (owner only)
  bot.onText(/^\/botstatics$/, async (msg) => {
    const chatId = msg.chat.id;
    if (!db.isOwner(chatId)) return;
    
    const stats = db.getStats();
    const users = db.getUsers();
    const scrapes = db.getAllScrapes();
    const bots = db.getBots();
    
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    const tpl = require('./modules/templates');
    
    await sendMessage(bot, chatId, tpl.getBotStats(stats, users, scrapes, bots), {
      reply_markup: kb.getBackKeyboard('owner_menu')
    });
  });
  
  // /userlist command (owner only)
  bot.onText(/^\/userlist$/, async (msg) => {
    const chatId = msg.chat.id;
    if (!db.isOwner(chatId)) return;
    
    const users = db.getUsers();
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    const tpl = require('./modules/templates');
    
    await sendMessage(bot, chatId, tpl.getUserList(users), {
      reply_markup: kb.getUserListKeyboard(users)
    });
  });
  
  // /addowner command (owner only)
  bot.onText(/^\/addowner$/, (msg) => {
    const chatId = msg.chat.id;
    if (!db.isOwner(chatId)) return;
    
    clearState(chatId);
    const { setState } = require('./modules/handlers');
    setState(chatId, 'add_owner');
    
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    
    sendMessage(bot, chatId, `
${kb.EMOJI.add}<b>╔══════════════════════════════════════╗</b>
<b>║      ➕ ADD NEW OWNER                   ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.add}

${kb.EMOJI.bulb} Send the <b>Chat ID</b> of the user.

${kb.EMOJI.cross} Send /cancel to abort.`, {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  
  // /addbottoken command (owner only)
  bot.onText(/^\/addbottoken$/, (msg) => {
    const chatId = msg.chat.id;
    if (!db.isOwner(chatId)) return;
    
    clearState(chatId);
    const { setState } = require('./modules/handlers');
    setState(chatId, 'add_bot_token');
    
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    
    sendMessage(bot, chatId, `
${kb.EMOJI.robot}<b>╔══════════════════════════════════════╗</b>
<b>║      🤖 CLONE YOUR BOT                  ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.robot}

${kb.EMOJI.bulb} Send the <b>Bot Token</b> from @BotFather.

${kb.EMOJI.cross} Send /cancel to abort.`, {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  
  // /cancel command
  bot.onText(/^\/cancel$/, (msg) => {
    const chatId = msg.chat.id;
    clearState(chatId);
    
    const { sendMessage } = require('./modules/handlers');
    const kb = require('./modules/keyboard');
    
    sendMessage(bot, chatId, `
${kb.EMOJI.check} <b>Action cancelled!</b>

What would you like to do?`, {
      reply_markup: kb.getMainMenuKeyboard()
    });
  });
  
  // Handle text messages
  bot.on('message', (msg) => {
    // Only handle text messages that aren't commands
    if (msg.text && !msg.text.startsWith('/')) {
      handleText(bot, msg);
    }
  });
  
  // Handle callback queries
  bot.on('callback_query', (query) => {
    handleCallback(bot, query);
  });
  
  // Handle polling errors
  bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
  });
  
  // Handle webhook errors
  bot.on('webhook_error', (error) => {
    console.error('Webhook error:', error.message);
  });
  
  // ─── Bot Info ───
  const botInfo = await bot.getMe();
  console.log(`✅ Bot started: @${botInfo.username}`);
  console.log(`📝 Bot Name: ${botInfo.first_name}`);
  console.log(`🆔 Bot ID: ${botInfo.id}`);
  console.log('');
  console.log('🚀 Shadow Web Scraper is now running!');
  console.log('⏳ Waiting for messages...');
  console.log('');
  
  // ─── Load Cloned Bots ───
  console.log('🤖 Loading cloned bots...');
  const bots = db.getBots();
  
  for (const botData of bots) {
    try {
      const TelegramBot = require('node-telegram-bot-api');
      const clonedBot = new TelegramBot(botData.token, { polling: true });
      const clonedInfo = await clonedBot.getMe();
      console.log(`  ✅ @${clonedInfo.username} - Online`);
      
      // Wire handlers for cloned bot
      clonedBot.onText(/\/start/, (msg) => handleStart(clonedBot, msg));
      clonedBot.onText(/\/help/, (msg) => handleHelp(clonedBot, msg));
      clonedBot.on('message', (msg) => {
        if (msg.text && !msg.text.startsWith('/')) {
          handleText(clonedBot, msg);
        }
      });
      clonedBot.on('callback_query', (query) => {
        handleCallback(clonedBot, query);
      });
    } catch (error) {
      console.log(`  ❌ Failed to load bot: ${error.message}`);
    }
  }
  
  if (bots.length === 0) {
    console.log('  ℹ️ No cloned bots found');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
}

// ─── Error Handlers ───
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep running despite errors
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep running despite errors
});

// ─── Graceful Shutdown ───
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// ─── Start ───
main().catch(error => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});
