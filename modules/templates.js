/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       SHADOW WEB SCRAPER - MESSAGE TEMPLATES                 ║
 * ║         Premium Styled Messages with Animations               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const config = require('../config');
const { EMOJI } = require('./keyboard');

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Channel Join Message ───
function getStartMessage(userName) {
  return `
${EMOJI.moon}<b>╔══════════════════════════════════════╗</b>
<b>║     ⚡ SHADOW WEB SCRAPER ⚡          ║</b>
<b>║        v${config.version} - Premium            ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.moon}

${EMOJI.wave} <b>Welcome, ${escapeHtml(userName)}!</b>

${EMOJI.shield} I'm your personal <b>Web Scraper Bot</b>.
${EMOJI.globe} I can download <b>complete websites</b> as offline ZIP files!

${EMOJI.lock} <b>To continue, join all channels:</b>

${EMOJI.satellite} <b>1.</b> Telegram Channel
${EMOJI.tv} <b>2.</b> YouTube Channel  
${EMOJI.phone} <b>3.</b> WhatsApp Channel

${EMOJI.check} After joining, click <b>"✅ Verify"</b> below!`;
}

// ─── Developer Introduction ───
function getDeveloperIntro() {
  const dev = config.developer;
  return `
${EMOJI.sparkles}<b>╔══════════════════════════════════════╗</b>
<b>║  👨‍💻 DEVELOPER INTRODUCTION           ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.sparkles}

${EMOJI.user} <b>Name:</b> <code>${escapeHtml(dev.name)}</code>
${EMOJI.code} <b>Bio:</b> <i>${escapeHtml(dev.bio)}</i>
${EMOJI.fire} <b>Version:</b> <code>${config.version}</code>

${EMOJI.link} <b>Social Media:</b>
┌─────────────────────────────
${EMOJI.satellite} <b>Telegram:</b> <a href="${dev.social.telegram}">Click Here</a>
${EMOJI.tv} <b>YouTube:</b> <a href="${dev.social.youtube}">Click Here</a>
${EMOJI.phone} <b>WhatsApp:</b> <a href="${dev.social.whatsapp}">Click Here</a>
${EMOJI.code} <b>GitHub:</b> <a href="${dev.social.github}">Click Here</a>
${EMOJI.camera} <b>Instagram:</b> <a href="${dev.social.instagram}">Click Here</a>
└─────────────────────────────

${EMOJI.rocket} <b>Ready to scrape any website!</b>
${EMOJI.magic} Send me a URL to get started.`;
}

// ─── Main Menu ───
function getMainMenu(userName) {
  return `
${EMOJI.shadow}<b>╔══════════════════════════════════════╗</b>
<b>║         📊 MAIN MENU                  ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.shadow}

${EMOJI.wave} Welcome back, <b>${escapeHtml(userName)}</b>!

${EMOJI.magic} Choose an option below:`;
}

// ─── User Menu ───
function getUserMenu() {
  return `
${EMOJI.user}<b>╔══════════════════════════════════════╗</b>
<b>║         👤 USER MENU                  ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.user}

${EMOJI.globe} <b>Web Scraping Options:</b>

${EMOJI.zap} <b>/scrapnew</b> - Scrape a new website
${EMOJI.folder} <b>/oldscraped</b> - View your scraped websites
${EMOJI.chart} <b>/mystatics</b> - Your scraping statistics

${EMOJI.fire} <b>Quick Start:</b> Just send me any website URL!`;
}

// ─── Owner Menu ───
function getOwnerMenu() {
  return `
${EMOJI.crown}<b>╔══════════════════════════════════════╗</b>
<b>║         🔐 OWNER MENU                 ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.crown}

${EMOJI.shield} <b>Admin Commands:</b>

${EMOJI.broadcast} <b>/broadcast</b> - Send message to all users
${EMOJI.chart} <b>/botstatics</b> - Bot usage statistics
${EMOJI.users} <b>/userlist</b> - List all registered users
${EMOJI.add} <b>/addowner</b> - Add new owner
${EMOJI.robot} <b>/addbottoken</b> - Clone bot with new token

${EMOJI.warning} These commands are <b>owner-only!</b>`;
}

