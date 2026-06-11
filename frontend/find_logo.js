const fs = require('fs');
const path = require('path');

function findFile(dir, fileName) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const found = findFile(fullPath, fileName);
            if (found) return found;
        } else if (file.toLowerCase() === fileName.toLowerCase()) {
            return fullPath;
        }
    }
    return null;
}

const found = findFile('d:/kimaya/Appzeto-multi-vendor', 'kimaya logo.jpeg');
console.log('Found:', found);
