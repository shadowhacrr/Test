/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      SHADOW WEB SCRAPER - PREMIUM ANIMATED KEYBOARDS         ║
 * ║          Stylish Inline Keyboards with Animations              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const config = require('../config');

// ─── Emoji Animations ───
const EMOJI = {
  sparkles: '✨',
  fire: '🔥',
  zap: '⚡',
  star: '⭐',
  rocket: '🚀',
  globe: '🌐',
  folder: '📁',
  chart: '📊',
  user: '👤',
  crown: '👑',
  lock: '🔒',
  unlock: '🔓',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  back: '🔙',
  next: '➡️',
  prev: '⬅️',
  home: '🏠',
  refresh: '🔄',
  search: '🔍',
  download: '⬇️',
  trash: '🗑️',
  settings: '⚙️',
  broadcast: '📢',
  users: '👥',
  bot: '🤖',
  add: '➕',
  remove: '➖',
  edit: '✏️',
  link: '🔗',
  phone: '📱',
  email: '📧',
  code: '💻',
  database: '🗄️',
  time: '⏰',
  speed: '⚡',
  trophy: '🏆',
  target: '🎯',
  magic: '🔮',
  shield: '🛡️',
  diamond: '💎',
  crown2: '👑',
  ghost: '👻',
  web: '🕸️',
  spider: '🕷️',
  shadow: '🌑',
  moon: '🌙',
  lightning: '⚡',
  wave: '〰️',
  ping: '📡',
  satellite: '🛰️',
  robot: '🤖',
  alien: '👽',
  space: '🌌',
  comet: '☄️',
  explosion: '💥',
  boom: '💣',
  party: '🎉',
  gift: '🎁',
  bulb: '💡',
  book: '📚',
  scroll: '📜',
  key: '🔑',
  hammer: '🔨',
  tools: '🛠️',
  gear: '⚙️',
  clock: '⏱️',
  timer: '⏲️',
  alarm: '⏰',
  stopwatch: '⏱️',
  hourglass: '⏳',
  recycle: '♻️',
  trash2: '🚮',
  broom: '🧹',
  soap: '🧼',
  sparkles2: '✨',
  fire2: '🔥',
  hot: '🥵',
  cold: '🥶',
  sun: '☀️',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  wind: '💨',
  tornado: '🌪️',
  rainbow: '🌈',
  umbrella: '☂️',
  ocean: '🌊',
  mountain: '⛰️',
  volcano: '🌋',
  map: '🗺️',
  compass: '🧭',
  anchor: '⚓',
  ship: '🚢',
  airplane: '✈️',
  helicopter: '🚁',
  rocket2: '🚀',
  ufo: '🛸',
  satellite2: '🛰️',
  telescope: '🔭',
  microscope: '🔬',
  magnet: '🧲',
  dna: '🧬',
  atom: '⚛️',
  infinity: '♾️',
  radio: '📻',
  tv: '📺',
  camera: '📷',
  video: '📹',
  movie: '🎬',
  game: '🎮',
  dice: '🎲',
  puzzle: '🧩',
  trophy2: '🏆',
  medal: '🏅',
  crown3: '👑',
  flag: '🚩',
  banner: '🎌',
  ticket: '🎫',
  mask: '🎭',
  paint: '🎨',
  music: '🎵',
  mic: '🎤',
  headphones: '🎧',
  drum: '🥁',
  guitar: '🎸',
  trumpet: '🎺',
  violin: '🎻',
  piano: '🎹',
  bell: '🔔',
  speaker: '🔊',
  mute: '🔇',
  megaphone: '📣',
  loud: '📢',
  phone2: '☎️',
  mobile: '📱',
  computer: '💻',
  desktop: '🖥️',
  keyboard: '⌨️',
  mouse: '🖱️',
  printer: '🖨️',
  usb: '🔌',
  battery: '🔋',
  electric: '⚡',
  plug: '🔌',
  bulb2: '💡',
  flashlight: '🔦',
  candle: '🕯️',
  fire3: '🔥',
  axe: '🪓',
  knife: '🔪',
  dagger: '🗡️',
  shield2: '🛡️',
  bow: '🏹',
  gun: '🔫',
  bomb2: '💣',
  firework: '🎆',
  sparkler: '🎇',
  balloon: '🎈',
  tada: '🎉',
  confetti: '🎊',
  streamers: '🎀',
  gift2: '🎁',
  envelope: '✉️',
  mail: '📧',
  inbox: '📥',
  outbox: '📤',
  package: '📦',
  label: '🏷️',
  bookmark: '🔖',
  flag2: '🚩',
  pin: '📌',
  paperclip: '📎',
  scissors: '✂️',
  pen: '🖊️',
  pencil: '✏️',
  paintbrush: '🖌️',
  crayon: '🖍️',
  memo: '📝',
  briefcase: '💼',
  file: '📄',
  folder2: '📁',
  openFolder: '📂',
  cardIndex: '📇',
  calendar: '📅',
  date: '📆',
  pad: '🗒️',
  spiral: '🗓️',
  chart2: '📊',
  chartUp: '📈',
  chartDown: '📉',
  barChart: '📊',
  clipboard: '📋',
  pushpin: '📌',
  round: '📍',
  paper: '📰',
  money: '💰',
  dollar: '💵',
  euro: '💶',
  pound: '💷',
  yen: '💴',
  credit: '💳',
  receipt: '🧾',
  gem: '💎',
  balance: '⚖️',
  toolbox: '🧰',
  wrench: '🔧',
  screwdriver: '🪛',
  nut: '🔩',
  bolt: '🔩',
  brick: '🧱',
  chains: '⛓️',
  hook: '🪝',
  knot: '🪢',
  thread: '🧵',
  yarn: '🧶',
  jacket: '🧥',
  gloves: '🧤',
  scarf: '🧣',
  socks: '🧦',
  dress: '👗',
  shirt: '👕',
  jeans: '👖',
  shoe: '👞',
  sneaker: '👟',
  boot: '👢',
  crown4: '👑',
  hat: '🎩',
  cap: '🧢',
  helmet: '⛑️',
  glasses: '👓',
  sunglasses: '🕶️',
  goggles: '🥽',
  labcoat: '🥼',
  safety: '🦺',
  necklace: '📿',
  ring: '💍',
  purse: '👛',
  handbag: '👜',
  bag: '👝',
  luggage: '🧳',
  glasses2: '👓',
  dark: '🕶️',
  shopping: '🛒',
  cart: '🛒',
  basket: '🧺',
  balloon2: '🎈',
  carp: '🎏',
  windchime: '🎐',
  ribbon: '🎀',
  gift3: '🎁',
  ticket2: '🎟️',
  medal2: '🎖️',
  trophy3: '🏆',
  crown5: '👑',
  soccer: '⚽',
  baseball: '⚾',
  basketball: '🏀',
  volleyball: '🏐',
  football: '🏈',
  rugby: '🏉',
  tennis: '🎾',
  pool: '🎱',
  pingpong: '🏓',
  badminton: '🏸',
  hockey: '🏒',
  lacrosse: '🥍',
  cricket: '🏏',
  boomerang: '🪃',
  frisbee: '🥏',
  dart: '🎯',
  kite: '🪁',
  playground: '🛝',
  bowling: '🎳',
  boxing: '🥊',
  ribbon2: '🎗️',
  mask2: '🎭',
  arts: '🎨',
  magic2: '🎪',
  circus: '🎪',
  guitar2: '🎸',
  music2: '🎵',
  musical: '🎶',
  saxophone: '🎷',
  accordion: '🪗',
  maracas: '🪇',
  flute: '🪈',
  drum2: '🥁',
  phone3: '📱',
  telephone: '☎️',
  pager: '📟',
  fax: '📠',
  tv2: '📺',
  radio2: '📻',
  studio: '🎙️',
  level: '🎚️',
  control: '🎛️',
  phone4: '📞',
  call: '📲',
  vibration: '📳',
  off: '📴',
  lock2: '🔒',
  unlock2: '🔓',
  locked: '🔐',
  key2: '🔑',
  oldKey: '🗝️',
  hammer2: '🔨',
  axe2: '🪓',
  pick: '⛏️',
  dagger2: '🗡️',
  crossed: '⚔️',
  gun2: '🔫',
  boom2: '🧨',
  fire4: '🔥',
  shell: '🐚',
  sign: '🧿',
  crystal: '🔮',
  laundry: '🧸',
  thread2: '🧵',
  yarn2: '🧶',
  glasses3: '👓',
  dark2: '🕶️',
  lab: '🥼',
  vest: '🦺',
  tie: '👔',
  shirt2: '👕',
  jeans2: '👖',
  scarf2: '🧣',
  gloves2: '🧤',
  coat: '🧥',
  socks2: '🧦',
  dress2: '👗',
  kimono: '👘',
  sari: '🥻',
  swimsuit: '🩱',
  shorts: '🩳',
  bikini: '👙',
  womans: '👚',
  fold: '🥻',
  bikini2: '👙',
  womans2: '👚',
  purse2: '👛',
  bag2: '👜',
  clutch: '👝',
  luggage2: '🧳',
  glasses4: '👓',
  dark3: '🕶️',
  goggles2: '🥽',
  lab2: '🥼',
  vest2: '🦺',
  necklace2: '📿',
  ring2: '💍',
  gem2: '💎',
  mute2: '🔇',
  speaker2: '🔈',
  sound: '🔉',
  loud2: '🔊',
  loudspeaker: '📢',
  megaphone2: '📣',
  horn: '📯',
  bell2: '🔔',
  noBell: '🔕',
  music3: '🎵',
  musical2: '🎶',
  search2: '🎙️',
  studio2: '🎚️',
  level2: '🎛️',
  phone5: '📞',
  call2: '📲',
  vibration2: '📳',
  phoneOff: '📴',
  lock3: '🔒',
  unlock3: '🔓',
  locked2: '🔐',
  key3: '🔑',
  oldKey2: '🗝️',
  hammer3: '🔨',
  axe3: '🪓',
  pick2: '⛏️',
  dagger3: '🗡️',
  crossed2: '⚔️',
  pistol: '🔫',
  shield3: '🛡️',
  smoking: '🚬',
  coffin: '⚰️',
  headstone: '🪦',
  urn: '⚱️',
  amphora: '🏺',
  crystal2: '🔮',
  bead: '📿',
  nazar: '🧿',
  hamsa: '🪬',
  barber: '💈',
  microscope2: '🔬',
  telescope2: '🔭',
  satellite3: '📡',
  syringe: '💉',
  drop: '💊',
  blood: '🩸',
  adhesive: '🩹',
  crutch: '🩼',
  stethoscope: '🩺',
  xray: '🩻',
  door: '🚪',
  elevator: '🛗',
  mirror: '🪞',
  window: '🪟',
  bed: '🛏️',
  couch: '🛋️',
  chair: '🪑',
  toilet: '🚽',
  plunger: '🪠',
  shower: '🚿',
  bathtub: '🛁',
  mouseTrap: '🪤',
  razor: '🪒',
  lotion: '🧴',
  safetyPin: '🧷',
  broom2: '🧹',
  basket2: '🧺',
  roll: '🧻',
  bucket: '🪣',
  soap2: '🧼',
  bubbles: '🫧',
  toothbrush: '🪥',
  sponge: '🧽',
  fireExtinguisher: '🧯',
  shoppingCart: '🛒',
  cigarette: '🚬',
  coffin2: '⚰️',
  funeral: '🪦',
  urn2: '⚱️'
};

