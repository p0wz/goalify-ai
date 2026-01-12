const fs = require('fs');
const path = require('path');

function fixMotiInFiles(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            fixMotiInFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;

            // Remove moti import
            content = content.replace(/import \{ MotiView \} from 'moti';\r?\n/g, '');

            // Replace MotiView with View (keeping attributes)
            content = content.replace(/<MotiView/g, '<View');
            content = content.replace(/<\/MotiView>/g, '</View>');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    });
}

// Fix screens folder
fixMotiInFiles('src/screens');

// Fix components folder
fixMotiInFiles('src/components');

console.log('Done!');
