const https = require('https');

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function apolloGetContactsByLabel(apiKey, label) {
  const contacts = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await httpRequest({
      hostname: 'api.apollo.io',
      path: '/api/v1/contacts/search',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    }, { api_key: apiKey, label_names: [label], per_page: 100, page });

    if (res.status !== 200) throw new Error(`Apollo ${res.status}: ${JSON.stringify(res.body).slice(0, 200)}`);

    const batch = res.body.contacts || [];
    contacts.push(...batch);

    const total = res.body.pagination?.total_entries || 0;
    hasMore = batch.length === 100 && contacts.length < total && page < 20;
    page++;

    if (hasMore) await new Promise(r => setTimeout(r, 200));
  }
  return contacts;
}

async function mailerAddSubscriber(apiKey, contact, groupId) {
  return httpRequest({
    hostname: 'connect.mailerlite.com',
    path: '/api/subscribers',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
  }, {
    email: contact.email,
    fields: {
      name: contact.first_name || '',
      last_name: contact.last_name || '',
      company: contact.organization_name || '',
      phone: contact.sanitized_phone || ''
    },
    groups: [groupId],
    status: 'active'
  });
}

async function apolloMatchContact(apiKey, email) {
  return httpRequest({
    hostname: 'api.apollo.io',
    path: '/api/v1/people/match',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
  }, { api_key: apiKey, email });
}

async function apolloAddLabel(apiKey, contactId, labelName) {
  return httpRequest({
    hostname: 'api.apollo.io',
    path: `/api/v1/contacts/${contactId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
  }, { api_key: apiKey, label_names: [labelName] });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, apolloKey, mailerKey, label, groupId, campaignId, newLabel } = req.body || {};

  try {
    // ── TEST KEYS ─────────────────────────────────────────────────────────
    if (action === 'test-keys') {
      const [apolloRes, mailerRes] = await Promise.all([
        httpRequest({
          hostname: 'api.apollo.io',
          path: '/api/v1/contacts/search',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, { api_key: apolloKey, per_page: 1, page: 1 }),
        httpRequest({
          hostname: 'connect.mailerlite.com',
          path: '/api/me',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${mailerKey}`, 'Content-Type': 'application/json' }
        })
      ]);
      return res.status(200).json({
        apollo: { ok: apolloRes.status === 200, status: apolloRes.status },
        mailerlite: { ok: mailerRes.status === 200, status: mailerRes.status,
          account: mailerRes.body?.data?.email || null }
      });
    }

    // ── GET MAILERLITE GROUPS ─────────────────────────────────────────────
    if (action === 'get-groups') {
      if (!mailerKey) return res.status(400).json({ error: 'mailerKey required' });
      const r = await httpRequest({
        hostname: 'connect.mailerlite.com',
        path: '/api/groups?limit=100',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${mailerKey}`, 'Content-Type': 'application/json' }
      });
      return res.status(r.status).json(r.body);
    }

    // ── SYNC: Apollo label → MailerLite group ─────────────────────────────
    if (action === 'sync') {
      if (!apolloKey || !mailerKey || !label || !groupId)
        return res.status(400).json({ error: 'apolloKey, mailerKey, label y groupId son requeridos' });

      const allContacts = await apolloGetContactsByLabel(apolloKey, label);
      const withEmail = allContacts.filter(c => c.email && c.email.includes('@'));

      let added = 0, updated = 0, errors = 0;
      const errorList = [];

      for (const contact of withEmail) {
        try {
          const r = await mailerAddSubscriber(mailerKey, contact, groupId);
          if (r.status === 200) updated++;
          else if (r.status === 201) added++;
          else { errors++; errorList.push({ email: contact.email, status: r.status }); }
        } catch (e) {
          errors++;
          errorList.push({ email: contact.email, error: e.message });
        }
        await new Promise(r => setTimeout(r, 120));
      }

      return res.status(200).json({
        success: true,
        total_apollo: allContacts.length,
        with_email: withEmail.length,
        new_subscribers: added,
        updated_subscribers: updated,
        errors,
        error_sample: errorList.slice(0, 5)
      });
    }

    // ── VERIFY: Get campaign opens → label in Apollo ──────────────────────
    if (action === 'verify') {
      if (!apolloKey || !mailerKey || !campaignId)
        return res.status(400).json({ error: 'apolloKey, mailerKey y campaignId son requeridos' });

      // Paginate openers
      let path = `/api/campaigns/${campaignId}/reports/subscribers?filter[opened]=true&limit=100`;
      const openers = [];
      let nextUrl = path;

      while (nextUrl) {
        const r = await httpRequest({
          hostname: 'connect.mailerlite.com',
          path: nextUrl,
          method: 'GET',
          headers: { 'Authorization': `Bearer ${mailerKey}`, 'Content-Type': 'application/json' }
        });

        if (r.status !== 200) {
          return res.status(200).json({ error: 'Error al obtener stats', status: r.status, body: r.body });
        }

        (r.body.data || []).forEach(s => openers.push(s.email || s.subscriber?.email));
        const next = r.body.links?.next;
        nextUrl = next ? new URL(next).pathname + new URL(next).search : null;
      }

      const uniqueOpeners = [...new Set(openers.filter(Boolean))];
      const labelName = newLabel || 'Abrió Email';
      let labeled = 0, notFound = 0;

      for (const email of uniqueOpeners) {
        const matchRes = await apolloMatchContact(apolloKey, email);
        const contactId = matchRes.body?.person?.id || matchRes.body?.contacts?.[0]?.id;
        if (contactId) {
          await apolloAddLabel(apolloKey, contactId, labelName);
          labeled++;
        } else {
          notFound++;
        }
        await new Promise(r => setTimeout(r, 150));
      }

      return res.status(200).json({
        success: true,
        total_openers: uniqueOpeners.length,
        labeled_in_apollo: labeled,
        not_found_in_apollo: notFound,
        label_added: labelName
      });
    }

    return res.status(400).json({ error: `Acción desconocida: ${action}` });

  } catch (err) {
    console.error('[apollo-mailer]', err);
    return res.status(500).json({ error: err.message });
  }
};
