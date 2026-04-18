/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      SHADOW WEB SCRAPER - BOT HANDLERS                       ║
 * ║     Message Handlers, Commands & Callback Queries            ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const path = require('path');
const fs = require('fs-extra');
const config = require('../config');
const db = require('./database');
const kb = require('./keyboard');
const tpl = require('./templates');
const { scrapeWebsite } = require('../scraper/engine');

// ─── State Management ───
const userStates = new Map();

function setState(chatId, state) {
  userStates.set(chatId, state);
}

function getState(chatId) {
  return userStates.get(chatId) || null;
}

function clearState(chatId) {
  userStates.delete(chatId);
}

// ─── Send Message Helper ───
async function sendMessage(bot, chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    // Retry without HTML if parsing fails
    if (error.message.includes('parse')) {
      return await bot.sendMessage(chatId, text.replace(/<[^>]*>/g, ''), options);
    }
  }
}

// ─── Edit Message Helper ───
async function editMessage(bot, chatId, messageId, text, options = {}) {
  try {
    return await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    });
  } catch (error) {
    console.error('Edit message error:', error.message);
  }
}

// ─── Check Channel Membership ───
async function checkChannelMembership(bot, chatId, channel) {
  try {
    const channelUsername = channel.startsWith('@') ? channel : `@${channel}`;
    const member = await bot.getChatMember(channelUsername, chatId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error(`Error checking membership for ${channel}:`, error.message);
    return false;
  }
}

// ─── Verify All Channels ───
async function verifyAllChannels(bot, chatId) {
  const channels = [
    { key: 'telegram', value: config.channels.telegram },
    { key: 'youtube', value: config.channels.youtube },
    { key: 'whatsapp', value: config.channels.whatsapp }
  ];
  
  const notJoined = [];
  
  for (const channel of channels) {
    const isMember = await checkChannelMembership(bot, chatId, channel.value);
    if (!isMember) {
      notJoined.push(channel.key);
    }
  }
  
  return notJoined;
}

// ─── /START Command ───
async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  // Add user to database
  db.addUser({
    chatId,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name
  });
  
  // Check if verified
  const isVerified = db.isUserVerified(chatId);
  
  if (isVerified) {
    // Show main menu
    await sendMessage(bot, chatId, tpl.getMainMenu(user.first_name), {
      reply_markup: kb.getMainMenuKeyboard()
    });
  } else {
    // Show channel join requirement
    await sendMessage(bot, chatId, tpl.getStartMessage(user.first_name), {
      reply_markup: kb.getChannelJoinKeyboard()
    });
  }
}

// ─── /HELP Command ───
async function handleHelp(bot, msg) {
  const chatId = msg.chat.id;
  await sendMessage(bot, chatId, tpl.getHelpMessage(), {
    reply_markup: kb.getBackKeyboard('main_menu')
  });
}

// ─── Text Message Handler ───
async function handleText(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = msg.from;
  
  // Check verification
  if (!db.isUserVerified(chatId)) {
    await sendMessage(bot, chatId, tpl.getStartMessage(user.first_name), {
      reply_markup: kb.getChannelJoinKeyboard()
    });
    return;
  }
  
  // Check user state
  const state = getState(chatId);
  
  // Handle broadcast message
  if (state === 'broadcast') {
    await handleBroadcastMessage(bot, chatId, text);
    clearState(chatId);
    return;
  }
  
  // Handle add owner
  if (state === 'add_owner') {
    await handleAddOwnerInput(bot, chatId, text);
    clearState(chatId);
    return;
  }
  
  // Handle add bot token
  if (state === 'add_bot_token') {
    await handleAddBotTokenInput(bot, chatId, text);
    clearState(chatId);
    return;
  }
  
  // Handle scraping URL
  if (state === 'scraping_url') {
    clearState(chatId);
    await handleScrapeUrl(bot, chatId, text);
    return;
  }
  
  // Check if message is a URL
  if (isValidUrl(text)) {
    await handleScrapeUrl(bot, chatId, text);
    return;
  }
  
  // Unknown command
  await sendMessage(bot, chatId, `
${kb.EMOJI.warning} <b>Unknown command!</b>

${kb.EMOJI.bulb} Send me a website URL to scrape
or use the menu buttons.

${kb.EMOJI.link} /help for all commands`, {
    reply_markup: kb.getMainMenuKeyboard()
  });
}

