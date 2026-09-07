import https from 'https';
import http from 'http';

const urls: Record<string, string> = {
  'Pasador cilíndrico DIN 6325': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/0b7776574f489179a41ac6009636fa37/DIN-6325-Steel-Dowel-Pins.jpg',
  'Tornillo cabeza cilíndrica Allen ISO4762/DIN912 8.8 Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/s/h/shcs316metricfg_t6ayylvtbijg5xik.jpg',
  'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/c/s/cskzincmetricfg_rqtqlqtvohojeuz7.jpg',
  'Pasador extraíble DIN 7979': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/2b1c4bb469191c90e674580e2699f329/DIN-7979-Steel-Dowel-Pins-with-Internal-Thread.jpg',
  'Circlips Exterior DIN 471': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/DIN-471-External-Circlip.jpg',
  'Circlips Interior DIN 472': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/DIN-472-Internal-Circlip.jpg',
  'Chaveta DIN 6885A': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/675856f0fd2242dfb7798c0d4f50729e/DIN-6885-Steel-Parallel-Keys.jpg',
  'Tuerca Hexagonal ISO4032.8 Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/4/1/41g1_igyk63xhjzirafyz.jpg',
  'Tuerca Freno DIN985 Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/4/1/41n10c10_1_8ztffumqitpfqtrm.jpg',
  'Arrandela GROWER W DIN127A Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/7/1/71ps10_vgrlok6cqvpnqyh6.jpg',
  'Arrandela Plana Normal ISO7089 200HV Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/7/1/71s1021m_ydlriz0avzrxpdxv.jpg',
  'Arrandela Plana Ancha ISO7093 200HV Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/7/1/71s1021m_ydlriz0avzrxpdxv.jpg',
  'Tornillo de presión con bola': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/edec1dcdc359bd5fdafa9db727a58bb9/BP-Steel-Ball-Plungers-with-or-without-Locking-Element-with-Slot-With-locking-element-Black.jpg',
  'Tornillo de presión con tetón': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/110942a580a1e3e9ce643e2df71f4ca3/WN-7379-Steel-Socket-Shoulder-Screws-with-Collar.jpg',
  'Varilla roscada 1 metro DIN976 8.8 Cincado': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/a/l/all_thread_stainless_vqkupraedtdwotzj.jpg',
  'Varilla roscada 1 metro DIN976 4.8': 'https://www.boltandnut.com.au/media/catalog/product/cache/15c9157424ce15b8e23b3472567b20b5/a/l/all_thread_stainless_vqkupraedtdwotzj.jpg',
  'Racord Instantaneo': 'https://live-catalog-cdn.jwwinco.com/catalog-images/winco/0b7776574f489179a41ac6009636fa37/DIN-6325-Steel-Dowel-Pins.jpg',
};

async function testUrl(name: string, url: string): Promise<{name: string; ok: boolean; status: number; size: number}> {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        testUrl(name, res.headers.location).then(resolve);
        return;
      }
      let size = 0;
      res.on('data', (chunk) => { size += chunk.length; });
      res.on('end', () => {
        resolve({ name, ok: res.statusCode === 200, status: res.statusCode || 0, size });
      });
    });
    req.on('error', () => resolve({ name, ok: false, status: 0, size: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ name, ok: false, status: 0, size: 0 }); });
  });
}

async function main() {
  const results = await Promise.all(
    Object.entries(urls).map(([name, url]) => testUrl(name, url))
  );
  
  console.log('=== URL Verification Results ===\n');
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗';
    console.log(`${icon} [${r.status}] ${r.name} (${r.size} bytes)`);
    if (!r.ok) console.log(`  URL: ${urls[r.name]}`);
  }
  
  const working = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  console.log(`\n${working.length} working, ${failed.length} failed`);
}

main();
