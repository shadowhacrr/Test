/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      SHADOW WEB SCRAPER - WEBSITE SCRAPING ENGINE            ║
 * ║   Downloads Complete Websites as Offline-Capable ZIP Files    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const archiver = require('archiver');
const cheerio = require('cheerio');
const axios = require('axios');
const { URL } = require('url');

puppeteer.use(StealthPlugin());

// ─── Scraper State ───
class WebsiteScraper {
  constructor(options = {}) {
    this.maxDepth = options.maxDepth || 2;
    this.maxPages = options.maxPages || 50;
    this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024;
    this.timeout = options.timeout || 30000;
    this.concurrentDownloads = options.concurrentDownloads || 5;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    this.visitedUrls = new Set();
    this.downloadedResources = new Set();
    this.pagesScraped = 0;
    this.totalSize = 0;
    this.errors = [];
    this.baseUrl = null;
    this.domain = null;
    this.outputDir = null;
    this.zipPath = null;
  }

  // ─── Main Scraping Method ───
  async scrape(url, outputPath) {
    const startTime = Date.now();
    
    try {
      // Validate URL
      this.baseUrl = new URL(url);
      this.domain = this.baseUrl.hostname;
      this.outputDir = outputPath || `./data/temp/scrape_${Date.now()}`;
      this.zipPath = `${this.outputDir}.zip`;
      
      // Clean up and create output directory
      await fs.remove(this.outputDir);
      await fs.ensureDir(this.outputDir);
      
      // Launch browser
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      // Scrape main page and discover links
      await this.scrapePage(browser, url, 0);
      
      await browser.close();
      
      // Create ZIP file
      await this.createZip();
      
      // Cleanup temp directory
      await fs.remove(this.outputDir);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        url,
        domain: this.domain,
        pages: this.pagesScraped,
        size: this.totalSize,
        zipPath: this.zipPath,
        duration,
        errors: this.errors
      };
      
    } catch (error) {
      // Cleanup on error
      if (this.outputDir) await fs.remove(this.outputDir).catch(() => {});
      if (this.zipPath) await fs.remove(this.zipPath).catch(() => {});
      
      return {
        success: false,
        url,
        domain: this.domain || new URL(url).hostname,
        pages: this.pagesScraped,
        size: this.totalSize,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  // ─── Scrape Single Page ───
  async scrapePage(browser, url, depth) {
    if (this.visitedUrls.has(url) || this.pagesScraped >= this.maxPages || depth > this.maxDepth) {
      return;
    }
    
    this.visitedUrls.add(url);
    this.pagesScraped++;
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Block unnecessary resources to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['xhr', 'fetch', 'websocket', 'manifest'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.timeout
      });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);
      
      // Get page content
      const html = await page.content();
      
      // Get page title for filename
      const title = await page.title();
      const fileName = this.getPageFileName(url, title);
      
      // Process HTML - download resources and rewrite URLs
      const processedHtml = await this.processHtml(html, url);
      
      // Save processed HTML
      const pagePath = path.join(this.outputDir, fileName);
      await fs.ensureDir(path.dirname(pagePath));
      await fs.writeFile(pagePath, processedHtml);
      
      // Discover and scrape internal links
      if (depth < this.maxDepth) {
        const links = await this.discoverLinks(html, url);
        for (const link of links.slice(0, this.maxPages - this.pagesScraped)) {
          await this.scrapePage(browser, link, depth + 1);
        }
      }
      
      await page.close();
      
    } catch (error) {
      this.errors.push({ url, error: error.message });
    }
  }

  // ─── Process HTML - Download Resources & Rewrite URLs ───
  async processHtml(html, pageUrl) {
    const $ = cheerio.load(html);
    const pageUrlObj = new URL(pageUrl);
    
    // Process CSS links
    const cssPromises = [];
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        cssPromises.push(this.processResource(href, pageUrl, 'css').then(localPath => {
          if (localPath) $(el).attr('href', localPath);
        }));
      }
    });
    await Promise.all(cssPromises);
    
    // Process JS scripts
    const jsPromises = [];
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        jsPromises.push(this.processResource(src, pageUrl, 'js').then(localPath => {
          if (localPath) $(el).attr('src', localPath);
        }));
      }
    });
    await Promise.all(jsPromises);
    
    // Process images
    const imgPromises = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        imgPromises.push(this.processResource(src, pageUrl, 'images').then(localPath => {
          if (localPath) $(el).attr('src', localPath);
        }));
      }
    });
    // Process srcset
    $('img[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        const newSrcset = srcset.split(',').map(part => {
          const [urlPart, descriptor] = part.trim().split(/\s+/);
          const fullUrl = this.resolveUrl(urlPart, pageUrl);
          const localPath = this.getLocalPath(fullUrl, 'images');
          imgPromises.push(this.downloadFile(fullUrl, path.join(this.outputDir, localPath)).then(() => localPath).catch(() => null));
          return localPath + (descriptor ? ' ' + descriptor : '');
        }).join(', ');
        $(el).attr('srcset', newSrcset);
      }
    });
    await Promise.all(imgPromises);
    
    // Process background images in inline styles
    $('[style*="background"]').each((_, el) => {
      const style = $(el).attr('style');
      if (style) {
        const newStyle = style.replace(/url\(['"]?([^'"\)]+)['"]?\)/g, (match, url) => {
          const fullUrl = this.resolveUrl(url, pageUrl);
          const localPath = this.getLocalPath(fullUrl, 'images');
          this.downloadFile(fullUrl, path.join(this.outputDir, localPath)).catch(() => {});
          return `url("${localPath}")`;
        });
        $(el).attr('style', newStyle);
      }
    });
    
    // Process favicon
    $('link[rel*="icon"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        this.processResource(href, pageUrl, 'images').then(localPath => {
          if (localPath) $(el).attr('href', localPath);
        });
      }
    });
    
    // Process fonts
    const fontPromises = [];
    $('link[rel="preload"][as="font"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        fontPromises.push(this.processResource(href, pageUrl, 'fonts').then(localPath => {
          if (localPath) $(el).attr('href', localPath);
        }));
      }
    });
    await Promise.all(fontPromises);
    
    // Process @font-face in style tags
    $('style').each((_, el) => {
      let css = $(el).html();
      if (css) {
        css = this.processCssUrls(css, pageUrl);
        $(el).html(css);
      }
    });
    
    // Process inline styles with url()
    $('[style*="url("]').each((_, el) => {
      let style = $(el).attr('style');
      if (style) {
        style = this.processCssUrls(style, pageUrl);
        $(el).attr('style', style);
      }
    });
    
    // Add base tag to handle relative URLs
    const baseExists = $('base').length > 0;
    if (!baseExists) {
      $('head').prepend(`<base href="${pageUrlObj.origin}/">`);
    }
    
    // Add offline meta tags
    $('head').prepend(`
      <meta name="generator" content="Shadow Web Scraper v1.0">
      <meta name="scraped-from" content="${pageUrl}">
      <meta name="scraped-date" content="${new Date().toISOString()}">
    `);
    
    // Fix anchor links (internal navigation)
    $('a[href^="#"]').each((_, el) => {
      // Keep anchor links as-is
    });
    
    // Process other links - make relative
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
        const fullUrl = this.resolveUrl(href, pageUrl);
        if (this.isSameDomain(fullUrl)) {
          const localPath = this.getPageFileName(fullUrl);
          $(el).attr('href', localPath);
        } else {
          // External links - keep as-is but add indicator
          $(el).attr('target', '_blank');
          $(el).attr('rel', 'noopener noreferrer');
        }
      }
    });
    
    return $.html();
  }

  // ─── Process CSS URLs ───
  processCssUrls(css, pageUrl) {
    return css.replace(/url\(['"]?([^'"\)]+)['"]?\)/g, (match, url) => {
      const fullUrl = this.resolveUrl(url.trim(), pageUrl);
      const localPath = this.getLocalPath(fullUrl, 'css');
      this.downloadFile(fullUrl, path.join(this.outputDir, localPath)).catch(() => {});
      return `url("${localPath}")`;
    });
  }

  // ─── Process Single Resource ───
  async processResource(url, pageUrl, type) {
    const fullUrl = this.resolveUrl(url, pageUrl);
    if (!fullUrl || this.downloadedResources.has(fullUrl)) {
      return this.getLocalPath(fullUrl, type);
    }
    
    const localPath = this.getLocalPath(fullUrl, type);
    const outputPath = path.join(this.outputDir, localPath);
    
    try {
      await this.downloadFile(fullUrl, outputPath);
      this.downloadedResources.add(fullUrl);
      
      // If CSS, process internal URLs
      if (type === 'css') {
        let css = await fs.readFile(outputPath, 'utf8');
        css = this.processCssUrls(css, fullUrl);
        await fs.writeFile(outputPath, css);
      }
      
      return localPath;
    } catch (error) {
      return null;
    }
  }

  // ─── Download File ───
  async downloadFile(url, outputPath) {
    if (!url || url.startsWith('data:')) return;
    
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Referer': this.baseUrl ? this.baseUrl.href : url
        },
        maxContentLength: this.maxFileSize
      });
      
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, response.data);
      
      this.totalSize += response.data.length;
      
      return outputPath;
    } catch (error) {
      this.errors.push({ url, error: error.message });
      throw error;
    }
  }

  // ─── Discover Internal Links ───
  async discoverLinks(html, pageUrl) {
    const $ = cheerio.load(html);
    const links = new Set();
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const fullUrl = this.resolveUrl(href, pageUrl);
        if (fullUrl && this.isSameDomain(fullUrl) && !this.visitedUrls.has(fullUrl)) {
          // Skip anchors, mailto, tel, javascript
          if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
            // Normalize URL - remove hash
            const urlObj = new URL(fullUrl);
            urlObj.hash = '';
            links.add(urlObj.href);
          }
        }
      }
    });
    
    return Array.from(links);
  }

  // ─── Resolve Relative URL ───
  resolveUrl(url, base) {
    try {
      if (!url) return null;
      if (url.startsWith('//')) {
        return new URL(this.baseUrl.protocol + url).href;
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      if (url.startsWith('data:')) {
        return null; // Skip data URIs
      }
      return new URL(url, base).href;
    } catch {
      return null;
    }
  }

  // ─── Check Same Domain ───
  isSameDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === this.domain;
    } catch {
      return false;
    }
  }

  // ─── Get Local Path for Resource ───
  getLocalPath(url, type) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // If it has a file extension, preserve structure
      if (path.extname(pathname)) {
        return path.join(type, this.domain, pathname.replace(/^\//, ''));
      }
      
      // Generate filename from URL hash
      const hash = Buffer.from(url).toString('base64').substring(0, 12);
      const ext = this.getExtensionForType(type);
      return path.join(type, this.domain, `${hash}${ext}`);
    } catch {
      const hash = Buffer.from(url).toString('base64').substring(0, 12);
      return path.join(type, `${hash}.bin`);
    }
  }

  // ─── Get Page File Name ───
  getPageFileName(url, title) {
    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;
      
      // Root page
      if (pathname === '/' || pathname === '') {
        return 'index.html';
      }
      
      // Remove trailing slash
      pathname = pathname.replace(/\/$/, '');
      
      // If it has extension, use it
      if (path.extname(pathname)) {
        return pathname.replace(/^\//, '');
      }
      
      // Otherwise add .html
      return pathname.replace(/^\//, '') + '/index.html';
    } catch {
      return 'index.html';
    }
  }

  // ─── Get Extension for Resource Type ───
  getExtensionForType(type) {
    switch (type) {
      case 'css': return '.css';
      case 'js': return '.js';
      case 'images': return '.png';
      case 'fonts': return '.woff2';
      default: return '.bin';
    }
  }

  // ─── Create ZIP File ───
  async createZip() {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(this.zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        this.totalSize = fs.statSync(this.zipPath).size;
        resolve();
      });
      
      archive.on('error', reject);
      archive.on('warning', (err) => {
        if (err.code !== 'ENOENT') reject(err);
      });
      
      archive.pipe(output);
      archive.directory(this.outputDir, false);
      archive.finalize();
    });
  }
}

// ─── Quick Scrape Function ───
async function scrapeWebsite(url, outputPath, options = {}) {
  const scraper = new WebsiteScraper(options);
  return await scraper.scrape(url, outputPath);
}

module.exports = {
  WebsiteScraper,
  scrapeWebsite
};
