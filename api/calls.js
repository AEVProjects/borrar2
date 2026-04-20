// api/calls.js — Vercel Serverless Function for Bland.ai calls proxy
// Routes: GET /api/calls?action=logs|leads|stats  POST /api/calls?action=trigger|add-lead|web-session|bland-webhook

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
// Optimized for Bland.ai best practices: <2000 chars, positive instructions, clear stages
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

    return `You are Laura, a commercial assistant at M-S-I Technologies calling ${n} at ${co}.
M-S-I provides senior LATAM engineers: US timezone, fluent English, ready in four weeks, twenty to thirty-five percent below domestic hire.
Topic of interest: ${topic}.

=== STAGE 1: CONFIRM IDENTITY ===
Your first sentence is already set. When they confirm identity, go to Stage 2.
"Who is calling?": "This is Laura from M-S-I Technologies, trying to reach ${n}."
If the person who answers is NOT ${n}, ask politely: "May I speak with ${n}?"
Gatekeeper says unavailable: ask for callback time or email, then say goodbye warmly.
Wrong number or left company: apologize, say goodbye warmly.

=== STAGE 2: EARN PERMISSION ===
Say once: "${n}, I noticed ${co} has been exploring ${topic}, and we work with technology teams solving exactly that. Can I have ninety seconds?"
YES: go to Stage 3.
NO: "Would later this week or next week work better?" Get time or email, say goodbye warmly.

=== STAGE 3: VALUE PROPOSITION ===
"We connect firms like yours with senior LATAM engineers in Five-G, I-O-T, Cloud, and Cybersecurity — same timezone, ready in four weeks, twenty to thirty-five percent savings. Are you having difficulty filling specialized roles, or is there a project where you need to expand capacity?"
Positive signal: go to Stage 4.
Rejection: "I appreciate your time, ${n}. Have a great day."

=== STAGE 4: QUALIFY ===
Ask one question at a time. Wait for each answer.
Q1: "What timeline are you working with?"
Q2: "What technologies are most critical?"
Q3: "Are you leading this decision, or is someone else involved?"

Handle objections:
- Already have a vendor: "Is there a role that has been hard to fill?"
- Hiring freeze: "Our contractor model avoids permanent headcount. Does that change things?"
- Send email: Ask their main challenge first. Get email. SPELL THE EMAIL BACK character by character. Confirm. DO NOT SPELL OUT THE PERSON'S NAME, only spell the email address.
- Not interested: "Is nearshore not an option, or just not on the radar right now?" One attempt only.

=== STAGE 5: BOOK MEETING ===
Enter only after explicit interest.
"A thirty-minute call with our senior consultant. No slides, straight to your situation. This week or next?"
Get day. Get time. Confirm: "So that is [day] at [time]."
Get email for calendar invite. SPELL THE EMAIL BACK character by character. Confirm. DO NOT SPELL OUT THE PERSON'S NAME.
After all three confirmed: "Excellent, ${n}. Nataly Riano will send the invite shortly. Reach her at n-r-i-a-n-o at msiamericas dot com. Enjoy your day."

=== RULES ===
Any farewell: "Thank you, ${n}. Have a great day." -> YOU MUST IMMEDIATELY HANG UP THE CALL.
Always answer direct questions before continuing your agenda.
Short sentences. One question per turn. Wait after every question.
Use their name two or three times max.
Calm, warm tone. Downward inflection on statements.`;
}