// ─── Callback Query Handler ───
async function handleCallback(bot, query) {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const user = query.from;
  
  // Answer callback
  await bot.answerCallbackQuery(query.id);
  
  // Check verification for non-verification callbacks
  if (data !== 'verify_join' && !db.isUserVerified(chatId)) {
    await editMessage(bot, chatId, messageId, tpl.getStartMessage(user.first_name), {
      reply_markup: kb.getChannelJoinKeyboard()
    });
    return;
  }
  
  switch (data) {
    case 'verify_join':
      await handleVerifyJoin(bot, chatId, messageId, user);
      break;
    case 'main_menu':
      await editMessage(bot, chatId, messageId, tpl.getMainMenu(user.first_name), {
        reply_markup: kb.getMainMenuKeyboard()
      });
      break;
    case 'user_menu':
      await editMessage(bot, chatId, messageId, tpl.getUserMenu(), {
        reply_markup: kb.getUserMenuKeyboard()
      });
      break;
    case 'owner_menu':
      await handleOwnerMenu(bot, chatId, messageId, user);
      break;
    case 'developer_info':
      await editMessage(bot, chatId, messageId, tpl.getDeveloperIntro(), {
        reply_markup: kb.getBackKeyboard('main_menu')
      });
      break;
    case 'stats_menu':
      await handleStatsMenu(bot, chatId, messageId);
      break;
    case 'scrap_new':
      await handleScrapNew(bot, chatId, messageId);
      break;
    case 'old_scraped':
      await handleOldScraped(bot, chatId, messageId);
      break;
    case 'my_statics':
      await handleMyStatics(bot, chatId, messageId);
      break;
    case 'broadcast':
      await handleBroadcast(bot, chatId, messageId);
      break;
    case 'bot_statics':
      await handleBotStatics(bot, chatId, messageId);
      break;
    case 'user_list':
      await handleUserList(bot, chatId, messageId);
      break;
    case 'add_owner':
      await handleAddOwner(bot, chatId, messageId);
      break;
    case 'add_bot_token':
      await handleAddBotToken(bot, chatId, messageId);
      break;
    case 'cancel_action':
      clearState(chatId);
      await editMessage(bot, chatId, messageId, tpl.getMainMenu(user.first_name), {
        reply_markup: kb.getMainMenuKeyboard()
      });
      break;
    case 'quick_scrap_help':
      await editMessage(bot, chatId, messageId, tpl.getScrapingSteps(), {
        reply_markup: kb.getBackKeyboard('user_menu')
      });
      break;
    default:
      // Handle paginated callbacks
      if (data.startsWith('scrapes_page_')) {
        const page = parseInt(data.replace('scrapes_page_', ''));
        await handleOldScraped(bot, chatId, messageId, page);
      } else if (data.startsWith('users_page_')) {
        const page = parseInt(data.replace('users_page_', ''));
        await handleUserList(bot, chatId, messageId, page);
      } else if (data.startsWith('view_scrape_')) {
        const scrapeId = data.replace('view_scrape_', '');
        await handleViewScrape(bot, chatId, messageId, scrapeId);
      } else if (data.startsWith('download_scrape_')) {
        const scrapeId = data.replace('download_scrape_', '');
        await handleDownloadScrape(bot, chatId, scrapeId);
      } else if (data.startsWith('delete_scrape_')) {
        const scrapeId = data.replace('delete_scrape_', '');
        await handleDeleteScrape(bot, chatId, messageId, scrapeId);
      } else if (data.startsWith('confirm_delete_')) {
        const scrapeId = data.replace('confirm_delete_', '');
        await handleConfirmDelete(bot, chatId, messageId, scrapeId);
      } else if (data === 'broadcast_confirm') {
        await handleBroadcastConfirm(bot, chatId, messageId);
      } else if (data === 'refresh_users') {
        await handleUserList(bot, chatId, messageId, 0);
      } else if (data === 'user_detail') {
        // Handle user detail view
      }
      break;
  }
}

