const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

let ffmpegPath;
try {
    ffmpegPath = require('ffmpeg-static');
} catch (e) {
    console.error('ffmpeg-static not available:', e.message);
    ffmpegPath = null;
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const request = mod.get(url, { timeout: 30000 }, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Download failed: HTTP ${response.statusCode} for ${url.substring(0, 80)}...`));
                return;
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => { file.close(resolve); });
            file.on('error', (err) => {
                try { fs.unlinkSync(dest); } catch (_) {}
                reject(err);
            });
        });
        request.on('error', (err) => reject(err));
        request.on('timeout', () => { request.destroy(); reject(new Error('Download timeout')); });
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Health check
    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'ok',
            ffmpeg: ffmpegPath ? 'available' : 'not found',
            ffmpegPath: ffmpegPath || null
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!ffmpegPath) {
        return res.status(500).json({ error: 'ffmpeg binary not available on this server' });
    }

    const { url1, url2 } = req.body || {};
    if (!url1 || !url2) {
        return res.status(400).json({ error: 'url1 and url2 are required' });
    }

    const tmpDir = os.tmpdir();
    const id = Date.now() + '_' + Math.random().toString(36).slice(2);
    const part1Path = path.join(tmpDir, `part1_${id}.mp4`);
    const part2Path = path.join(tmpDir, `part2_${id}.mp4`);
    const listPath = path.join(tmpDir, `list_${id}.txt`);
    const outputPath = path.join(tmpDir, `merged_${id}.mp4`);

    try {
        console.log('Downloading videos...');
        await Promise.all([
            downloadFile(url1, part1Path),
            downloadFile(url2, part2Path)
        ]);

        const size1 = fs.statSync(part1Path).size;
        const size2 = fs.statSync(part2Path).size;
        console.log(`Downloaded: part1=${(size1/1024/1024).toFixed(1)}MB, part2=${(size2/1024/1024).toFixed(1)}MB`);

        // Create concat list file for ffmpeg
        fs.writeFileSync(listPath, `file '${part1Path}'\nfile '${part2Path}'`);

        // Merge with ffmpeg (fast stream copy, no re-encoding)
        const cmd = `"${ffmpegPath}" -f concat -safe 0 -i "${listPath}" -c copy -movflags +faststart -y "${outputPath}"`;
        console.log('Running ffmpeg...');
        execSync(cmd, { timeout: 45000, stdio: 'pipe' });

        const mergedBuffer = fs.readFileSync(outputPath);
        console.log(`Merged: ${(mergedBuffer.length/1024/1024).toFixed(1)}MB`);

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename="msi-video-complete.mp4"');
        res.setHeader('Content-Length', mergedBuffer.length);
        return res.status(200).send(mergedBuffer);

    } catch (error) {
        console.error('Merge error:', error.message);
        if (error.stderr) console.error('ffmpeg stderr:', error.stderr.toString());
        return res.status(500).json({ error: 'Failed to merge videos: ' + error.message });
    } finally {
        [part1Path, part2Path, listPath, outputPath].forEach(f => {
            try { fs.unlinkSync(f); } catch (_) {}
        });
    }
};