// ── UNIFIED BLAND PAYLOAD GENERATOR ────────────────────────────────────────────
// Generates the full Bland.ai API payload for BOTH phone and web calls.
function generateBlandPayload(lead, options = {}) {
    const n = lead.lead_name || 'there';
    const co = lead.company || 'your company';
    const e = lead.email || '';
    const phone = lead.phone || '';
    const isWebCall = options.isWebCall || false;
    const webhookUrl = options.webhookUrl || null;

    const task = generateBlandPrompt(lead);

    const payload = {
        task,
        voice: BLAND_VOICE_ID,
        first_sentence: isWebCall
            ? `Hi${n !== 'there' ? ' ' + n : ''}! This is Laura from MSI Technologies. How are you today?`
            : `Hi, is this ${n}?`,
        wait_for_greeting: !isWebCall,
        noise_cancellation: true,
        background_track: 'office',
        record: true,
        max_duration: isWebCall ? 10 : 5,
        language: 'en-US',
        model: 'turbo',
        interruption_threshold: 150,
        temperature: 0.4,
        voice_settings: { speed: 1.2 },
        voicemail: {
            action: 'leave_message',
            message: `Hi ${n}, this is Laura from M-S-I Technologies. We help companies scale their tech teams with senior engineers. I would love to connect briefly. You can reach us at n-r-i-a-n-o at msiamericas dot com. Have a great day.`
        },
        summary_prompt: 'Classify this call. Extract: 1) disposition (meeting_scheduled, send_email, callback, not_interested, wrong_number, gatekeeper, voicemail, no_answer), 2) meeting_date and meeting_time if scheduled, 3) callback_date and callback_time if requested, 4) email_collected if confirmed during call, 5) pain_points mentioned, 6) brief summary of conversation outcome.',
        dispositions: ['meeting_scheduled', 'send_email', 'callback', 'not_interested', 'wrong_number', 'gatekeeper', 'voicemail', 'no_answer'],
        pronunciation_guide: [
            { word: 'MSI', pronunciation: 'M-S-I', case_sensitive: 'true', spaced: 'true' },
            { word: '5G', pronunciation: 'Five-G', case_sensitive: 'true', spaced: 'true' },
            { word: 'IoT', pronunciation: 'I-O-T', case_sensitive: 'true', spaced: 'true' },
            { word: 'AWS', pronunciation: 'A-W-S', case_sensitive: 'true', spaced: 'true' },
            { word: 'GCP', pronunciation: 'G-C-P', case_sensitive: 'true', spaced: 'true' },
            { word: 'Nataly', pronunciation: 'NAH-tah-lee' },
            { word: 'Riano', pronunciation: 'Ree-AH-no' }
        ],
        metadata: {
            lead_name: n,
            company: co,
            email: e,
            phone: phone,
            lead_type: lead.lead_type || 'STAFFING',
            web_call: isWebCall,
            call_date: new Date().toISOString().split('T')[0]
        }
    };

    // Phone-specific fields
    if (!isWebCall) {
        payload.phone_number = phone;
        payload.phone_number_id = BLAND_PHONE_NUMBER_ID;
    }

    // Webhook
    if (webhookUrl) {
        payload.webhook = webhookUrl;
    }

    return payload;
}