// ─── Verify Join Handler ───
async function handleVerifyJoin(bot, chatId, messageId, user) {
  const notJoined = await verifyAllChannels(bot, chatId);
  
  if (notJoined.length === 0) {
    // All channels joined
    db.verifyUser(chatId);
    
    await editMessage(bot, chatId, messageId, tpl.getVerificationSuccess(), {
      reply_markup: {
        inline_keyboard: [
          [{ text: `${kb.EMOJI.rocket} Continue`, callback_data: 'main_menu' }]
        ]
      }
    });
  } else {
    await editMessage(bot, chatId, messageId, tpl.getNotJoinedMessage(notJoined), {
      reply_markup: kb.getChannelJoinKeyboard()
    });
  }
}

// ─── Owner Menu ───
async function handleOwnerMenu(bot, chatId, messageId, user) {
  if (!db.isOwner(chatId)) {
    await bot.answerCallbackQuery(query.id, { text: '⛔ Owner only!', show_alert: true });
    await editMessage(bot, chatId, messageId, tpl.getUnauthorized(), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
    return;
  }
  
  await editMessage(bot, chatId, messageId, tpl.getOwnerMenu(), {
    reply_markup: kb.getOwnerMenuKeyboard()
  });
}

// ─── Stats Menu ───
async function handleStatsMenu(bot, chatId, messageId) {
  const stats = db.getStats();
  const users = db.getUsers();
  const scrapes = db.getAllScrapes();
  const bots = db.getBots();
  
  await editMessage(bot, chatId, messageId, tpl.getBotStats(stats, users, scrapes, bots), {
    reply_markup: kb.getBackKeyboard('main_menu')
  });
}

// ─── Scrap New ───
async function handleScrapNew(bot, chatId, messageId) {
  setState(chatId, 'scraping_url');
  
  await editMessage(bot, chatId, messageId, `
${kb.EMOJI.zap}<b>╔══════════════════════════════════════╗</b>
<b>║      ⚡ SCRAP NEW WEBSITE               ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.zap}

${kb.EMOJI.globe} <b>Send me a website URL to scrape!</b>

${kb.EMOJI.bulb} Example: <code>https://example.com</code>
${kb.EMOJI.link} The bot will download the entire website

${kb.EMOJI.cross} Send /cancel to abort`, {
    reply_markup: kb.getCancelKeyboard()
  });
}

// ─── Handle Scrape URL ───
async function handleScrapeUrl(bot, chatId, url) {
  if (!isValidUrl(url)) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>Invalid URL!</b>

${kb.EMOJI.bulb} Please send a valid URL starting with http:// or https://
Example: <code>https://example.com</code>`);
    return;
  }
  
  // Normalize URL
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  // Send initial message
  const progressMsg = await sendMessage(bot, chatId, tpl.getScrapingWaitMessage());
  
  try {
    // Update status
    await editMessage(bot, chatId, progressMsg.message_id, `
${kb.EMOJI.rocket}<b>╔══════════════════════════════════════╗</b>
<b>║      ⏳ SCRAPING WEBSITE...             ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.rocket}

${kb.EMOJI.globe} <b>URL:</b> <code>${url}</code>
${kb.EMOJI.time} <b>Status:</b> <i>Initializing browser...</i>

${kb.EMOJI.hourglass} Please wait...`);
    
    // Start scraping
    const outputDir = path.join(config.paths.downloads, `scrape_${chatId}_${Date.now()}`);
    
    const result = await scrapeWebsite(url, outputDir, {
      maxDepth: config.scraper.maxDepth,
      maxPages: config.scraper.maxPages,
      maxFileSize: config.scraper.maxFileSize,
      timeout: config.scraper.requestTimeout,
      concurrentDownloads: config.scraper.concurrentDownloads,
      userAgent: config.scraper.userAgent
    });
    
    if (result.success) {
      // Save scrape to database
      const scrapeRecord = db.addScrape({
        chatId,
        url: result.url,
        domain: result.domain,
        pages: result.pages,
        size: result.size,
        zipPath: result.zipPath,
        duration: result.duration
      });
      
      // Update user stats
      db.updateUserStats(chatId, result.pages, result.size);
      
      // Update global stats
      db.updateGlobalStats(result.pages, result.size);
      
      // Update progress message
      await editMessage(bot, chatId, progressMsg.message_id, tpl.getScrapingSuccess(result));
      
      // Send ZIP file
      if (fs.existsSync(result.zipPath)) {
        await bot.sendDocument(chatId, result.zipPath, {
          caption: `
${kb.EMOJI.package} <b>Shadow Web Scraper - Download</b>

${kb.EMOJI.globe} <b>Website:</b> <code>${result.domain}</code>
${kb.EMOJI.file} <b>Pages:</b> <code>${result.pages}</code>
${kb.EMOJI.package} <b>Size:</b> <code>${tpl.formatBytes(result.size)}</code>

${kb.EMOJI.bulb} Extract the ZIP and open index.html
${kb.EMOJI.fire} Website works completely offline!`,
          parse_mode: 'HTML'
        });
      }
    } else {
      await editMessage(bot, chatId, progressMsg.message_id, tpl.getScrapingError(url, result.error || 'Unknown error'));
    }
    
  } catch (error) {
    await editMessage(bot, chatId, progressMsg.message_id, tpl.getScrapingError(url, error.message));
  }
}

