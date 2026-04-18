/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           SHADOW WEB SCRAPER - JSON DATABASE                 ║
 * ║         No Database Required - Pure JSON Storage              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// ─── Ensure data directories exist ───
function initDatabase() {
  const dirs = [
    config.paths.data,
    config.paths.downloads,
    config.paths.temp
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirsSync(dir);
    }
  });

  // Initialize JSON files with defaults
  const files = [
    { path: config.paths.users, default: { users: [] } },
    { path: config.paths.owners, default: { owners: [] } },
    { path: config.paths.scrapes, default: { scrapes: [] } },
    { path: config.paths.stats, default: { stats: { totalScrapes: 0, totalPages: 0, totalData: 0, startTime: Date.now() } } },
    { path: config.paths.bots, default: { bots: [] } },
    { path: config.paths.sessions, default: { sessions: {} } }
  ];

  files.forEach(({ path: filePath, default: defaultData }) => {
    if (!fs.existsSync(filePath)) {
      fs.writeJsonSync(filePath, defaultData, { spaces: 2 });
    }
  });
}

// ─── Generic JSON CRUD Operations ───
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readJsonSync(filePath);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return null;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeJsonSync(filePath, data, { spaces: 2 });
    return true;
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e.message);
    return false;
  }
}

// ─── USERS ───
function getUsers() {
  const data = readJson(config.paths.users);
  return data ? data.users : [];
}

function getUser(chatId) {
  const users = getUsers();
  return users.find(u => u.chatId === chatId);
}

function addUser(user) {
  const data = readJson(config.paths.users) || { users: [] };
  const existing = data.users.find(u => u.chatId === user.chatId);
  
  if (!existing) {
    data.users.push({
      chatId: user.chatId,
      username: user.username || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      joinedAt: new Date().toISOString(),
      isVerified: false,
      totalScrapes: 0,
      totalPages: 0,
      totalData: 0,
      lastActive: new Date().toISOString()
    });
    writeJson(config.paths.users, data);
    return true;
  }
  return false;
}

function updateUser(chatId, updates) {
  const data = readJson(config.paths.users);
  if (!data) return false;
  
  const idx = data.users.findIndex(u => u.chatId === chatId);
  if (idx !== -1) {
    data.users[idx] = { ...data.users[idx], ...updates, lastActive: new Date().toISOString() };
    writeJson(config.paths.users, data);
    return true;
  }
  return false;
}

function verifyUser(chatId) {
  return updateUser(chatId, { isVerified: true, verifiedAt: new Date().toISOString() });
}

function isUserVerified(chatId) {
  const user = getUser(chatId);
  return user ? user.isVerified : false;
}

function updateUserStats(chatId, pages, dataSize) {
  const user = getUser(chatId);
  if (user) {
    return updateUser(chatId, {
      totalScrapes: (user.totalScrapes || 0) + 1,
      totalPages: (user.totalPages || 0) + pages,
      totalData: (user.totalData || 0) + dataSize
    });
  }
  return false;
}

// ─── OWNERS ───
function getOwners() {
  const data = readJson(config.paths.owners);
  if (!data) return config.ownerIds.map(id => ({ chatId: id, addedAt: new Date().toISOString() }));
  return data.owners;
}

function isOwner(chatId) {
  const owners = getOwners();
  return owners.some(o => o.chatId === chatId) || config.ownerIds.includes(String(chatId));
}

function addOwner(chatId, addedBy) {
  if (isOwner(chatId)) return false;
  
  const data = readJson(config.paths.owners) || { owners: [] };
  data.owners.push({
    chatId,
    addedBy,
    addedAt: new Date().toISOString()
  });
  writeJson(config.paths.owners, data);
  return true;
}

function removeOwner(chatId) {
  const data = readJson(config.paths.owners);
  if (!data) return false;
  data.owners = data.owners.filter(o => o.chatId !== chatId);
  writeJson(config.paths.owners, data);
  return true;
}