// ── ANALYZE CALL RESULT ────────────────────────────────────────────────────────
// Unified analysis function for both webhook and polling paths
function analyzeCallResult(callResult, lead) {
    const fullTranscript = (callResult.concatenated_transcript || '').toLowerCase();
    const correctedDuration = parseInt(callResult.corrected_duration || '0');
    const callLength = callResult.call_length || 0;
    const durationSeconds = correctedDuration > 0 ? correctedDuration : Math.round(callLength * 60);
    const status = callResult.status || '';
    const summary = (callResult.summary || '').toLowerCase();
    const blandDisposition = (callResult.disposition || '').toLowerCase().trim();

    const transcripts = callResult.transcripts || [];
    const userLines = transcripts.filter(t => t.user === 'user').map(t => t.text.toLowerCase()).join(' ');
    const assistantLines = transcripts.filter(t => t.user === 'assistant').map(t => t.text.toLowerCase()).join(' ');

    const isVoicemail = callResult.voicemail_detected === true ||
        callResult.answered_by === 'voicemail' ||
        blandDisposition === 'voicemail' ||
        fullTranscript.includes('leave a message') ||
        fullTranscript.includes('voicemail');

    let callStatus = 'no_answer';
    let interestLevel = 'none';
    let nextStep = 'callback';
    let disposition = blandDisposition || 'unknown';
    let notes = '';
    let painPoints = '';
    let meetingDate = '';
    let meetingTime = '';
    let callbackDate = '';
    let callbackTime = '';
    let emailCollected = '';

    if (status === 'completed' && isVoicemail) {
        callStatus = 'voicemail';
        disposition = 'voicemail';
        notes = 'Voicemail - message left';
        nextStep = 'callback';
    } else if (status === 'completed' && userLines.length > 5 && !isVoicemail && durationSeconds > 15) {
        callStatus = 'answered';

        // Pain points
        if (userLines.includes('scale') || userLines.includes('grow')) painPoints += 'Scaling team; ';
        if (userLines.includes('cost') || userLines.includes('budget')) painPoints += 'Cost concerns; ';
        if (userLines.includes('security') || userLines.includes('cyber')) painPoints += 'Cybersecurity; ';
        if (userLines.includes('cloud') || userLines.includes('aws') || userLines.includes('azure')) painPoints += 'Cloud; ';
        if (userLines.includes('ai ') || userLines.includes('machine learning')) painPoints += 'AI/ML; ';
        if (userLines.includes('kubernetes') || userLines.includes('devops')) painPoints += 'DevOps; ';
        if (userLines.includes('5g') || userLines.includes('telecom')) painPoints += 'Telecom/5G; ';

        // Disposition — Bland as primary source
        if (blandDisposition === 'meeting_scheduled') { interestLevel = 'high'; nextStep = 'meeting_scheduled'; disposition = 'meeting_scheduled'; }
        else if (blandDisposition === 'send_email') { interestLevel = 'medium'; nextStep = 'send_email'; disposition = 'send_email'; }
        else if (blandDisposition === 'not_interested') { interestLevel = 'none'; nextStep = 'not_interested'; disposition = 'not_interested'; }
        else if (blandDisposition === 'callback') { interestLevel = 'low'; nextStep = 'callback'; disposition = 'callback'; }
        else if (blandDisposition === 'wrong_number') { interestLevel = 'none'; nextStep = 'not_interested'; disposition = 'wrong_number'; }
        else if (blandDisposition === 'gatekeeper') { interestLevel = 'none'; nextStep = 'callback'; disposition = 'gatekeeper'; }
        else {
            // Heuristic fallback
            const summaryHasMeeting = summary.includes('scheduled') || summary.includes('calendar invite') || summary.includes('booked');
            const summaryHasEmail = summary.includes('send info') || summary.includes('send email') || summary.includes('email follow');
            const summaryHasNoInterest = summary.includes('not interested') || summary.includes('declined');
            const strongRejection = userLines.includes('not interested') || userLines.includes('no thank') || userLines.includes('dont call');

            if (summaryHasMeeting) { interestLevel = 'high'; nextStep = 'meeting_scheduled'; disposition = 'meeting_scheduled'; }
            else if (summaryHasEmail) { interestLevel = 'medium'; nextStep = 'send_email'; disposition = 'send_email'; }
            else if (strongRejection || summaryHasNoInterest) { interestLevel = 'none'; nextStep = 'not_interested'; disposition = 'not_interested'; }
            else { interestLevel = 'low'; nextStep = 'callback'; disposition = 'callback'; }
        }

        // Extract meeting/callback/email from summary
        const summaryFull = callResult.summary || '';
        const dayMatch = summaryFull.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        const timeMatch = summaryFull.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))/i);
        const emailMatch = summaryFull.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

        if (nextStep === 'meeting_scheduled' && dayMatch) meetingDate = dayMatch[1];
        if (nextStep === 'meeting_scheduled' && timeMatch) meetingTime = timeMatch[1];
        if (nextStep === 'callback' && dayMatch) callbackDate = dayMatch[1];
        if (nextStep === 'callback' && timeMatch) callbackTime = timeMatch[1];
        if (emailMatch) emailCollected = emailMatch[1];

        notes = callResult.summary || 'Call completed';
    } else if (status === 'completed') {
        callStatus = 'no_answer';
        disposition = 'no_answer';
        notes = 'Call too short - no meaningful interaction';
    } else {
        callStatus = (status === 'busy') ? 'busy' : 'no_answer';
        disposition = 'no_answer';
        notes = (status === 'busy') ? 'Line busy' : 'No answer - ' + status;
    }

    // New lead status
    let newStatus = 'PENDING';
    const currentAttempts = (parseInt(lead.attempts) || 0) + 1;

    if (disposition === 'meeting_scheduled') newStatus = 'SCHEDULED';
    else if (disposition === 'not_interested' || disposition === 'wrong_number') newStatus = 'NOT_INTERESTED';
    else if (disposition === 'send_email') newStatus = 'FOLLOW_UP';
    else if (disposition === 'callback' || disposition === 'gatekeeper') newStatus = 'CALLBACK';
    else if (callStatus === 'answered' && interestLevel === 'low') newStatus = 'CONTACTED';
    else if (currentAttempts >= 3 && callStatus !== 'answered') newStatus = 'NO_ANSWER';

    // Timestamps
    const now = new Date();
    const estOpts = { timeZone: 'America/New_York' };
    const dateStr = now.toLocaleDateString('en-CA', estOpts);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, ...estOpts });

    // Calendly link
    let calendlyLink = '';
    if (nextStep === 'meeting_scheduled' && (emailCollected || lead.email)) {
        const meetingEmail = emailCollected || lead.email;
        calendlyLink = `https://calendly.com/nataly-riano-msitechnologiesinc/30min?name=${encodeURIComponent(lead.lead_name || '')}&email=${encodeURIComponent(meetingEmail)}&a1=${encodeURIComponent(lead.company || '')}`;
    }

    return {
        call_id: callResult.call_id || '',
        call_status: callStatus,
        interest_level: interestLevel,
        disposition,
        pain_points: painPoints.trim(),
        next_step: nextStep,
        notes,
        transcript: callResult.concatenated_transcript || '',
        recording_url: callResult.recording_url || '',
        duration: durationSeconds,
        new_status: newStatus,
        new_attempts: currentAttempts,
        call_date: dateStr,
        call_time: timeStr,
        calendly_link: calendlyLink,
        summary: callResult.summary || notes,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        callback_date: callbackDate,
        callback_time: callbackTime,
        email_collected: emailCollected
    };
}