// ─── Old Scraped ───
async function handleOldScraped(bot, chatId, messageId, page = 0) {
  const scrapes = db.getScrapes(chatId);
  
  await editMessage(bot, chatId, messageId, tpl.getScrapedList(scrapes, page), {
    reply_markup: kb.getScrapedListKeyboard(scrapes, page)
  });
}

// ─── View Scrape Detail ───
async function handleViewScrape(bot, chatId, messageId, scrapeId) {
  const scrapes = db.getScrapes(chatId);
  const scrape = scrapes.find(s => s.id === scrapeId);
  
  if (!scrape) {
    await editMessage(bot, chatId, messageId, `
${kb.EMOJI.cross} <b>Scrape not found!</b>`, {
      reply_markup: kb.getBackKeyboard('old_scraped')
    });
    return;
  }
  
  const status = fs.existsSync(scrape.zipPath) ? `${kb.EMOJI.check} Available` : `${kb.EMOJI.cross} File Deleted`;
  
  await editMessage(bot, chatId, messageId, `
${kb.EMOJI.globe}<b>╔══════════════════════════════════════╗</b>
<b>║      🌐 SCRAPE DETAILS                  ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.globe}

${kb.EMOJI.link} <b>URL:</b> <code>${scrape.url}</code>
${kb.EMOJI.web} <b>Domain:</b> <code>${scrape.domain}</code>

${kb.EMOJI.chart} <b>Details:</b>
┌─────────────────────────────
${kb.EMOJI.file} <b>Pages:</b> <code>${scrape.pages}</code>
${kb.EMOJI.package} <b>Size:</b> <code>${tpl.formatBytes(scrape.size)}</code>
${kb.EMOJI.clock} <b>Duration:</b> <code>${tpl.formatDuration(scrape.duration || 0)}</code>
${kb.EMOJI.calendar} <b>Date:</b> <code>${new Date(scrape.completedAt).toLocaleString()}</code>
${kb.EMOJI.check} <b>Status:</b> ${status}
└─────────────────────────────`, {
    reply_markup: kb.getScrapeDetailKeyboard(scrapeId)
  });
}

// ─── Download Scrape ───
async function handleDownloadScrape(bot, chatId, scrapeId) {
  const scrapes = db.getScrapes(chatId);
  const scrape = scrapes.find(s => s.id === scrapeId);
  
  if (!scrape || !fs.existsSync(scrape.zipPath)) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>File not found!</b>

The ZIP file may have been deleted or expired.`);
    return;
  }
  
  await bot.sendDocument(chatId, scrape.zipPath, {
    caption: `
${kb.EMOJI.package} <b>Shadow Web Scraper - Download</b>

${kb.EMOJI.globe} <b>Website:</b> <code>${scrape.domain}</code>
${kb.EMOJI.file} <b>Pages:</b> <code>${scrape.pages}</code>
${kb.EMOJI.package} <b>Size:</b> <code>${tpl.formatBytes(scrape.size)}</code>

${kb.EMOJI.bulb} Extract and open index.html to view offline!`,
    parse_mode: 'HTML'
  });
}

// ─── Delete Scrape ───
async function handleDeleteScrape(bot, chatId, messageId, scrapeId) {
  await editMessage(bot, chatId, messageId, `
${kb.EMOJI.warning}<b>╔══════════════════════════════════════╗</b>
<b>║      ⚠️ CONFIRM DELETE                  ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.warning}

${kb.EMOJI.cross} Are you sure you want to delete this scrape?