// ─── Premium Channel Join Keyboard ───
function getChannelJoinKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.satellite} Telegram Channel`, url: config.channels.telegram.startsWith('@') ? `https://t.me/${config.channels.telegram.replace('@', '')}` : config.channels.telegram }
      ],
      [
        { text: `${EMOJI.tv} YouTube Channel`, url: config.channels.youtube.startsWith('@') ? `https://youtube.com/${config.channels.youtube}` : config.channels.youtube }
      ],
      [
        { text: `${EMOJI.phone} WhatsApp Channel`, url: config.channels.whatsapp.startsWith('@') ? `https://wa.me/${config.channels.whatsapp.replace('@', '')}` : config.channels.whatsapp }
      ],
      [
        { text: `${EMOJI.check} ✅ Verify Join`, callback_data: "verify_join" }
      ]
    ]
  };
}

// ─── Premium Main Menu Keyboard ───
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.user} User Menu`, callback_data: "user_menu" },
        { text: `${EMOJI.crown} Owner Menu`, callback_data: "owner_menu" }
      ],
      [
        { text: `${EMOJI.globe} Developer`, callback_data: "developer_info" },
        { text: `${EMOJI.chart} Statistics`, callback_data: "stats_menu" }
      ]
    ]
  };
}

// ─── Premium User Menu Keyboard ───
function getUserMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.zap} ⚡ Scrap New Web`, callback_data: "scrap_new" }
      ],
      [
        { text: `${EMOJI.folder} 📁 Old Scraped Webs`, callback_data: "old_scraped" },
        { text: `${EMOJI.chart} 📊 My Statics`, callback_data: "my_statics" }
      ],
      [
        { text: `${EMOJI.fire} 🔥 Quick Scrap (Send URL)`, callback_data: "quick_scrap_help" }
      ],
      [
        { text: `${EMOJI.back} 🔙 Back`, callback_data: "main_menu" }
      ]
    ]
  };
}

