const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HONORS_DIR = path.join(__dirname, '..', 'images', 'honors');
const TARGET_SIZE = 100 * 1024; // 100KB
const MIN_QUALITY = 1; // 最低质量

async function compress() {
    console.log('🗜️  Compressing to <100KB...\n');

    const files = fs.readdirSync(HONORS_DIR).filter(f => f.endsWith('.webp') && !f.includes('_new'));

    for (const file of files) {
        const inputPath = path.join(HONORS_DIR, file);
        const outputPath = path.join(HONORS_DIR, file.replace('.webp', '_new.webp'));

        try {
            const originalSize = fs.statSync(inputPath).size;
            if (originalSize <= TARGET_SIZE) {
                console.log(`⏭️  ${file}: ${(originalSize/1024).toFixed(0)}KB (already <100KB)`);
                continue;
            }

            let quality = 50;
            let newSize = 0;

            while (quality >= MIN_QUALITY) {
                await sharp(inputPath)
                    .webp({ quality: quality })
                    .toFile(outputPath);

                newSize = fs.statSync(outputPath).size;

                if (newSize <= TARGET_SIZE) {
                    fs.unlinkSync(inputPath);
                    fs.renameSync(outputPath, inputPath);
                    console.log(`✅ ${file}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (q${quality})`);
                    break;
                }

                if (quality > MIN_QUALITY) {
                    fs.unlinkSync(outputPath);
                    quality -= 5;
                } else {
                    // 最低质量，保留
                    fs.unlinkSync(inputPath);
                    fs.renameSync(outputPath, inputPath);
                    console.log(`✅ ${file}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (最低质量)`);
                    break;
                }
            }
        } catch (err) {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            console.log(`⏭️  ${file}: 跳过 (${err.message})`);
        }
    }

    console.log('\n🎉 Done!');
}

compress();