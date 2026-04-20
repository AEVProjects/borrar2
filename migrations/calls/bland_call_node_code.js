// NODO: "Llamar con Bland.ai" — v8 FINAL
// Reemplaza el nodo de v7. Usa modelo 'base', voicemail con leave_message,
// summary_prompt, dispositions, y webhook para recibir resultados.

const BLAND_API_KEY = 'org_aae0e1f07f1f504b5f39fe9953ecc82eda35d2da72650564a340a49b4a80d996540eef9ac5b57109ba6f69';
const BLAND_PHONE_NUMBER_ID = '07e907b3-68ee-4177-bcb1-3f8e990a245e'; // Twilio +15187570699
const lead = $('¿Lead Válido?').first().json;
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

// === RESOLVE INTENT TOPIC ===
const intentMap = {
  'STAFFING': 'nearshore staff augmentation and specialized talent acquisition',
  'AI_SOLUTIONS': 'AI solutions and intelligent process automation',
  'CLOUD': 'cloud infrastructure and DevOps modernization',
  'CYBERSECURITY': 'cybersecurity and compliance solutions'
};
const topic = intentMap[String(lead.lead_type || '').toUpperCase()]
  || lead.intent_topic
  || 'technology staffing and digital transformation';

const n = lead.lead_name || 'there';
const co = lead.company || 'your company';
const t = lead.title || 'Technology Leader';
const e = lead.email || '';

// === OPTIMIZED PROMPT (<2000 chars, Bland best practices) ===
const task = `You are Laura, a commercial assistant at M-S-I Technologies calling ${n} at ${co}.
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
Be conversational and adapt to the user. If they change their mind (e.g., "Wait, I can talk to my boss"), acknowledge it naturally (e.g., "That makes sense. Should I send you an email so you can share it with him, or should we schedule a call together?").
Ask these naturally, one at a time, ONLY if it fits the flow:
Q1: "What roles or technologies are most critical right now?"
Q2: "Are you leading this decision, or is someone else involved?"

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
Listen actively. If the user adds context, respond empathetically to what they EXACTLY said before asking another question. DO NOT be rigid.
Any farewell: "Thank you, ${n}. Have a great day." -> YOU MUST IMMEDIATELY HANG UP THE CALL.
Always answer direct questions before continuing your agenda.
Short sentences. One question per turn. Wait after every question.
Use their name two or three times max.
Calm, warm tone. Downward inflection on statements.`;

// === BLAND API PAYLOAD (Best Practices 2026) ===
const body = {
  phone_number: lead.phone,
  phone_number_id: BLAND_PHONE_NUMBER_ID,
  task: task,
  voice: '4e65cda2-cf46-4907-84ba-3ca96c48f549',
  first_sentence: 'Hi, is this ' + n + '?',
  wait_for_greeting: true,
  noise_cancellation: true,
  background_track: 'office',
  record: true,
  max_duration: 5,
  language: 'en-US',
  model: 'turbo',               // 'turbo' is the fastest model internally
  interruption_threshold: 150,  // Lower threshold for faster back-and-forth
  temperature: 0.4,             // Lower = more faithful to script. Sales: 0.4-0.6
  voice_settings: { speed: 1.2 }, // Increase speaking speed
  voicemail: {                  // New format (replaces deprecated voicemail_action)
    action: 'leave_message',
    message: 'Hi ' + n + ', this is Laura from M-S-I Technologies. We help companies scale their tech teams with senior engineers. I would love to connect briefly. You can reach us at n-r-i-a-n-o at msiamericas dot com. Have a great day.'
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
  webhook: 'https://borrar2.vercel.app/api/calls?action=bland-webhook',
  metadata: {
    lead_id: String(lead.id || ''),
    lead_name: n,
    company: co,
    email: e,
    phone: lead.phone,
    lead_type: lead.lead_type || 'STAFFING',
    call_date: today
  }
};

const response = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.bland.ai/v1/calls',
  headers: {
    'Content-Type': 'application/json',
    'authorization': BLAND_API_KEY
  },
  body: body
});

return [{
  json: {
    ...response,
    phone: lead.phone,
    lead_id: lead.id,
    lead_name: n,
    company: co,
    email: e,
    title: t,
    attempts: lead.attempts,
    call_date_today: today
  }
}];