// ─── Scraping Progress ───
function getScrapingProgress(url, status) {
  const domain = new URL(url).hostname;
  return `
${EMOJI.rocket}<b>╔══════════════════════════════════════╗</b>
<b>║      ⚡ SCRAPING IN PROGRESS           ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.rocket}

${EMOJI.globe} <b>URL:</b> <code>${escapeHtml(url)}</code>
${EMOJI.web} <b>Domain:</b> <code>${escapeHtml(domain)}</code>
${EMOJI.time} <b>Status:</b> <i>${status || 'Initializing...'}</i>

${EMOJI.hourglass} Please wait, this may take a few moments...`;
}

// ─── Scraping Success ───
function getScrapingSuccess(result) {
  const pages = result.pages || 0;
  const size = formatBytes(result.size || 0);
  const time = formatDuration(result.duration || 0);
  return `
${EMOJI.check}<b>╔══════════════════════════════════════╗</b>
<b>║      ✅ SCRAPING COMPLETE!              ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.check}

${EMOJI.globe} <b>URL:</b> <code>${escapeHtml(result.url)}</code>
${EMOJI.web} <b>Domain:</b> <code>${escapeHtml(result.domain)}</code>

${EMOJI.chart} <b>Stats:</b>
┌─────────────────────────────
${EMOJI.file} <b>Pages Scraped:</b> <code>${pages}</code>
${EMOJI.package} <b>Total Size:</b> <code>${size}</code>
${EMOJI.clock} <b>Time Taken:</b> <code>${time}</code>
${EMOJI.calendar} <b>Completed:</b> <code>${new Date().toLocaleString()}</code>
└─────────────────────────────

${EMOJI.download} Your offline website ZIP is ready!
${EMOJI.fire} <b>Extract and open index.html to view!</b>`;
}

// ─── Scraping Error ───
function getScrapingError(url, error) {
  return `
${EMOJI.cross}<b>╔══════════════════════════════════════╗</b>
<b>║      ❌ SCRAPING FAILED                 ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.cross}

${EMOJI.globe} <b>URL:</b> <code>${escapeHtml(url)}</code>
${EMOJI.warning} <b>Error:</b> <i>${escapeHtml(error)}</i>

${EMOJI.bulb} <b>Tips:</b>
• Make sure the URL is valid
• Some sites block scrapers
• Try with http:// instead of https://
• Check if the site is accessible`;
}

// ─── User Statistics ───
function getUserStats(user) {
  const name = user.firstName || user.username || 'User';
  const joined = new Date(user.joinedAt).toLocaleDateString();
  const totalScrapes = user.totalScrapes || 0;
  const totalPages = user.totalPages || 0;
  const totalData = formatBytes(user.totalData || 0);
  
  let rank = '🥉 Bronze';
  if (totalScrapes >= 50) rank = '💎 Diamond';
  else if (totalScrapes >= 20) rank = '🥇 Gold';
  else if (totalScrapes >= 10) rank = '🥈 Silver';

  return `
${EMOJI.chart}<b>╔══════════════════════════════════════╗</b>
<b>║       📊 YOUR STATISTICS               ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.chart}

${EMOJI.user} <b>User:</b> <code>${escapeHtml(name)}</code>
🆔 <b>ID:</b> <code>${user.chatId}</code>
${EMOJI.calendar} <b>Joined:</b> <code>${joined}</code>

${EMOJI.target} <b>Scraping Stats:</b>
┌─────────────────────────────
${EMOJI.file} <b>Total Scrapes:</b> <code>${totalScrapes}</code>
${EMOJI.web} <b>Total Pages:</b> <code>${totalPages}</code>
${EMOJI.package} <b>Total Data:</b> <code>${totalData}</code>
└─────────────────────────────

${EMOJI.trophy} <b>Ranking:</b> <code>${rank}</b>`;
}