${kb.EMOJI.trash} This action cannot be undone!`, {
    reply_markup: kb.getConfirmDeleteKeyboard(scrapeId)
  });
}

// ─── Confirm Delete ───
async function handleConfirmDelete(bot, chatId, messageId, scrapeId) {
  const scrapes = db.getScrapes(chatId);
  const scrape = scrapes.find(s => s.id === scrapeId);
  
  if (scrape && scrape.zipPath && fs.existsSync(scrape.zipPath)) {
    fs.removeSync(scrape.zipPath);
  }
  
  // Remove from database
  const data = require('./database').readJson(config.paths.scrapes) || { scrapes: [] };
  data.scrapes = data.scrapes.filter(s => !(s.id === scrapeId && s.chatId === chatId));
  require('./database').writeJson(config.paths.scrapes, data);
  
  await editMessage(bot, chatId, messageId, `
${kb.EMOJI.check}<b>╔══════════════════════════════════════╗</b>
<b>║      ✅ SCRAPE DELETED                  ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.check}

${kb.EMOJI.trash} The scrape has been deleted successfully.`, {
    reply_markup: kb.getBackKeyboard('old_scraped')
  });
}

// ─── My Statics ───
async function handleMyStatics(bot, chatId, messageId) {
  const user = db.getUser(chatId);
  
  if (!user) {
    await editMessage(bot, chatId, messageId, `
${kb.EMOJI.cross} <b>User not found!</b>`, {
      reply_markup: kb.getBackKeyboard('user_menu')
    });
    return;
  }
  
  await editMessage(bot, chatId, messageId, tpl.getUserStats(user), {
    reply_markup: kb.getBackKeyboard('user_menu')
  });
}

// ─── Broadcast ───
async function handleBroadcast(bot, chatId, messageId) {
  if (!db.isOwner(chatId)) {
    await editMessage(bot, chatId, messageId, tpl.getUnauthorized(), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
    return;
  }
  
  setState(chatId, 'broadcast');
  
  await editMessage(bot, chatId, messageId, tpl.getBroadcastHelp(), {
    reply_markup: kb.getCancelKeyboard()
  });
}

// ─── Handle Broadcast Message ───
async function handleBroadcastMessage(bot, chatId, message) {
  // Store message for confirmation
  db.setSession(chatId, { broadcastMessage: message });
  
  await sendMessage(bot, chatId, tpl.getBroadcastPreview(message), {
    reply_markup: kb.getBroadcastConfirmKeyboard()
  });
}

// ─── Broadcast Confirm ───
async function handleBroadcastConfirm(bot, chatId, messageId) {
  const session = db.getSession(chatId);
  const message = session.broadcastMessage;
  
  if (!message) {
    await editMessage(bot, chatId, messageId, `
${kb.EMOJI.cross} <b>No broadcast message found!</b>

Please start again.`, {
      reply_markup: kb.getBackKeyboard('owner_menu')
    });
    return;
  }
  
  const users = db.getUsers().filter(u => u.isVerified);
  let sent = 0;
  let failed = 0;
  
  // Send progress
  const progressMsg = await sendMessage(bot, chatId, `
${kb.EMOJI.broadcast} <b>Sending to ${users.length} users...</b>

${kb.EMOJI.time} Please wait...`);
  
  for (const user of users) {
    try {
      await bot.sendMessage(user.chatId, message, { parse_mode: 'HTML' });
      sent++;
    } catch {
      failed++;
    }
    
    // Update progress every 10 users
    if ((sent + failed) % 10 === 0) {
      await editMessage(bot, chatId, progressMsg.message_id, `
${kb.EMOJI.broadcast} <b>Sending...</b>

