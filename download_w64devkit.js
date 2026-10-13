const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('Downloading w64devkit for C and C++ (GCC/G++)...');
const url = 'https://github.com/skeeto/w64devkit/releases/download/v1.20.0/w64devkit-1.20.0.zip';
const dest = path.join(process.env.TEMP, 'w64devkit.zip');

function download(targetUrl) {
  https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      return download(res.headers.location);
    }
    if (res.statusCode !== 200) {
      console.error('Failed with status:', res.statusCode);
      return;
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('w64devkit download finished!');
    });
  }).on('error', err => console.error('Download error:', err.message));
}

download(url);
