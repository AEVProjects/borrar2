// api/calls.js — Vercel Serverless Function for Bland.ai calls proxy
// Routes: GET /api/calls?action=logs|leads|stats  POST /api/calls?action=trigger|add-lead

const BLAND_API_KEY = process.env.BLAND_API_KEY || 'org_aae0e1f07f1f504b5f39fe9953ecc82eda35d2da72650564a340a49b4a80d996540eef9ac5b57109ba6f69';
const BLAND_VOICE_ID = process.env.BLAND_VOICE_ID || '4e65cda2-cf46-4907-84ba-3ca96c48f549';
const BLAND_PHONE_NUMBER_ID = process.env.BLAND_PHONE_NUMBER_ID || '07e907b3-68ee-4177-bcb1-3f8e990a245e'; // Twilio +15187570699
// Same Supabase values as config.example.js (already public in repo)
const SUPABASE_URL = 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';

async function supabaseFetch(path, options = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
        ...options,
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': options.prefer || 'return=representation',
            ...(options.headers || {})
        }
    });
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text }; }
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Explicit JSON body parsing (Vercel sometimes skips auto-parse)
    if (req.method === 'POST' && typeof req.body === 'string') {
        try { req.body = JSON.parse(req.body); } catch {}
    }
    if (req.method === 'POST' && !req.body) {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        } catch { req.body = {}; }
    }

    const action = req.query.action;

    try {
        // ── GET: today's stats ──────────────────────────────────────────
        if (req.method === 'GET' && action === 'stats') {
            const today = new Date().toISOString().split('T')[0];
            const r = await supabaseFetch(`/bland_daily_stats?date=eq.${today}&limit=1`);
            const stats = (r.data && r.data[0]) || {
                total_calls: 0, answered: 0, voicemail: 0,
                no_answer: 0, meetings_scheduled: 0, interested: 0, not_interested: 0
            };
            return res.status(200).json({ success: true, stats });
        }

        // ── GET: call logs ──────────────────────────────────────────────
        if (req.method === 'GET' && action === 'logs') {
            const page  = parseInt(req.query.page  || '1');
            const limit = parseInt(req.query.limit || '20');
            const offset = (page - 1) * limit;
            const r = await supabaseFetch(
                `/bland_call_logs?order=created_at.desc&limit=${limit}&offset=${offset}`,
                { headers: { 'Prefer': 'count=exact' } }
            );
            const count = parseInt(r.data?.length || 0);
            return res.status(200).json({ success: true, logs: r.data || [], page, limit });
        }

        // ── GET: leads ──────────────────────────────────────────────────
        if (req.method === 'GET' && action === 'leads') {
            const page   = parseInt(req.query.page   || '1');
            const limit  = parseInt(req.query.limit  || '20');
            const status = req.query.status || '';
            const offset = (page - 1) * limit;
            let path = `/bland_leads?order=created_at.desc&limit=${limit}&offset=${offset}`;
            if (status) path += `&status=eq.${status}`;
            const r = await supabaseFetch(path);
            return res.status(200).json({ success: true, leads: r.data || [], page, limit });
        }

        // ── POST: trigger test call ─────────────────────────────────────
        if (req.method === 'POST' && action === 'trigger') {
            if (!BLAND_API_KEY) {
                return res.status(500).json({ success: false, error: 'BLAND_API_KEY not configured' });
            }

            const { lead_name, phone, company, title, email, lead_type } = req.body || {};
            if (!phone) return res.status(400).json({ success: false, error: 'phone is required' });

            const n = lead_name || 'there';
            const co = company || 'your company';
            const e = email || '';
            const intentMap = {
                'STAFFING': 'nearshore staff augmentation and specialized talent acquisition',
                'AI_SOLUTIONS': 'AI solutions and intelligent process automation',
                'CLOUD': 'cloud infrastructure and DevOps modernization',
                'CYBERSECURITY': 'cybersecurity and compliance solutions'
            };
            const topic = intentMap[(lead_type || 'STAFFING').toUpperCase()] || 'technology staffing and digital transformation';

            const task = `You are Laura, a commercial assistant calling on behalf of M-S-I Technologies, a nearshore technology staffing company with over twenty years of experience. If asked sincerely whether you are human or a bot, answer that you are a real person.\n\nLEAD: ${n} | ${title || 'Technology Leader'} at ${co} | Email: ${e} | Topic: ${topic}\n\nABOUT MSI: Senior LATAM engineers, US time zone, fluent English, ready in under four weeks, twenty to thirty-five percent below domestic hire. Services: Staff Augmentation, Cloud, Cybersecurity (A-W-S, G-C-P, Azure, Kubernetes), Telecom.\n\nThis is a TEST CALL. Keep it brief — introduce yourself, confirm you reached ${n}, mention MSI's staffing services, and close warmly after 1 minute. Do not attempt a full sales call.`;

            const blandRes = await fetch('https://api.bland.ai/v1/calls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': BLAND_API_KEY
                },
                body: JSON.stringify({
                    phone_number: phone,
                    phone_number_id: BLAND_PHONE_NUMBER_ID,
                    task,
                    voice: BLAND_VOICE_ID,
                    first_sentence: `Hi, is this ${n}?`,
                    wait_for_greeting: true,
                    noise_cancellation: true,
                    record: true,
                    max_duration: 2,
                    language: 'en-US',
                    model: 'enhanced',
                    metadata: { test_call: true, lead_name: n, company: co }
                })
            });
            const blandData = await blandRes.json();

            if (!blandRes.ok) {
                console.error('[api/calls] Bland.ai error:', JSON.stringify(blandData));
                return res.status(blandRes.status).json({
                    success: false,
                    error: blandData.message || blandData.error || blandData.errors || JSON.stringify(blandData)
                });
            }

            return res.status(200).json({ success: true, call_id: blandData.call_id, status: blandData.status, message: 'Test call initiated' });
        }

        // ── POST: add lead ──────────────────────────────────────────────
        if (req.method === 'POST' && action === 'add-lead') {
            const { lead_name, phone, company, title, email, industry, lead_type, intent_topic } = req.body || {};
            if (!lead_name || !phone) {
                return res.status(400).json({ success: false, error: 'lead_name and phone are required' });
            }
            const r = await supabaseFetch('/bland_leads', {
                method: 'POST',
                body: JSON.stringify({ lead_name, phone, company, title, email, industry, lead_type: lead_type || 'STAFFING', intent_topic }),
                prefer: 'return=representation'
            });
            if (!r.ok) return res.status(r.status).json({ success: false, error: r.data });
            return res.status(201).json({ success: true, lead: r.data[0] || r.data });
        }

        // ── GET: fetch a specific call from Bland.ai ────────────────────
        if (req.method === 'GET' && action === 'call-detail') {
            const callId = req.query.call_id;
            if (!callId) return res.status(400).json({ success: false, error: 'call_id required' });
            if (!BLAND_API_KEY) return res.status(500).json({ success: false, error: 'BLAND_API_KEY not configured' });
            const r = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
                headers: { 'authorization': BLAND_API_KEY }
            });
            const data = await r.json();
            return res.status(r.status).json({ success: r.ok, data });
        }

        // ── POST: create web call agent + get session token ─────────────────
        if (req.method === 'POST' && action === 'web-session') {
            const { lead_name, company, title, lead_type, email } = req.body || {};
            const n  = lead_name || 'there';
            const co = company   || 'your company';
            const e  = email     || '';
            const intentMap = {
                'STAFFING':      'nearshore staff augmentation and specialized talent acquisition',
                'AI_SOLUTIONS':  'AI solutions and intelligent process automation',
                'CLOUD':         'cloud infrastructure and DevOps modernization',
                'CYBERSECURITY': 'cybersecurity and compliance solutions'
            };
            const topic = intentMap[(lead_type || 'STAFFING').toUpperCase()] || 'technology staffing';

            const prompt = `You are Laura, a commercial assistant at M-S-I Technologies, a nearshore technology staffing company.
You are speaking with ${n}${co !== 'your company' ? ` from ${co}` : ''}${title ? `, ${title}` : ''}. Topic: ${topic}.

ABOUT MSI: Senior LATAM engineers, US time zone, ready in under four weeks, 20-35% below domestic hire. Services: Staff Augmentation, Cloud, Cybersecurity (AWS, GCP, Azure), Telecom.

Keep this conversation brief and natural (3-5 minutes max). Your goals:
1. Greet warmly and introduce yourself as Laura from MSI Technologies
2. Ask about their current technology staffing challenges
3. Briefly explain MSI's value proposition relevant to ${topic}
4. Offer to schedule a 30-minute call with a senior consultant
5. If they agree, let them know Nataly Riano (nriano@msiamericas.com) will send a calendar invite

Tone: Warm, confident, professional. Short sentences. Wait for responses. Never say "I just wanted to".`;

            // Create Bland agent
            const agentRes = await fetch('https://api.bland.ai/v1/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'authorization': BLAND_API_KEY },
                body: JSON.stringify({
                    voice: BLAND_VOICE_ID,
                    prompt,
                    first_sentence: `Hi${n !== 'there' ? ' '+n : ''}! This is Laura from MSI Technologies. How are you today?`,
                    wait_for_greeting: false,
                    interruptions: true,
                    noise_cancellation: true,
                    model: 'enhanced',
                    language: 'en-US',
                    max_duration: 10
                })
            });
            const agentData = await agentRes.json();
            if (!agentRes.ok) {
                console.error('[web-session] agent create error:', agentData);
                return res.status(agentRes.status).json({ success: false, error: agentData.message || agentData.error || JSON.stringify(agentData) });
            }
            const agentId = agentData.agent?.agent_id || agentData.agent_id;
            if (!agentId) return res.status(500).json({ success: false, error: 'No agent_id in Bland response: ' + JSON.stringify(agentData) });

            // Authorize for web use
            const authRes = await fetch(`https://api.bland.ai/v1/agents/${agentId}/authorize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'authorization': BLAND_API_KEY }
            });
            const authData = await authRes.json();
            if (!authRes.ok) {
                console.error('[web-session] authorize error:', authData);
                return res.status(authRes.status).json({ success: false, error: authData.message || authData.error || JSON.stringify(authData) });
            }

            return res.status(200).json({ success: true, agent_id: agentId, token: authData.token });
        }

        return res.status(404).json({ success: false, error: `Unknown action: ${action}` });

    } catch (err) {
        console.error('[api/calls]', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
