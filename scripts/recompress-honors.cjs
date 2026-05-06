const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HONORS_DIR = path.join(__dirname, '..', 'images', 'honors');
const QUALITY = 50; // 更低的质量设置

async function recompress() {
    console.log('🗜️  Recompressing honors images...\n');

    const files = fs.readdirSync(HONORS_DIR).filter(f => f.endsWith('.webp'));

    for (const file of files) {
        const inputPath = path.join(HONORS_DIR, file);
        const outputPath = path.join(HONORS_DIR, file.replace('.webp', '_new.webp'));
        const originalSize = fs.statSync(inputPath).size;

        try {
            await sharp(inputPath)
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            const newSize = fs.statSync(outputPath).size;
            const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1);

            if (newSize < originalSize) {
                fs.unlinkSync(inputPath);
                fs.renameSync(outputPath, inputPath);
                console.log(`✅ ${file}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${saved}% saved)`);
            } else {
                fs.unlinkSync(outputPath);
                console.log(`⏭️  ${file}: no improvement`);
            }
        } catch (err) {
            console.error(`❌ ${file}: ${err.message}`);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
    }

    console.log('\n🎉 Done!');
}

recompress();