import { readFileSync } from 'fs';

const content = readFileSync('C:\\Users\\thedu\\.local\\share\\opencode\\tool-output\\tool_0619fa450001OANT9GUwCUBB2R', 'utf-8');

// Look for any script tags with product data
const scriptTags = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log(`Found ${scriptTags.length} script tags`);

// Search for image-related patterns in all scripts
for (const script of scriptTags) {
  if (script.includes('image') || script.includes('Image') || script.includes('bild') || script.includes('Bild')) {
    const urls = script.match(/https?:\/\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi);
    if (urls) {
      console.log('\nImage URLs found in script:');
      [...new Set(urls)].slice(0, 10).forEach(u => console.log('  ', u));
    }
  }
}

// Look for JSON-LD structured data
const jsonLd = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
if (jsonLd) {
  console.log(`\nFound ${jsonLd.length} JSON-LD blocks`);
  for (const block of jsonLd) {
    const json = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    try {
      const data = JSON.parse(json);
      if (data.image) console.log('JSON-LD image:', data.image);
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (item.image) console.log('Graph image:', item.image);
        }
      }
    } catch {}
  }
}

// Search for media.wuerth.com patterns
const mediaMatches = content.match(/media\.wuerth\.com[^"'\s<>]*/gi);
if (mediaMatches) {
  console.log('\nmedia.wuerth.com references:');
  [...new Set(mediaMatches)].slice(0, 10).forEach(u => console.log('  ', u));
}

// Search for any product image patterns
const prodImgPatterns = content.match(/(?:productImage|product_image|itemImage|artikelBild|produktBild)[^"'\s<>]{0,200}/gi);
if (prodImgPatterns) {
  console.log('\nProduct image patterns:');
  prodImgPatterns.slice(0, 5).forEach(u => console.log('  ', u));
}

// Look for fetch/axios calls to API
const apiCalls = content.match(/fetch\s*\(\s*["'`]([^"'`]+)/gi);
if (apiCalls) {
  console.log('\nFetch calls:');
  apiCalls.slice(0, 10).forEach(u => console.log('  ', u));
}
