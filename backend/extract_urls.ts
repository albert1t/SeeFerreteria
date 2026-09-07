import { readFileSync } from 'fs';

const bossard = readFileSync('C:\\Users\\thedu\\.local\\share\\opencode\\tool-output\\tool_0619657420010B2MYHqkmxxid6', 'utf-8');
const wurth = readFileSync('C:\\Users\\thedu\\.local\\share\\opencode\\tool-output\\tool_06196670900169vwau9C2QeSmU', 'utf-8');

// Bossard - find ctfassets image URLs
const bossardUrls = [...new Set((bossard.match(/https?:\/\/images\.eu\.ctfassets\.net\/[^\s"'<>]+/g) || []))];
console.log('=== BOSSARD IMAGE URLS (first 10) ===');
bossardUrls.slice(0, 10).forEach(u => console.log(u));

// Wurth - find media image URLs
const wurthUrls = [...new Set((wurth.match(/https?:\/\/media\.(wuerth\.com|witglobal\.net)\/[^\s"'<>]+/g) || []))];
console.log('\n=== WURTH IMAGE URLS (first 10) ===');
wurthUrls.slice(0, 10).forEach(u => console.log(u));

// Also look for og:image in Bossard
const bossardOg = bossard.match(/og:image.*?content="([^"]+)"/g);
console.log('\n=== BOSSARD OG:IMAGE ===');
if (bossardOg) bossardOg.forEach(m => console.log(m));

// Also look for og:image in Wurth
const wurthOg = wurth.match(/og:image.*?content="([^"]+)"/g);
console.log('\n=== WURTH OG:IMAGE ===');
if (wurthOg) wurthOg.forEach(m => console.log(m));

// Also look for twitter:image in Bossard
const bossardTw = bossard.match(/twitter:image.*?content="([^"]+)"/g);
console.log('\n=== BOSSARD TWITTER:IMAGE ===');
if (bossardTw) bossardTw.forEach(m => console.log(m));