// ─── Bot Statistics ───
function getBotStats(stats, users, scrapes, bots) {
  const uptime = formatDuration(Date.now() - (stats.startTime || Date.now()));
  const totalUsers = users.length;
  const totalScrapes = scrapes.length;
  const totalPages = scrapes.reduce((sum, s) => sum + (s.pages || 0), 0);
  const totalData = formatBytes(scrapes.reduce((sum, s) => sum + (s.size || 0), 0));
  const clonedBots = bots.length;
  const owners = config.ownerIds.length;

  // Active today
  const today = new Date().toDateString();
  const activeToday = users.filter(u => {
    const lastActive = u.lastActive ? new Date(u.lastActive).toDateString() : '';
    return lastActive === today;
  }).length;
  const newToday = users.filter(u => {
    const joined = u.joinedAt ? new Date(u.joinedAt).toDateString() : '';
    return joined === today;
  }).length;

  return `
${EMOJI.bot}<b>╔══════════════════════════════════════╗</b>
<b>║        🤖 BOT STATISTICS                ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.bot}

${EMOJI.clock} <b>Uptime:</b> <code>${uptime}</code>

${EMOJI.users} <b>Users:</b>
┌─────────────────────────────
${EMOJI.user} <b>Total Users:</b> <code>${totalUsers}</code>
${EMOJI.fire} <b>Active Today:</b> <code>${activeToday}</code>
${EMOJI.sparkles} <b>New Today:</b> <code>${newToday}</code>
└─────────────────────────────

${EMOJI.target} <b>Scraping:</b>
┌─────────────────────────────
${EMOJI.file} <b>Total Scrapes:</b> <code>${totalScrapes}</code>
${EMOJI.web} <b>Total Pages:</b> <code>${totalPages}</code>
${EMOJI.package} <b>Total Data:</b> <code>${totalData}</code>
└─────────────────────────────

${EMOJI.robot} <b>Cloned Bots:</b> <code>${clonedBots}</code>
${EMOJI.crown} <b>Owners:</b> <code>${owners}</code>`;
}

// ─── Scraped List ───
function getScrapedList(scrapes, page = 0) {
  const perPage = 5;
  const totalPages = Math.ceil(scrapes.length / perPage);
  
  if (scrapes.length === 0) {
    return `
${EMOJI.folder}<b>╔══════════════════════════════════════╗</b>
<b>║      📁 YOUR SCRAPED WEBSITES           ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.folder}

${EMOJI.warning} No scraped websites found!

${EMOJI.bulb} Use <b>"Scrap New Web"</b> to download a website.`;
  }

  let list = `
${EMOJI.folder}<b>╔══════════════════════════════════════╗</b>
<b>║      📁 YOUR SCRAPED WEBSITES           ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.folder}

${EMOJI.file} <b>Total:</b> <code>${scrapes.length}</code> websites
${EMOJI.web} <b>Page:</b> <code>${page + 1}/${totalPages}</code>

<b>Your Downloads:</b>
`;

  const start = page * perPage;
  const end = start + perPage;
  const pageScrapes = scrapes.slice(start, end);

  pageScrapes.forEach((scrape, idx) => {
    const domain = escapeHtml(scrape.domain || 'Unknown');
    const date = new Date(scrape.completedAt).toLocaleDateString();
    const size = formatBytes(scrape.size || 0);
    const pages = scrape.pages || 0;
    list += `\n${EMOJI.globe} <b>${start + idx + 1}.</b> <code>${domain}</code>
${EMOJI.file} Pages: ${pages} | ${EMOJI.package} ${size} | ${EMOJI.calendar} ${date}`;
  });

  return list;
}

