const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');

// 压缩配置
const CONFIG = {
    jpg: { quality: 70, format: 'webp' },
    jpeg: { quality: 70, format: 'webp' },
    png: { quality: 70, format: 'webp', effort: 6 },
    webp: { quality: 60 }  // 再次压缩 WebP
};

// 是否重新压缩现有 WebP
const RECOMPRESS_WEBP = process.argv.includes('--recompress');

function getFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...getFiles(fullPath));
        } else if (item.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}

async function compressImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase().slice(1);
    const config = CONFIG[ext];
    if (!config) return;

    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));

    // WebP 重新压缩
    if (ext === 'webp') {
        if (!RECOMPRESS_WEBP) {
            console.log(`⏭️  Skip: ${name}.webp (use --recompress to force)`);
            return;
        }
        const outputPath = path.join(dir, `${name}_new.webp`);
        const originalSize = fs.statSync(inputPath).size;

        try {
            await sharp(inputPath)
                .webp({ quality: config.quality })
                .toFile(outputPath);

            const newSize = fs.statSync(outputPath).size;
            const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1);

            // 如果新文件更小，替换原文件
            if (newSize < originalSize) {
                fs.unlinkSync(inputPath);
                fs.renameSync(outputPath, inputPath);
                console.log(`✅ ${name}.webp: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${saved}% saved)`);
            } else {
                fs.unlinkSync(outputPath);
                console.log(`⏭️  ${name}.webp: no improvement, keep original`);
            }
        } catch (err) {
            console.error(`❌ ${inputPath}: ${err.message}`);
        }
        return;
    }

    // 转换为 WebP
    const outputPath = path.join(dir, `${name}.webp`);

    // 跳过已存在的 webp
    if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skip: ${path.basename(inputPath)} (already converted)`);
        return;
    }

    const originalSize = fs.statSync(inputPath).size;

    try {
        let pipeline = sharp(inputPath);

        if (ext === 'png') {
            pipeline = pipeline.png({ compressionLevel: config.effort, quality: config.quality });
        } else {
            pipeline = pipeline.jpeg({ quality: config.quality });
        }

        await pipeline.webp({ quality: config.quality }).toFile(outputPath);

        const newSize = fs.statSync(outputPath).size;
        const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1);

        console.log(`✅ ${name}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${saved}% saved)`);
    } catch (err) {
        console.error(`❌ ${inputPath}: ${err.message}`);
    }
}

async function main() {
    console.log('🗜️  Starting image compression...\n');

    const files = getFiles(IMAGES_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    console.log(`Found ${files.length} images to process\n`);

    for (const file of files) {
        await compressImage(file);
    }

    console.log('\n🎉 Done!');
}

main();