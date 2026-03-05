// Set CORS on GCS bucket msi-veo-videos
// Run once: node set-gcs-cors.js

const crypto = require('crypto');
const https = require('https');

const SA_EMAIL = 'vertex-express@gen-lang-client-0521438560.iam.gserviceaccount.com';
const SA_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCc8VpJosYd8D0N
mFLmh1b7UOsHgm5ZZBvjSkPUhcFXXoEnOoouhWPD5hEl7ziA+3vWpbHLWb5sm0dv
qUhHJWwMMbE5eBxmR7m/Cacpy5ZiOVw+180aZqq6e1AsKlEzRvdz66FSgpCeYtmS
2nnc8fGwxfB06qpXsxLVQYnwnKzOlKOv9cfXC/29vrbXoPwez9lkVyySa11iGtYA
zMU2LjiPrxvcDTbhb1JYD/050fT/m3z2NgclsV6uCEQxNLXOJriJxNuSKhmZufis
soO/rlj/V+RFTrHEQ8zn3nbm6/W2ZANZt94AOo31t5TR6Idt9PxgjodSHJYLEm+0
OXC6bAf3AgMBAAECggEASvGn81Ti9YX0qarNH5+OZkmASmA7EL3Q4Wtj07chmfab
hx+Zv9hbyT7yfmJrYZB11Qzfx6Lt35AQ/13fkXXp0DLklfRo32Ct7u+Nn1REVlhc
1/eWTl6rdYyQPt7gUrO3U+g3655EsBW1Hz7sBZmVmBwVlMdAm8t8GVEILVmr3aN1
5CzVUaLtk9UNQDApUfxgdD2kutWTjqM2j3jsgceST6p98dqV2U8HiOXonpMgt02+
3PqApJNu4HQhdMzYwX67vKLuqanlZllLlBp8TWvbP3Roo2p57pD8oamT0BKWDUcX
fwT19NJOXqRTim6oalvGklTuwhI9+EJJPlAwN7+rAQKBgQDc+sNzQC4Eph4we6g5
BQe5QGIchou/ey1vJ+UGbM8vy6bkuy9dPbDZ/XUZTPOYkTPHKvRu544DTIQzH0qJ
fG5NKUIYdOInJm8y+r0JybMrrKl0b04/Nrlueb4RjesASMSq3BTVMK5+6Mb4vx7y
LS3mYUc8TF+kBEEaw0H4Fwlu9wKBgQC10JcC0kbtCF/MmHwSq9w0PfgbHT3NoZH7
yOWeXPfRLybn+I4MMYW3y5KSL5RM3Gxtve2I/HjJPpprZSUJXfMgRLrVkFRV1iFp
A/v1vAxoMlYGk3Oh74rwmmMmU7hhPSNL5HxIDHdXVZb5jrOvqIIBcZ6n2qhaCVXH
mtjl3QbvAQKBgBxiUWyiV8bdF4+espLwZHeVH4UOezDTP5jBhRd4LnyzKfLDYGgX
nnnBpqLjUX7NV9tDVzZPo9wkne57HHXgd8KNhCHkEZB5zVq8/j8dm1gGy5VbHq/b
9aGNHa7fjcnxjuFrd3mS0TcX60bUNcNhrj2jTSUfokFNEpe/cN/PBbUtAoGAaSms
nyonciT83Gd6pIYZiXIqluxT+iOxP7SU9AOMJ8ehNl2zM+RVFtk9/yZcHhUE9nj7
8tctuiFmyiWnxYI9BXYbpzmjPj7r9kUisKFDf+VVktoo8QqQD9kM7ndQV5Y4W0Ze
iIIFaVONTu22iyzpfZJNlYNJC0MJBbpQKKyuvQECgYEA2q4N8oL3VJwZAuyIVXOm
g9SH9dq4pRunQbXJpxaP2mklGNEbLV1YURVGA0oyQE5oh3/4s/LdMERUFkaYBBnl
yrcLRELtnjswAy3b2tEp4ULP/rx5MRY4qjNonUrzoXAs937zDIcyjO6/ekxE28sO
Xk4daXQsjz4PY3lVvJcnKFA=
-----END PRIVATE KEY-----
`;
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const BUCKET = 'msi-veo-videos';

function b64url(str) { return Buffer.from(str).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function b64urlBuf(buf) { return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }

async function httpReq(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    // 1. Get access token
    console.log('Getting access token...');
    const now = Math.floor(Date.now()/1000);
    const hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
    const pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/devstorage.full_control'}));
    const si = hdr + '.' + pay;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(si);
    const jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));

    const tokenBody = 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt;
    const tokenRes = await httpReq({
        hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(tokenBody) }
    }, tokenBody);

    if (!tokenRes.data.access_token) {
        console.error('Token failed:', tokenRes.data);
        return;
    }
    const TOKEN = tokenRes.data.access_token;
    console.log('Token obtained.');

    // 2. Set CORS on bucket
    console.log('Setting CORS on gs://' + BUCKET + '...');
    const corsConfig = JSON.stringify({
        cors: [{
            origin: ['*'],
            method: ['GET', 'HEAD', 'OPTIONS'],
            responseHeader: ['Content-Type', 'Content-Range', 'Accept-Ranges', 'Content-Length'],
            maxAgeSeconds: 86400
        }]
    });

    const patchRes = await httpReq({
        hostname: 'storage.googleapis.com',
        path: '/storage/v1/b/' + BUCKET + '?fields=cors',
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + TOKEN,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(corsConfig)
        }
    }, corsConfig);

    console.log('Response status:', patchRes.status);
    console.log('Response:', JSON.stringify(patchRes.data, null, 2));

    if (patchRes.status === 200) {
        console.log('\n✅ CORS configured successfully! Videos can now be fetched from the browser.');
    } else {
        console.error('\n❌ Failed to set CORS. You may need to grant the service account "Storage Admin" role on the bucket.');
    }
}

main().catch(console.error);
