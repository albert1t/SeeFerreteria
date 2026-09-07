import { readFileSync } from 'fs';

const files = [
  { name: 'DIN 6885 Feather Keys', path: 'C:\\Users\\thedu\\.local\\share\\opencode\\tool-output\\tool_061998caa001rAmvyHQt30LmH6' },
  { name: 'DIN 471 Circlips', path: 'C:\\Users\\thedu\\.local\\share\\opencode\\tool-output\\tool_06199927e001XnVSWESvLMFuZe' },
  { name: 'Thread Inserts', path: 'C:\\Users\\thedu\\.local\\share\\opencode\\tool-output\\tool_0619990a400165yAU1Y95nb2Hm' },
];

for (const file of files) {
  console.log(`\n=== ${file.name} ===`);
  const html = readFileSync(file.path, 'utf-8');
  
  // Find all media.witglobal.net image URLs
  const urls = [...new Set((html.match(/https?:\/\/media\.witglobal\.net\/source\/eshop\/stmedia\/0100\/images\/std\.lang\.all\/resolutions\/category\/\d+px\/\d+\.jpg/g) || []))];
  
  // Find og:image
  const ogMatch = html.match(/og:image.*?content="(https?:\/\/[^"]+)"/);
  if (ogMatch) {
    console.log('OG:IMAGE:', ogMatch[1]);
  }
  
  // Find twitter:image  
  const twMatch = html.match(/twitter:image.*?content="(https?:\/\/[^"]+)"/);
  if (twMatch) {
    console.log('TWITTER:IMAGE:', twMatch[1]);
  }
  
  // Find all unique image IDs
  const imageIds = [...new Set(urls.map(u => u.match(/\/(\d+)\.jpg$/)?.[1]).filter(Boolean))];
  console.log('Image IDs found:', imageIds.join(', '));
  
  // Show 800px versions
  const bigUrls = urls.filter(u => u.includes('800px'));
  console.log('800px URLs:');
  bigUrls.forEach(u => console.log('  ', u));
}