// ── SAVE CALL RESULTS TO SUPABASE ──────────────────────────────────────────────
async function saveCallResults(analysis, lead) {
    const esc = (s) => (s || '').replace(/'/g, "''");

    // 1. Update lead
    const updateFields = [];
    updateFields.push(`status = '${analysis.new_status}'`);
    updateFields.push(`attempts = ${analysis.new_attempts}`);
    updateFields.push(`last_call_date = '${analysis.call_date}'`);
    updateFields.push(`last_call_time = '${analysis.call_time}'`);
    updateFields.push(`call_result = '${analysis.call_status}'`);
    updateFields.push(`interest_level = '${analysis.interest_level}'`);
    updateFields.push(`disposition = '${analysis.disposition}'`);
    updateFields.push(`pain_points = '${esc(analysis.pain_points)}'`);
    updateFields.push(`next_step = '${analysis.next_step}'`);
    updateFields.push(`notes = '${esc(analysis.notes).substring(0, 1000)}'`);
    updateFields.push(`calendly_link = '${analysis.calendly_link || ''}'`);
    if (analysis.meeting_date) updateFields.push(`meeting_date = '${analysis.meeting_date}'`);
    if (analysis.meeting_time) updateFields.push(`meeting_time = '${analysis.meeting_time}'`);
    if (analysis.callback_date) updateFields.push(`callback_date = '${analysis.callback_date}'`);
    if (analysis.callback_time) updateFields.push(`callback_time = '${analysis.callback_time}'`);
    if (analysis.email_collected) updateFields.push(`email_collected = '${analysis.email_collected}'`);
    updateFields.push(`updated_at = NOW()`);

    // Use Supabase REST API to update lead
    const phone = lead.phone || '';
    if (phone) {
        await supabaseFetch(`/bland_leads?phone=eq.${encodeURIComponent(phone)}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: analysis.new_status,
                attempts: analysis.new_attempts,
                last_call_date: analysis.call_date,
                last_call_time: analysis.call_time,
                call_result: analysis.call_status,
                interest_level: analysis.interest_level,
                disposition: analysis.disposition,
                pain_points: analysis.pain_points,
                next_step: analysis.next_step,
                notes: (analysis.notes || '').substring(0, 1000),
                calendly_link: analysis.calendly_link || '',
                meeting_date: analysis.meeting_date || null,
                meeting_time: analysis.meeting_time || null,
                callback_date: analysis.callback_date || null,
                callback_time: analysis.callback_time || null,
                email_collected: analysis.email_collected || null,
                updated_at: new Date().toISOString()
            })
        });
    }

    // 2. Insert call log
    await supabaseFetch('/bland_call_logs', {
        method: 'POST',
        body: JSON.stringify({
            call_id: analysis.call_id,
            lead_id: lead.id || null,
            lead_name: lead.lead_name || '',
            phone: phone,
            call_date: analysis.call_date,
            call_time: analysis.call_time,
            duration_seconds: analysis.duration || 0,
            call_result: analysis.call_status,
            interest_level: analysis.interest_level,
            next_step: analysis.next_step,
            disposition: analysis.disposition,
            pain_points: analysis.pain_points,
            email_collected: analysis.email_collected || null,
            meeting_date: analysis.meeting_date || null,
            meeting_time: analysis.meeting_time || null,
            callback_date: analysis.callback_date || null,
            callback_time: analysis.callback_time || null,
            transcript: (analysis.transcript || '').substring(0, 10000),
            recording_url: analysis.recording_url || '',
            summary: (analysis.summary || '').substring(0, 2000)
        })
    });

    // 3. Upsert daily stats
    const today = analysis.call_date;
    const statsR = await supabaseFetch(`/bland_daily_stats?date=eq.${today}&limit=1`);
    const existing = (statsR.data && statsR.data[0]) || null;

    if (existing) {
        await supabaseFetch(`/bland_daily_stats?date=eq.${today}`, {
            method: 'PATCH',
            body: JSON.stringify({
                total_calls: (existing.total_calls || 0) + 1,
                answered: (existing.answered || 0) + (analysis.call_status === 'answered' ? 1 : 0),
                voicemail: (existing.voicemail || 0) + (analysis.call_status === 'voicemail' ? 1 : 0),
                no_answer: (existing.no_answer || 0) + (analysis.call_status === 'no_answer' ? 1 : 0),
                busy: (existing.busy || 0) + (analysis.call_status === 'busy' ? 1 : 0),
                meetings_scheduled: (existing.meetings_scheduled || 0) + (analysis.disposition === 'meeting_scheduled' ? 1 : 0),
                interested: (existing.interested || 0) + (['high', 'medium'].includes(analysis.interest_level) ? 1 : 0),
                not_interested: (existing.not_interested || 0) + (analysis.disposition === 'not_interested' ? 1 : 0),
                updated_at: new Date().toISOString()
            })
        });
    } else {
        await supabaseFetch('/bland_daily_stats', {
            method: 'POST',
            body: JSON.stringify({
                date: today,
                total_calls: 1,
                answered: analysis.call_status === 'answered' ? 1 : 0,
                voicemail: analysis.call_status === 'voicemail' ? 1 : 0,
                no_answer: analysis.call_status === 'no_answer' ? 1 : 0,
                busy: analysis.call_status === 'busy' ? 1 : 0,
                meetings_scheduled: analysis.disposition === 'meeting_scheduled' ? 1 : 0,
                interested: ['high', 'medium'].includes(analysis.interest_level) ? 1 : 0,
                not_interested: analysis.disposition === 'not_interested' ? 1 : 0
            })
        });
    }

    return { success: true };
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
                no_answer: 0, busy: 0, meetings_scheduled: 0, interested: 0, not_interested: 0
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

            const payloadBody = generateBlandPayload(
                { lead_name, phone, company, title, email, lead_type },
                {
                    isWebCall: false,
                    webhookUrl: webhook_url || `https://n8nmsi.app.n8n.cloud/webhook/bland-webhook`
                }
            );
            // Test calls: shorter duration
            payloadBody.max_duration = 2;

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

            const prompt = generateBlandPrompt({ lead_name, company, title, email, lead_type });
            const n = lead_name || 'there';
            const co = company || 'your company';
            const e = email || '';

            const payloadBody = {
                voice: BLAND_VOICE_ID,
                prompt,
                first_sentence: `Hi${n !== 'there' ? ' ' + n : ''}! This is Laura from MSI Technologies. How are you today?`,
                wait_for_greeting: false,
                interruptions: true,
                noise_cancellation: true,
                model: 'base',
                language: 'en-US',
                max_duration: 10,
                metadata: { web_call: true, lead_name: n, company: co, email: e, phone: phone || 'WEB-USER', lead_type: lead_type || 'STAFFING' }
            };
            
            // Always set webhook so we get the results
            payloadBody.webhook = webhook_url || 'https://n8nmsi.app.n8n.cloud/webhook/bland-webhook';

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

        // ── POST: Bland.ai Webhook (call completed) ─────────────────────────
        if (req.method === 'POST' && action === 'bland-webhook') {
            const callResult = req.body || {};
            console.log('[bland-webhook] Received:', JSON.stringify({
                call_id: callResult.call_id,
                status: callResult.status,
                disposition: callResult.disposition,
                duration: callResult.corrected_duration
            }));

            // Accept completed calls or calls that have a duration (web calls might differ)
            if (callResult.status !== 'completed' && !callResult.call_length && !callResult.session_id) {
                return res.status(200).json({ success: true, message: 'Call not completed yet, skipping' });
            }

            // Recover lead data from metadata (or variables for web agents)
            const meta = callResult.metadata || callResult.variables || callResult.request_data || {};
            let lead = {
                id: meta.lead_id || null,
                lead_name: meta.lead_name || 'Unknown',
                company: meta.company || '',
                phone: meta.phone || callResult.to || '',
                email: meta.email || '',
                attempts: 0,
                lead_type: meta.lead_type || 'STAFFING'
            };

            // Try to find the actual lead in Supabase for accurate attempts count
            if (lead.phone) {
                const leadR = await supabaseFetch(`/bland_leads?phone=eq.${encodeURIComponent(lead.phone)}&limit=1`);
                if (leadR.ok && leadR.data && leadR.data[0]) {
                    lead = { ...lead, ...leadR.data[0] };
                }
            }

            // Analyze and save
            const analysis = analyzeCallResult(callResult, lead);
            await saveCallResults(analysis, lead);

            console.log('[bland-webhook] Processed:', JSON.stringify({
                phone: lead.phone,
                disposition: analysis.disposition,
                new_status: analysis.new_status,
                meeting_date: analysis.meeting_date,
                email_collected: analysis.email_collected
            }));

            return res.status(200).json({
                success: true,
                disposition: analysis.disposition,
                new_status: analysis.new_status,
                meeting_date: analysis.meeting_date || null,
                email_collected: analysis.email_collected || null
            });
        }

        return res.status(404).json({ success: false, error: `Unknown action: ${action}` });

    } catch (err) {
        console.error('[api/calls]', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
