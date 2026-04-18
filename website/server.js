/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      SHADOW WEB SCRAPER - EXPRESS SERVER                     ║
 * ║     Health Check & Web Dashboard for Railway Deployment       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config');
const db = require('../modules/database');

const app = express();
app.use(express.json());

// ─── Health Check (Required for Railway) ───
app.get('/', (req, res) => {
  const stats = db.getStats();
  const users = db.getUsers();
  const scrapes = db.getAllScrapes();
  
  res.json({
    status: 'online',
    bot: config.botName,
    version: config.version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    stats: {
      totalUsers: users.length,
      totalScrapes: scrapes.length,
      totalPages: scrapes.reduce((sum, s) => sum + (s.pages || 0), 0),
      totalData: scrapes.reduce((sum, s) => sum + (s.size || 0), 0)
    }
  });
});

// ─── Health Check Endpoint ───
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage()
  });
});

// ─── API Stats ───
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    const users = db.getUsers();
    const scrapes = db.getAllScrapes();
    const bots = db.getBots();
    
    res.json({
      success: true,
      bot: {
        name: config.botName,
        version: config.version,
        uptime: process.uptime()
      },
      users: {
        total: users.length,
        verified: users.filter(u => u.isVerified).length,
        active: users.filter(u => {
          if (!u.lastActive) return false;
          const daysSince = (Date.now() - new Date(u.lastActive).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 7;
        }).length
      },
      scrapes: {
        total: scrapes.length,
        totalPages: scrapes.reduce((sum, s) => sum + (s.pages || 0), 0),
        totalData: scrapes.reduce((sum, s) => sum + (s.size || 0), 0),
        recent: scrapes.slice(-10).map(s => ({
          domain: s.domain,
          pages: s.pages,
          size: s.size,
          date: s.completedAt
        }))
      },
      clonedBots: bots.length,
      startTime: stats.startTime
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── API Users List ───
app.get('/api/users', (req, res) => {
  try {
    const users = db.getUsers();
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        chatId: u.chatId,
        username: u.username,
        firstName: u.firstName,
        isVerified: u.isVerified,
        joinedAt: u.joinedAt,
        totalScrapes: u.totalScrapes || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Start Server ───
function startServer() {
  const port = config.port;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Health check server running on port ${port}`);
    console.log(`[Server] Health: http://localhost:${port}/health`);
  });
  return app;
}

module.exports = { app, startServer };