// ─── Premium Owner Menu Keyboard ───
function getOwnerMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.broadcast} 📢 Broadcast`, callback_data: "broadcast" },
        { text: `${EMOJI.bot} 🤖 Bot Statics`, callback_data: "bot_statics" }
      ],
      [
        { text: `${EMOJI.users} 👥 User List`, callback_data: "user_list" },
        { text: `${EMOJI.add} ➕ Add Owner`, callback_data: "add_owner" }
      ],
      [
        { text: `${EMOJI.robot} 🤖 Add Bot Token`, callback_data: "add_bot_token" }
      ],
      [
        { text: `${EMOJI.back} 🔙 Back`, callback_data: "main_menu" }
      ]
    ]
  };
}

// ─── Scraped Website List Keyboard ───
function getScrapedListKeyboard(scrapes, page = 0) {
  const perPage = 5;
  const totalPages = Math.ceil(scrapes.length / perPage);
  const start = page * perPage;
  const end = start + perPage;
  const pageScrapes = scrapes.slice(start, end);

  const keyboard = [];

  // Scraped items
  pageScrapes.forEach((scrape, idx) => {
    const domain = scrape.domain || 'Unknown';
    const date = new Date(scrape.completedAt).toLocaleDateString();
    keyboard.push([
      { 
        text: `${EMOJI.globe} ${domain} (${date})`, 
        callback_data: `view_scrape_${scrape.id}` 
      }
    ]);
  });

  // Pagination
  const navButtons = [];
  if (page > 0) {
    navButtons.push({ text: `${EMOJI.prev} Prev`, callback_data: `scrapes_page_${page - 1}` });
  }
  if (page < totalPages - 1) {
    navButtons.push({ text: `${EMOJI.next} Next`, callback_data: `scrapes_page_${page + 1}` });
  }
  if (navButtons.length > 0) {
    keyboard.push(navButtons);
  }

  keyboard.push([
    { text: `${EMOJI.back} 🔙 Back to Menu`, callback_data: "user_menu" }
  ]);

  return { inline_keyboard: keyboard };
}

// ─── Scrape Detail Keyboard ───
function getScrapeDetailKeyboard(scrapeId) {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.download} 📥 Download ZIP`, callback_data: `download_scrape_${scrapeId}` }
      ],
      [
        { text: `${EMOJI.globe} 🌐 View Online`, callback_data: `view_online_${scrapeId}` }
      ],
      [
        { text: `${EMOJI.trash} 🗑️ Delete`, callback_data: `delete_scrape_${scrapeId}` }
      ],
      [
        { text: `${EMOJI.back} 🔙 Back to List`, callback_data: "old_scraped" }
      ]
    ]
  };
}

