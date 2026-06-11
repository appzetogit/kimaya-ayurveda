const fs = require('fs');
const path = require('path');
const src = 'd:\\kimaya\\Appzeto-multi-vendor\\frontend\\dist\\assets\\kimaya logo.jpeg';
const destDir = 'd:\\kimaya\\Appzeto-multi-vendor\\frontend\\src\\data\\logos';
const dest = path.join(destDir, 'kimaya_logo.jpeg');
try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log('Copied successfully!');
} catch (err) {
  console.error(err);
}