// ─── SCRAPES ───
function getScrapes(chatId) {
  const data = readJson(config.paths.scrapes);
  if (!data) return [];
  return data.scrapes.filter(s => s.chatId === chatId);
}

function getAllScrapes() {
  const data = readJson(config.paths.scrapes);
  return data ? data.scrapes : [];
}

function addScrape(scrape) {
  const data = readJson(config.paths.scrapes) || { scrapes: [] };
  data.scrapes.push({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    chatId: scrape.chatId,
    url: scrape.url,
    domain: scrape.domain,
    pages: scrape.pages || 0,
    size: scrape.size || 0,
    zipPath: scrape.zipPath || "",
    status: scrape.status || "completed",
    startedAt: scrape.startedAt || new Date().toISOString(),
    completedAt: new Date().toISOString(),
    duration: scrape.duration || 0
  });
  writeJson(config.paths.scrapes, data);
  return data.scrapes[data.scrapes.length - 1];
}

function getUserScrapeCount(chatId) {
  return getScrapes(chatId).length;
}

// ─── GLOBAL STATS ───
function getStats() {
  const data = readJson(config.paths.stats);
  return data ? data.stats : { totalScrapes: 0, totalPages: 0, totalData: 0, startTime: Date.now() };
}

function updateGlobalStats(pages, dataSize) {
  const data = readJson(config.paths.stats) || { stats: { totalScrapes: 0, totalPages: 0, totalData: 0, startTime: Date.now() } };
  data.stats.totalScrapes += 1;
  data.stats.totalPages += pages;
  data.stats.totalData += dataSize;
  writeJson(config.paths.stats, data);
  return data.stats;
}

// ─── CLONED BOTS ───
function getBots() {
  const data = readJson(config.paths.bots);
  return data ? data.bots : [];
}

function addBot(botToken, addedBy) {
  const data = readJson(config.paths.bots) || { bots: [] };
  data.bots.push({
    id: Date.now().toString(36),
    token: botToken,
    addedBy,
    addedAt: new Date().toISOString(),
    status: "active"
  });
  writeJson(config.paths.bots, data);
  return true;
}

function removeBot(botId) {
  const data = readJson(config.paths.bots);
  if (!data) return false;
  data.bots = data.bots.filter(b => b.id !== botId);
  writeJson(config.paths.bots, data);
  return true;
}

// ─── SESSIONS ───
function getSession(chatId) {
  const data = readJson(config.paths.sessions);
  return data && data.sessions ? data.sessions[chatId] || {} : {};
}

function setSession(chatId, session) {
  const data = readJson(config.paths.sessions) || { sessions: {} };
  data.sessions[chatId] = { ...data.sessions[chatId], ...session };
  writeJson(config.paths.sessions, data);
  return true;
}

function clearSession(chatId) {
  const data = readJson(config.paths.sessions);
  if (data && data.sessions) {
    delete data.sessions[chatId];
    writeJson(config.paths.sessions, data);
  }
  return true;
}

// ─── BROADCAST QUEUE ───
function getBroadcastStatus() {
  const path = `${config.paths.data}/broadcast.json`;
  if (!fs.existsSync(path)) return null;
  return readJson(path);
}

function setBroadcastStatus(status) {
  const path = `${config.paths.data}/broadcast.json`;
  writeJson(path, status);
  return true;
}

module.exports = {
  initDatabase,
  
  // Users
  getUsers,
  getUser,
  addUser,
  updateUser,
  verifyUser,
  isUserVerified,
  updateUserStats,
  
  // Owners
  getOwners,
  isOwner,
  addOwner,
  removeOwner,
  
  // Scrapes
  getScrapes,
  getAllScrapes,
  addScrape,
  getUserScrapeCount,
  
  // Stats
  getStats,
  updateGlobalStats,
  
  // Bots
  getBots,
  addBot,
  removeBot,
  
  // Sessions
  getSession,
  setSession,
  clearSession,
  
  // Broadcast
  getBroadcastStatus,
  setBroadcastStatus
};