// ─── Confirm Delete Keyboard ───
function getConfirmDeleteKeyboard(scrapeId) {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.cross} ❌ Yes, Delete`, callback_data: `confirm_delete_${scrapeId}` },
        { text: `${EMOJI.back} 🔙 Cancel`, callback_data: `view_scrape_${scrapeId}` }
      ]
    ]
  };
}

// ─── User List Pagination Keyboard ───
function getUserListKeyboard(users, page = 0) {
  const perPage = 8;
  const totalPages = Math.ceil(users.length / perPage);
  const start = page * perPage;
  const end = start + perPage;
  const pageUsers = users.slice(start, end);

  const keyboard = [];

  pageUsers.forEach((user) => {
    const name = user.firstName || user.username || 'Unknown';
    const id = user.chatId;
    const status = user.isVerified ? `${EMOJI.check}` : `${EMOJI.cross}`;
    keyboard.push([
      { 
        text: `${status} ${name} (${id})`, 
        callback_data: `user_detail_${id}` 
      }
    ]);
  });

  const navButtons = [];
  if (page > 0) {
    navButtons.push({ text: `${EMOJI.prev} Prev`, callback_data: `users_page_${page - 1}` });
  }
  navButtons.push({ text: `${EMOJI.refresh} ${page + 1}/${totalPages}`, callback_data: "refresh_users" });
  if (page < totalPages - 1) {
    navButtons.push({ text: `${EMOJI.next} Next`, callback_data: `users_page_${page + 1}` });
  }
  keyboard.push(navButtons);

  keyboard.push([
    { text: `${EMOJI.back} 🔙 Back`, callback_data: "owner_menu" }
  ]);

  return { inline_keyboard: keyboard };
}

// ─── Broadcast Confirm Keyboard ───
function getBroadcastConfirmKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.check} ✅ Send Now`, callback_data: "broadcast_confirm" },
        { text: `${EMOJI.cross} ❌ Cancel`, callback_data: "owner_menu" }
      ]
    ]
  };
}

// ─── Cancel Keyboard ───
function getCancelKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.cross} ❌ Cancel`, callback_data: "cancel_action" }
      ]
    ]
  };
}

// ─── Back Keyboard ───
function getBackKeyboard(callback) {
  return {
    inline_keyboard: [
      [
        { text: `${EMOJI.back} 🔙 Back`, callback_data: callback }
      ]
    ]
  };
}

// ─── Force Reply Keyboard ───
function getForceReply(placeholder) {
  return {
    force_reply: true,
    input_field_placeholder: placeholder || "Type here..."
  };
}

module.exports = {
  EMOJI,
  getChannelJoinKeyboard,
  getMainMenuKeyboard,
  getUserMenuKeyboard,
  getOwnerMenuKeyboard,
  getScrapedListKeyboard,
  getScrapeDetailKeyboard,
  getConfirmDeleteKeyboard,
  getUserListKeyboard,
  getBroadcastConfirmKeyboard,
  getCancelKeyboard,
  getBackKeyboard,
  getForceReply
};