${kb.EMOJI.check} Sent: ${sent}
${kb.EMOJI.cross} Failed: ${failed}
${kb.EMOJI.users} Total: ${users.length}`);
    }
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Delete progress message
  try {
    await bot.deleteMessage(chatId, progressMsg.message_id);
  } catch {}
  
  // Send report
  await editMessage(bot, chatId, messageId, tpl.getBroadcastReport(sent, failed, users.length), {
    reply_markup: kb.getBackKeyboard('owner_menu')
  });
  
  // Clear session
  db.clearSession(chatId);
}

// ─── Bot Statics ───
async function handleBotStatics(bot, chatId, messageId) {
  if (!db.isOwner(chatId)) {
    await editMessage(bot, chatId, messageId, tpl.getUnauthorized(), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
    return;
  }
  
  const stats = db.getStats();
  const users = db.getUsers();
  const scrapes = db.getAllScrapes();
  const bots = db.getBots();
  
  await editMessage(bot, chatId, messageId, tpl.getBotStats(stats, users, scrapes, bots), {
    reply_markup: kb.getBackKeyboard('owner_menu')
  });
}

// ─── User List ───
async function handleUserList(bot, chatId, messageId, page = 0) {
  if (!db.isOwner(chatId)) {
    await editMessage(bot, chatId, messageId, tpl.getUnauthorized(), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
    return;
  }
  
  const users = db.getUsers();
  
  await editMessage(bot, chatId, messageId, tpl.getUserList(users, page), {
    reply_markup: kb.getUserListKeyboard(users, page)
  });
}

// ─── Add Owner ───
async function handleAddOwner(bot, chatId, messageId) {
  if (!db.isOwner(chatId)) {
    await editMessage(bot, chatId, messageId, tpl.getUnauthorized(), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
    return;
  }
  
  setState(chatId, 'add_owner');
  
  await editMessage(bot, chatId, messageId, `
${kb.EMOJI.add}<b>╔══════════════════════════════════════╗</b>
<b>║      ➕ ADD NEW OWNER                   ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.add}

${kb.EMOJI.bulb} Send the <b>Chat ID</b> of the user you want to make owner.

${kb.EMOJI.info} The user must have started the bot first.

${kb.EMOJI.cross} Send /cancel to abort.`, {
    reply_markup: kb.getCancelKeyboard()
  });
}

// ─── Handle Add Owner Input ───
async function handleAddOwnerInput(bot, chatId, text) {
  const targetChatId = parseInt(text.trim());
  
  if (isNaN(targetChatId)) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>Invalid Chat ID!</b>

Please send a valid numeric Chat ID.`);
    return;
  }
  
  const targetUser = db.getUser(targetChatId);
  
  if (!targetUser) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>User not found!</b>

The user must have started the bot first.
Ask them to send /start to the bot.`);
    return;
  }
  
  if (db.isOwner(targetChatId)) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.warning} <b>User is already an owner!</b>`);
    return;
  }
  
  const success = db.addOwner(targetChatId, chatId);
  
  if (success) {
    await sendMessage(bot, chatId, tpl.getAddOwnerSuccess(targetChatId, targetUser.firstName || targetUser.username));
    
    // Notify the new owner
    await sendMessage(bot, targetChatId, `
${kb.EMOJI.crown}<b>╔══════════════════════════════════════╗</b>
<b>║      👑 YOU ARE NOW AN OWNER!           ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.crown}

${kb.EMOJI.shield} You have been promoted to <b>Owner</b>!

${kb.EMOJI.bulb} You now have access to:
• Broadcast messages
• Bot statistics
• User list
• Add more owners
• Clone bots

${kb.EMOJI.warning} Use your powers wisely!`);
  } else {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>Failed to add owner!</b>

Please try again.`);
  }
}

// ─── Add Bot Token ───
async function handleAddBotToken(bot, chatId, messageId) {
  if (!db.isOwner(chatId)) {
    await editMessage(bot, chatId, messageId, tpl.getUnauthorized(), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
    return;
  }
  
  setState(chatId, 'add_bot_token');
  
  await editMessage(bot, chatId, messageId, `
${kb.EMOJI.robot}<b>╔══════════════════════════════════════╗</b>
<b>║      🤖 CLONE YOUR BOT                  ║</b>
<b>╚══════════════════════════════════════╝</b>${kb.EMOJI.robot}

${kb.EMOJI.bulb} Send the <b>Bot Token</b> from @BotFather.

${kb.EMOJI.info} The new bot will have all features:
• Web Scraping
• Channel Verification
• All Menus & Commands

${kb.EMOJI.warning} The bot must not be already running.

${kb.EMOJI.cross} Send /cancel to abort.`, {
    reply_markup: kb.getCancelKeyboard()
  });
}

// ─── Handle Add Bot Token Input ───
async function handleAddBotTokenInput(bot, chatId, token) {
  // Validate token format
  if (!token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>Invalid Bot Token!</b>

Token format: <code>123456789:ABCdefGHIjklMNOpqrSTU</code>

Get a token from @BotFather`);
    return;
  }
  
  // Test the token
  const TelegramBot = require('node-telegram-bot-api');
  
  try {
    const testBot = new TelegramBot(token, { polling: false });
    const botInfo = await testBot.getMe();
    
    // Save bot to database
    db.addBot(token, chatId);
    
    const bots = db.getBots();
    
    await sendMessage(bot, chatId, tpl.getAddBotSuccess(bots.length));
    
    // Start the cloned bot
    await startClonedBot(token, botInfo);
    
  } catch (error) {
    await sendMessage(bot, chatId, `
${kb.EMOJI.cross} <b>Invalid Bot Token!</b>

${kb.EMOJI.warning} Error: <code>${error.message}</code>

${kb.EMOJI.bulb} Please check:
• Token is correct
• Bot is not already running
• You got the token from @BotFather`);
  }
}