// ─── Broadcast Help ───
function getBroadcastHelp() {
  return `
${EMOJI.broadcast}<b>╔══════════════════════════════════════╗</b>
<b>║       📢 BROADCAST MESSAGE              ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.broadcast}

${EMOJI.bulb} <b>Send your message now!</b>

${EMOJI.info} Supports HTML formatting:
&lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;code&gt;code&lt;/code&gt;

${EMOJI.warning} This will send to <b>ALL</b> users.

${EMOJI.cross} Send /cancel to abort.`;
}

// ─── Broadcast Preview ───
function getBroadcastPreview(message) {
  return `
${EMOJI.broadcast}<b>╔══════════════════════════════════════╗</b>
<b>║    📢 BROADCAST PREVIEW                 ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.broadcast}

<b>Your message:</b>
─────────────────────────
${message}
─────────────────────────

${EMOJI.check} Click <b>"✅ Send Now"</b> to broadcast
${EMOJI.cross} Click <b>"❌ Cancel"</b> to abort`;
}

// ─── Broadcast Report ───
function getBroadcastReport(sent, failed, total) {
  return `
${EMOJI.check}<b>╔══════════════════════════════════════╗</b>
<b>║    ✅ BROADCAST COMPLETE                ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.check}

${EMOJI.users} <b>Total Users:</b> <code>${total}</code>
${EMOJI.check} <b>Sent:</b> <code>${sent}</code>
${EMOJI.cross} <b>Failed:</b> <code>${failed}</code>

${EMOJI.chart} <b>Success Rate:</b> <code>${((sent/total)*100).toFixed(1)}%</code>`;
}

// ─── User List ───
function getUserList(users, page = 0) {
  const perPage = 8;
  const totalPages = Math.ceil(users.length / perPage);
  
  let list = `
${EMOJI.users}<b>╔══════════════════════════════════════╗</b>
<b>║       👥 REGISTERED USERS               ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.users}

${EMOJI.user} <b>Total:</b> <code>${users.length}</code> users
${EMOJI.web} <b>Page:</b> <code>${page + 1}/${totalPages}</code>

`;

  const start = page * perPage;
  const end = start + perPage;
  const pageUsers = users.slice(start, end);

  pageUsers.forEach((user, idx) => {
    const name = escapeHtml(user.firstName || user.username || 'Unknown');
    const status = user.isVerified ? `${EMOJI.check} Verified` : `${EMOJI.cross} Unverified`;
    list += `<b>${start + idx + 1}.</b> ${name} (ID: <code>${user.chatId}</code>) ${status}\n`;
  });

  return list;
}

// ─── Add Owner Success ───
function getAddOwnerSuccess(chatId, name) {
  return `
${EMOJI.check}<b>╔══════════════════════════════════════╗</b>
<b>║      ✅ OWNER ADDED                     ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.check}

${EMOJI.user} <b>User:</b> <code>${escapeHtml(name)}</code>
🆔 <b>Chat ID:</b> <code>${chatId}</code>

${EMOJI.crown} This user now has <b>Owner access!</b>
They can use all admin commands.`;
}

// ─── Add Bot Token Success ───
function getAddBotSuccess(botCount) {
  return `
${EMOJI.robot}<b>╔══════════════════════════════════════╗</b>
<b>║      🤖 BOT CLONED!                     ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.robot}

${EMOJI.check} <b>New bot is now online!</b>

${EMOJI.info} The cloned bot has all features:
• Web Scraping
• Channel Verification
• All Menus & Commands

${EMOJI.robot} <b>Total Cloned Bots:</b> <code>${botCount}</code>

${EMOJI.bulb} Each bot runs independently!`;
}

// ─── Verification Success ───
function getVerificationSuccess() {
  return `
${EMOJI.check}<b>╔══════════════════════════════════════╗</b>
<b>║     ✅ VERIFICATION SUCCESS!            ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.check}

${EMOJI.tada} <b>Welcome to Shadow Web Scraper!</b>

${EMOJI.globe} You now have <b>full access</b> to:
• Download complete websites
• View your scraping history
• Track your statistics

${EMOJI.rocket} Let's get started!`;
}

