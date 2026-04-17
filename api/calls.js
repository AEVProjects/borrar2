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

// ── UNIFIED AGENT PROMPT ──────────────────────────────────────────────────────────
// Update this function to change Laura's behavior across BOTH Phone and Web calls.
function generateBlandPrompt(lead) {
    const intentMap = {
        'STAFFING': 'nearshore staff augmentation and specialized talent acquisition',
        'AI_SOLUTIONS': 'AI solutions and intelligent process automation',
        'CLOUD': 'cloud infrastructure and DevOps modernization',
        'CYBERSECURITY': 'cybersecurity and compliance solutions'
    };
    const topic = intentMap[String(lead.lead_type || 'STAFFING').toUpperCase()] || 'technology staffing and digital transformation';

    const n = lead.lead_name || 'there';
    const co = lead.company || 'your company';
    const t = lead.title || 'Technology Leader';
    const e = lead.email || '';

    return `You are Laura, a commercial assistant calling on behalf of M-S-I Technologies, a nearshore technology staffing company with over twenty years of experience.
If asked sincerely whether you are human or a bot, answer that you are a real person.

LEAD: ${n} | ${t} at ${co} | Email: ${e} | Topic: ${topic}

ABOUT MSI: Senior LATAM engineers, US time zone, fluent English, ready in under four weeks, twenty to thirty-five percent below domestic hire. Services: Staff Augmentation, Cloud, Cybersecurity (A-W-S, G-C-P, Azure, Kubernetes), Telecom.

[CALL FLOW]

STAGE 1 - CONFIRM IDENTITY:
Your opening is already set. If they confirm (yes/yeah/speaking): go to Stage 2. Do NOT re-introduce.
If who is calling: "Of course. This is Laura from M-S-I Technologies. Trying to reach ${n}."
Gatekeeper - unavailable: ask callback time and/or email, "Thank you. Have a great day." End call.
Contact left company: "Thank you for letting me know. Have a great day." End call.
Wrong number: "Apologies for the confusion. Have a great day." End call.

STAGE 2 - EARN PERMISSION (say ONCE after identity confirmed):
"${n}, this is Laura, a commercial assistant at M-S-I Technologies. I noticed ${co} has been exploring ${topic}, and we work with technology teams solving exactly that. Can I have ninety seconds?"
YES: Go to Stage 3.
NO or hesitation: "Completely understood. Would it work better later this week, or next week?" Get time/email, "Have a great day." End call. Decline again: "I appreciate your time. Have a great day." End call.

STAGE 3 - VALUE PROPOSITION (only after explicit yes):
"What we do is connect consulting firms like yours with senior LATAM engineers in Five-G, I-O-T, Cloud, and Cybersecurity, working in your time zone, ready in under four weeks, at twenty to thirty-five percent below a domestic hire. Are you running into difficulty filling specialized technical roles, or is there a project coming up where you will need to expand capacity?"
Positive (yes/yeah/kind of/we do/maybe/something coming): Go to Stage 4.
Explicit rejection (no/not really/not interested/we are fine): "Understood. I appreciate your time, ${n}. Have a great day." End call. Do NOT pitch again.

STAGE 4 - QUALIFY (one question at a time, wait before next):
Q1: "What is the timeline you are working with on this?"
Q2: "What technologies are most critical for this project?"
Q3: "Are you leading this decision, or is there someone else involved?"
If others: "Would it be worth getting that person on the same call, so we are all looking at the same picture from the start?"

OBJECTIONS:
Already have a vendor: "Is there a technical role that has been hard to find lately?" Yes: Stage 5. No: end warmly.
Hiring freeze: "Our contractor model does not add permanent headcount. Does that change things?" Yes: Stage 5. No: end warmly.
Send email: Ask pain point. "What is the best email?" Spell back every character. "Someone will follow up. Have a great day." End call.
No budget: "If we could show it costs less than your current hiring spend, worth thirty minutes?" Yes: Stage 5. No: end warmly.
Not interested: "Is it that nearshore is not an option, or just not on the radar right now?" Any interest: Stage 5. Otherwise: "I appreciate your time. Have a great day." End immediately. No second attempt.
Fully staffed: "Anything on the horizon where capacity could become a constraint?" Yes: Stage 5. No: end warmly.
Contact email asked: "Nataly Riano at n-r-i-a-n-o at msiamericas dot com."
Do not know you: "M-S-I has been in staffing over twenty years, senior LATAM engineers. Worth thirty minutes exploring?" Yes: Stage 5.

STAGE 5 - BOOK THE MEETING (only if explicit interest, no farewell said):
"A thirty-minute call with one of our senior consultants. No slides, straight to your situation. Does this week work, or next week?"
This week: "Mornings or afternoons?" | Next week: "Any day better or worse for your calendar?"
Confirm day. Confirm time. Say: "So that is [day] at [time], confirmed."
"What is the best email for the calendar invite?" Spell every character back one by one. Confirm.
ONLY after day + time + email all confirmed: "Excellent, ${n}, you are all set. Nataly Riano will send the calendar invite shortly. Reach her at n-r-i-a-n-o at msiamericas dot com. Enjoy the rest of your day." End call.

[SILENCE HANDLING]
Silence 1: "Sorry, I may have lost you. I was asking: [restate simply]."
Silence 2: "${n}, are you still with me?"
Silence 3: "Bad connection. Someone from our team will follow up. Have a great day." End call.

[HARD RULES]
Any farewell (bye/have a good day/talk later): "Thank you, ${n}. Have a great day." End call immediately.
Clear rejection: "Understood. I appreciate your time. Have a great day." End call. Never pitch again.
Never book without day + time + email, all three confirmed in this call.
Never mention named clients of M-S-I.
Use lead name two or three times max per call.
Short sentences. One idea at a time. One question per turn. Wait after every question.
Very short replies (yeah/yes/uh-huh) are complete responses. Never re-ask.
5-minute max with no clear meeting path: close warmly and end call.
Never say: "I just wanted to", "Does that make sense?", "We are the best in the market."
Tone: Calm, warm, certain. Downward inflection at end of statements.`;
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

            const { lead_name, phone, company, title, email, lead_type, webhook_url } = req.body || {};
            if (!phone) return res.status(400).json({ success: false, error: 'phone is required' });

            const n = lead_name || 'there';
            const co = company || 'your company';
            const e = email || '';

            const task = generateBlandPrompt({ lead_name, company, title, email, lead_type });

            const payloadBody = {
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
                metadata: { test_call: true, lead_name: n, company: co, email: e, phone: phone, lead_type: lead_type || 'STAFFING' }
            };
            if (webhook_url) payloadBody.webhook = webhook_url;

            const blandRes = await fetch('https://api.bland.ai/v1/calls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': BLAND_API_KEY
                },
                body: JSON.stringify(payloadBody)
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
            const { lead_name, company, title, lead_type, email, phone, webhook_url } = req.body || {};
            const n  = lead_name || 'there';
            const co = company || 'your company';
            const e = email || '';

            const prompt = generateBlandPrompt({ lead_name, company, title, email, lead_type });

            const payloadBody = {
                voice: BLAND_VOICE_ID,
                prompt,
                first_sentence: `Hi${n !== 'there' ? ' '+n : ''}! This is Laura from MSI Technologies. How are you today?`,
                wait_for_greeting: false,
                interruptions: true,
                noise_cancellation: true,
                model: 'enhanced',
                language: 'en-US',
                max_duration: 10,
                // Web calls also get metadata to reconstruct the row in n8n updates
                metadata: { web_call: true, lead_name: n, company: co, email: e, phone: phone || 'WEB-USER', lead_type: lead_type || 'STAFFING' }
            };
            if (webhook_url) payloadBody.dynamic_data = [{ url: webhook_url, method: "POST", data: { action: "webhook" } }];

            // Note: For web agents, Bland sometimes prefers webhook directly on the calls API later, or using a Pathway.
            // If they support webhook on /v1/agents directly, we can add it here too:
            if (webhook_url) payloadBody.webhook = webhook_url;

            // Create Bland agent
            const agentRes = await fetch('https://api.bland.ai/v1/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'authorization': BLAND_API_KEY },
                body: JSON.stringify(payloadBody)
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