// ─── Start Cloned Bot ───
async function startClonedBot(token, botInfo) {
  const TelegramBot = require('node-telegram-bot-api');
  const clonedBot = new TelegramBot(token, { polling: true });
  
  // Reuse all handlers from main bot
  clonedBot.onText(/\/start/, (msg) => handleStart(clonedBot, msg));
  clonedBot.onText(/\/help/, (msg) => handleHelp(clonedBot, msg));
  clonedBot.onText(/\/scrapnew/, (msg) => {
    setState(msg.chat.id, 'scraping_url');
    sendMessage(clonedBot, msg.chat.id, `
${kb.EMOJI.zap} <b>Scrap New Website</b>

Send me a website URL to scrape!`, {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  clonedBot.onText(/\/oldscraped/, async (msg) => {
    const scrapes = db.getScrapes(msg.chat.id);
    await sendMessage(clonedBot, msg.chat.id, tpl.getScrapedList(scrapes), {
      reply_markup: kb.getScrapedListKeyboard(scrapes)
    });
  });
  clonedBot.onText(/\/mystatics/, async (msg) => {
    const user = db.getUser(msg.chat.id);
    await sendMessage(clonedBot, msg.chat.id, tpl.getUserStats(user), {
      reply_markup: kb.getBackKeyboard('main_menu')
    });
  });
  clonedBot.onText(/\/broadcast/, async (msg) => {
    if (!db.isOwner(msg.chat.id)) {
      await sendMessage(clonedBot, msg.chat.id, tpl.getUnauthorized());
      return;
    }
    setState(msg.chat.id, 'broadcast');
    await sendMessage(clonedBot, msg.chat.id, tpl.getBroadcastHelp(), {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  clonedBot.onText(/\/botstatics/, async (msg) => {
    if (!db.isOwner(msg.chat.id)) {
      await sendMessage(clonedBot, msg.chat.id, tpl.getUnauthorized());
      return;
    }
    const stats = db.getStats();
    const users = db.getUsers();
    const scrapes = db.getAllScrapes();
    await sendMessage(clonedBot, msg.chat.id, tpl.getBotStats(stats, users, scrapes, []), {
      reply_markup: kb.getBackKeyboard('owner_menu')
    });
  });
  clonedBot.onText(/\/userlist/, async (msg) => {
    if (!db.isOwner(msg.chat.id)) {
      await sendMessage(clonedBot, msg.chat.id, tpl.getUnauthorized());
      return;
    }
    const users = db.getUsers();
    await sendMessage(clonedBot, msg.chat.id, tpl.getUserList(users), {
      reply_markup: kb.getUserListKeyboard(users)
    });
  });
  clonedBot.onText(/\/addowner/, (msg) => {
    if (!db.isOwner(msg.chat.id)) {
      sendMessage(clonedBot, msg.chat.id, tpl.getUnauthorized());
      return;
    }
    setState(msg.chat.id, 'add_owner');
    sendMessage(clonedBot, msg.chat.id, 'Send the Chat ID of the user to make owner:', {
      reply_markup: kb.getCancelKeyboard()
    });
  });
  
  // Text handler
  clonedBot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
      handleText(clonedBot, msg);
    }
  });
  
  // Callback handler
  clonedBot.on('callback_query', (query) => {
    handleCallback(clonedBot, query);
  });
  
  console.log(`[Clone] Bot @${botInfo.username} started successfully!`);
}

// ─── Utility: Check Valid URL ───
function isValidUrl(string) {
  try {
    const url = string.startsWith('http') ? string : 'https://' + string;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  handleStart,
  handleHelp,
  handleText,
  handleCallback,
  setState,
  getState,
  clearState,
  sendMessage
};