// ─── Not Joined Message ───
function getNotJoinedMessage(notJoined) {
  const channels = notJoined.map(c => {
    if (c.includes('telegram')) return `${EMOJI.satellite} Telegram Channel`;
    if (c.includes('youtube')) return `${EMOJI.tv} YouTube Channel`;
    if (c.includes('whatsapp')) return `${EMOJI.phone} WhatsApp Channel`;
    return c;
  }).join('\n');

  return `
${EMOJI.cross}<b>╔══════════════════════════════════════╗</b>
<b>║     ❌ VERIFICATION FAILED              ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.cross}

${EMOJI.warning} You haven't joined all channels yet!

${EMOJI.lock} <b>Missing:</b>
${channels}

${EMOJI.bulb} Please join all channels and try again.`;
}

// ─── Unauthorized ───
function getUnauthorized() {
  return `
${EMOJI.cross}<b>╔══════════════════════════════════════╗</b>
<b>║      ⛔ ACCESS DENIED                   ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.cross}

${EMOJI.shield} <b>Owner Only!</b>

${EMOJI.warning} You are not authorized to use this command.

${EMOJI.bulb} Contact: <code>${config.developer.name}</code>`;
}

// ─── Scraping Waiting ───
function getScrapingWaitMessage() {
  return `
${EMOJI.rocket}<b>╔══════════════════════════════════════╗</b>
<b>║     ⏳ SCRAPING WEBSITE...               ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.rocket}

${EMOJI.hourglass} <b>Please wait...</b>

${EMOJI.web} Downloading website resources
${EMOJI.file} Processing HTML/CSS/JS
${EMOJI.package} Creating ZIP file

${EMOJI.time} This usually takes 2-5 minutes`;
}

// ─── Scraping Steps ───
function getScrapingSteps() {
  return `
${EMOJI.bulb}<b>How to Scrape a Website:</b>

<b>Method 1 - Quick Scrap:</b>
${EMOJI.one} Just send any website URL
${EMOJI.two} Bot will auto-detect and scrape
${EMOJI.three} Download your ZIP file

<b>Method 2 - Menu:</b>
${EMOJI.one} Click "User Menu"
${EMOJI.two} Click "Scrap New Web"
${EMOJI.three} Send the website URL
${EMOJI.four} Download your ZIP file

${EMOJI.warning} <b>Note:</b>
• Some sites may block scraping
• Large sites may take longer
• Max 50 pages per scrape`;
}

// ─── Help Message ───
function getHelpMessage() {
  return `
${EMOJI.shadow}<b>╔══════════════════════════════════════╗</b>
<b>║     🆘 HELP & COMMANDS                  ║</b>
<b>╚══════════════════════════════════════╝</b>${EMOJI.shadow}

${EMOJI.user} <b>User Commands:</b>
/start - Start the bot
/scrapnew - Scrape a new website
/oldscraped - View scraped websites
/mystatics - Your statistics
/help - Show this help

${EMOJI.crown} <b>Owner Commands:</b>
/broadcast - Message all users
/botstatics - Bot statistics
/userlist - List users
/addowner - Add new owner
/addbottoken - Clone bot

${EMOJI.globe} <b>Quick:</b> Just send any URL to scrape!`;
}

// ─── Utility: Format Bytes ───
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ─── Utility: Format Duration ───
function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

module.exports = {
  getStartMessage,
  getDeveloperIntro,
  getMainMenu,
  getUserMenu,
  getOwnerMenu,
  getScrapingProgress,
  getScrapingSuccess,
  getScrapingError,
  getUserStats,
  getBotStats,
  getScrapedList,
  getBroadcastHelp,
  getBroadcastPreview,
  getBroadcastReport,
  getUserList,
  getAddOwnerSuccess,
  getAddBotSuccess,
  getVerificationSuccess,
  getNotJoinedMessage,
  getUnauthorized,
  getScrapingWaitMessage,
  getScrapingSteps,
  getHelpMessage,
  formatBytes,
  formatDuration,
  escapeHtml
};
